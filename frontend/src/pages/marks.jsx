import { useEffect, useState } from "react"

import { API_URL, getStudentId } from "../auth/auth"


function Marks() {
  const studentId = getStudentId()

  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState("")
  const [marks, setMarks] = useState([])
  const [summary, setSummary] = useState(null)

  const [loading, setLoading] = useState(true)
  const [marksLoading, setMarksLoading] = useState(false)
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

        setCourses(data.courses || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [studentId])


  useEffect(() => {
    async function loadMarks() {
      setMarks([])
      setSummary(null)
      setError("")

      if (!courseId || !studentId) {
        return
      }

      setMarksLoading(true)

      try {
        const course = courses.find(
          (item) => String(item.id) === String(courseId)
        )

        const response = await fetch(
          `${API_URL}/marks/student/${studentId}/course/${courseId}`
        )

        const data = await response.json()

        if (!response.ok || data.error) {
          throw new Error(
            data.detail ||
            data.error ||
            "Unable to load marks."
          )
        }

        setMarks(Array.isArray(data) ? data : [])

        if (course?.course_type === "Theory") {
          const summaryResponse = await fetch(
            `${API_URL}/marks/student/${studentId}/course/${courseId}/summary`
          )

          const summaryData = await summaryResponse.json()

          if (
            summaryResponse.ok &&
            !summaryData.error
          ) {
            setSummary(summaryData)
          }
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setMarksLoading(false)
      }
    }

    loadMarks()
  }, [courseId, studentId, courses])


  if (loading) {
    return <div className="page-card">Loading marks...</div>
  }


  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Marks</h1>
          <p>View your assessment and examination marks.</p>
        </div>
      </div>

      <div className="page-card" style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: 650,
          }}
        >
          Course
        </label>

        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "560px",
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid #dddfe7",
          }}
        >
          <option value="">Select course</option>

          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.course_code} — {course.course_name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="page-card">
          <p style={{ color: "#c0392b" }}>{error}</p>
        </div>
      )}

      {courseId && marksLoading && (
        <div className="page-card">Loading course marks...</div>
      )}

      {courseId && !marksLoading && (
        <>
          {summary && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "14px",
                marginBottom: "20px",
              }}
            >
              <SummaryCard
                title="Mid Average"
                value={summary.mid_average}
              />

              <SummaryCard
                title="Slip Average"
                value={summary.best_two_slip_average}
              />

              <SummaryCard
                title="CIE Total"
                value={summary.cie_total}
              />

              <SummaryCard
                title="SEE"
                value={summary.see_marks}
              />

              <SummaryCard
                title="Final Total"
                value={summary.final_total}
              />
            </div>
          )}

          <div className="page-card">
            {marks.length === 0 ? (
              <p>No marks have been entered for this course yet.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={th}>Component</th>
                      <th style={th}>Marks Obtained</th>
                      <th style={th}>Maximum Marks</th>
                    </tr>
                  </thead>

                  <tbody>
                    {marks.map((item) => (
                      <tr key={item.assessment_component_id}>
                        <td style={td}>
                          {item.component_name}
                        </td>

                        <td style={td}>
                          {item.marks_obtained}
                        </td>

                        <td style={td}>
                          {item.max_marks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}


function SummaryCard({ title, value }) {
  return (
    <div className="page-card">
      <div
        style={{
          color: "#858794",
          fontSize: "12px",
          marginBottom: "7px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "24px",
          fontWeight: 800,
        }}
      >
        {value ?? 0}
      </div>
    </div>
  )
}


const th = {
  textAlign: "left",
  padding: "13px",
  borderBottom: "1px solid #ececf2",
  fontSize: "13px",
}


const td = {
  padding: "13px",
  borderBottom: "1px solid #f0f0f4",
  fontSize: "13px",
}


export default Marks