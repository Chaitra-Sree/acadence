from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr

from database import SessionLocal

from models.student import Student
from models.faculty import Faculty
from models.course import Course
from models.program import Program
from models.enrollment import Enrollment
from models.faculty_course import FacultyCourse
from models.attendance import Attendance
from models.assessment import AssessmentComponent
from models.marks import Mark
from models.user import User

from auth_dependencies import require_admin
from security import hash_password


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# =========================================================
# REQUEST SCHEMAS
# =========================================================

class StudentCreateAdmin(BaseModel):
    roll_number: str
    name: str
    email: EmailStr
    batch: str
    semester: int
    password: str


class StudentUpdate(BaseModel):
    roll_number: str
    name: str
    email: EmailStr
    batch: str


class FacultyCreateAdmin(BaseModel):
    faculty_code: str
    name: str
    email: EmailStr
    department: str = "MCA"
    password: str


class FacultyUpdate(BaseModel):
    faculty_code: str
    name: str
    email: EmailStr
    department: str = "MCA"


class CourseCreateAdmin(BaseModel):
    course_code: str
    course_name: str
    semester: int
    course_type: str
    cie_max: int
    see_max: int
    credits: float


class CourseUpdate(BaseModel):
    course_code: str
    course_name: str
    semester: int
    course_type: str
    cie_max: int
    see_max: int
    credits: float


class FacultyCourseRequest(BaseModel):
    faculty_id: int
    course_id: int


# =========================================================
# HELPERS
# =========================================================

def validate_course_data(course_data):
    if course_data.semester not in [1, 2, 3, 4]:
        raise HTTPException(
            status_code=400,
            detail="Semester must be between 1 and 4"
        )

    if course_data.cie_max < 0:
        raise HTTPException(
            status_code=400,
            detail="CIE marks cannot be negative"
        )

    if course_data.see_max < 0:
        raise HTTPException(
            status_code=400,
            detail="SEE marks cannot be negative"
        )

    if course_data.credits <= 0:
        raise HTTPException(
            status_code=400,
            detail="Credits must be greater than zero"
        )


def create_assessment_components(db, course):
    course_type = course.course_type.strip().lower()

    components = []

    if course_type == "theory":
        components = [
            ("Mid 1", 20),
            ("Mid 2", 20),
            ("Slip Test 1", 5),
            ("Slip Test 2", 5),
            ("Slip Test 3", 5),
            ("Assignment", 10),
            ("Attendance", 5),
            ("SEE", 60),
        ]

    elif course_type == "practical":
        components = [
            ("Lab CIE", course.cie_max),
            ("Lab SEE", course.see_max),
        ]

    elif course_type == "mini project":
        components = [
            ("CIE", course.cie_max),
        ]

    elif course_type == "internship":
        components = [
            ("CIE", course.cie_max),
        ]

    elif course_type == "project":
        components = [
            ("CIE", course.cie_max),
            ("SEE", course.see_max),
        ]

    else:
        if course.cie_max > 0:
            components.append(
                ("CIE", course.cie_max)
            )

        if course.see_max > 0:
            components.append(
                ("SEE", course.see_max)
            )

    for component_name, max_marks in components:
        if max_marks <= 0:
            continue

        component = AssessmentComponent(
            course_id=course.id,
            component_name=component_name,
            max_marks=max_marks
        )

        db.add(component)


# =========================================================
# DASHBOARD SUMMARY
# =========================================================

@router.get("/summary")
def get_admin_summary(
    current_admin: User = Depends(require_admin)
):
    db = SessionLocal()

    try:
        return {
            "total_students": db.query(Student).count(),
            "total_faculty": db.query(Faculty).count(),
            "total_courses": db.query(Course).count(),
            "total_mappings": db.query(FacultyCourse).count()
        }

    finally:
        db.close()


# =========================================================
# STUDENT MANAGEMENT
# =========================================================

