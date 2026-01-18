import os
import logging
import time
import asyncio
from collections import deque

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from models import QuestionGenerationRequest, QuestionGenerationResponse, MCQQuestion
from gemini_generator import generate_questions_gemini

load_dotenv()
if not os.getenv("GEMINI_API_KEY"):
    raise RuntimeError("Gemini API key not configured")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s - %(message)s")
logger = logging.getLogger("ai-service")

request_times = deque(maxlen=50)
RATE_WINDOW_SECONDS = 60.0
MAX_REQUESTS_PER_WINDOW = 6  # ~1 request every 10 seconds to protect daily free-tier quota
rate_lock = asyncio.Lock()


async def enforce_rate_limit() -> float:
    async with rate_lock:
        now = time.monotonic()
        window_start = now - RATE_WINDOW_SECONDS
        while request_times and request_times[0] < window_start:
            request_times.popleft()
        if len(request_times) >= MAX_REQUESTS_PER_WINDOW:
            wait_for = (request_times[0] + RATE_WINDOW_SECONDS) - now
            return max(wait_for, 0.0)
        request_times.append(now)
        return 0.0

app = FastAPI(
    title="SkillForge AI Service",
    description="AI question generation via Google Gemini",
    version="4.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.exception("Validation error", exc_info=exc)
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors(),
            "body": exc.body
        }
    )

@app.get("/")
async def root():
    """Service status endpoint"""
    return {
        "status": "online",
        "service": "SkillForge AI Service",
        "version": "4.0.0",
        "generation": "enabled",
        "provider": "Google Gemini",
        "endpoints": {
            "generate": "/generate-questions",
            "health": "/api/health",
            "docs": "/docs"
        }
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "generation": "enabled"
    }

@app.post("/generate-questions", response_model=QuestionGenerationResponse)
async def generate_questions_endpoint(request: Request):
    wait_for = await enforce_rate_limit()
    if wait_for > 0:
        logger.warning("Rate limiter delaying request for %.2fs to protect quota", wait_for)
        await asyncio.sleep(wait_for)
        # Re-check after waiting to avoid overlapping bursts
        wait_for = await enforce_rate_limit()
        if wait_for > 0:
            raise HTTPException(status_code=429, detail="Too many requests. Please slow down and retry in a moment.")

    # Debug: log raw incoming request body
    try:
        raw_body = await request.body()
        logger.info(f"Raw incoming request body: {raw_body}")
    except Exception as e:
        logger.error(f"Failed to read raw request body: {e}")

    # Parse as QuestionGenerationRequest
    try:
        data = await request.json()
        parsed_request = QuestionGenerationRequest(**data)
    except Exception as e:
        logger.error(f"Failed to parse QuestionGenerationRequest: {e}")
        raise HTTPException(status_code=422, detail=f"Invalid request: {e}")
    try:
        logger.info("Parsed generate request: %s", parsed_request.model_dump())
        difficulty = None
        if parsed_request.difficulty is not None:
            if hasattr(parsed_request.difficulty, "value"):
                difficulty = parsed_request.difficulty.value
            elif isinstance(parsed_request.difficulty, str):
                difficulty = parsed_request.difficulty.lower()
        logger.info("Starting Gemini request for course=%s topic=%s difficulty=%s count=%s", parsed_request.courseName, parsed_request.topic, difficulty, parsed_request.numberOfQuestions)
        questions: list[MCQQuestion] = generate_questions_gemini(
            course=parsed_request.courseName,
            topic=parsed_request.topic,
            difficulty=difficulty,
            count=parsed_request.numberOfQuestions,
        )
        logger.info("Gemini response received and parsed (%s questions)", len(questions))

        return QuestionGenerationResponse(
            questions=questions,
            courseName=parsed_request.courseName,
            topic=parsed_request.topic,
            difficulty=difficulty,
            count=len(questions),
        )
    except HTTPException:
        logger.exception("HTTPException while generating questions")
        raise
    except Exception as exc:
        logger.exception("Unhandled exception while generating questions")
        raise HTTPException(status_code=500, detail=f"Error generating questions: {exc}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)