from sqlalchemy import Column, Integer, ForeignKey
from database import Base


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(
        Integer,
        ForeignKey("students.id"),
        nullable=False
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=False
    )

    classes_held = Column(Integer, default=0)

    classes_attended = Column(Integer, default=0)