from pydantic import BaseModel


class FacultyCreate(BaseModel):
    faculty_code: str
    name: str
    email: str
    department: str = "MCA"