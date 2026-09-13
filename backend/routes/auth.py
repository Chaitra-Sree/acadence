from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from database import SessionLocal

from models.user import User
from models.student import Student
from models.faculty import Faculty

from schemas.auth import (
    LoginRequest,
    UserCreate
)

from security import (
    hash_password,
    verify_password,
    create_access_token
)

from auth_dependencies import (
    get_current_user,
    require_admin
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/login")
def login(
    login_data: LoginRequest
):

    db = SessionLocal()


    try:

        user = db.query(User).filter(
            User.email ==
            login_data.email
        ).first()


        if user is None:

            raise HTTPException(
                status_code=
                    status.HTTP_401_UNAUTHORIZED,
                detail=
                    "Invalid email or password"
            )


        if not verify_password(
            login_data.password,
            user.password_hash
        ):

            raise HTTPException(
                status_code=
                    status.HTTP_401_UNAUTHORIZED,
                detail=
                    "Invalid email or password"
            )


        access_token = (
            create_access_token({
                "sub": str(user.id),
                "role": user.role,

                "student_id":
                    user.student_id,

                "faculty_id":
                    user.faculty_id
            })
        )


        return {

            "access_token":
                access_token,

            "token_type":
                "bearer",

            "user_id":
                user.id,

            "email":
                user.email,

            "role":
                user.role,

            "student_id":
                user.student_id,

            "faculty_id":
                user.faculty_id
        }


    finally:

        db.close()



@router.get("/me")
def get_me(
    current_user: User =
        Depends(get_current_user)
):

    return {

        "id":
            current_user.id,

        "email":
            current_user.email,

        "role":
            current_user.role,

        "student_id":
            current_user.student_id,

        "faculty_id":
            current_user.faculty_id

    }



@router.post("/users")
def create_user(
    user_data: UserCreate,
    current_admin: User =
        Depends(require_admin)
):

    db = SessionLocal()


    try:

        role = (
            user_data.role
            .strip()
            .lower()
        )


        if role not in [
            "student",
            "faculty",
            "admin"
        ]:

            raise HTTPException(
                status_code=400,
                detail=
                    "Role must be student, faculty or admin"
            )


        existing_user = (
            db.query(User)
            .filter(
                User.email ==
                user_data.email
            )
            .first()
        )


        if existing_user:

            raise HTTPException(
                status_code=400,
                detail=
                    "A user with this email already exists"
            )


        if role == "student":

            if user_data.student_id is None:

                raise HTTPException(
                    status_code=400,
                    detail=
                        "student_id is required for student users"
                )


            student = (
                db.query(Student)
                .filter(
                    Student.id ==
                    user_data.student_id
                )
                .first()
            )


            if student is None:

                raise HTTPException(
                    status_code=404,
                    detail=
                        "Student not found"
                )


            existing_student_user = (
                db.query(User)
                .filter(
                    User.student_id ==
                    user_data.student_id
                )
                .first()
            )


            if existing_student_user:

                raise HTTPException(
                    status_code=400,
                    detail=
                        "This student already has a login account"
                )


        if role == "faculty":

            if user_data.faculty_id is None:

                raise HTTPException(
                    status_code=400,
                    detail=
                        "faculty_id is required for faculty users"
                )


            faculty = (
                db.query(Faculty)
                .filter(
                    Faculty.id ==
                    user_data.faculty_id
                )
                .first()
            )


            if faculty is None:

                raise HTTPException(
                    status_code=404,
                    detail=
                        "Faculty member not found"
                )


            existing_faculty_user = (
                db.query(User)
                .filter(
                    User.faculty_id ==
                    user_data.faculty_id
                )
                .first()
            )


            if existing_faculty_user:

                raise HTTPException(
                    status_code=400,
                    detail=
                        "This faculty member already has a login account"
                )


        new_user = User(

            email=
                user_data.email,

            password_hash=
                hash_password(
                    user_data.password
                ),

            role=
                role,

            student_id=
                user_data.student_id
                if role == "student"
                else None,

            faculty_id=
                user_data.faculty_id
                if role == "faculty"
                else None

        )


        db.add(new_user)

        db.commit()

        db.refresh(new_user)


        return {

            "message":
                "User created successfully",

            "user": {

                "id":
                    new_user.id,

                "email":
                    new_user.email,

                "role":
                    new_user.role,

                "student_id":
                    new_user.student_id,

                "faculty_id":
                    new_user.faculty_id
            }

        }


    finally:

        db.close()