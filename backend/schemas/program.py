from pydantic import BaseModel


class ProgramCreate(BaseModel):
    name: str
    code: str
    total_semesters: int