from sqlalchemy import Column, Integer, ForeignKey
from database import Base


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(
        Integer,
        ForeignKey("students.id"),
        nullable=False
    )

    program_id = Column(
        Integer,
        ForeignKey("programs.id"),
        nullable=False
    )

    semester = Column(Integer, nullable=False)