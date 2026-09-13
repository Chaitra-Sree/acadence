import {
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  Search,
  Users,
  BookOpen,
  GraduationCap,
} from "lucide-react"

import { apiGet } from "../../auth/api"


function FacultyStudents() {
  const [students, setStudents] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const [search, setSearch] =
    useState("")

  const [semester, setSemester] =
    useState("all")


  useEffect(() => {
    loadStudents()
  }, [])


  async function loadStudents() {
    try {
      setLoading(true)
      setError("")

      const data =
        await apiGet(
          "/faculty-portal/me/students"
        )

      setStudents(
        Array.isArray(data)
          ? data
          : []
      )

    } catch (err) {
      console.error(err)

      setError(
        err.message ||
        "Could not load students."
      )

    } finally {
      setLoading(false)
    }
  }


  const semesters =
    useMemo(() => {
      return [
        ...new Set(
          students.map(
            (student) =>
              student.semester
          )
        ),
      ].sort()
    }, [students])


  const filteredStudents =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase()

      return students.filter(
        (student) => {
          const matchesSemester =
            semester === "all" ||
            String(
              student.semester
            ) === semester

          const courseText =
            (
              student
                .assigned_courses ||
              []
            )
              .map(
                (course) =>
                  `${course.course_code} ${course.course_name}`
              )
              .join(" ")

          const searchable =
            `
              ${student.roll_number || ""}
              ${student.name || ""}
              ${student.email || ""}
              ${student.batch || ""}
              ${courseText}
            `.toLowerCase()

          const matchesSearch =
            searchable.includes(
              term
            )

          return (
            matchesSemester &&
            matchesSearch
          )
        }
      )
    }, [
      students,
      search,
      semester,
    ])


  const courseCount =
    useMemo(() => {
      const ids =
        new Set()

      students.forEach(
        (student) => {
          (
            student
              .assigned_courses ||
            []
          ).forEach(
            (course) =>
              ids.add(course.id)
          )
        }
      )

      return ids.size
    }, [students])


  if (loading) {
    return (
      <div className="panel">
        <h3>
          Loading students...
        </h3>

        <p className="subtitle">
          Fetching only the students
          connected to your assigned
          courses.
        </p>
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
          alignItems:
            "flex-end",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "22px",
        }}
      >
        <div>
          <p className="eyebrow">
            FACULTY PORTAL
          </p>

          <h1>
            My Students
          </h1>

          <p className="subtitle">
            Students shown here are
            automatically filtered from
            your assigned courses.
          </p>
        </div>
      </div>


      {error && (
        <div
          className="panel"
          style={{
            marginBottom: "18px",
            border:
              "1px solid #f0cccc",
            background:
              "#fff7f7",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#b83d3d",
              fontWeight: 650,
            }}
          >
            {error}
          </p>
        </div>
      )}


      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        <SummaryCard
          icon={
            <Users size={19} />
          }
          label="My Students"
          value={students.length}
        />

        <SummaryCard
          icon={
            <BookOpen size={19} />
          }
          label="Assigned Courses"
          value={courseCount}
        />

        <SummaryCard
          icon={
            <GraduationCap
              size={19}
            />
          }
          label="Semesters"
          value={
            semesters.length
          }
        />
      </div>


      <div
        className="panel"
        style={{
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              position:
                "relative",
              flex: "1 1 320px",
            }}
          >
            <Search
              size={18}
              style={{
                position:
                  "absolute",
                left: "14px",
                top: "50%",
                transform:
                  "translateY(-50%)",
                color: "#9295a5",
              }}
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search student, roll number, email or course..."
              style={{
                ...inputStyle,
                paddingLeft:
                  "43px",
              }}
            />
          </div>


          <select
            value={semester}
            onChange={(event) =>
              setSemester(
                event.target.value
              )
            }
            style={{
              ...inputStyle,
              width: "180px",
            }}
          >
            <option value="all">
              All Semesters
            </option>

            {semesters.map(
              (item) => (
                <option
                  key={item}
                  value={
                    String(item)
                  }
                >
                  Semester {item}
                </option>
              )
            )}
          </select>
        </div>
      </div>


      <div className="panel">
        <div
          className="panel-header"
          style={{
            marginBottom:
              "18px",
          }}
        >
          <div>
            <h3>
              Student List
            </h3>

            <p>
              {
                filteredStudents
                  .length
              }{" "}
              student
              {
                filteredStudents
                  .length === 1
                  ? ""
                  : "s"
              }{" "}
              found
            </p>
          </div>
        </div>


        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table
            style={tableStyle}
          >
            <thead>
              <tr>
                <th style={thStyle}>
                  Roll Number
                </th>

                <th style={thStyle}>
                  Student
                </th>

                <th style={thStyle}>
                  Semester
                </th>

                <th style={thStyle}>
                  Batch
                </th>

                <th style={thStyle}>
                  My Courses
                </th>
              </tr>
            </thead>


            <tbody>
              {filteredStudents.map(
                (student) => (
                  <tr
                    key={
                      student.id
                    }
                  >
                    <td
                      style={
                        tdStyle
                      }
                    >
                      <strong>
                        {
                          student
                            .roll_number
                        }
                      </strong>
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      <div>
                        <strong>
                          {
                            student
                              .name
                          }
                        </strong>

                        <div
                          style={{
                            marginTop:
                              "4px",
                            fontSize:
                              "12px",
                            color:
                              "#8b8e9d",
                          }}
                        >
                          {
                            student
                              .email
                          }
                        </div>
                      </div>
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      <span
                        style={
                          semesterBadge
                        }
                      >
                        Sem{" "}
                        {
                          student
                            .semester
                        }
                      </span>
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      {
                        student
                          .batch
                      }
                    </td>

                    <td
                      style={
                        tdStyle
                      }
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          flexWrap:
                            "wrap",
                          gap: "6px",
                        }}
                      >
                        {(
                          student
                            .assigned_courses ||
                          []
                        ).map(
                          (
                            course
                          ) => (
                            <span
                              key={
                                course.id
                              }
                              title={
                                course.course_name
                              }
                              style={
                                courseBadge
                              }
                            >
                              {
                                course
                                  .course_code
                              }
                            </span>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>


          {filteredStudents
            .length === 0 && (
            <div
              style={
                emptyState
              }
            >
              <Users
                size={32}
                style={{
                  marginBottom:
                    "10px",
                  opacity: 0.45,
                }}
              />

              <h3>
                No students found
              </h3>

              <p className="subtitle">
                No students match your
                current course assignments
                and filters.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}


function SummaryCard({
  icon,
  label,
  value,
}) {
  return (
    <div
      className="panel"
      style={{
        padding: "18px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: "#6757d8",
          marginBottom: "12px",
        }}
      >
        {icon}

        <span
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#777a88",
          }}
        >
          {label}
        </span>
      </div>

      <div
        style={{
          fontSize: "27px",
          fontWeight: 800,
        }}
      >
        {value}
      </div>
    </div>
  )
}


const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 13px",
  borderRadius: "10px",
  border:
    "1px solid #dddfe7",
  background: "#ffffff",
  outline: "none",
  fontSize: "14px",
}


const tableStyle = {
  width: "100%",
  borderCollapse:
    "collapse",
}


const thStyle = {
  textAlign: "left",
  padding: "14px 12px",
  borderBottom:
    "1px solid #e8e8ef",
  color: "#767988",
  fontSize: "12px",
  fontWeight: 700,
  textTransform:
    "uppercase",
  letterSpacing: "0.04em",
}


const tdStyle = {
  padding: "15px 12px",
  borderBottom:
    "1px solid #f0f0f4",
  color: "#363846",
  fontSize: "13px",
  verticalAlign: "top",
}


const semesterBadge = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#f0edff",
  color: "#6757d8",
  fontWeight: 700,
  fontSize: "12px",
}


const courseBadge = {
  display: "inline-block",
  padding: "6px 9px",
  borderRadius: "8px",
  background: "#f5f4fb",
  color: "#585269",
  fontSize: "11px",
  fontWeight: 700,
}


const emptyState = {
  textAlign: "center",
  padding: "55px 20px",
  color: "#777a88",
}


export default FacultyStudents
