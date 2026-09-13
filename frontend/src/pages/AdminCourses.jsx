import {
  useEffect,
  useState,
} from "react"

import {
  Pencil,
  Trash2,
  Search,
  X,
  Plus,
} from "lucide-react"

import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
} from "../auth/api"


const emptyCourse = {
  course_code: "",
  course_name: "",
  semester: "1",
  course_type: "Theory",
  cie_max: "40",
  see_max: "60",
  credits: "4",
}


function AdminCourses() {
  const [courses, setCourses] =
    useState([])

  const [search, setSearch] =
    useState("")

  const [semester, setSemester] =
    useState("all")

  const [editing, setEditing] =
    useState(null)

  const [creating, setCreating] =
    useState(false)

  const [newCourse, setNewCourse] =
    useState(emptyCourse)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const [message, setMessage] =
    useState("")


  async function loadCourses() {
    try {
      const data =
        await apiGet(
          "/admin/courses"
        )

      setCourses(data)

    } catch (err) {
      setError(err.message)

    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadCourses()
  }, [])


  function applyTypeDefaults(
    type
  ) {
    if (type === "Theory") {
      return {
        cie_max: "40",
        see_max: "60",
        credits: "4",
      }
    }

    if (type === "Practical") {
      return {
        cie_max: "50",
        see_max: "50",
        credits: "1.5",
      }
    }

    if (
      type ===
      "Mini Project"
    ) {
      return {
        cie_max: "50",
        see_max: "0",
        credits: "2.5",
      }
    }

    if (
      type ===
      "Internship"
    ) {
      return {
        cie_max: "50",
        see_max: "0",
        credits: "1",
      }
    }

    if (type === "Project") {
      return {
        cie_max: "100",
        see_max: "100",
        credits: "12",
      }
    }

    return {}
  }


  async function handleCreate(
    event
  ) {
    event.preventDefault()

    setError("")
    setMessage("")

    try {
      await apiPost(
        "/admin/courses",
        {
          course_code:
            newCourse.course_code,

          course_name:
            newCourse.course_name,

          semester:
            Number(
              newCourse.semester
            ),

          course_type:
            newCourse.course_type,

          cie_max:
            Number(
              newCourse.cie_max
            ),

          see_max:
            Number(
              newCourse.see_max
            ),

          credits:
            Number(
              newCourse.credits
            ),
        }
      )

      setMessage(
        "Course and assessment components created successfully."
      )

      setNewCourse(
        emptyCourse
      )

      setCreating(false)

      await loadCourses()

    } catch (err) {
      setError(err.message)
    }
  }


  async function handleSave(
    event
  ) {
    event.preventDefault()

    try {
      await apiPut(
        `/admin/courses/${editing.id}`,
        {
          course_code:
            editing.course_code,

          course_name:
            editing.course_name,

          semester:
            Number(
              editing.semester
            ),

          course_type:
            editing.course_type,

          cie_max:
            Number(
              editing.cie_max
            ),

          see_max:
            Number(
              editing.see_max
            ),

          credits:
            Number(
              editing.credits
            ),
        }
      )

      setEditing(null)

      setMessage(
        "Course updated successfully."
      )

      setError("")

      await loadCourses()

    } catch (err) {
      setError(err.message)
    }
  }


  async function handleDelete(
    course
  ) {
    const confirmed =
      window.confirm(
        `Delete ${course.course_code} - ${course.course_name}? Associated assessment components, marks, attendance and faculty mappings will also be removed.`
      )

    if (!confirmed) {
      return
    }

    try {
      await apiDelete(
        `/admin/courses/${course.id}`
      )

      setMessage(
        "Course deleted successfully."
      )

      setError("")

      await loadCourses()

    } catch (err) {
      setError(err.message)
    }
  }


  const filtered =
    courses.filter(
      (course) => {
        const matchesSemester =
          semester === "all" ||
          String(
            course.semester
          ) === semester

        const text =
          `${course.course_code} ${course.course_name} ${course.course_type}`
            .toLowerCase()

        const matchesSearch =
          text.includes(
            search.toLowerCase()
          )

        return (
          matchesSemester &&
          matchesSearch
        )
      }
    )


  if (loading) {
    return (
      <div className="page-card">
        Loading courses...
      </div>
    )
  }


  return (
    <div>
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div>
          <h1>
            Courses
          </h1>

          <p>
            Manage MCA curriculum
            courses and evaluation
            schemes.
          </p>
        </div>

        <button
          onClick={() =>
            setCreating(true)
          }
          style={primaryButton}
        >
          <Plus size={17} />
          Add Course
        </button>
      </div>


      <div
        className="page-card"
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            position: "relative",
            flex: 1,
            minWidth: "230px",
          }}
        >
          <Search
            size={17}
            style={{
              position: "absolute",
              left: "13px",
              top: "50%",
              transform:
                "translateY(-50%)",
              color: "#8b8d9a",
            }}
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search courses"
            style={{
              ...inputStyle,
              paddingLeft: "40px",
            }}
          />
        </div>

        <select
          value={semester}
          onChange={(e) =>
            setSemester(
              e.target.value
            )
          }
          style={{
            ...inputStyle,
            width: "210px",
          }}
        >
          <option value="all">
            All Semesters
          </option>

          <option value="1">
            Semester I
          </option>

          <option value="2">
            Semester II
          </option>

          <option value="3">
            Semester III
          </option>

          <option value="4">
            Semester IV
          </option>
        </select>
      </div>


      {error && (
        <MessageCard
          text={error}
          error
        />
      )}


      {message && (
        <MessageCard
          text={message}
        />
      )}


      <div className="page-card">
        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>
                  Code
                </th>

                <th style={th}>
                  Course
                </th>

                <th style={th}>
                  Semester
                </th>

                <th style={th}>
                  Type
                </th>

                <th style={th}>
                  CIE
                </th>

                <th style={th}>
                  SEE
                </th>

                <th style={th}>
                  Credits
                </th>

                <th style={th}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(
                (course) => (
                  <tr
                    key={course.id}
                  >
                    <td style={td}>
                      {
                        course.course_code
                      }
                    </td>

                    <td style={td}>
                      {
                        course.course_name
                      }
                    </td>

                    <td style={td}>
                      {
                        course.semester
                      }
                    </td>

                    <td style={td}>
                      {
                        course.course_type
                      }
                    </td>

                    <td style={td}>
                      {
                        course.cie_max
                      }
                    </td>

                    <td style={td}>
                      {
                        course.see_max
                      }
                    </td>

                    <td style={td}>
                      {
                        course.credits
                      }
                    </td>

                    <td style={td}>
                      <button
                        onClick={() =>
                          setEditing({
                            ...course,
                          })
                        }
                        style={
                          iconButton
                        }
                      >
                        <Pencil
                          size={16}
                        />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            course
                          )
                        }
                        style={{
                          ...iconButton,
                          color:
                            "#c0392b",
                        }}
                      >
                        <Trash2
                          size={16}
                        />
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>


          {filtered.length === 0 && (
            <p>
              No courses found.
            </p>
          )}
        </div>
      </div>


      {creating && (
        <CourseModal
          title="Add Course"
          data={newCourse}
          setData={
            setNewCourse
          }
          onSubmit={
            handleCreate
          }
          onClose={() => {
            setCreating(false)

            setNewCourse(
              emptyCourse
            )
          }}
          submitText="Create Course"
          applyTypeDefaults={
            applyTypeDefaults
          }
        />
      )}


      {editing && (
        <CourseModal
          title="Edit Course"
          data={editing}
          setData={
            setEditing
          }
          onSubmit={
            handleSave
          }
          onClose={() =>
            setEditing(null)
          }
          submitText="Save Changes"
          applyTypeDefaults={
            applyTypeDefaults
          }
        />
      )}
    </div>
  )
}


