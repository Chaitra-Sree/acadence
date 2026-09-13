import { useEffect, useState } from "react"

import {
  Link2,
  Trash2,
} from "lucide-react"

import {
  apiDelete,
  apiGet,
  apiPost,
} from "../auth/api"


function AdminCourseMapping() {
  const [faculty, setFaculty] = useState([])
  const [courses, setCourses] = useState([])
  const [mappings, setMappings] = useState([])

  const [facultyId, setFacultyId] = useState("")
  const [courseId, setCourseId] = useState("")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")


  async function loadData() {
    try {
      const [
        facultyData,
        courseData,
        mappingData,
      ] = await Promise.all([
        apiGet("/admin/faculty"),
        apiGet("/admin/courses"),
        apiGet(
          "/admin/course-mappings"
        ),
      ])

      setFaculty(facultyData)
      setCourses(courseData)
      setMappings(mappingData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadData()
  }, [])


  async function handleAssign(event) {
    event.preventDefault()

    if (!facultyId || !courseId) {
      setError(
        "Please select both faculty and course."
      )

      return
    }

    try {
      await apiPost(
        "/admin/course-mappings",
        {
          faculty_id:
            Number(facultyId),

          course_id:
            Number(courseId),
        }
      )

      setFacultyId("")
      setCourseId("")

      setMessage(
        "Course assigned successfully."
      )

      setError("")

      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }


  async function handleRemove(mapping) {
    const confirmed =
      window.confirm(
        `Remove ${mapping.course_code} from ${mapping.faculty_name}?`
      )

    if (!confirmed) {
      return
    }

    try {
      await apiDelete(
        `/admin/course-mappings/${mapping.id}`
      )

      setMessage(
        "Course mapping removed."
      )

      setError("")

      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }


  if (loading) {
    return (
      <div className="page-card">
        Loading course mappings...
      </div>
    )
  }


  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Course Mapping</h1>

          <p>
            Assign academic courses to
            faculty members.
          </p>
        </div>
      </div>

      <div
        className="page-card"
        style={{
          marginBottom: "22px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "11px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f0edff",
              color: "#6757d8",
            }}
          >
            <Link2 size={20} />
          </div>

          <div>
            <strong>
              Assign Course
            </strong>

            <div
              style={{
                color: "#858794",
                fontSize: "12px",
              }}
            >
              Faculty-to-course mapping
            </div>
          </div>
        </div>

        <form
          onSubmit={handleAssign}
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
          }}
        >
          <select
            value={facultyId}
            onChange={(e) =>
              setFacultyId(
                e.target.value
              )
            }
            style={inputStyle}
          >
            <option value="">
              Select faculty
            </option>

            {faculty.map((member) => (
              <option
                key={member.id}
                value={member.id}
              >
                {member.faculty_code} —{" "}
                {member.name}
              </option>
            ))}
          </select>

          <select
            value={courseId}
            onChange={(e) =>
              setCourseId(
                e.target.value
              )
            }
            style={inputStyle}
          >
            <option value="">
              Select course
            </option>

            {courses.map((course) => (
              <option
                key={course.id}
                value={course.id}
              >
                {course.course_code} —{" "}
                {course.course_name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            style={primaryButton}
          >
            Assign Course
          </button>
        </form>
      </div>

      {error && (
        <div className="page-card">
          <p style={{ color: "#c0392b" }}>
            {error}
          </p>
        </div>
      )}

      {message && (
        <div className="page-card">
          <p style={{ color: "#218838" }}>
            {message}
          </p>
        </div>
      )}

      <div className="page-card">
        <h3
          style={{
            marginTop: 0,
          }}
        >
          Current Assignments
        </h3>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>
                  Faculty
                </th>

                <th style={th}>
                  Course
                </th>

                <th style={th}>
                  Semester
                </th>

                <th style={th}>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {mappings.map(
                (mapping) => (
                  <tr key={mapping.id}>
                    <td style={td}>
                      <strong>
                        {
                          mapping.faculty_name
                        }
                      </strong>

                      <div
                        style={{
                          color:
                            "#858794",
                          fontSize:
                            "12px",
                        }}
                      >
                        {
                          mapping.faculty_code
                        }
                      </div>
                    </td>

                    <td style={td}>
                      <strong>
                        {
                          mapping.course_code
                        }
                      </strong>

                      <div
                        style={{
                          color:
                            "#858794",
                          fontSize:
                            "12px",
                        }}
                      >
                        {
                          mapping.course_name
                        }
                      </div>
                    </td>

                    <td style={td}>
                      Semester{" "}
                      {mapping.semester}
                    </td>

                    <td style={td}>
                      <button
                        onClick={() =>
                          handleRemove(
                            mapping
                          )
                        }
                        style={{
                          border: "none",
                          background:
                            "transparent",
                          color:
                            "#c0392b",
                          cursor:
                            "pointer",
                        }}
                      >
                        <Trash2
                          size={17}
                        />
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {mappings.length === 0 && (
            <p>
              No course mappings exist yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}


const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #dddfe7",
}


const primaryButton = {
  border: "none",
  borderRadius: "10px",
  padding: "12px 18px",
  background: "#6757d8",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
}


const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
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


export default AdminCourseMapping