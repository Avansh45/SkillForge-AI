from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from models import QuestionGenerationRequest, QuestionGenerationResponse
from gemini_generator import generate_questions_with_gemini
import time
from collections import deque

app = FastAPI(title="AI Question Generation Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

request_times = deque(maxlen=50)
RATE_LIMIT_REQUESTS = 6
RATE_LIMIT_WINDOW = 60

def check_rate_limit():
    current_time = time.time()
    while request_times and current_time - request_times[0] > RATE_LIMIT_WINDOW:
        request_times.popleft()
    
    if len(request_times) >= RATE_LIMIT_REQUESTS:
        oldest_request = request_times[0]
        time_to_wait = RATE_LIMIT_WINDOW - (current_time - oldest_request)
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "message": f"Maximum {RATE_LIMIT_REQUESTS} requests per {RATE_LIMIT_WINDOW} seconds allowed",
                "retry_after": round(time_to_wait, 2)
            }
        )
    
    request_times.append(current_time)

@app.get("/")
async def root():
    return {
        "service": "AI Question Generation",
        "status": "running",
        "rate_limit": f"{RATE_LIMIT_REQUESTS} requests per {RATE_LIMIT_WINDOW} seconds"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-question-generator",
        "rate_limit_remaining": RATE_LIMIT_REQUESTS - len(request_times)
    }

@app.post("/generate-questions", response_model=QuestionGenerationResponse)
async def generate_questions(request: QuestionGenerationRequest):
    try:
        check_rate_limit()
        
        if not 1 <= request.num_questions <= 100:
            raise HTTPException(
                status_code=400,
                detail="Number of questions must be between 1 and 100"
            )
        
        questions = await generate_questions_with_gemini(
            topic=request.topic,
            difficulty=request.difficulty,
            num_questions=request.num_questions,
            exam_type=request.exam_type
        )
        
        return QuestionGenerationResponse(
            success=True,
            questions=questions,
            topic=request.topic,
            difficulty=request.difficulty,
            num_questions=len(questions)
        )
        
    except HTTPException:
        raise
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        error_message = str(e)
        if "rate limit" in error_message.lower() or "quota" in error_message.lower():
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "API rate limit exceeded",
                    "message": "Gemini API rate limit reached. Please try again in a few moments.",
                    "retry_after": 60
                }
            )
        
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Question generation failed",
                "message": error_message
            }
        )

@app.get("/rate-limit-status")
async def get_rate_limit_status():
    current_time = time.time()
    while request_times and current_time - request_times[0] > RATE_LIMIT_WINDOW:
        request_times.popleft()
    
    remaining = RATE_LIMIT_REQUESTS - len(request_times)
    reset_in = 0
    if request_times:
        reset_in = RATE_LIMIT_WINDOW - (current_time - request_times[0])
    
    return {
        "limit": RATE_LIMIT_REQUESTS,
        "remaining": remaining,
        "reset_in_seconds": round(reset_in, 2),
        "window_seconds": RATE_LIMIT_WINDOW
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
