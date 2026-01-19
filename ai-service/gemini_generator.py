<<<<<<< HEAD
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
=======
import os
import json
import random
import time
from typing import List

import requests

from models import MCQQuestion


def _build_prompt(course: str, topic: str, difficulty: str, count: int) -> str:
    difficulty_str = f"Difficulty level: {difficulty} (align rigor and nuance accordingly)." if difficulty else ""
    # Add randomization to ensure different questions each time
    variation_seed = random.randint(1000, 9999)
    timestamp_seed = int(time.time() * 1000) % 10000
    return f"""
SYSTEM:
Act as an expert assessment author who writes concise, scenario-led MCQs.
Output ONLY raw JSON (no markdown fences, no prose) matching the schema below.
Enforce uniqueness: no repeated questions, no repeated phrasing patterns, no duplicated options within or across questions.
Vary the correctOption positions across A/B/C/D; avoid clustering.
Avoid generic wording and common textbook trivia; prefer realistic industry or real-world scenarios when relevant.
IMPORTANT: Generate completely NEW and DIFFERENT questions each time. Variation seed: {variation_seed}{timestamp_seed}. Never reuse previous examples.

TASK:
Create exactly {count} unique multiple-choice questions for the course '{course}' on the topic '{topic}'.
{difficulty_str}

CONTENT RULES:
Every question stays on topic: '{topic}'.
No templatey stems like "Which of the following" unless truly necessary; vary the phrasing style.
Options are concise, plausible, mutually exclusive, and avoid all/none-of-the-above.
No yes/no questions. Each question has four distinct options.
Avoid repeating the same option text across the set.

FORMAT (must be valid JSON exactly):
{{
    "questions": [
        {{
            "questionText": "...",
            "optionA": "...",
            "optionB": "...",
            "optionC": "...",
            "optionD": "...",
            "correctOption": "A"
        }}
    ]
}}

OUTPUT:
Return exactly {count} items in questions.
correctOption must be one of: A, B, C, or D.
No explanations, no markdown, no extra text beyond the JSON object.
"""


def _call_gemini(prompt: str, api_key: str, timeout: int = 180) -> str:
    import logging
    import time
    logger = logging.getLogger("ai-service")
    
    endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key
    }
    params = None
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }

    max_retries = 5
    base_wait = 5
    for attempt in range(max_retries):
        try:
            response = requests.post(endpoint, headers=headers, json=payload, timeout=timeout)
        except requests.RequestException as exc:
            if attempt < max_retries - 1:
                wait = base_wait * (2 ** attempt)
                logger.warning(f"Attempt {attempt+1}: Request failed: {exc}. Waiting {wait}s before retry...")
                time.sleep(wait)
                continue
            raise ValueError(f"Gemini request failed after {max_retries} attempts: {exc}")

        if response.status_code == 429:
            if attempt < max_retries - 1:
                wait = base_wait * (2 ** attempt)
                logger.warning(f"Rate limited (429) on attempt {attempt+1}. Waiting {wait}s before retry {attempt+2}/{max_retries}...")
                time.sleep(wait)
                continue
            else:
                logger.error("Rate limited after all retry attempts. API quota exhausted.")
                raise ValueError("Gemini quota exceeded. Please wait before trying again.")
        
        if response.status_code in {401, 403}:
            raise ValueError("Invalid Gemini API key or unauthorized request.")
        if response.status_code >= 500:
            if attempt < max_retries - 1:
                wait = base_wait * (2 ** attempt)
                logger.warning(f"Server error ({response.status_code}) on attempt {attempt+1}. Waiting {wait}s...")
                time.sleep(wait)
                continue
            raise ValueError("Gemini service unavailable. Try again later.")
        if response.status_code >= 400:
            raise ValueError(f"Gemini request failed with status {response.status_code}: {response.text}")

        try:
            data = response.json()
        except ValueError:
            raise ValueError(f"Malformed Gemini response: {response.text}")
        if "error" in data:
            message = data.get("error", {}).get("message", "Unknown error")
            raise ValueError(f"Gemini API error: {message}")

        candidates = data.get("candidates") or []
        if not candidates:
            raise ValueError("Malformed Gemini response: missing candidates")

        parts = (candidates[0].get("content") or {}).get("parts") or []
        if not parts or "text" not in parts[0]:
            raise ValueError("Malformed Gemini response: missing text content")

        raw_text = str(parts[0].get("text", "")).strip()
        if not raw_text:
            raise ValueError("Malformed Gemini response: empty text")

        logger.info(f"Gemini request successful on attempt {attempt+1}")
        return raw_text
    
    raise ValueError("Gemini request failed after all retries")


def _parse_response(raw_text: str, expected_count: int) -> List[MCQQuestion]:
    import logging
    logger = logging.getLogger("ai-service")
    
    text = raw_text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
>>>>>>> TempBranch
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    
    text = text.strip()
    
