from database import SessionLocal

from models.user import User
from models.student import Student
from models.faculty import Faculty

from security import hash_password


db = SessionLocal()


def create_user_if_missing(
    email,
    password,
    role,
    student_id=None,
    faculty_id=None
):

    existing = db.query(User).filter(
        User.email == email
    ).first()


    if existing:

        print(
            f"User already exists: {email}"
        )

        return


    user = User(

        email=email,

        password_hash=
            hash_password(password),

        role=role,

        student_id=student_id,

        faculty_id=faculty_id

    )


    db.add(user)

    print(
        f"Created {role}: {email}"
    )



student = (
    db.query(Student)
    .filter(
        Student.id == 1
    )
    .first()
)


faculty = (
    db.query(Faculty)
    .filter(
        Faculty.id == 1
    )
    .first()
)


if student:

    create_user_if_missing(

        email=
            "student@acadence.com",

        password=
            "student123",

        role=
            "student",

        student_id=
            student.id

    )

else:

    print(
        "Student ID 1 was not found."
    )



if faculty:

    create_user_if_missing(

        email=
            "faculty@acadence.com",

        password=
            "faculty123",

        role=
            "faculty",

        faculty_id=
            faculty.id

    )

else:

    print(
        "Faculty ID 1 was not found."
    )



create_user_if_missing(

    email=
        "admin@acadence.com",

    password=
        "admin123",

    role=
        "admin"

)


db.commit()

db.close()


print(
    "User seeding completed."
)