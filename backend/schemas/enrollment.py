from pydantic import BaseModel


class EnrollmentCreate(BaseModel):
    student_id: int
    program_id: int
    semester: int