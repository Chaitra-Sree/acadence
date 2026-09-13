from sqlalchemy import Column, Integer, ForeignKey
from database import Base


class FacultyCourse(Base):
    __tablename__ = "faculty_courses"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    faculty_id = Column(
        Integer,
        ForeignKey("faculty.id"),
        nullable=False
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=False
    )