from sqlalchemy import Column, Integer, Float, ForeignKey
from database import Base


class Mark(Base):
    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True)

    student_id = Column(
        Integer,
        ForeignKey("students.id"),
        nullable=False
    )

    assessment_component_id = Column(
        Integer,
        ForeignKey("assessment_components.id"),
        nullable=False
    )

    marks_obtained = Column(Float, nullable=False)