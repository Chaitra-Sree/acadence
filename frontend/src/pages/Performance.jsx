import { useEffect, useState } from "react"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  API_URL,
  getStudentId,
  authFetch,
} from "../auth/auth"


function Performance() {
  const studentId = getStudentId()

  const [semesterData, setSemesterData] = useState([])
  const [cgpa, setCgpa] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  useEffect(() => {
    async function loadPerformance() {
      if (!studentId) {
        setError("Student account is not linked correctly.")
        setLoading(false)
        return
      }

      try {
        const cgpaResponse = await authFetch(
          `${API_URL}/cgpa/student/${studentId}`
        )

        const cgpaData = await cgpaResponse.json()

        if (!cgpaResponse.ok) {
          throw new Error(
            cgpaData.detail ||
            "Unable to load performance."
          )
        }

        setCgpa(cgpaData.cgpa ?? null)

        const rows = []

        for (let semester = 1; semester <= 4; semester++) {
          try {
            const response = await authFetch(
              `${API_URL}/sgpa/student/${studentId}/semester/${semester}`
            )

            const data = await response.json()

            if (
              response.ok &&
              data.sgpa !== null &&
              data.sgpa !== undefined &&
              data.total_credits > 0
            ) {
              rows.push({
                semester: `Sem ${semester}`,
                sgpa: Number(data.sgpa),
              })
            }
          } catch {
            // Semester has no available result yet.
          }
        }

        setSemesterData(rows)
      } catch (err) {
        setError(
          err.message ||
          "Unable to load performance."
        )
      } finally {
        setLoading(false)
      }
    }

    loadPerformance()
  }, [studentId])


  if (loading) {
    return (
      <div className="page-card">
        Loading performance...
      </div>
    )
  }


  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Performance</h1>
          <p>
            Semester-wise academic performance overview.
          </p>
        </div>
      </div>

      {error && (
        <div className="page-card">
          <p style={{ color: "#c0392b" }}>
            {error}
          </p>
        </div>
      )}

      {!error && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div className="page-card">
              <div
                style={{
                  color: "#858794",
                  fontSize: "13px",
                  marginBottom: "8px",
                }}
              >
                CGPA
              </div>

              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                }}
              >
                {cgpa ?? "—"}
              </div>
            </div>

            <div className="page-card">
              <div
                style={{
                  color: "#858794",
                  fontSize: "13px",
                  marginBottom: "8px",
                }}
              >
                Semesters with Results
              </div>

              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                }}
              >
                {semesterData.length}
              </div>
            </div>
          </div>

          <div className="page-card">
            <h3>SGPA Trend</h3>

            {semesterData.length === 0 ? (
              <p>No SGPA data available yet.</p>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "330px",
                }}
              >
                <ResponsiveContainer>
                  <BarChart data={semesterData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Bar dataKey="sgpa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}


export default Performance
