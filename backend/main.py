from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends

from auth_dependencies import get_current_user, require_admin

from database import Base, engine, SessionLocal

from routes.auth import router as auth_router
from routes.admin import router as admin_router
from routes.faculty_portal import router as faculty_portal_router

from models.student import Student
from models.program import Program
from models.enrollment import Enrollment
from models.course import Course
from models.assessment import AssessmentComponent
from models.marks import Mark
from models.attendance import Attendance
from models.faculty import Faculty
from models.faculty_course import FacultyCourse
from models.user import User

from schemas.student import StudentCreate
from schemas.program import ProgramCreate
from schemas.enrollment import EnrollmentCreate
from schemas.course import CourseCreate
from schemas.assessment import AssessmentCreate
from schemas.marks import MarkCreate
from schemas.attendance import AttendanceCreate
from schemas.faculty import FacultyCreate
from schemas.faculty_course import FacultyCourseCreate


# =========================================================
# APP SETUP
# =========================================================

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Acadence API",
    description="Academic Performance Analytics and Management System",
    version="1.0.0",
)

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(faculty_portal_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "https://Chaitra-Sree.github.io",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# ACADEMIC HELPERS
# =========================================================

def get_grade_point(marks_percentage: float) -> int:
    if marks_percentage >= 90:
        return 10
    elif marks_percentage >= 80:
        return 9
    elif marks_percentage >= 70:
        return 8
    elif marks_percentage >= 60:
        return 7
    elif marks_percentage >= 50:
        return 6
    elif marks_percentage >= 40:
        return 5
    return 0


def get_grade_letter(marks_percentage: float) -> str:
    if marks_percentage >= 90:
        return "S"
    elif marks_percentage >= 80:
        return "A"
    elif marks_percentage >= 70:
        return "B"
    elif marks_percentage >= 60:
        return "C"
    elif marks_percentage >= 50:
        return "D"
    elif marks_percentage >= 40:
        return "E"
    return "F"


def get_attendance_percentage(record: Attendance | None):
    if record is None or record.classes_held <= 0:
        return None

    return round(
        (record.classes_attended / record.classes_held) * 100,
        2,
    )


def get_attendance_mark(percentage):
    """
    CBIT MCA attendance contribution out of 5:
    >=85 -> 5
    >=80 -> 4
    >=75 -> 3
    >=70 -> 2
    >=65 -> 1
    <65  -> 0
    """
    if percentage is None:
        return None
    if percentage >= 85:
        return 5
    elif percentage >= 80:
        return 4
    elif percentage >= 75:
        return 3
    elif percentage >= 70:
        return 2
    elif percentage >= 65:
        return 1
    return 0


def get_attendance_status(percentage):
    if percentage is None:
        return "Not Recorded"
    if percentage >= 75:
        return "Safe"
    return "Attendance Shortage"


def get_course_marks_dict(db, student_id: int, course_id: int):
    results = (
        db.query(Mark, AssessmentComponent)
        .join(
            AssessmentComponent,
            Mark.assessment_component_id == AssessmentComponent.id,
        )
        .filter(
            Mark.student_id == student_id,
            AssessmentComponent.course_id == course_id,
        )
        .all()
    )

    marks = {}
    component_max = {}

    for mark, component in results:
        # Attendance is no longer accepted as a manually-scored academic mark.
        if component.component_name == "Attendance":
            continue

        marks[component.component_name] = mark.marks_obtained
        component_max[component.component_name] = component.max_marks

    return marks, component_max


def get_attendance_record(db, student_id: int, course_id: int):
    return (
        db.query(Attendance)
        .filter(
            Attendance.student_id == student_id,
            Attendance.course_id == course_id,
        )
        .first()
    )


def evaluate_course(db, student_id: int, course: Course):
    """
    Produces one consistent result for theory, labs and project-style courses.

    Important rule:
    Missing marks are NOT treated as zero.
    A course is included in SGPA only when every required component is entered.
    """
    marks, component_max = get_course_marks_dict(
        db,
        student_id,
        course.id,
    )

    course_type = (course.course_type or "").strip().lower()

    # -----------------------------------------------------
    # THEORY
    # -----------------------------------------------------
    if course_type == "theory":
        required_mark_components = [
            "Mid 1",
            "Mid 2",
            "Slip Test 1",
            "Slip Test 2",
            "Slip Test 3",
            "Assignment",
            "SEE",
        ]

        missing_components = [
            component
            for component in required_mark_components
            if component not in marks
        ]

        attendance_record = get_attendance_record(
            db,
            student_id,
            course.id,
        )

        attendance_percentage = get_attendance_percentage(
            attendance_record
        )
        attendance_mark = get_attendance_mark(
            attendance_percentage
        )

        if attendance_mark is None:
            missing_components.append("Attendance")

        mid_average = None
        if "Mid 1" in marks and "Mid 2" in marks:
            mid_average = (
                marks["Mid 1"] + marks["Mid 2"]
            ) / 2

        slip_values = [
            marks[name]
            for name in [
                "Slip Test 1",
                "Slip Test 2",
                "Slip Test 3",
            ]
            if name in marks
        ]

        best_two_slip_average = None
        if len(slip_values) >= 2:
            best_two = sorted(
                slip_values,
                reverse=True,
            )[:2]

            best_two_slip_average = (
                best_two[0] + best_two[1]
            ) / 2

        assignment = marks.get("Assignment")
        see_marks = marks.get("SEE")

        cie_total = None

        if (
            mid_average is not None
            and len(slip_values) == 3
            and assignment is not None
            and attendance_mark is not None
        ):
            cie_total = (
                mid_average
                + best_two_slip_average
                + assignment
                + attendance_mark
            )

        complete = (
            len(missing_components) == 0
            and cie_total is not None
            and see_marks is not None
        )

        final_total = None
        marks_percentage = None
        grade_point = None
        grade = None
        credit_points = None

        if complete:
            final_total = cie_total + see_marks

            # Theory is 40 CIE + 60 SEE = 100.
            marks_percentage = round(final_total, 2)
            grade_point = get_grade_point(marks_percentage)
            grade = get_grade_letter(marks_percentage)
            credit_points = round(
                course.credits * grade_point,
                2,
            )

        return {
            "course_id": course.id,
            "course_code": course.course_code,
            "course_name": course.course_name,
            "course_type": course.course_type,
            "credits": course.credits,
            "status": "Complete" if complete else "Incomplete",
            "complete": complete,
            "missing_components": missing_components,
            "mid_1": marks.get("Mid 1"),
            "mid_2": marks.get("Mid 2"),
            "mid_average": (
                round(mid_average, 2)
                if mid_average is not None
                else None
            ),
            "slip_test_1": marks.get("Slip Test 1"),
            "slip_test_2": marks.get("Slip Test 2"),
            "slip_test_3": marks.get("Slip Test 3"),
            "best_two_slip_average": (
                round(best_two_slip_average, 2)
                if best_two_slip_average is not None
                else None
            ),
            "assignment": assignment,
            "attendance_percentage": attendance_percentage,
            "attendance_mark": attendance_mark,
            "attendance_status": get_attendance_status(
                attendance_percentage
            ),
            "cie_total": (
                round(cie_total, 2)
                if cie_total is not None
                else None
            ),
            "see_marks": see_marks,
            "final_total": (
                round(final_total, 2)
                if final_total is not None
                else None
            ),
            "marks_percentage": marks_percentage,
            "grade": grade,
            "grade_point": grade_point,
            "credit_points": credit_points,
        }

    # -----------------------------------------------------
    # NON-THEORY
    # -----------------------------------------------------
    configured_components = (
        db.query(AssessmentComponent)
        .filter(
            AssessmentComponent.course_id == course.id,
            AssessmentComponent.component_name != "Attendance",
        )
        .all()
    )

    required_names = [
        component.component_name
        for component in configured_components
    ]

    missing_components = [
        name
        for name in required_names
        if name not in marks
    ]

    complete = (
        len(required_names) > 0
        and len(missing_components) == 0
    )

    total_obtained = None
    total_max = None
    marks_percentage = None
    grade_point = None
    grade = None
    credit_points = None

    if complete:
        total_obtained = sum(
            marks[name]
            for name in required_names
        )

        total_max = sum(
            component.max_marks
            for component in configured_components
        )

        if total_max > 0:
            marks_percentage = round(
                (total_obtained / total_max) * 100,
                2,
            )

            grade_point = get_grade_point(
                marks_percentage
            )
            grade = get_grade_letter(
                marks_percentage
            )
            credit_points = round(
                course.credits * grade_point,
                2,
            )
        else:
            complete = False
            missing_components.append(
                "Valid assessment maximum"
            )

    return {
        "course_id": course.id,
        "course_code": course.course_code,
        "course_name": course.course_name,
        "course_type": course.course_type,
        "credits": course.credits,
        "status": "Complete" if complete else "Incomplete",
        "complete": complete,
        "missing_components": missing_components,
        "total_obtained": (
            round(total_obtained, 2)
            if total_obtained is not None
            else None
        ),
        "total_max": total_max,
        "marks_percentage": marks_percentage,
        "grade": grade,
        "grade_point": grade_point,
        "credit_points": credit_points,
    }


def calculate_student_sgpa(db, student_id: int, semester: int):
    courses = (
        db.query(Course)
        .filter(Course.semester == semester)
        .order_by(Course.course_code.asc())
        .all()
    )

    course_results = []

    total_credit_points = 0.0
    completed_credits = 0.0
    semester_registered_credits = sum(
        course.credits
        for course in courses
    )

    for course in courses:
        result = evaluate_course(
            db,
            student_id,
            course,
        )

        course_results.append(result)

        if result["complete"]:
            completed_credits += course.credits
            total_credit_points += (
                result["credit_points"] or 0
            )

    completed_courses = sum(
        1
        for course in course_results
        if course["complete"]
    )

    incomplete_courses = (
        len(course_results)
        - completed_courses
    )

    sgpa = None

    if completed_credits > 0:
        sgpa = round(
            total_credit_points /
            completed_credits,
            2,
        )

    # A semester is "fully complete" only when every configured course
    # for that semester is complete.
    semester_complete = (
        len(courses) > 0
        and incomplete_courses == 0
    )

    return {
        "semester": semester,
        "courses": course_results,
        "registered_credits": round(
            semester_registered_credits,
            2,
        ),
        "total_credits": round(
            completed_credits,
            2,
        ),
        "completed_credits": round(
            completed_credits,
            2,
        ),
        "total_credit_points": round(
            total_credit_points,
            2,
        ),
        "completed_courses": completed_courses,
        "incomplete_courses": incomplete_courses,
        "semester_complete": semester_complete,
        "sgpa": sgpa,
    }


# =========================================================
# ACCESS CONTROL HELPERS
# =========================================================

def require_student_owner(
    student_id: int,
    current_user: User,
):
    """
    Student users may access only their own academic records.
    Admin users may access any student's records.

    Faculty access to student academic data is intentionally handled
    through the protected /faculty-portal/... routes, where course
    ownership is checked separately.
    """
    if current_user.role == "admin":
        return

    if current_user.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Student or admin access required",
        )

    if current_user.student_id is None:
        raise HTTPException(
            status_code=403,
            detail="Student account is not linked to a student profile",
        )

    if current_user.student_id != student_id:
        raise HTTPException(
            status_code=403,
            detail="You can access only your own academic records",
        )


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def home():
    return {
        "message": "Acadence MCA Academic Dashboard API is running"
    }


