from pydantic import BaseModel


class AssessmentCreate(BaseModel):
    course_id: int
    component_name: str
    max_marks: int