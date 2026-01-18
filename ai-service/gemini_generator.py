import google.generativeai as genai
import json
import os
import asyncio
import time
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel('gemini-2.0-flash-exp')

def extract_json_from_response(text: str) -> str:
    text = text.strip()
    
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    
    text = text.strip()
    
    start_idx = text.find('[')
    end_idx = text.rfind(']')
    
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        text = text[start_idx:end_idx + 1]
    
    return text

def fix_json_structure(text: str) -> str:
    text = text.strip()
    
    if not text.startswith('['):
        text = '[' + text
    
    open_braces = text.count('{')
    close_braces = text.count('}')
    if open_braces > close_braces:
        text += '}' * (open_braces - close_braces)
    
    open_brackets = text.count('[')
    close_brackets = text.count(']')
    if open_brackets > close_brackets:
        text += ']' * (open_brackets - close_brackets)
    
    return text

def parse_questions_response(response_text: str) -> List[Dict]:
    try:
        cleaned_text = extract_json_from_response(response_text)
        questions = json.loads(cleaned_text)
        return questions
    except json.JSONDecodeError as e:
        try:
            fixed_text = fix_json_structure(cleaned_text)
            questions = json.loads(fixed_text)
            return questions
        except json.JSONDecodeError:
            raise ValueError(f"Failed to parse JSON response after fixing: {str(e)}")

async def generate_questions_with_gemini(
    topic: str,
    difficulty: str,
    num_questions: int,
    exam_type: str = "multiple-choice"
) -> List[Dict]:
    
    dynamic_timeout = max(60, num_questions * 2)
    
    prompt = f"""Generate exactly {num_questions} {difficulty} level {exam_type} questions about {topic}.

CRITICAL: You must return ONLY a valid JSON array. No explanations, no markdown formatting, no code blocks.

Return format:
[
  {{
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "marks": 2,
    "difficulty": "{difficulty}"
  }}
]

Requirements:
- Generate exactly {num_questions} questions
- Each question must have exactly 4 options
- correctAnswer must match one of the options exactly
- Use {difficulty} difficulty level
- All questions about {topic}
- Return ONLY the JSON array, nothing else"""

    max_retries = 5
    base_delay = 5
    
    for attempt in range(max_retries):
        try:
            response = await asyncio.wait_for(
                asyncio.to_thread(
                    model.generate_content,
                    prompt,
                    generation_config={
                        "temperature": 0.7,
                        "top_p": 0.95,
                        "top_k": 40,
                        "max_output_tokens": 8192,
                    }
                ),
                timeout=dynamic_timeout
            )
            
            if not response or not response.text:
                raise ValueError("Empty response from Gemini API")
            
            questions = parse_questions_response(response.text)
            
            if not questions or len(questions) == 0:
                raise ValueError("No questions generated")
            
            for i, q in enumerate(questions):
                if not isinstance(q, dict):
                    raise ValueError(f"Question {i+1} is not a valid object")
                if "question" not in q or not q["question"]:
                    raise ValueError(f"Question {i+1} missing 'question' field")
                if "options" not in q or not isinstance(q["options"], list) or len(q["options"]) != 4:
                    raise ValueError(f"Question {i+1} must have exactly 4 options")
                if "correctAnswer" not in q or q["correctAnswer"] not in q["options"]:
                    raise ValueError(f"Question {i+1} has invalid correctAnswer")
                
                q.setdefault("marks", 2)
                q.setdefault("difficulty", difficulty)
            
            if len(questions) > num_questions:
                questions = questions[:num_questions]
            
            return questions
            
        except asyncio.TimeoutError:
            if attempt < max_retries - 1:
                delay = base_delay * (2 ** attempt)
                await asyncio.sleep(delay)
                continue
            raise ValueError(f"Request timed out after {dynamic_timeout} seconds. Try with fewer questions.")
        
        except Exception as e:
            error_msg = str(e).lower()
            
            if "rate" in error_msg or "quota" in error_msg or "429" in error_msg:
                if attempt < max_retries - 1:
                    delay = base_delay * (2 ** attempt)
                    await asyncio.sleep(delay)
                    continue
                raise ValueError("Gemini API rate limit exceeded. Please try again in a few moments.")
            
            if "resource_exhausted" in error_msg or "503" in error_msg:
                if attempt < max_retries - 1:
                    delay = base_delay * (2 ** attempt)
                    await asyncio.sleep(delay)
                    continue
                raise ValueError("Gemini API is temporarily unavailable. Please try again.")
            
            if attempt < max_retries - 1 and ("network" in error_msg or "connection" in error_msg):
                delay = base_delay * (2 ** attempt)
                await asyncio.sleep(delay)
                continue
            
            raise ValueError(f"Failed to generate questions: {str(e)}")
    
    raise ValueError(f"Failed to generate questions after {max_retries} attempts")