# =========================================================
# STUDENTS
# =========================================================

@app.post("/students")
def create_student(
    student: StudentCreate,
    current_admin: User = Depends(require_admin),
):
    db = SessionLocal()

    try:
        existing_roll = (
            db.query(Student)
            .filter(
                Student.roll_number == student.roll_number
            )
            .first()
        )

        if existing_roll:
            raise HTTPException(
                status_code=400,
                detail="Roll number already exists",
            )

        existing_email = (
            db.query(Student)
            .filter(
                Student.email == student.email
            )
            .first()
        )

        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Student email already exists",
            )

        new_student = Student(
            roll_number=student.roll_number,
            name=student.name,
            email=student.email,
            batch=student.batch,
        )

        db.add(new_student)
        db.commit()
        db.refresh(new_student)

        return new_student

    finally:
        db.close()


@app.get("/students")
def get_students(
    current_admin: User = Depends(require_admin),
):
    db = SessionLocal()

    try:
        return db.query(Student).all()

    finally:
        db.close()


# =========================================================
# COURSES
# =========================================================

@app.post("/courses")
def create_course(
    course: CourseCreate,
    current_admin: User = Depends(require_admin),
):
    db = SessionLocal()

    try:
        if course.semester not in [1, 2, 3, 4]:
            raise HTTPException(
                status_code=400,
                detail="Semester must be between 1 and 4",
            )

        if course.cie_max < 0 or course.see_max < 0:
            raise HTTPException(
                status_code=400,
                detail="CIE and SEE maximum marks cannot be negative",
            )

        if course.credits <= 0:
            raise HTTPException(
                status_code=400,
                detail="Credits must be greater than zero",
            )

        duplicate = (
            db.query(Course)
            .filter(
                Course.course_code == course.course_code
            )
            .first()
        )

        if duplicate:
            raise HTTPException(
                status_code=400,
                detail="Course code already exists",
            )

        new_course = Course(
            course_code=course.course_code,
            course_name=course.course_name,
            semester=course.semester,
            course_type=course.course_type,
            cie_max=course.cie_max,
            see_max=course.see_max,
            credits=course.credits,
        )

        db.add(new_course)
        db.commit()
        db.refresh(new_course)

        return new_course

    finally:
        db.close()


