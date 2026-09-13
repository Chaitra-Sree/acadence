from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from database import SessionLocal
from auth_dependencies import require_faculty

from models.user import User
from models.faculty import Faculty
from models.faculty_course import FacultyCourse
from models.course import Course
from models.student import Student
from models.enrollment import Enrollment
from models.attendance import Attendance
from models.assessment import AssessmentComponent
from models.marks import Mark


router = APIRouter(
    prefix="/faculty-portal",
    tags=["Faculty Portal"],
)


class FacultyMarkRequest(BaseModel):
    student_id: int
    assessment_component_id: int
    marks_obtained: float


class FacultyAttendanceRequest(BaseModel):
    student_id: int
    course_id: int
    classes_held: int
    classes_attended: int


def get_logged_in_faculty(
    current_user: User = Depends(require_faculty),
):
    if current_user.faculty_id is None:
        raise HTTPException(
            status_code=403,
            detail="Faculty account is not linked to a faculty profile",
        )

    return current_user


def ensure_course_is_assigned(
    db,
    faculty_id: int,
    course_id: int,
):
    mapping = (
        db.query(FacultyCourse)
        .filter(
            FacultyCourse.faculty_id == faculty_id,
            FacultyCourse.course_id == course_id,
        )
        .first()
    )

    if mapping is None:
        raise HTTPException(
            status_code=403,
            detail="This course is not assigned to you",
        )

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

    return course


def ensure_student_belongs_to_course_semester(
    db,
    student_id: int,
    course: Course,
):
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

    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == student_id,
            Enrollment.semester == course.semester,
        )
        .first()
    )

    if enrollment is None:
        raise HTTPException(
            status_code=403,
            detail=(
                "This student is not enrolled in the semester "
                "for this course"
            ),
        )

    return student, enrollment


@router.get("/me")
def get_faculty_profile(
    current_user: User = Depends(get_logged_in_faculty),
):
    db = SessionLocal()

    try:
        faculty = (
            db.query(Faculty)
            .filter(Faculty.id == current_user.faculty_id)
            .first()
        )

        if faculty is None:
            raise HTTPException(
                status_code=404,
                detail="Faculty profile not found",
            )

        return {
            "id": faculty.id,
            "faculty_code": faculty.faculty_code,
            "name": faculty.name,
            "email": faculty.email,
            "department": faculty.department,
        }

    finally:
        db.close()


@router.get("/me/courses")
def get_my_courses(
    current_user: User = Depends(get_logged_in_faculty),
):
    db = SessionLocal()

    try:
        courses = (
            db.query(Course)
            .join(
                FacultyCourse,
                FacultyCourse.course_id == Course.id,
            )
            .filter(
                FacultyCourse.faculty_id == current_user.faculty_id
            )
            .order_by(
                Course.semester.asc(),
                Course.course_code.asc(),
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
                "credits": course.credits,
            }
            for course in courses
        ]

    finally:
        db.close()


@router.get("/me/students")
def get_my_students(
    current_user: User = Depends(get_logged_in_faculty),
):
    db = SessionLocal()

    try:
        assigned_courses = (
            db.query(Course)
            .join(
                FacultyCourse,
                FacultyCourse.course_id == Course.id,
            )
            .filter(
                FacultyCourse.faculty_id == current_user.faculty_id
            )
            .all()
        )

        if not assigned_courses:
            return []

        semesters = sorted({
            course.semester
            for course in assigned_courses
        })

        students = (
            db.query(Student, Enrollment)
            .join(
                Enrollment,
                Enrollment.student_id == Student.id,
            )
            .filter(
                Enrollment.semester.in_(semesters)
            )
            .order_by(Student.roll_number.asc())
            .all()
        )

        response = []

        for student, enrollment in students:
            matching_courses = [
                course
                for course in assigned_courses
                if course.semester == enrollment.semester
            ]

            response.append({
                "id": student.id,
                "roll_number": student.roll_number,
                "name": student.name,
                "email": student.email,
                "batch": student.batch,
                "semester": enrollment.semester,
                "assigned_courses": [
                    {
                        "id": course.id,
                        "course_code": course.course_code,
                        "course_name": course.course_name,
                    }
                    for course in matching_courses
                ],
            })

        return response

    finally:
        db.close()


