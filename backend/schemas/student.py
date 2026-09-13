from pydantic import BaseModel


class StudentCreate(BaseModel):
    roll_number: str
    name: str
    email: str
    batch: str

class Student(StudentCreate):
    id: int

    class Config:
        orm_mode = True