from pydantic import BaseModel


class CourseCreate(BaseModel):
    course_code: str
    course_name: str
    semester: int
    course_type: str
    cie_max: int
    see_max: int
    credits: float