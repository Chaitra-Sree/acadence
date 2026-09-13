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

import { API_URL, getFacultyId } from "../../auth/auth"


function FacultyPerformance() {
  const facultyId = getFacultyId()

  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState("")
  const [performance, setPerformance] = useState([])

  const [loading, setLoading] = useState(true)
  const [performanceLoading, setPerformanceLoading] = useState(false)
  const [error, setError] = useState("")


  useEffect(() => {
    async function loadInitialData() {
      if (!facultyId) {
        setError("Faculty account is not linked correctly.")
        setLoading(false)
        return
      }

      try {
        const [studentsResponse, coursesResponse] = await Promise.all([
          fetch(`${API_URL}/students`),
          fetch(`${API_URL}/faculty/${facultyId}/courses`),
        ])

        const studentsData = await studentsResponse.json()
        const coursesData = await coursesResponse.json()

        setStudents(studentsData)

        if (coursesData.error) {
          throw new Error(coursesData.error)
        }

        setCourses(coursesData)
      } catch (err) {
        setError(err.message || "Unable to load performance data.")
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [facultyId])


  useEffect(() => {
    async function loadPerformance() {
      if (!courseId) {
        setPerformance([])
        return
      }

      setPerformanceLoading(true)
      setError("")

      try {
        const selectedCourse = courses.find(
          (course) => String(course.id) === String(courseId)
        )

        const rows = await Promise.all(
          students.map(async (student) => {
            try {
              if (selectedCourse?.course_type === "Theory") {
                const response = await fetch(
                  `${API_URL}/marks/student/${student.id}/course/${courseId}/summary`
                )

                const data = await response.json()

                if (!response.ok || data.error) {
                  return null
                }

                return {
                  studentId: student.id,
                  name: student.name,
                  rollNumber: student.roll_number,
                  score: Number(data.final_total || 0),
                }
              }

              const response = await fetch(
                `${API_URL}/marks/student/${student.id}/course/${courseId}`
              )

              const data = await response.json()

              if (!response.ok || !Array.isArray(data) || data.length === 0) {
                return null
              }

              const obtained = data.reduce(
                (sum, item) => sum + Number(item.marks_obtained || 0),
                0
              )

              const maximum = data.reduce(
                (sum, item) => sum + Number(item.max_marks || 0),
                0
              )

              const percentage =
                maximum > 0
                  ? (obtained / maximum) * 100
                  : 0

              return {
                studentId: student.id,
                name: student.name,
                rollNumber: student.roll_number,
                score: Number(percentage.toFixed(2)),
              }
            } catch {
              return null
            }
          })
        )

        setPerformance(rows.filter(Boolean))
      } catch (err) {
        setError(err.message || "Unable to calculate performance.")
      } finally {
        setPerformanceLoading(false)
      }
    }

    loadPerformance()
  }, [courseId, students, courses])


  const average =
    performance.length > 0
      ? (
          performance.reduce(
            (sum, item) => sum + item.score,
            0
          ) / performance.length
        ).toFixed(2)
      : "0.00"


  if (loading) {
    return <div className="page-card">Loading class performance...</div>
  }


  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Class Performance</h1>
          <p>Review performance for your assigned courses.</p>
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
            maxWidth: "520px",
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid #dddfe7",
          }}
        >
          <option value="">Select assigned course</option>

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

      {courseId && (
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
            <StatCard title="Students with Data" value={performance.length} />
            <StatCard title="Class Average" value={`${average}%`} />
          </div>

          <div className="page-card">
            {performanceLoading ? (
              <p>Calculating performance...</p>
            ) : performance.length === 0 ? (
              <p>No marks have been entered for this course yet.</p>
            ) : (
              <div style={{ width: "100%", height: "340px" }}>
                <ResponsiveContainer>
                  <BarChart data={performance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rollNumber" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" />
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


function StatCard({ title, value }) {
  return (
    <div className="page-card">
      <div
        style={{
          color: "#8b8d99",
          fontSize: "13px",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "28px",
          fontWeight: 800,
        }}
      >
        {value}
      </div>
    </div>
  )
}


export default FacultyPerformance