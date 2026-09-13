from database import SessionLocal
from models.course import Course
from models.assessment import AssessmentComponent


db = SessionLocal()

courses = db.query(Course).all()


for course in courses:

    # THEORY SUBJECTS
    if course.course_type == "Theory":

        components = [
            ("Mid 1", 20),
            ("Mid 2", 20),
            ("Slip Test 1", 5),
            ("Slip Test 2", 5),
            ("Slip Test 3", 5),
            ("Assignment", 10),
            ("Attendance", 5),
            ("SEE", 60)
        ]

    # LABS
    elif course.course_type == "Practical":

        components = [
            ("Lab CIE", 50),
            ("Lab SEE", 50)
        ]

    # MINI PROJECT
    elif course.course_type == "Mini Project":

        components = [
            ("Mini Project CIE", 50)
        ]

    # INTERNSHIP
    elif course.course_type == "Internship":

        components = [
            ("Internship CIE", 50)
        ]

    # FINAL PROJECT
    elif course.course_type == "Project":

        components = [
            ("Project CIE", 100),
            ("Project SEE", 100)
        ]

    else:
        components = []


    for component_name, max_marks in components:

        existing = db.query(AssessmentComponent).filter(
            AssessmentComponent.course_id == course.id,
            AssessmentComponent.component_name == component_name
        ).first()

        if not existing:

            component = AssessmentComponent(
                course_id=course.id,
                component_name=component_name,
                max_marks=max_marks
            )

            db.add(component)


db.commit()
db.close()

print("Assessment components added successfully.")