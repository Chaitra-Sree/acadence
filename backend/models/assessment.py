from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base


class AssessmentComponent(Base):
    __tablename__ = "assessment_components"

    id = Column(Integer, primary_key=True, index=True)

    course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=False
    )

    component_name = Column(String, nullable=False)

    max_marks = Column(Integer, nullable=False)