@router.get("/me/course/{course_id}/students")
def get_students_for_my_course(
    course_id: int,
    current_user: User = Depends(get_logged_in_faculty),
):
    db = SessionLocal()

    try:
        course = ensure_course_is_assigned(
            db,
            current_user.faculty_id,
            course_id,
        )

        students = (
            db.query(Student, Enrollment)
            .join(
                Enrollment,
                Enrollment.student_id == Student.id,
            )
            .filter(
                Enrollment.semester == course.semester
            )
            .order_by(Student.roll_number.asc())
            .all()
        )

        response = []

        for student, enrollment in students:
            attendance = (
                db.query(Attendance)
                .filter(
                    Attendance.student_id == student.id,
                    Attendance.course_id == course.id,
                )
                .first()
            )

            if attendance and attendance.classes_held > 0:
                attendance_percentage = round(
                    (
                        attendance.classes_attended
                        / attendance.classes_held
                    )
                    * 100,
                    2,
                )
            else:
                attendance_percentage = None

            response.append({
                "id": student.id,
                "roll_number": student.roll_number,
                "name": student.name,
                "email": student.email,
                "batch": student.batch,
                "semester": enrollment.semester,
                "attendance_percentage": attendance_percentage,
            })

        return {
            "course": {
                "id": course.id,
                "course_code": course.course_code,
                "course_name": course.course_name,
                "semester": course.semester,
            },
            "students": response,
        }

    finally:
        db.close()


@router.get("/me/course/{course_id}/components")
def get_my_course_components(
    course_id: int,
    current_user: User = Depends(get_logged_in_faculty),
):
    db = SessionLocal()

    try:
        ensure_course_is_assigned(
            db,
            current_user.faculty_id,
            course_id,
        )

        components = (
            db.query(AssessmentComponent)
            .filter(
                AssessmentComponent.course_id == course_id,
                AssessmentComponent.component_name != "Attendance",
            )
            .order_by(AssessmentComponent.id.asc())
            .all()
        )

        return [
            {
                "id": component.id,
                "course_id": component.course_id,
                "component_name": component.component_name,
                "max_marks": component.max_marks,
            }
            for component in components
        ]

    finally:
        db.close()


@router.get(
    "/me/course/{course_id}/student/{student_id}/attendance"
)
def get_my_student_attendance(
    course_id: int,
    student_id: int,
    current_user: User = Depends(get_logged_in_faculty),
):
    db = SessionLocal()

    try:
        course = ensure_course_is_assigned(
            db,
            current_user.faculty_id,
            course_id,
        )

        ensure_student_belongs_to_course_semester(
            db,
            student_id,
            course,
        )

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

        if attendance.classes_held > 0:
            percentage = round(
                (
                    attendance.classes_attended
                    / attendance.classes_held
                )
                * 100,
                2,
            )
        else:
            percentage = 0.0

        return {
            "student_id": student_id,
            "course_id": course_id,
            "classes_held": attendance.classes_held,
            "classes_attended": attendance.classes_attended,
            "attendance_percentage": percentage,
        }

    finally:
        db.close()


@router.post("/me/marks")
def save_my_student_mark(
    payload: FacultyMarkRequest,
    current_user: User = Depends(get_logged_in_faculty),
):
    db = SessionLocal()

    try:
        component = (
            db.query(AssessmentComponent)
            .filter(
                AssessmentComponent.id
                == payload.assessment_component_id
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
                    "from attendance data"
                ),
            )

        course = ensure_course_is_assigned(
            db,
            current_user.faculty_id,
            component.course_id,
        )

        ensure_student_belongs_to_course_semester(
            db,
            payload.student_id,
            course,
        )

        if (
            payload.marks_obtained < 0
            or payload.marks_obtained > component.max_marks
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Marks must be between 0 and "
                    f"{component.max_marks}"
                ),
            )

        existing = (
            db.query(Mark)
            .filter(
                Mark.student_id == payload.student_id,
                Mark.assessment_component_id
                == payload.assessment_component_id,
            )
            .first()
        )

        if existing:
            existing.marks_obtained = payload.marks_obtained
            db.commit()
            db.refresh(existing)

            return {
                "message": "Marks updated successfully",
                "mark": {
                    "id": existing.id,
                    "student_id": existing.student_id,
                    "assessment_component_id":
                        existing.assessment_component_id,
                    "marks_obtained": existing.marks_obtained,
                },
            }

        new_mark = Mark(
            student_id=payload.student_id,
            assessment_component_id=
                payload.assessment_component_id,
            marks_obtained=payload.marks_obtained,
        )

        db.add(new_mark)
        db.commit()
        db.refresh(new_mark)

        return {
            "message": "Marks saved successfully",
            "mark": {
                "id": new_mark.id,
                "student_id": new_mark.student_id,
                "assessment_component_id":
                    new_mark.assessment_component_id,
                "marks_obtained": new_mark.marks_obtained,
            },
        }

    finally:
        db.close()