@router.get("/students")
def admin_get_students(
    current_admin: User = Depends(require_admin)
):
    db = SessionLocal()

    try:
        students = (
            db.query(Student)
            .order_by(Student.id.desc())
            .all()
        )

        result = []

        for student in students:
            enrollment = (
                db.query(Enrollment)
                .filter(
                    Enrollment.student_id == student.id
                )
                .first()
            )

            result.append({
                "id": student.id,
                "roll_number": student.roll_number,
                "name": student.name,
                "email": student.email,
                "batch": student.batch,
                "semester": (
                    enrollment.semester
                    if enrollment
                    else None
                )
            })

        return result

    finally:
        db.close()


@router.post("/students")
def admin_create_student(
    student_data: StudentCreateAdmin,
    current_admin: User = Depends(require_admin)
):
    db = SessionLocal()

    try:
        if student_data.semester not in [1, 2, 3, 4]:
            raise HTTPException(
                status_code=400,
                detail="Semester must be between 1 and 4"
            )

        if len(student_data.password) < 6:
            raise HTTPException(
                status_code=400,
                detail="Password must contain at least 6 characters"
            )

        existing_roll = (
            db.query(Student)
            .filter(
                Student.roll_number ==
                student_data.roll_number
            )
            .first()
        )

        if existing_roll:
            raise HTTPException(
                status_code=400,
                detail="Roll number already exists"
            )

        existing_student_email = (
            db.query(Student)
            .filter(
                Student.email ==
                student_data.email
            )
            .first()
        )

        if existing_student_email:
            raise HTTPException(
                status_code=400,
                detail="Student email already exists"
            )

        existing_user = (
            db.query(User)
            .filter(
                User.email ==
                student_data.email
            )
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="A login account already uses this email"
            )

        program = (
            db.query(Program)
            .filter(Program.code == "MCA")
            .first()
        )

        if program is None:
            program = db.query(Program).first()

        if program is None:
            raise HTTPException(
                status_code=400,
                detail="No academic programme exists. Create the MCA programme first."
            )

        student = Student(
            roll_number=student_data.roll_number,
            name=student_data.name,
            email=student_data.email,
            batch=student_data.batch
        )

        db.add(student)
        db.flush()

        enrollment = Enrollment(
            student_id=student.id,
            program_id=program.id,
            semester=student_data.semester
        )

        db.add(enrollment)

        user = User(
            email=student_data.email,
            password_hash=hash_password(
                student_data.password
            ),
            role="student",
            student_id=student.id,
            faculty_id=None
        )

        db.add(user)

        db.commit()
        db.refresh(student)

        return {
            "message": "Student created successfully",
            "student": {
                "id": student.id,
                "roll_number": student.roll_number,
                "name": student.name,
                "email": student.email,
                "batch": student.batch,
                "semester": student_data.semester
            }
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Could not create student: {str(error)}"
        )

    finally:
        db.close()


@router.put("/students/{student_id}")
def admin_update_student(
    student_id: int,
    student_data: StudentUpdate,
    current_admin: User = Depends(require_admin)
):
    db = SessionLocal()

    try:
        student = (
            db.query(Student)
            .filter(Student.id == student_id)
            .first()
        )

        if student is None:
            raise HTTPException(
                status_code=404,
                detail="Student not found"
            )

        duplicate_roll = (
            db.query(Student)
            .filter(
                Student.roll_number ==
                student_data.roll_number,
                Student.id != student_id
            )
            .first()
        )

        if duplicate_roll:
            raise HTTPException(
                status_code=400,
                detail="Another student already uses this roll number"
            )

        duplicate_email = (
            db.query(Student)
            .filter(
                Student.email ==
                student_data.email,
                Student.id != student_id
            )
            .first()
        )

        if duplicate_email:
            raise HTTPException(
                status_code=400,
                detail="Another student already uses this email"
            )

        duplicate_user = (
            db.query(User)
            .filter(
                User.email ==
                student_data.email,
                User.student_id != student_id
            )
            .first()
        )

        if duplicate_user:
            raise HTTPException(
                status_code=400,
                detail="Another login account already uses this email"
            )

        student.roll_number = student_data.roll_number
        student.name = student_data.name
        student.email = student_data.email
        student.batch = student_data.batch

        user = (
            db.query(User)
            .filter(
                User.student_id ==
                student_id
            )
            .first()
        )

        if user:
            user.email = student_data.email

        db.commit()
        db.refresh(student)

        return {
            "message": "Student updated successfully",
            "student": {
                "id": student.id,
                "roll_number": student.roll_number,
                "name": student.name,
                "email": student.email,
                "batch": student.batch
            }
        }

    except HTTPException:
        db.rollback()
        raise

    finally:
        db.close()