@app.get("/courses")
def get_courses(
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        return (
            db.query(Course)
            .order_by(
                Course.semester.asc(),
                Course.course_code.asc(),
            )
            .all()
        )

    finally:
        db.close()


@app.get("/courses/semester/{semester}")
def get_courses_by_semester(
    semester: int,
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        return (
            db.query(Course)
            .filter(Course.semester == semester)
            .order_by(Course.course_code.asc())
            .all()
        )

    finally:
        db.close()


# =========================================================
# ENROLLMENTS / PROGRAMS
# =========================================================

@app.post("/enrollments")
def create_enrollment(
    enrollment: EnrollmentCreate,
    current_admin: User = Depends(require_admin),
):
    db = SessionLocal()

    try:
        new_enrollment = Enrollment(
            student_id=enrollment.student_id,
            program_id=enrollment.program_id,
            semester=enrollment.semester,
        )

        db.add(new_enrollment)
        db.commit()
        db.refresh(new_enrollment)

        return new_enrollment

    finally:
        db.close()


@app.get("/enrollments")
def get_enrollments(
    current_admin: User = Depends(require_admin),
):
    db = SessionLocal()

    try:
        return db.query(Enrollment).all()

    finally:
        db.close()


@app.post("/programs")
def create_program(
    program: ProgramCreate,
    current_admin: User = Depends(require_admin),
):
    db = SessionLocal()

    try:
        new_program = Program(
            name=program.name,
            code=program.code,
            total_semesters=program.total_semesters,
        )

        db.add(new_program)
        db.commit()
        db.refresh(new_program)

        return new_program

    finally:
        db.close()


# =========================================================
# ASSESSMENT COMPONENTS
# =========================================================

@app.post("/assessment-components")
def create_assessment_component(
    component: AssessmentCreate,
    current_admin: User = Depends(require_admin),
):
    db = SessionLocal()

    try:
        if component.component_name.strip().lower() == "attendance":
            raise HTTPException(
                status_code=400,
                detail=(
                    "Attendance marks are automatic and should "
                    "not be created as a manually-entered component."
                ),
            )

        new_component = AssessmentComponent(
            course_id=component.course_id,
            component_name=component.component_name,
            max_marks=component.max_marks,
        )

        db.add(new_component)
        db.commit()
        db.refresh(new_component)

        return new_component

    finally:
        db.close()


@app.get("/assessment-components/course/{course_id}")
def get_assessment_components(
    course_id: int,
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        # Hide the old seeded "Attendance" assessment component from
        # faculty marks entry. Attendance is calculated from attendance data.
        return (
            db.query(AssessmentComponent)
            .filter(
                AssessmentComponent.course_id == course_id,
                AssessmentComponent.component_name != "Attendance",
            )
            .all()
        )

    finally:
        db.close()


# =========================================================
# MARKS
# =========================================================

@app.post("/marks")
def create_or_update_mark(
    mark: MarkCreate,
    current_admin: User = Depends(require_admin),
):
    db = SessionLocal()

    try:
        student = (
            db.query(Student)
            .filter(Student.id == mark.student_id)
            .first()
        )

        if student is None:
            raise HTTPException(
                status_code=404,
                detail="Student not found",
            )

        component = (
            db.query(AssessmentComponent)
            .filter(
                AssessmentComponent.id ==
                mark.assessment_component_id
            )
            .first()
        )

        if component is None:
            raise HTTPException(
                status_code=404,
                detail="Assessment component not found",
            )

        if component.component_name == "Attendance":
            raise HTTPException(
                status_code=400,
                detail=(
                    "Attendance marks are calculated automatically "
                    "from subject attendance."
                ),
            )

        if (
            mark.marks_obtained < 0
            or mark.marks_obtained > component.max_marks
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Marks must be between 0 and "
                    f"{component.max_marks}"
                ),
            )

        existing_mark = (
            db.query(Mark)
            .filter(
                Mark.student_id == mark.student_id,
                Mark.assessment_component_id ==
                mark.assessment_component_id,
            )
            .first()
        )

        if existing_mark:
            existing_mark.marks_obtained = (
                mark.marks_obtained
            )

            db.commit()
            db.refresh(existing_mark)

            return {
                "message": "Marks updated successfully",
                "mark": {
                    "id": existing_mark.id,
                    "student_id": existing_mark.student_id,
                    "assessment_component_id":
                        existing_mark.assessment_component_id,
                    "marks_obtained":
                        existing_mark.marks_obtained,
                },
            }

        new_mark = Mark(
            student_id=mark.student_id,
            assessment_component_id=
                mark.assessment_component_id,
            marks_obtained=mark.marks_obtained,
        )

        db.add(new_mark)
        db.commit()
        db.refresh(new_mark)

        return {
            "message": "Marks added successfully",
            "mark": {
                "id": new_mark.id,
                "student_id": new_mark.student_id,
                "assessment_component_id":
                    new_mark.assessment_component_id,
                "marks_obtained":
                    new_mark.marks_obtained,
            },
        }

    finally:
        db.close()


@app.get("/marks")
def get_marks(
    current_admin: User = Depends(require_admin),
):
    db = SessionLocal()

    try:
        return db.query(Mark).all()

    finally:
        db.close()


@app.get("/marks/student/{student_id}")
def get_student_marks(
    student_id: int,
    current_user: User = Depends(get_current_user),
):
    require_student_owner(student_id, current_user)
    db = SessionLocal()

    try:
        return (
            db.query(Mark)
            .filter(
                Mark.student_id == student_id
            )
            .all()
        )

    finally:
        db.close()


@app.get("/marks/student/{student_id}/course/{course_id}")
def get_student_course_marks(
    student_id: int,
    course_id: int,
    current_user: User = Depends(get_current_user),
):
    require_student_owner(student_id, current_user)
    db = SessionLocal()

    try:
        results = (
            db.query(Mark, AssessmentComponent)
            .join(
                AssessmentComponent,
                Mark.assessment_component_id ==
                AssessmentComponent.id,
            )
            .filter(
                Mark.student_id == student_id,
                AssessmentComponent.course_id == course_id,
                AssessmentComponent.component_name != "Attendance",
            )
            .all()
        )

        response = []

        for mark, component in results:
            response.append({
                "assessment_component_id": component.id,
                "component_name": component.component_name,
                "marks_obtained": mark.marks_obtained,
                "max_marks": component.max_marks,
            })

        return response

    finally:
        db.close()


@app.get(
    "/marks/student/{student_id}/course/{course_id}/summary"
)
def get_course_mark_summary(
    student_id: int,
    course_id: int,
    current_user: User = Depends(get_current_user),
):
    require_student_owner(student_id, current_user)
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
                detail="Course not found",
            )

        result = evaluate_course(
            db,
            student_id,
            course,
        )

        if (
            (course.course_type or "")
            .strip()
            .lower() == "theory"
        ):
            return {
                "course_id": course.id,
                "course_code": course.course_code,
                "status": result["status"],
                "complete": result["complete"],
                "missing_components":
                    result["missing_components"],
                "mid_1": result["mid_1"],
                "mid_2": result["mid_2"],
                "mid_average": result["mid_average"],
                "slip_test_1": result["slip_test_1"],
                "slip_test_2": result["slip_test_2"],
                "slip_test_3": result["slip_test_3"],
                "best_two_slip_average":
                    result["best_two_slip_average"],
                "assignment": result["assignment"],
                "attendance_percentage":
                    result["attendance_percentage"],
                "attendance":
                    result["attendance_mark"],
                "attendance_mark":
                    result["attendance_mark"],
                "attendance_status":
                    result["attendance_status"],
                "cie_total": result["cie_total"],
                "see_marks": result["see_marks"],
                "final_total": result["final_total"],
                "marks_percentage":
                    result["marks_percentage"],
                "grade": result["grade"],
                "grade_point": result["grade_point"],
            }

        return result

    finally:
        db.close()


# =========================================================
# ATTENDANCE
# =========================================================

@app.post("/attendance")
def create_or_update_attendance(
    attendance: AttendanceCreate,
    current_admin: User = Depends(require_admin),
):
    db = SessionLocal()

    try:
        if (
            attendance.classes_held < 0
            or attendance.classes_attended < 0
        ):
            raise HTTPException(
                status_code=400,
                detail="Attendance values cannot be negative",
            )

        if (
            attendance.classes_attended >
            attendance.classes_held
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Classes attended cannot be greater "
                    "than classes held"
                ),
            )

        student = (
            db.query(Student)
            .filter(
                Student.id == attendance.student_id
            )
            .first()
        )

        if student is None:
            raise HTTPException(
                status_code=404,
                detail="Student not found",
            )

        course = (
            db.query(Course)
            .filter(
                Course.id == attendance.course_id
            )
            .first()
        )

        if course is None:
            raise HTTPException(
                status_code=404,
                detail="Course not found",
            )

        existing = (
            db.query(Attendance)
            .filter(
                Attendance.student_id ==
                attendance.student_id,
                Attendance.course_id ==
                attendance.course_id,
            )
            .first()
        )

        if existing:
            existing.classes_held = (
                attendance.classes_held
            )
            existing.classes_attended = (
                attendance.classes_attended
            )

            db.commit()
            db.refresh(existing)

            percentage = get_attendance_percentage(
                existing
            )

            return {
                "message": "Attendance updated successfully",
                "attendance": {
                    "id": existing.id,
                    "student_id": existing.student_id,
                    "course_id": existing.course_id,
                    "classes_held": existing.classes_held,
                    "classes_attended":
                        existing.classes_attended,
                    "attendance_percentage":
                        percentage,
                    "attendance_mark":
                        get_attendance_mark(percentage),
                    "status":
                        get_attendance_status(percentage),
                },
            }

        new_attendance = Attendance(
            student_id=attendance.student_id,
            course_id=attendance.course_id,
            classes_held=attendance.classes_held,
            classes_attended=attendance.classes_attended,
        )

        db.add(new_attendance)
        db.commit()
        db.refresh(new_attendance)

        percentage = get_attendance_percentage(
            new_attendance
        )

        return {
            "message": "Attendance added successfully",
            "attendance": {
                "id": new_attendance.id,
                "student_id": new_attendance.student_id,
                "course_id": new_attendance.course_id,
                "classes_held": new_attendance.classes_held,
                "classes_attended":
                    new_attendance.classes_attended,
                "attendance_percentage": percentage,
                "attendance_mark":
                    get_attendance_mark(percentage),
                "status":
                    get_attendance_status(percentage),
            },
        }

    finally:
        db.close()


