import { useEffect, useState } from "react"

import {
  BookOpen,
  Layers3,
} from "lucide-react"

import { apiGet } from "../auth/api"


function AdminSemesters() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await apiGet(
          "/admin/courses"
        )

        setCourses(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])


  if (loading) {
    return (
      <div className="page-card">
        Loading semesters...
      </div>
    )
  }


  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Semesters</h1>

          <p>
            MCA curriculum distribution
            across four semesters.
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(290px, 1fr))",
          gap: "20px",
        }}
      >
        {[1, 2, 3, 4].map(
          (semester) => {
            const semesterCourses =
              courses.filter(
                (course) =>
                  course.semester ===
                  semester
              )

            const totalCredits =
              semesterCourses.reduce(
                (sum, course) =>
                  sum +
                  Number(
                    course.credits || 0
                  ),
                0
              )

            return (
              <div
                className="page-card"
                key={semester}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#8a8c98",
                        fontSize: "12px",
                      }}
                    >
                      MCA
                    </div>

                    <h2
                      style={{
                        margin: "4px 0 0",
                      }}
                    >
                      Semester {semester}
                    </h2>
                  </div>

                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      borderRadius:
                        "12px",
                      background:
                        "#f0edff",
                      color: "#6757d8",
                    }}
                  >
                    <Layers3 size={21} />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "18px",
                    marginBottom: "20px",
                    fontSize: "13px",
                  }}
                >
                  <div>
                    <strong>
                      {
                        semesterCourses.length
                      }
                    </strong>
                    <div
                      style={{
                        color:
                          "#8a8c98",
                      }}
                    >
                      Courses
                    </div>
                  </div>

                  <div>
                    <strong>
                      {totalCredits}
                    </strong>

                    <div
                      style={{
                        color:
                          "#8a8c98",
                      }}
                    >
                      Credits
                    </div>
                  </div>
                </div>

                {semesterCourses.length ===
                0 ? (
                  <p
                    style={{
                      color: "#8a8c98",
                    }}
                  >
                    No courses configured.
                  </p>
                ) : (
                  <div>
                    {semesterCourses.map(
                      (course) => (
                        <div
                          key={course.id}
                          style={{
                            display:
                              "flex",
                            gap: "10px",
                            alignItems:
                              "center",
                            borderTop:
                              "1px solid #eeeeF3",
                            padding:
                              "12px 0",
                          }}
                        >
                          <BookOpen
                            size={17}
                            color="#6757d8"
                          />

                          <div>
                            <strong
                              style={{
                                fontSize:
                                  "13px",
                              }}
                            >
                              {
                                course.course_code
                              }
                            </strong>

                            <div
                              style={{
                                fontSize:
                                  "12px",
                                color:
                                  "#858794",
                                marginTop:
                                  "2px",
                              }}
                            >
                              {
                                course.course_name
                              }
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )
          }
        )}
      </div>
    </div>
  )
}


export default AdminSemesters