@router.delete("/students/{student_id}")
def admin_delete_student(
    student_id: int,
    current_admin: User = Depends(require_admin)
):
    db = SessionLocal()

    try:
        student = (
            db.query(Student)
            .filter(Student.id == student_id)
            .first()
        )

        if student is None:
            raise HTTPException(
                status_code=404,
                detail="Student not found"
            )

        db.query(User).filter(
            User.student_id == student_id
        ).delete(
            synchronize_session=False
        )

        db.query(Mark).filter(
            Mark.student_id == student_id
        ).delete(
            synchronize_session=False
        )

        db.query(Attendance).filter(
            Attendance.student_id == student_id
        ).delete(
            synchronize_session=False
        )

        db.query(Enrollment).filter(
            Enrollment.student_id == student_id
        ).delete(
            synchronize_session=False
        )

        db.delete(student)

        db.commit()

        return {
            "message": "Student deleted successfully"
        }

    finally:
        db.close()


# =========================================================
# FACULTY MANAGEMENT
# =========================================================

@router.get("/faculty")
def admin_get_faculty(
    current_admin: User = Depends(require_admin)
):
    db = SessionLocal()

    try:
        faculty_members = (
            db.query(Faculty)
            .order_by(Faculty.id.desc())
            .all()
        )

        return [
            {
                "id": faculty.id,
                "faculty_code": faculty.faculty_code,
                "name": faculty.name,
                "email": faculty.email,
                "department": faculty.department
            }
            for faculty in faculty_members
        ]

    finally:
        db.close()


@router.post("/faculty")
def admin_create_faculty(
    faculty_data: FacultyCreateAdmin,
    current_admin: User = Depends(require_admin)
):
    db = SessionLocal()

    try:
        if len(faculty_data.password) < 6:
            raise HTTPException(
                status_code=400,
                detail="Password must contain at least 6 characters"
            )

        existing_code = (
            db.query(Faculty)
            .filter(
                Faculty.faculty_code ==
                faculty_data.faculty_code
            )
            .first()
        )

        if existing_code:
            raise HTTPException(
                status_code=400,
                detail="Faculty code already exists"
            )

        existing_email = (
            db.query(Faculty)
            .filter(
                Faculty.email ==
                faculty_data.email
            )
            .first()
        )

        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Faculty email already exists"
            )

        existing_user = (
            db.query(User)
            .filter(
                User.email ==
                faculty_data.email
            )
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="A login account already uses this email"
            )

        faculty = Faculty(
            faculty_code=faculty_data.faculty_code,
            name=faculty_data.name,
            email=faculty_data.email,
            department=faculty_data.department
        )

        db.add(faculty)
        db.flush()

        user = User(
            email=faculty_data.email,
            password_hash=hash_password(
                faculty_data.password
            ),
            role="faculty",
            student_id=None,
            faculty_id=faculty.id
        )

        db.add(user)

        db.commit()
        db.refresh(faculty)

        return {
            "message": "Faculty created successfully",
            "faculty": {
                "id": faculty.id,
                "faculty_code": faculty.faculty_code,
                "name": faculty.name,
                "email": faculty.email,
                "department": faculty.department
            }
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Could not create faculty: {str(error)}"
        )

    finally:
        db.close()


