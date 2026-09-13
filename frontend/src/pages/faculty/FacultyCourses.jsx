import { useEffect, useMemo, useState } from "react"
import { BookOpen, Search } from "lucide-react"

import { API_URL, getFacultyId } from "../../auth/auth"


function FacultyCourses() {
  const facultyId = getFacultyId()

  const [courses, setCourses] = useState([])
  const [semester, setSemester] = useState("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  useEffect(() => {
    async function loadCourses() {
      if (!facultyId) {
        setError("Faculty account is not linked correctly.")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `${API_URL}/faculty/${facultyId}/courses`
        )

        const data = await response.json()

        if (!response.ok || data.error) {
          throw new Error(
            data.detail ||
            data.error ||
            "Unable to load courses."
          )
        }

        setCourses(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [facultyId])


  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSemester =
        semester === "all" ||
        String(course.semester) === semester

      const text =
        `${course.course_code} ${course.course_name}`.toLowerCase()

      const matchesSearch =
        text.includes(search.toLowerCase())

      return matchesSemester && matchesSearch
    })
  }, [courses, semester, search])


  if (loading) {
    return <div className="page-card">Loading assigned courses...</div>
  }


  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Courses</h1>
          <p>Courses currently assigned to you.</p>
        </div>
      </div>

      {error && (
        <div className="page-card">
          <p style={{ color: "#c0392b" }}>{error}</p>
        </div>
      )}

      <div
        className="page-card"
        style={{
          display: "flex",
          gap: "14px",
          flexWrap: "wrap",
          marginBottom: "22px",
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "230px" }}>
          <Search
            size={17}
            style={{
              position: "absolute",
              left: "13px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#8b8d9a",
            }}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses"
            style={{
              width: "100%",
              padding: "12px 14px 12px 40px",
              borderRadius: "10px",
              border: "1px solid #dedfe7",
              boxSizing: "border-box",
            }}
          />
        </div>

        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          style={{
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid #dedfe7",
          }}
        >
          <option value="all">All Semesters</option>
          <option value="1">Semester I</option>
          <option value="2">Semester II</option>
          <option value="3">Semester III</option>
          <option value="4">Semester IV</option>
        </select>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="page-card">
          <p>No assigned courses found.</p>
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
          {filteredCourses.map((course) => (
            <div className="page-card" key={course.id}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "18px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f0edff",
                    color: "#6757d8",
                  }}
                >
                  <BookOpen size={20} />
                </div>

                <div>
                  <strong>{course.course_code}</strong>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#8a8c98",
                    }}
                  >
                    Semester {course.semester}
                  </div>
                </div>
              </div>

              <h3>{course.course_name}</h3>

              <div
                style={{
                  marginTop: "18px",
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "10px",
                  fontSize: "13px",
                }}
              >
                <div>
                  <span style={{ color: "#8a8c98" }}>Type</span>
                  <br />
                  <strong>{course.course_type}</strong>
                </div>

                <div>
                  <span style={{ color: "#8a8c98" }}>Credits</span>
                  <br />
                  <strong>{course.credits}</strong>
                </div>

                <div>
                  <span style={{ color: "#8a8c98" }}>CIE</span>
                  <br />
                  <strong>{course.cie_max}</strong>
                </div>

                <div>
                  <span style={{ color: "#8a8c98" }}>SEE</span>
                  <br />
                  <strong>{course.see_max}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


export default FacultyCourses