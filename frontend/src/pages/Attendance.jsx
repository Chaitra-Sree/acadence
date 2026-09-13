import { useEffect, useState } from "react"

import { API_URL, getStudentId } from "../auth/auth"


function Attendance() {
  const studentId = getStudentId()

  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  useEffect(() => {
    async function loadAttendance() {
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
            "Unable to load attendance."
          )
        }

        setDashboard(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadAttendance()
  }, [studentId])


  if (loading) {
    return <div className="page-card">Loading attendance...</div>
  }


  const attendance = dashboard?.attendance || []


  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Attendance</h1>
          <p>Your subject-wise attendance status.</p>
        </div>
      </div>

      {error && (
        <div className="page-card">
          <p style={{ color: "#c0392b" }}>{error}</p>
        </div>
      )}

      <div className="page-card">
        {attendance.length === 0 ? (
          <p>No attendance data available yet.</p>
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
                  <th style={th}>Course</th>
                  <th style={th}>Held</th>
                  <th style={th}>Attended</th>
                  <th style={th}>Percentage</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>

              <tbody>
                {attendance.map((item, index) => {
                  const percentage = Number(
                    item.percentage ||
                    item.attendance_percentage ||
                    0
                  )

                  const safe = percentage >= 75

                  return (
                    <tr key={item.course_id || index}>
                      <td style={td}>
                        {item.course_code ||
                          item.course_name ||
                          `Course ${item.course_id}`}
                      </td>

                      <td style={td}>
                        {item.classes_held ?? "-"}
                      </td>

                      <td style={td}>
                        {item.classes_attended ?? "-"}
                      </td>

                      <td style={td}>
                        {percentage.toFixed(2)}%
                      </td>

                      <td style={td}>
                        <span
                          style={{
                            color: safe ? "#218838" : "#c0392b",
                            fontWeight: 700,
                          }}
                        >
                          {safe ? "Safe" : "Shortage"}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
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


export default Attendance