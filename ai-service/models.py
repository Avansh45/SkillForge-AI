from pydantic import BaseModel, Field
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
