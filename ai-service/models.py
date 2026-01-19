from pydantic import BaseModel, Field
<<<<<<< HEAD
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
=======
from typing import List, Optional
from enum import Enum

class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class GenerationMode(str, Enum):
    TEMPLATE = "template"
    LLM = "llm"

class QuestionGenerationRequest(BaseModel):
    courseName: str = Field(..., description="Name of the course")
    topic: str = Field(..., description="Topic for question generation")
    difficulty: Optional[DifficultyLevel] = Field(default=None, description="Difficulty level (optional)")
    numberOfQuestions: int = Field(..., ge=1, le=100, description="Number of questions to generate (up to 100)")
    mode: Optional[GenerationMode] = Field(default=None)

    @classmethod
    def __get_validators__(cls):
        yield cls._coerce_fields
        yield from super().__get_validators__()

    @classmethod
    def _coerce_fields(cls, values):
        if 'difficulty' in values and isinstance(values['difficulty'], str):
            values['difficulty'] = values['difficulty'].lower()
        if 'numberOfQuestions' in values:
            try:
                values['numberOfQuestions'] = int(values['numberOfQuestions'])
            except Exception:
                pass
        return values

class MCQQuestion(BaseModel):
    question: str
    optionA: str
    optionB: str
    optionC: str
    optionD: str
    correctOption: str = Field(..., pattern="^[A-D]$")

class QuestionGenerationResponse(BaseModel):
    questions: List[MCQQuestion]
    courseName: str
    topic: str
    difficulty: Optional[str]
    count: int
>>>>>>> TempBranch