@app.get("/attendance")
def get_attendance(
    current_admin: User = Depends(require_admin),
):
    db = SessionLocal()

    try:
        return db.query(Attendance).all()

    finally:
        db.close()


@app.get(
    "/attendance/student/{student_id}/course/{course_id}"
)
def get_student_course_attendance(
    student_id: int,
    course_id: int,
    current_user: User = Depends(get_current_user),
):
    require_student_owner(student_id, current_user)
    db = SessionLocal()

    try:
        attendance = (
            db.query(Attendance)
            .filter(
                Attendance.student_id == student_id,
                Attendance.course_id == course_id,
            )
            .first()
        )

        if attendance is None:
            raise HTTPException(
                status_code=404,
                detail="Attendance record not found",
            )

        percentage = get_attendance_percentage(
            attendance
        )

        return {
            "student_id": student_id,
            "course_id": course_id,
            "classes_held": attendance.classes_held,
            "classes_attended":
                attendance.classes_attended,
            "attendance_percentage": percentage,
            "percentage": percentage,
            "attendance_mark":
                get_attendance_mark(percentage),
            "status":
                get_attendance_status(percentage),
        }

    finally:
        db.close()


# =========================================================
# SGPA / CGPA
# =========================================================

@app.get(
    "/sgpa/student/{student_id}/semester/{semester}"
)
def get_student_sgpa(
    student_id: int,
    semester: int,
    current_user: User = Depends(get_current_user),
):
    require_student_owner(student_id, current_user)
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
                detail="Student not found",
            )

        if semester not in [1, 2, 3, 4]:
            raise HTTPException(
                status_code=400,
                detail="Semester must be between 1 and 4",
            )

        result = calculate_student_sgpa(
            db,
            student_id,
            semester,
        )

        return {
            "student_id": student_id,
            **result,
        }

    finally:
        db.close()


