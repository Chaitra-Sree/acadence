from pydantic import BaseModel


class AttendanceCreate(BaseModel):
    student_id: int
    course_id: int
    classes_held: int
    classes_attended: int