@router.put("/faculty/{faculty_id}")
def admin_update_faculty(
    faculty_id: int,
    faculty_data: FacultyUpdate,
    current_admin: User = Depends(require_admin)
):
    db = SessionLocal()

    try:
        faculty = (
            db.query(Faculty)
            .filter(Faculty.id == faculty_id)
            .first()
        )

        if faculty is None:
            raise HTTPException(
                status_code=404,
                detail="Faculty member not found"
            )

        duplicate_code = (
            db.query(Faculty)
            .filter(
                Faculty.faculty_code ==
                faculty_data.faculty_code,
                Faculty.id != faculty_id
            )
            .first()
        )

        if duplicate_code:
            raise HTTPException(
                status_code=400,
                detail="Another faculty member already uses this faculty code"
            )

        duplicate_email = (
            db.query(Faculty)
            .filter(
                Faculty.email ==
                faculty_data.email,
                Faculty.id != faculty_id
            )
            .first()
        )

        if duplicate_email:
            raise HTTPException(
                status_code=400,
                detail="Another faculty member already uses this email"
            )

        duplicate_user = (
            db.query(User)
            .filter(
                User.email ==
                faculty_data.email,
                User.faculty_id != faculty_id
            )
            .first()
        )

        if duplicate_user:
            raise HTTPException(
                status_code=400,
                detail="Another login account already uses this email"
            )

        faculty.faculty_code = faculty_data.faculty_code
        faculty.name = faculty_data.name
        faculty.email = faculty_data.email
        faculty.department = faculty_data.department

        user = (
            db.query(User)
            .filter(
                User.faculty_id ==
                faculty_id
            )
            .first()
        )

        if user:
            user.email = faculty_data.email

        db.commit()
        db.refresh(faculty)

        return {
            "message": "Faculty updated successfully",
            "faculty": {
                "id": faculty.id,
                "faculty_code": faculty.faculty_code,
                "name": faculty.name,
                "email": faculty.email,
                "department": faculty.department
            }
        }

    except HTTPException:
        db.rollback()
        raise

    finally:
        db.close()


@router.delete("/faculty/{faculty_id}")
def admin_delete_faculty(
    faculty_id: int,
    current_admin: User = Depends(require_admin)
):
    db = SessionLocal()

    try:
        faculty = (
            db.query(Faculty)
            .filter(Faculty.id == faculty_id)
            .first()
        )

        if faculty is None:
            raise HTTPException(
                status_code=404,
                detail="Faculty member not found"
            )

        db.query(User).filter(
            User.faculty_id == faculty_id
        ).delete(
            synchronize_session=False
        )

        db.query(FacultyCourse).filter(
            FacultyCourse.faculty_id == faculty_id
        ).delete(
            synchronize_session=False
        )

        db.delete(faculty)

        db.commit()

        return {
            "message": "Faculty deleted successfully"
        }

    finally:
        db.close()


# =========================================================
# COURSE MANAGEMENT
# =========================================================

@router.get("/courses")
def admin_get_courses(
    current_admin: User = Depends(require_admin)
):
    db = SessionLocal()

    try:
        courses = (
            db.query(Course)
            .order_by(
                Course.semester.asc(),
                Course.course_code.asc()
            )
            .all()
        )

        return [
            {
                "id": course.id,
                "course_code": course.course_code,
                "course_name": course.course_name,
                "semester": course.semester,
                "course_type": course.course_type,
                "cie_max": course.cie_max,
                "see_max": course.see_max,
                "credits": course.credits
            }
            for course in courses
        ]

    finally:
        db.close()