@app.get("/cgpa/student/{student_id}")
def calculate_cgpa(
    student_id: int,
    current_user: User = Depends(get_current_user),
):
    require_student_owner(student_id, current_user)
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
                detail="Student not found",
            )

        semester_results = []

        total_credit_points = 0.0
        total_completed_credits = 0.0

        for semester in range(1, 5):
            result = calculate_student_sgpa(
                db,
                student_id,
                semester,
            )

            # Do not include partially completed semesters in CGPA.
            # Their partial SGPA remains available from the SGPA endpoint.
            if not result["semester_complete"]:
                continue

            if result["completed_credits"] <= 0:
                continue

            total_credit_points += (
                result["total_credit_points"]
            )

            total_completed_credits += (
                result["completed_credits"]
            )

            semester_results.append({
                "semester": semester,
                "sgpa": result["sgpa"],
                "credits":
                    result["completed_credits"],
                "semester_complete": True,
            })

        cgpa = None

        if total_completed_credits > 0:
            cgpa = round(
                total_credit_points /
                total_completed_credits,
                2,
            )

        return {
            "student_id": student_id,
            "semesters": semester_results,
            "completed_semesters":
                len(semester_results),
            "total_credits": round(
                total_completed_credits,
                2,
            ),
            "total_credit_points": round(
                total_credit_points,
                2,
            ),
            "cgpa": cgpa,
        }

    finally:
        db.close()