@router.post("/me/attendance")
def save_my_student_attendance(
    payload: FacultyAttendanceRequest,
    current_user: User = Depends(get_logged_in_faculty),
):
    db = SessionLocal()

    try:
        course = ensure_course_is_assigned(
            db,
            current_user.faculty_id,
            payload.course_id,
        )

        ensure_student_belongs_to_course_semester(
            db,
            payload.student_id,
            course,
        )

        if payload.classes_held < 0 or payload.classes_attended < 0:
            raise HTTPException(
                status_code=400,
                detail="Attendance values cannot be negative",
            )

        if payload.classes_attended > payload.classes_held:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Classes attended cannot be greater "
                    "than classes held"
                ),
            )

        existing = (
            db.query(Attendance)
            .filter(
                Attendance.student_id == payload.student_id,
                Attendance.course_id == payload.course_id,
            )
            .first()
        )

        if existing:
            existing.classes_held = payload.classes_held
            existing.classes_attended = payload.classes_attended

            db.commit()
            db.refresh(existing)

            attendance = existing
            message = "Attendance updated successfully"

        else:
            attendance = Attendance(
                student_id=payload.student_id,
                course_id=payload.course_id,
                classes_held=payload.classes_held,
                classes_attended=payload.classes_attended,
            )

            db.add(attendance)
            db.commit()
            db.refresh(attendance)

            message = "Attendance saved successfully"

        if attendance.classes_held > 0:
            percentage = round(
                (
                    attendance.classes_attended
                    / attendance.classes_held
                )
                * 100,
                2,
            )
        else:
            percentage = 0.0

        return {
            "message": message,
            "attendance": {
                "id": attendance.id,
                "student_id": attendance.student_id,
                "course_id": attendance.course_id,
                "classes_held": attendance.classes_held,
                "classes_attended": attendance.classes_attended,
                "attendance_percentage": percentage,
            },
        }

    finally:
        db.close()


@router.get("/me/course/{course_id}/performance")
def get_my_course_performance(
    course_id: int,
    current_user: User = Depends(get_logged_in_faculty),
):
    db = SessionLocal()

    try:
        course = ensure_course_is_assigned(
            db,
            current_user.faculty_id,
            course_id,
        )

        students = (
            db.query(Student, Enrollment)
            .join(
                Enrollment,
                Enrollment.student_id == Student.id,
            )
            .filter(
                Enrollment.semester == course.semester
            )
            .order_by(Student.roll_number.asc())
            .all()
        )

        components = (
            db.query(AssessmentComponent)
            .filter(
                AssessmentComponent.course_id == course.id,
                AssessmentComponent.component_name != "Attendance",
            )
            .all()
        )

        student_results = []

        for student, _ in students:
            marks_rows = (
                db.query(Mark, AssessmentComponent)
                .join(
                    AssessmentComponent,
                    Mark.assessment_component_id
                    == AssessmentComponent.id,
                )
                .filter(
                    Mark.student_id == student.id,
                    AssessmentComponent.course_id == course.id,
                    AssessmentComponent.component_name != "Attendance",
                )
                .all()
            )

            marks = {
                component.component_name: mark.marks_obtained
                for mark, component in marks_rows
            }

            entered = len(marks)
            total_components = len(components)

            obtained = 0.0
            possible = 0.0

            for component in components:
                if component.component_name in marks:
                    obtained += marks[component.component_name]
                    possible += component.max_marks

            current_percentage = None

            if possible > 0:
                current_percentage = round(
                    (obtained / possible) * 100,
                    2,
                )

            student_results.append({
                "student_id": student.id,
                "roll_number": student.roll_number,
                "name": student.name,
                "components_entered": entered,
                "total_components": total_components,
                "current_percentage": current_percentage,
            })

        percentages = [
            item["current_percentage"]
            for item in student_results
            if item["current_percentage"] is not None
        ]

        class_average = None

        if percentages:
            class_average = round(
                sum(percentages) / len(percentages),
                2,
            )

        return {
            "course": {
                "id": course.id,
                "course_code": course.course_code,
                "course_name": course.course_name,
                "semester": course.semester,
            },
            "student_count": len(student_results),
            "class_average": class_average,
            "students": student_results,
        }

    finally:
        db.close()
