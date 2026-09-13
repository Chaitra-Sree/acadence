from pydantic import BaseModel


class FacultyCourseCreate(BaseModel):
    faculty_id: int
    course_id: int