# =========================================================
# STUDENT DASHBOARD
# =========================================================

@app.get("/dashboard/student/{student_id}")
def get_student_dashboard(
    student_id: int,
    current_user: User = Depends(get_current_user),
):
    require_student_owner(student_id, current_user)
    db = SessionLocal()

    try:
        student = (
            db.query(Student)
            .filter(
                Student.id == student_id
            )
            .first()
        )

        if student is None:
            raise HTTPException(
                status_code=404,
                detail="Student not found",
            )

        enrollment = (
            db.query(Enrollment)
            .filter(
                Enrollment.student_id == student_id
            )
            .first()
        )

        if enrollment is None:
            raise HTTPException(
                status_code=404,
                detail="Student enrollment not found",
            )

        current_semester = enrollment.semester

        courses = (
            db.query(Course)
            .filter(
                Course.semester ==
                current_semester
            )
            .order_by(Course.course_code.asc())
            .all()
        )

        sgpa_result = calculate_student_sgpa(
            db,
            student_id,
            current_semester,
        )

        attendance_records = (
            db.query(Attendance, Course)
            .join(
                Course,
                Attendance.course_id ==
                Course.id,
            )
            .filter(
                Attendance.student_id ==
                student_id,
                Course.semester ==
                current_semester,
            )
            .all()
        )

        attendance_data = []

        for attendance, course in attendance_records:
            percentage = get_attendance_percentage(
                attendance
            )

            attendance_data.append({
                "course_id": course.id,
                "course_code":
                    course.course_code,
                "course_name":
                    course.course_name,
                "classes_held":
                    attendance.classes_held,
                "classes_attended":
                    attendance.classes_attended,
                "percentage": percentage,
                "attendance_percentage":
                    percentage,
                "attendance_mark":
                    get_attendance_mark(percentage),
                "status":
                    get_attendance_status(percentage),
            })

        course_data = []

        for course in courses:
            course_data.append({
                "id": course.id,
                "course_code":
                    course.course_code,
                "course_name":
                    course.course_name,
                "course_type":
                    course.course_type,
                "cie_max":
                    course.cie_max,
                "see_max":
                    course.see_max,
                "credits":
                    course.credits,
            })

        return {
            "student": {
                "id": student.id,
                "roll_number":
                    student.roll_number,
                "name": student.name,
                "email": student.email,
                "batch": student.batch,
            },
            "program": {
                "program_id":
                    enrollment.program_id,
                "current_semester":
                    current_semester,
            },
            "academic_summary": {
                "sgpa":
                    sgpa_result["sgpa"],
                "semester_complete":
                    sgpa_result[
                        "semester_complete"
                    ],
                "registered_credits":
                    sgpa_result[
                        "registered_credits"
                    ],
                "completed_credits":
                    sgpa_result[
                        "completed_credits"
                    ],
                "completed_courses":
                    sgpa_result[
                        "completed_courses"
                    ],
                "incomplete_courses":
                    sgpa_result[
                        "incomplete_courses"
                    ],
            },
            "courses": course_data,
            "attendance": attendance_data,
            "course_performance":
                sgpa_result["courses"],
        }

    finally:
        db.close()