function CourseModal({
  title,
  data,
  setData,
  onSubmit,
  onClose,
  submitText,
  applyTypeDefaults,
}) {
  return (
    <div style={modalOverlay}>
      <div style={modalCard}>
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              margin: 0,
            }}
          >
            {title}
          </h3>

          <button
            onClick={onClose}
            style={iconButton}
          >
            <X size={18} />
          </button>
        </div>


        <form
          onSubmit={onSubmit}
        >
          <Input
            label="Course Code"
            value={
              data.course_code
            }
            onChange={(value) =>
              setData({
                ...data,
                course_code:
                  value,
              })
            }
          />

          <Input
            label="Course Name"
            value={
              data.course_name
            }
            onChange={(value) =>
              setData({
                ...data,
                course_name:
                  value,
              })
            }
          />


          <label
            style={labelStyle}
          >
            Semester
          </label>

          <select
            value={
              data.semester
            }
            onChange={(e) =>
              setData({
                ...data,
                semester:
                  e.target.value,
              })
            }
            style={{
              ...inputStyle,
              marginBottom:
                "16px",
            }}
          >
            <option value="1">
              Semester I
            </option>

            <option value="2">
              Semester II
            </option>

            <option value="3">
              Semester III
            </option>

            <option value="4">
              Semester IV
            </option>
          </select>


          <label
            style={labelStyle}
          >
            Course Type
          </label>

          <select
            value={
              data.course_type
            }
            onChange={(e) => {
              const type =
                e.target.value

              const defaults =
                applyTypeDefaults(
                  type
                )

              setData({
                ...data,
                course_type:
                  type,
                ...defaults,
              })
            }}
            style={{
              ...inputStyle,
              marginBottom:
                "16px",
            }}
          >
            <option value="Theory">
              Theory
            </option>

            <option value="Practical">
              Practical
            </option>

            <option value="Mini Project">
              Mini Project
            </option>

            <option value="Internship">
              Internship
            </option>

            <option value="Project">
              Project
            </option>
          </select>


          <Input
            label="CIE Maximum"
            type="number"
            value={
              data.cie_max
            }
            onChange={(value) =>
              setData({
                ...data,
                cie_max: value,
              })
            }
          />

          <Input
            label="SEE Maximum"
            type="number"
            value={
              data.see_max
            }
            onChange={(value) =>
              setData({
                ...data,
                see_max: value,
              })
            }
          />

          <Input
            label="Credits"
            type="number"
            step="0.5"
            value={
              data.credits
            }
            onChange={(value) =>
              setData({
                ...data,
                credits: value,
              })
            }
          />


          <button
            type="submit"
            style={
              primaryButton
            }
          >
            {submitText}
          </button>
        </form>
      </div>
    </div>
  )
}


