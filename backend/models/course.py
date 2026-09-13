from sqlalchemy import Column, Integer, String, Float
from database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)

    course_code = Column(String, nullable=False)
    course_name = Column(String, nullable=False)

    semester = Column(Integer, nullable=False)

    course_type = Column(String, nullable=False)

    cie_max = Column(Integer, nullable=False)
    see_max = Column(Integer, nullable=False)

    credits = Column(Float, nullable=False)