# =========================================================
# FACULTY
# =========================================================

@app.post("/faculty")
def create_faculty(
    faculty: FacultyCreate,
    current_admin: User = Depends(require_admin),
):
    db = SessionLocal()

    try:
        existing_code = (
            db.query(Faculty)
            .filter(
                Faculty.faculty_code ==
                faculty.faculty_code
            )
            .first()
        )

        if existing_code:
            raise HTTPException(
                status_code=400,
                detail="Faculty code already exists",
            )

        existing_email = (
            db.query(Faculty)
            .filter(
                Faculty.email ==
                faculty.email
            )
            .first()
        )

        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Faculty email already exists",
            )

        new_faculty = Faculty(
            faculty_code=faculty.faculty_code,
            name=faculty.name,
            email=faculty.email,
            department=faculty.department,
        )

        db.add(new_faculty)
        db.commit()
        db.refresh(new_faculty)

        return new_faculty

    finally:
        db.close()


@app.get("/faculty")
def get_faculty(
    current_admin: User = Depends(require_admin),
):
    db = SessionLocal()

    try:
        return db.query(Faculty).all()

    finally:
        db.close()


@app.post("/faculty-courses")
def assign_course_to_faculty(
    mapping: FacultyCourseCreate,
    current_admin: User = Depends(require_admin),
):
    db = SessionLocal()

    try:
        faculty = (
            db.query(Faculty)
            .filter(
                Faculty.id ==
                mapping.faculty_id
            )
            .first()
        )

        if faculty is None:
            raise HTTPException(
                status_code=404,
                detail="Faculty member not found",
            )

        course = (
            db.query(Course)
            .filter(
                Course.id ==
                mapping.course_id
            )
            .first()
        )

        if course is None:
            raise HTTPException(
                status_code=404,
                detail="Course not found",
            )

        existing = (
            db.query(FacultyCourse)
            .filter(
                FacultyCourse.faculty_id ==
                mapping.faculty_id,
                FacultyCourse.course_id ==
                mapping.course_id,
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Course already assigned to "
                    "this faculty member"
                ),
            )

        new_mapping = FacultyCourse(
            faculty_id=mapping.faculty_id,
            course_id=mapping.course_id,
        )

        db.add(new_mapping)
        db.commit()
        db.refresh(new_mapping)

        return {
            "message": "Course assigned successfully",
            "mapping": {
                "id": new_mapping.id,
                "faculty_id":
                    new_mapping.faculty_id,
                "course_id":
                    new_mapping.course_id,
            },
        }

    finally:
        db.close()


