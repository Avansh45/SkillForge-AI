from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class QuestionGenerationRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=500, description="Topic for question generation")
    difficulty: str = Field(..., pattern="^(easy|medium|hard)$", description="Difficulty level: easy, medium, or hard")
    num_questions: int = Field(..., ge=1, le=100, description="Number of questions to generate (1-100)")
    exam_type: str = Field(default="multiple-choice", description="Type of exam questions")

    class Config:
        json_schema_extra = {
            "example": {
                "topic": "Python Programming",
                "difficulty": "medium",
                "num_questions": 10,
                "exam_type": "multiple-choice"
            }
        }

class Question(BaseModel):
    question: str
    options: List[str]
    correctAnswer: str
    marks: int = 2
    difficulty: str

class QuestionGenerationResponse(BaseModel):
    success: bool
    questions: List[Dict]
    topic: str
    difficulty: str
    num_questions: int
    message: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "questions": [
                    {
                        "question": "What is Python?",
                        "options": ["A snake", "A programming language", "A food", "A game"],
                        "correctAnswer": "A programming language",
                        "marks": 2,
                        "difficulty": "easy"
                    }
                ],
                "topic": "Python Programming",
                "difficulty": "easy",
                "num_questions": 1
            }
        }
