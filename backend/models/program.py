from sqlalchemy import Column, Integer, String
from database import Base


class Program(Base):
    __tablename__ = "programs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)
    total_semesters = Column(Integer, nullable=False)