import { useEffect, useState } from "react"

import { BookOpen, Save, Users } from "lucide-react"

import {
  apiGet,
  apiPost,
} from "../../auth/api"


function FacultyMarks() {
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [components, setComponents] = useState([])

  const [courseId, setCourseId] = useState("")
  const [studentId, setStudentId] = useState("")
  const [componentId, setComponentId] = useState("")
  const [marks, setMarks] = useState("")

  const [loading, setLoading] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [loadingComponents, setLoadingComponents] = useState(false)
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
    async function loadCourseData() {
      setStudents([])
      setComponents([])

      setStudentId("")
      setComponentId("")
      setMarks("")

      setMessage("")
      setError("")

      if (!courseId) {
        return
      }

      try {
        setLoadingStudents(true)
        setLoadingComponents(true)

        const [
          studentData,
          componentData,
        ] = await Promise.all([
          apiGet(
            `/faculty-portal/me/course/${courseId}/students`
          ),
          apiGet(
            `/faculty-portal/me/course/${courseId}/components`
          ),
        ])

        setStudents(
          Array.isArray(
            studentData?.students
          )
            ? studentData.students
            : []
        )

        setComponents(
          Array.isArray(componentData)
            ? componentData
            : []
        )

      } catch (err) {
        console.error(err)

        setError(
          err.message ||
          "Unable to load course data."
        )

      } finally {
        setLoadingStudents(false)
        setLoadingComponents(false)
      }
    }

    loadCourseData()
  }, [courseId])


  async function handleSubmit(event) {
    event.preventDefault()

    setMessage("")
    setError("")

    if (
      !courseId ||
      !studentId ||
      !componentId ||
      marks === ""
    ) {
      setError(
        "Please complete all fields."
      )
      return
    }

    const selectedComponent =
      components.find(
        (component) =>
          String(component.id) ===
          String(componentId)
      )

    if (!selectedComponent) {
      setError(
        "Please select a valid assessment component."
      )
      return
    }

    const numericMarks =
      Number(marks)

    if (
      Number.isNaN(numericMarks) ||
      numericMarks < 0
    ) {
      setError(
        "Marks must be a valid non-negative number."
      )
      return
    }

    if (
      numericMarks >
      selectedComponent.max_marks
    ) {
      setError(
        `Maximum marks for ${selectedComponent.component_name} is ${selectedComponent.max_marks}.`
      )
      return
    }

    try {
      setSaving(true)

      await apiPost(
        "/faculty-portal/me/marks",
        {
          student_id:
            Number(studentId),
          assessment_component_id:
            Number(componentId),
          marks_obtained:
            numericMarks,
        }
      )

      setMessage(
        "Marks saved successfully."
      )

      setMarks("")

    } catch (err) {
      console.error(err)

      setError(
        err.message ||
        "Unable to save marks."
      )

    } finally {
      setSaving(false)
    }
  }


  const selectedCourse =
    courses.find(
      (course) =>
        String(course.id) ===
        String(courseId)
    )

  const selectedComponent =
    components.find(
      (component) =>
        String(component.id) ===
        String(componentId)
    )


  if (loading) {
    return (
      <div className="page-card">
        Loading marks entry...
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
            Marks Entry
          </h1>

          <p>
            Enter or update marks only
            for students in your assigned
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


            <Field label="Assessment Component">
              <select
                value={componentId}
                onChange={(event) =>
                  setComponentId(
                    event.target.value
                  )
                }
                style={inputStyle}
                disabled={
                  !courseId ||
                  loadingComponents
                }
              >
                <option value="">
                  {
                    loadingComponents
                      ? "Loading components..."
                      : "Select component"
                  }
                </option>

                {components.map(
                  (component) => (
                    <option
                      key={component.id}
                      value={component.id}
                    >
                      {
                        component
                          .component_name
                      }
                      {" / "}
                      {
                        component
                          .max_marks
                      }
                    </option>
                  )
                )}
              </select>
            </Field>


            <Field label="Marks Obtained">
              <input
                type="number"
                step="0.01"
                min="0"
                max={
                  selectedComponent
                    ?.max_marks
                }
                value={marks}
                onChange={(event) =>
                  setMarks(
                    event.target.value
                  )
                }
                style={inputStyle}
                placeholder={
                  selectedComponent
                    ? `Enter marks out of ${selectedComponent.max_marks}`
                    : "Select a component first"
                }
                disabled={
                  !componentId
                }
              />
            </Field>


            {selectedComponent && (
              <div
                style={{
                  ...infoBox,
                  marginBottom:
                    "20px",
                }}
              >
                Maximum marks:{" "}
                <strong>
                  {
                    selectedComponent
                      .max_marks
                  }
                </strong>
              </div>
            )}


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
                  : "Save Marks"
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


export default FacultyMarks