function MessageCard({
  text,
  error = false,
}) {
  return (
    <div
      className="page-card"
      style={{
        marginBottom: "18px",
      }}
    >
      <p
        style={{
          margin: 0,
          color: error
            ? "#c0392b"
            : "#218838",
        }}
      >
        {text}
      </p>
    </div>
  )
}


function Input({
  label,
  value,
  onChange,
  type = "text",
  step,
}) {
  return (
    <div
      style={{
        marginBottom: "16px",
      }}
    >
      <label
        style={labelStyle}
      >
        {label}
      </label>

      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        style={inputStyle}
        required
      />
    </div>
  )
}


const tableStyle = {
  width: "100%",
  borderCollapse:
    "collapse",
}


const th = {
  textAlign: "left",
  padding: "13px",
  borderBottom:
    "1px solid #e8e8ef",
  fontSize: "13px",
}


const td = {
  padding: "13px",
  borderBottom:
    "1px solid #f0f0f4",
  fontSize: "13px",
}


const iconButton = {
  border: "none",
  background:
    "transparent",
  cursor: "pointer",
  padding: "7px",
  color: "#6757d8",
}


const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontSize: "13px",
  fontWeight: 650,
}


const inputStyle = {
  width: "100%",
  boxSizing:
    "border-box",
  padding: "11px 13px",
  borderRadius: "10px",
  border:
    "1px solid #dddfe7",
}


const primaryButton = {
  border: "none",
  borderRadius: "10px",
  padding: "12px 18px",
  background: "#6757d8",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
}


const modalOverlay = {
  position: "fixed",
  inset: 0,
  background:
    "rgba(14,15,22,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
}


const modalCard = {
  width: "90%",
  maxWidth: "520px",
  maxHeight: "88vh",
  overflowY: "auto",
  background: "#fff",
  borderRadius: "16px",
  padding: "24px",
  boxShadow:
    "0 24px 60px rgba(0,0,0,0.18)",
}


export default AdminCourses