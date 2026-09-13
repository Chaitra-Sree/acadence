import { useEffect, useState } from "react"

import {
  BookOpen,
  CalendarCheck,
  Save,
  Users,
} from "lucide-react"

import {
  apiGet,
  apiPost,
} from "../../auth/api"


function FacultyAttendance() {
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])

  const [courseId, setCourseId] = useState("")
  const [studentId, setStudentId] = useState("")

  const [classesHeld, setClassesHeld] = useState("")
  const [classesAttended, setClassesAttended] = useState("")

  const [loading, setLoading] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [saving, setSaving] = useState(false)

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")


  useEffect(() => {
    loadCourses()
  }, [])


  async function loadCourses() {
    try {
      setLoading(true)
      setError("")

      const data = await apiGet(
        "/faculty-portal/me/courses"
      )

      setCourses(
        Array.isArray(data)
          ? data
          : []
      )

    } catch (err) {
      console.error(err)

      setError(
        err.message ||
        "Unable to load assigned courses."
      )

    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    async function loadStudents() {
      setStudents([])
      setStudentId("")
      setClassesHeld("")
      setClassesAttended("")

      setMessage("")
      setError("")

      if (!courseId) {
        return
      }

      try {
        setLoadingStudents(true)

        const data = await apiGet(
          `/faculty-portal/me/course/${courseId}/students`
        )

        setStudents(
          Array.isArray(
            data?.students
          )
            ? data.students
            : []
        )

      } catch (err) {
        console.error(err)

        setError(
          err.message ||
          "Unable to load students."
        )

      } finally {
        setLoadingStudents(false)
      }
    }

    loadStudents()
  }, [courseId])


  useEffect(() => {
    async function loadAttendance() {
      setMessage("")
      setError("")

      if (
        !studentId ||
        !courseId
      ) {
        setClassesHeld("")
        setClassesAttended("")
        return
      }

      try {
        setLoadingAttendance(true)

        const data = await apiGet(
          `/faculty-portal/me/course/${courseId}/student/${studentId}/attendance`
        )

        setClassesHeld(
          data.classes_held ?? ""
        )

        setClassesAttended(
          data.classes_attended ?? ""
        )

      } catch (err) {
        /*
          A missing attendance record is normal
          for a student whose attendance has not
          been entered yet. Start with blank values.
        */
        setClassesHeld("")
        setClassesAttended("")

      } finally {
        setLoadingAttendance(false)
      }
    }

    loadAttendance()
  }, [
    studentId,
    courseId,
  ])


  async function handleSubmit(event) {
    event.preventDefault()

    setMessage("")
    setError("")

    if (
      !courseId ||
      !studentId ||
      classesHeld === "" ||
      classesAttended === ""
    ) {
      setError(
        "Please complete all fields."
      )
      return
    }

    const held =
      Number(classesHeld)

    const attended =
      Number(classesAttended)

    if (
      Number.isNaN(held) ||
      Number.isNaN(attended) ||
      held < 0 ||
      attended < 0
    ) {
      setError(
        "Attendance values must be valid non-negative numbers."
      )
      return
    }

    if (
      !Number.isInteger(held) ||
      !Number.isInteger(attended)
    ) {
      setError(
        "Classes held and attended must be whole numbers."
      )
      return
    }

    if (attended > held) {
      setError(
        "Classes attended cannot exceed classes held."
      )
      return
    }

    try {
      setSaving(true)

      const data = await apiPost(
        "/faculty-portal/me/attendance",
        {
          student_id:
            Number(studentId),
          course_id:
            Number(courseId),
          classes_held:
            held,
          classes_attended:
            attended,
        }
      )

      const attendance =
        data?.attendance

      if (attendance) {
        setClassesHeld(
          attendance.classes_held
        )

        setClassesAttended(
          attendance.classes_attended
        )
      }

      setMessage(
        "Attendance saved successfully."
      )

    } catch (err) {
      console.error(err)

      setError(
        err.message ||
        "Unable to save attendance."
      )

    } finally {
      setSaving(false)
    }
  }


  const percentage =
    Number(classesHeld) > 0
      ? (
          (
            Number(classesAttended) /
            Number(classesHeld)
          ) *
          100
        ).toFixed(2)
      : "0.00"


  function attendanceMarkFromPercentage(
    value
  ) {
    const number =
      Number(value)

    if (number >= 85) return 5
    if (number >= 80) return 4
    if (number >= 75) return 3
    if (number >= 70) return 2
    if (number >= 65) return 1

    return 0
  }


  const attendanceMark =
    Number(classesHeld) > 0
      ? attendanceMarkFromPercentage(
          percentage
        )
      : "-"


  const selectedCourse =
    courses.find(
      (course) =>
        String(course.id) ===
        String(courseId)
    )


  if (loading) {
    return (
      <div className="page-card">
        Loading attendance...
      </div>
    )
  }


  return (
    <div>

      <div className="page-header">
        <div>
          <p className="eyebrow">
            FACULTY PORTAL
          </p>

          <h1>
            Attendance Entry
          </h1>

          <p>
            Update attendance only for
            students in your assigned
            courses.
          </p>
        </div>
      </div>


      {error && (
        <MessageCard
          type="error"
          text={error}
        />
      )}

      {message && (
        <MessageCard
          type="success"
          text={message}
        />
      )}


      <div
        className="page-card"
        style={{
          maxWidth: "760px",
        }}
      >

        {courses.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "35px 20px",
            }}
          >
            <BookOpen
              size={34}
              style={{
                opacity: 0.45,
                marginBottom: "10px",
              }}
            />

            <h3>
              No assigned courses
            </h3>

            <p>
              Ask the administrator to
              assign a course to your
              faculty account.
            </p>
          </div>

        ) : (
          <form onSubmit={handleSubmit}>

            <Field label="Assigned Course">
              <select
                value={courseId}
                onChange={(event) =>
                  setCourseId(
                    event.target.value
                  )
                }
                style={inputStyle}
              >
                <option value="">
                  Select assigned course
                </option>

                {courses.map(
                  (course) => (
                    <option
                      key={course.id}
                      value={course.id}
                    >
                      {course.course_code}
                      {" — "}
                      {course.course_name}
                      {" • Sem "}
                      {course.semester}
                    </option>
                  )
                )}
              </select>
            </Field>


            {selectedCourse && (
              <div
                style={infoBox}
              >
                <BookOpen
                  size={17}
                />

                <span>
                  <strong>
                    {
                      selectedCourse
                        .course_code
                    }
                  </strong>
                  {" · "}
                  Semester{" "}
                  {
                    selectedCourse
                      .semester
                  }
                  {" · "}
                  {
                    selectedCourse
                      .course_type
                  }
                </span>
              </div>
            )}


            <Field label="Student">
              <select
                value={studentId}
                onChange={(event) =>
                  setStudentId(
                    event.target.value
                  )
                }
                style={inputStyle}
                disabled={
                  !courseId ||
                  loadingStudents
                }
              >
                <option value="">
                  {
                    loadingStudents
                      ? "Loading students..."
                      : "Select student"
                  }
                </option>

                {students.map(
                  (student) => (
                    <option
                      key={student.id}
                      value={student.id}
                    >
                      {
                        student
                          .roll_number
                      }
                      {" — "}
                      {student.name}
                    </option>
                  )
                )}
              </select>
            </Field>


            {courseId &&
              !loadingStudents &&
              students.length === 0 && (
                <div
                  style={{
                    ...infoBox,
                    marginTop: "-5px",
                  }}
                >
                  <Users
                    size={17}
                  />

                  <span>
                    No students are
                    currently enrolled in
                    this course's
                    semester.
                  </span>
                </div>
              )}


            <Field label="Classes Held">
              <input
                type="number"
                min="0"
                step="1"
                value={classesHeld}
                onChange={(event) =>
                  setClassesHeld(
                    event.target.value
                  )
                }
                style={inputStyle}
                disabled={
                  !studentId ||
                  loadingAttendance
                }
                placeholder={
                  loadingAttendance
                    ? "Loading..."
                    : "Enter total classes held"
                }
              />
            </Field>


            <Field label="Classes Attended">
              <input
                type="number"
                min="0"
                step="1"
                value={classesAttended}
                onChange={(event) =>
                  setClassesAttended(
                    event.target.value
                  )
                }
                style={inputStyle}
                disabled={
                  !studentId ||
                  loadingAttendance
                }
                placeholder={
                  loadingAttendance
                    ? "Loading..."
                    : "Enter classes attended"
                }
              />
            </Field>


            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <MetricCard
                icon={
                  <CalendarCheck
                    size={18}
                  />
                }
                label="Attendance"
                value={`${percentage}%`}
              />

              <MetricCard
                icon={
                  <CalendarCheck
                    size={18}
                  />
                }
                label="Attendance Mark"
                value={
                  attendanceMark === "-"
                    ? "-"
                    : `${attendanceMark} / 5`
                }
              />
            </div>


            <button
              type="submit"
              style={{
                ...buttonStyle,
                opacity:
                  saving ? 0.7 : 1,
              }}
              disabled={saving}
            >
              <Save size={17} />

              {
                saving
                  ? "Saving..."
                  : "Save Attendance"
              }
            </button>

          </form>
        )}
      </div>

    </div>
  )
}


