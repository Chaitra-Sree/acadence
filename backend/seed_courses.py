from database import SessionLocal
from models.course import Course

db = SessionLocal()

courses = [
    # Semester I
    {"course_code": "25MCC101", "course_name": "Data Structures Using C++", "semester": 1, "course_type": "Theory", "cie_max": 40, "see_max": 60, "credits": 4},
    {"course_code": "25MCC102", "course_name": "Computer Architecture", "semester": 1, "course_type": "Theory", "cie_max": 40, "see_max": 60, "credits": 4},
    {"course_code": "25MCC103", "course_name": "Object-oriented programming using Java", "semester": 1, "course_type": "Theory", "cie_max": 40, "see_max": 60, "credits": 4},
    {"course_code": "25MTC101", "course_name": "Mathematical Foundation for Computer Science", "semester": 1, "course_type": "Theory", "cie_max": 40, "see_max": 60, "credits": 4},
    {"course_code": "25MTC102", "course_name": "Probability and Statistics for Data Science", "semester": 1, "course_type": "Theory", "cie_max": 40, "see_max": 60, "credits": 4},
    {"course_code": "25MCC104", "course_name": "Data Structures Using C++ Lab", "semester": 1, "course_type": "Practical", "cie_max": 50, "see_max": 50, "credits": 1.5},
    {"course_code": "25MCC105", "course_name": "Object Oriented Programming using Java Lab", "semester": 1, "course_type": "Practical", "cie_max": 50, "see_max": 50, "credits": 1.5},
    {"course_code": "25EG101", "course_name": "Professional Communication Skills Lab", "semester": 1, "course_type": "Practical", "cie_max": 50, "see_max": 50, "credits": 1},

    # Semester II
    {"course_code": "25MCC106", "course_name": "Database Management Systems", "semester": 2, "course_type": "Theory", "cie_max": 40, "see_max": 60, "credits": 4},
    {"course_code": "25MCC107", "course_name": "Web Technologies", "semester": 2, "course_type": "Theory", "cie_max": 40, "see_max": 60, "credits": 4},
    {"course_code": "25MCC108", "course_name": "Operating Systems", "semester": 2, "course_type": "Theory", "cie_max": 40, "see_max": 60, "credits": 4},
    {"course_code": "25MCC109", "course_name": "Data Engineering with Python", "semester": 2, "course_type": "Theory", "cie_max": 40, "see_max": 60, "credits": 4},

    # Semester III
    {"course_code": "25MCC113", "course_name": "Artificial Intelligence and Machine Learning", "semester": 3, "course_type": "Theory", "cie_max": 40, "see_max": 60, "credits": 4},
    {"course_code": "25MCC114", "course_name": "Software Engineering and DevOps", "semester": 3, "course_type": "Theory", "cie_max": 40, "see_max": 60, "credits": 4},
    {"course_code": "25MCC115", "course_name": "Computer Networks", "semester": 3, "course_type": "Theory", "cie_max": 40, "see_max": 60, "credits": 4},
    {"course_code": "25MCC116", "course_name": "Machine Learning Lab using Python", "semester": 3, "course_type": "Practical", "cie_max": 50, "see_max": 50, "credits": 1.5},
    {"course_code": "25MCC117", "course_name": "Software Engineering Lab", "semester": 3, "course_type": "Practical", "cie_max": 50, "see_max": 50, "credits": 1.5},
    {"course_code": "25MCC118", "course_name": "Mini Project with Seminar", "semester": 3, "course_type": "Mini Project", "cie_max": 50, "see_max": 0, "credits": 2.5},
    {"course_code": "25MCC119", "course_name": "Internship", "semester": 3, "course_type": "Internship", "cie_max": 50, "see_max": 0, "credits": 3},

    # Semester IV
    {"course_code": "25MCC121", "course_name": "Project Work", "semester": 4, "course_type": "Project", "cie_max": 100, "see_max": 100, "credits": 12},
]

for course_data in courses:
    existing = db.query(Course).filter(
        Course.course_code == course_data["course_code"]
    ).first()

    if not existing:
        db.add(Course(**course_data))

db.commit()
db.close()

print("Courses added successfully.")

