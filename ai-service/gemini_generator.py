import os
import json
from typing import List

import requests

from models import MCQQuestion


def _build_prompt(course: str, topic: str, difficulty: str, count: int) -> str:
    difficulty_str = f"Difficulty level: {difficulty} (align rigor and nuance accordingly)." if difficulty else ""
    return f"""
SYSTEM:
Act as an expert assessment author who writes concise, scenario-led MCQs.
Output ONLY raw JSON (no markdown fences, no prose) matching the schema below.
Enforce uniqueness: no repeated questions, no repeated phrasing patterns, no duplicated options within or across questions.
Vary the correctOption positions across A/B/C/D; avoid clustering.
Avoid generic wording and common textbook trivia; prefer realistic industry or real-world scenarios when relevant.

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
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    
    text = text.strip()
    
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
    
    logger.info(f"Parsed {len(parsed)} valid questions, skipped {skipped_count}")
    if len(parsed) == 0:
        raise ValueError("No valid questions could be parsed from AI response")
    
    return parsed


def generate_questions_gemini(course: str, topic: str, difficulty: str, count: int) -> List[MCQQuestion]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("Gemini API key not configured")

    timeout = max(60, count * 2)
    prompt = _build_prompt(course, topic, difficulty, count)
    raw = _call_gemini(prompt, api_key, timeout=timeout)
    return _parse_response(raw, count)