function Field({
  label,
  children,
}) {
  return (
    <div
      style={{
        marginBottom: "18px",
      }}
    >
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          fontSize: "13px",
          fontWeight: 650,
        }}
      >
        {label}
      </label>

      {children}
    </div>
  )
}


function MetricCard({
  icon,
  label,
  value,
}) {
  return (
    <div
      style={{
        padding: "14px 15px",
        background: "#f6f5ff",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          color: "#6b5ddd",
          marginBottom: "6px",
        }}
      >
        {icon}

        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          {label}
        </span>
      </div>

      <strong
        style={{
          fontSize: "18px",
        }}
      >
        {value}
      </strong>
    </div>
  )
}


function MessageCard({
  type,
  text,
}) {
  const isError =
    type === "error"

  return (
    <div
      className="page-card"
      style={{
        marginBottom: "18px",
        border:
          isError
            ? "1px solid #f0cccc"
            : "1px solid #cce8d5",
        background:
          isError
            ? "#fff7f7"
            : "#f5fff8",
        color:
          isError
            ? "#b83d3d"
            : "#218838",
        fontWeight: 650,
      }}
    >
      {text}
    </div>
  )
}


const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: "10px",
  border:
    "1px solid #dddfe7",
  background: "#ffffff",
  outline: "none",
}


const buttonStyle = {
  border: "none",
  borderRadius: "10px",
  padding: "12px 20px",
  background: "#6757d8",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
}


const infoBox = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px 14px",
  background: "#f6f5ff",
  borderRadius: "10px",
  marginBottom: "18px",
  color: "#56506f",
  fontSize: "13px",
}


export default FacultyAttendance
