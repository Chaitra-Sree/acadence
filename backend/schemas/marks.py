from pydantic import BaseModel


class MarkCreate(BaseModel):
    student_id: int
    assessment_component_id: int
    marks_obtained: float