@router.post("/courses")
def admin_create_course(
    course_data: CourseCreateAdmin,
    current_admin: User = Depends(require_admin)
):
    db = SessionLocal()

    try:
        validate_course_data(course_data)

        existing_course = (
            db.query(Course)
            .filter(
                Course.course_code ==
                course_data.course_code
            )
            .first()
        )

        if existing_course:
            raise HTTPException(
                status_code=400,
                detail="Course code already exists"
            )

        course = Course(
            course_code=course_data.course_code,
            course_name=course_data.course_name,
            semester=course_data.semester,
            course_type=course_data.course_type,
            cie_max=course_data.cie_max,
            see_max=course_data.see_max,
            credits=course_data.credits
        )

        db.add(course)
        db.flush()

        create_assessment_components(
            db,
            course
        )

        db.commit()
        db.refresh(course)

        return {
            "message": "Course created successfully",
            "course": {
                "id": course.id,
                "course_code": course.course_code,
                "course_name": course.course_name,
                "semester": course.semester,
                "course_type": course.course_type,
                "cie_max": course.cie_max,
                "see_max": course.see_max,
                "credits": course.credits
            }
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Could not create course: {str(error)}"
        )

    finally:
        db.close()


@router.put("/courses/{course_id}")
def admin_update_course(
    course_id: int,
    course_data: CourseUpdate,
    current_admin: User = Depends(require_admin)
):
    db = SessionLocal()

    try:
        validate_course_data(course_data)

        course = (
            db.query(Course)
            .filter(Course.id == course_id)
            .first()
        )

        if course is None:
            raise HTTPException(
                status_code=404,
                detail="Course not found"
            )

        duplicate_code = (
            db.query(Course)
            .filter(
                Course.course_code ==
                course_data.course_code,
                Course.id != course_id
            )
            .first()
        )

        if duplicate_code:
            raise HTTPException(
                status_code=400,
                detail="Another course already uses this course code"
            )

        course.course_code = course_data.course_code
        course.course_name = course_data.course_name
        course.semester = course_data.semester
        course.course_type = course_data.course_type
        course.cie_max = course_data.cie_max
        course.see_max = course_data.see_max
        course.credits = course_data.credits

        db.commit()
        db.refresh(course)

        return {
            "message": "Course updated successfully",
            "course": {
                "id": course.id,
                "course_code": course.course_code,
                "course_name": course.course_name,
                "semester": course.semester,
                "course_type": course.course_type,
                "cie_max": course.cie_max,
                "see_max": course.see_max,
                "credits": course.credits
            }
        }

    finally:
        db.close()


@router.delete("/courses/{course_id}")
def admin_delete_course(
    course_id: int,
    current_admin: User = Depends(require_admin)
):
    db = SessionLocal()

    try:
        course = (
            db.query(Course)
            .filter(Course.id == course_id)
            .first()
        )

        if course is None:
            raise HTTPException(
                status_code=404,
                detail="Course not found"
            )

        component_ids = [
            component.id
            for component in (
                db.query(AssessmentComponent)
                .filter(
                    AssessmentComponent.course_id ==
                    course_id
                )
                .all()
            )
        ]

        if component_ids:
            db.query(Mark).filter(
                Mark.assessment_component_id.in_(
                    component_ids
                )
            ).delete(
                synchronize_session=False
            )

        db.query(AssessmentComponent).filter(
            AssessmentComponent.course_id ==
            course_id
        ).delete(
            synchronize_session=False
        )

        db.query(Attendance).filter(
            Attendance.course_id ==
            course_id
        ).delete(
            synchronize_session=False
        )

        db.query(FacultyCourse).filter(
            FacultyCourse.course_id ==
            course_id
        ).delete(
            synchronize_session=False
        )

        db.delete(course)

        db.commit()

        return {
            "message": "Course deleted successfully"
        }

    finally:
        db.close()


# =========================================================
# FACULTY COURSE MAPPING
# =========================================================

