import { useEffect, useState } from "react"
import { BookOpen } from "lucide-react"

import { API_URL, getStudentId } from "../auth/auth"


function Courses() {
  const studentId = getStudentId()

  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  useEffect(() => {
    async function loadCourses() {
      if (!studentId) {
        setError("Student account is not linked correctly.")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `${API_URL}/dashboard/student/${studentId}`
        )

        const data = await response.json()

        if (!response.ok || data.error) {
          throw new Error(
            data.detail ||
            data.error ||
            "Unable to load courses."
          )
        }

        setDashboard(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [studentId])


  if (loading) {
    return <div className="page-card">Loading courses...</div>
  }


  const courses = dashboard?.courses || []


  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Courses</h1>
          <p>
            Semester {dashboard?.current_semester || "-"} registered courses.
          </p>
        </div>
      </div>

      {error && (
        <div className="page-card">
          <p style={{ color: "#c0392b" }}>{error}</p>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="page-card">
          <p>No course data available.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "18px",
          }}
        >
          {courses.map((course) => (
            <div className="page-card" key={course.id}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "#f0edff",
                  color: "#6757d8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                }}
              >
                <BookOpen size={20} />
              </div>

              <div
                style={{
                  color: "#777987",
                  fontSize: "12px",
                }}
              >
                {course.course_code}
              </div>

              <h3>{course.course_name}</h3>

              <p>
                {course.course_type} · {course.credits} Credits
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


export default Courses