<<<<<<< HEAD
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
=======
    def attempt_json_parse(json_text):
        """Attempt to parse JSON and return (success, data)"""
        try:
            return True, json.loads(json_text)
        except json.JSONDecodeError:
            return False, None
    
    success, data = attempt_json_parse(text)
    
    if not success:
        logger.warning(f"Initial JSON parse failed. Response length: {len(text)}, attempting recovery...")
        
        try:
            questions_start = text.find('"questions"')
            if questions_start < 0:
                raise ValueError("No 'questions' field in response")
            
            array_start = text.find('[', questions_start)
            if array_start < 0:
                raise ValueError("No questions array found")
            
            brace_count = 0
            last_valid_pos = array_start
            
            for i in range(array_start, len(text)):
                if text[i] == '{':
                    brace_count += 1
                elif text[i] == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        last_valid_pos = i + 1
            
            recovered_text = text[:last_valid_pos] + ']}' 
            logger.warning(f"Attempting JSON recovery: truncating at position {last_valid_pos}, found {last_valid_pos - array_start} chars")
            success, data = attempt_json_parse(recovered_text)
            
            if success:
                logger.info("JSON recovery successful by truncating to last complete question")
            else:
                logger.error(f"Recovery failed. Trying alternative method...")
                last_close_brace = text.rfind('}')
                if last_close_brace > array_start:
                    recovered_text2 = text[:last_close_brace + 1] + ']}' 
                    success, data = attempt_json_parse(recovered_text2)
                    if success:
                        logger.info("JSON recovery successful using alternative method")
                    else:
                        raise ValueError("JSON recovery failed with both methods")
                else:
                    raise ValueError("Could not find closing brace for recovery")
                
        except Exception as recovery_exc:
            logger.error(f"JSON recovery failed: {recovery_exc}")
            tail = text[-300:] if len(text) > 300 else text
            logger.error(f"Response tail (last 300 chars): {tail}")
            raise ValueError(f"Failed to parse LLM JSON and recovery failed: {recovery_exc}")

    if not isinstance(data, dict) or "questions" not in data:
        logger.error(f"Invalid response structure. Data keys: {list(data.keys()) if isinstance(data, dict) else type(data)}")
        raise ValueError("Invalid AI response structure")
    
    questions = data["questions"]
    if not isinstance(questions, list):
        logger.error(f"Questions is not a list. Type: {type(questions)}")
        raise ValueError("Questions field is not a list")
    
    actual_count = len(questions)
    min_required = max(1, int(expected_count * 0.5))
    if actual_count < min_required:
        logger.error(f"Too few questions. Expected: {expected_count}, Got: {actual_count}, Min required: {min_required}")
        raise ValueError(f"Expected at least {min_required} questions, got {actual_count}")
    
    if actual_count < expected_count:
        logger.warning(f"Received fewer questions than requested. Expected: {expected_count}, Got: {actual_count}")

    parsed = []
    seen_questions = set()
    skipped_count = 0
    logger.info(f"Processing {len(questions)} questions, expecting at least {min_required}")
    
    for idx, q in enumerate(questions, 1):
        try:
            question_text = str(q.get("questionText", "")).strip()
            if not question_text:
                logger.warning(f"Question {idx}: Empty question text, skipping")
                skipped_count += 1
                continue
                
            options = [
                str(q.get("optionA", "")).strip(),
                str(q.get("optionB", "")).strip(),
                str(q.get("optionC", "")).strip(),
                str(q.get("optionD", "")).strip(),
            ]
            
            if any(not opt for opt in options):
                logger.warning(f"Question {idx}: Empty option detected, skipping")
                skipped_count += 1
                continue
            
            normalized_question = question_text.lower()
            if normalized_question in seen_questions:
                logger.warning(f"Question {idx}: Duplicate detected, skipping")
                skipped_count += 1
                continue
            seen_questions.add(normalized_question)

            unique_options = len(set(opt.lower() for opt in options))
            if unique_options != 4:
                logger.warning(f"Question {idx}: Only {unique_options} distinct options, skipping")
                skipped_count += 1
                continue

            correct_option = str(q.get("correctOption", "")).strip().upper()
            if correct_option not in {"A", "B", "C", "D"}:
                logger.warning(f"Question {idx}: Invalid correct option '{correct_option}', skipping")
                skipped_count += 1
                continue

            parsed.append(
                MCQQuestion(
                    question=question_text,
                    optionA=options[0],
                    optionB=options[1],
                    optionC=options[2],
                    optionD=options[3],
                    correctOption=correct_option,
                )
            )
        except Exception as exc:
            logger.warning(f"Question {idx}: Error - {exc}, skipping")
            skipped_count += 1
            continue
    
    # Ensure we return exactly expected_count items when possible
    if len(parsed) > expected_count:
        import random as _rnd
        _rnd.shuffle(parsed)
        parsed = parsed[:expected_count]
        logger.info(f"Parsed {len(parsed)} valid questions (trimmed to expected count), skipped {skipped_count}")
    else:
        logger.info(f"Parsed {len(parsed)} valid questions, skipped {skipped_count}")
    if len(parsed) == 0:
        raise ValueError("No valid questions could be parsed from AI response")
    
    return parsed


def generate_questions_gemini(course: str, topic: str, difficulty: str, count: int) -> List[MCQQuestion]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("Gemini API key not configured")

    # Increase timeout for large question counts: up to 5 minutes (300s) for 100 questions
    timeout = min(300, max(60, count * 3))
    prompt = _build_prompt(course, topic, difficulty, count)
    raw = _call_gemini(prompt, api_key, timeout=timeout)
    return _parse_response(raw, count)
>>>>>>> TempBranch