@router.get("/course-mappings")
def admin_get_course_mappings(
    current_admin: User = Depends(require_admin)
):
    db = SessionLocal()

    try:
        mappings = (
            db.query(
                FacultyCourse,
                Faculty,
                Course
            )
            .join(
                Faculty,
                FacultyCourse.faculty_id ==
                Faculty.id
            )
            .join(
                Course,
                FacultyCourse.course_id ==
                Course.id
            )
            .order_by(
                Faculty.name.asc(),
                Course.semester.asc()
            )
            .all()
        )

        return [
            {
                "id": mapping.id,
                "faculty_id": faculty.id,
                "faculty_code": faculty.faculty_code,
                "faculty_name": faculty.name,
                "course_id": course.id,
                "course_code": course.course_code,
                "course_name": course.course_name,
                "semester": course.semester
            }
            for mapping, faculty, course
            in mappings
        ]

    finally:
        db.close()


@router.post("/course-mappings")
def admin_create_course_mapping(
    mapping_data: FacultyCourseRequest,
    current_admin: User = Depends(require_admin)
):
    db = SessionLocal()

    try:
        faculty = (
            db.query(Faculty)
            .filter(
                Faculty.id ==
                mapping_data.faculty_id
            )
            .first()
        )

        if faculty is None:
            raise HTTPException(
                status_code=404,
                detail="Faculty member not found"
            )

        course = (
            db.query(Course)
            .filter(
                Course.id ==
                mapping_data.course_id
            )
            .first()
        )

        if course is None:
            raise HTTPException(
                status_code=404,
                detail="Course not found"
            )

        existing = (
            db.query(FacultyCourse)
            .filter(
                FacultyCourse.faculty_id ==
                mapping_data.faculty_id,

                FacultyCourse.course_id ==
                mapping_data.course_id
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail="This faculty-course mapping already exists"
            )

        mapping = FacultyCourse(
            faculty_id=mapping_data.faculty_id,
            course_id=mapping_data.course_id
        )

        db.add(mapping)
        db.commit()
        db.refresh(mapping)

        return {
            "message": "Course assigned successfully",
            "mapping_id": mapping.id
        }

    finally:
        db.close()


@router.delete("/course-mappings/{mapping_id}")
def admin_delete_course_mapping(
    mapping_id: int,
    current_admin: User = Depends(require_admin)
):
    db = SessionLocal()

    try:
        mapping = (
            db.query(FacultyCourse)
            .filter(
                FacultyCourse.id ==
                mapping_id
            )
            .first()
        )

        if mapping is None:
            raise HTTPException(
                status_code=404,
                detail="Course mapping not found"
            )

        db.delete(mapping)
        db.commit()

        return {
            "message": "Course mapping removed successfully"
        }

    finally:
        db.close()


# =========================================================
# PROGRAMME ANALYTICS
# =========================================================

@router.get("/analytics")
def admin_analytics(
    current_admin: User = Depends(require_admin)
):
    db = SessionLocal()

    try:
        students = db.query(Student).all()
        faculty = db.query(Faculty).all()
        courses = db.query(Course).all()

        attendance_records = (
            db.query(Attendance)
            .all()
        )

        semester_counts = {
            1: 0,
            2: 0,
            3: 0,
            4: 0
        }

        for course in courses:
            semester_counts[
                course.semester
            ] = (
                semester_counts.get(
                    course.semester,
                    0
                ) + 1
            )

        attendance_percentages = []

        for record in attendance_records:
            if record.classes_held > 0:
                percentage = (
                    record.classes_attended /
                    record.classes_held
                ) * 100

                attendance_percentages.append(
                    percentage
                )

        if attendance_percentages:
            average_attendance = round(
                sum(
                    attendance_percentages
                ) /
                len(
                    attendance_percentages
                ),
                2
            )

        else:
            average_attendance = 0

        return {
            "total_students": len(students),
            "total_faculty": len(faculty),
            "total_courses": len(courses),
            "average_attendance": average_attendance,

            "semester_course_distribution": [
                {
                    "semester": semester,
                    "courses":
                        semester_counts.get(
                            semester,
                            0
                        )
                }
                for semester
                in [1, 2, 3, 4]
            ]
        }

    finally:
        db.close()