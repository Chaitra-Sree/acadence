from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    student_id: Optional[int] = None
    faculty_id: Optional[int] = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str

    student_id: Optional[int] = None
    faculty_id: Optional[int] = None
    