@app.get("/faculty/{faculty_id}/courses")
def get_faculty_courses(
    faculty_id: int,
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()

    try:
        faculty = (
            db.query(Faculty)
            .filter(
                Faculty.id == faculty_id
            )
            .first()
        )

        if faculty is None:
            raise HTTPException(
                status_code=404,
                detail="Faculty member not found",
            )

        results = (
            db.query(Course)
            .join(
                FacultyCourse,
                FacultyCourse.course_id ==
                Course.id,
            )
            .filter(
                FacultyCourse.faculty_id ==
                faculty_id
            )
            .order_by(
                Course.semester.asc(),
                Course.course_code.asc(),
            )
            .all()
        )

        response = []

        for course in results:
            response.append({
                "id": course.id,
                "course_code":
                    course.course_code,
                "course_name":
                    course.course_name,
                "semester":
                    course.semester,
                "course_type":
                    course.course_type,
                "cie_max":
                    course.cie_max,
                "see_max":
                    course.see_max,
                "credits":
                    course.credits,
            })

        return response

    finally:
        db.close()


@app.get("/faculty-courses")
def get_faculty_course_mappings(
    current_admin: User = Depends(require_admin),
):
    db = SessionLocal()

    try:
        results = (
            db.query(
                FacultyCourse,
                Faculty,
                Course,
            )
            .join(
                Faculty,
                FacultyCourse.faculty_id ==
                Faculty.id,
            )
            .join(
                Course,
                FacultyCourse.course_id ==
                Course.id,
            )
            .order_by(
                Faculty.name.asc(),
                Course.semester.asc(),
                Course.course_code.asc(),
            )
            .all()
        )

        response = []

        for mapping, faculty, course in results:
            response.append({
                "mapping_id":
                    mapping.id,
                "faculty_id":
                    faculty.id,
                "faculty_code":
                    faculty.faculty_code,
                "faculty_name":
                    faculty.name,
                "course_id":
                    course.id,
                "course_code":
                    course.course_code,
                "course_name":
                    course.course_name,
                "semester":
                    course.semester,
            })

        return response

    finally:
        db.close()
