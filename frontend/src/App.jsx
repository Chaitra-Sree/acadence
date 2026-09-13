import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom"

import {
  useEffect,
  useState,
} from "react"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"


// ======================================================
// AUTH
// ======================================================

import ProtectedRoute from "./auth/ProtectedRoute"

import {
  getStudentId,
} from "./auth/auth"

import {
  apiGet,
} from "./auth/api"


// ======================================================
// LAYOUTS
// ======================================================

import StudentLayout from "./layouts/StudentLayout"
import FacultyLayout from "./layouts/FacultyLayout"
import AdminLayout from "./layouts/AdminLayout"


// ======================================================
// LOGIN
// ======================================================

import Login from "./pages/Login"


// ======================================================
// STUDENT PAGES
// ======================================================

import Marks from "./pages/marks.jsx"
import Attendance from "./pages/Attendance.jsx"
import Courses from "./pages/Courses"
import Performance from "./pages/Performance"
import Profile from "./pages/Profile"


// ======================================================
// FACULTY PAGES
// ======================================================

import FacultyDashboard from "./pages/faculty/FacultyDashboard"
import FacultyMarks from "./pages/faculty/FacultyMarks"
import FacultyAttendance from "./pages/faculty/FacultyAttendance"
import FacultyCourses from "./pages/faculty/FacultyCourses"
import FacultyStudents from "./pages/faculty/FacultyStudents"
import FacultyPerformance from "./pages/faculty/FacultyPerformance"
import FacultyProfile from "./pages/faculty/FacultyProfile"


// ======================================================
// ADMIN PAGES
// ======================================================

import AdminDashboard from "./pages/AdminDashboard"
import AdminStudents from "./pages/AdminStudents"
import AdminFaculty from "./pages/AdminFaculty"
import AdminCourses from "./pages/AdminCourses"
import AdminSemesters from "./pages/AdminSemesters"
import AdminCourseMapping from "./pages/AdminCourseMapping"
import AdminAnalytics from "./pages/AdminAnalytics"
import AdminProfile from "./pages/AdminProfile"


// ======================================================
// STUDENT DASHBOARD
// ======================================================

function StudentDashboard() {
  const [dashboardData, setDashboardData] =
    useState(null)

  const [cgpaData, setCgpaData] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")


  useEffect(() => {
    let mounted = true


    async function loadDashboard() {
      try {
        const studentId =
          getStudentId()


        if (!studentId) {
          throw new Error(
            "Student account is not linked to a student profile."
          )
        }


        const [
          dashboard,
          cgpa,
        ] = await Promise.all([
          apiGet(
            `/dashboard/student/${studentId}`
          ),

          apiGet(
            `/cgpa/student/${studentId}`
          ),
        ])


        if (!mounted) {
          return
        }


        setDashboardData(
          dashboard
        )

        setCgpaData(
          cgpa
        )

      } catch (err) {
        console.error(
          "Dashboard error:",
          err
        )


        if (mounted) {
          setError(
            err.message ||
            "Could not load dashboard."
          )
        }

      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }


    loadDashboard()


    return () => {
      mounted = false
    }

  }, [])


  // ====================================================
  // LOADING STATE
  // ====================================================

  if (loading) {
    return (
      <div className="panel">
        <h3>
          Loading dashboard...
        </h3>

        <p className="subtitle">
          Fetching your academic
          information.
        </p>
      </div>
    )
  }


  // ====================================================
  // ERROR STATE
  // ====================================================

  if (
    error ||
    !dashboardData ||
    dashboardData.error
  ) {
    return (
      <div className="panel">
        <h3>
          Could not load dashboard.
        </h3>

        <p className="subtitle">
          {error ||
            dashboardData?.error ||
            "Make sure the FastAPI backend is running."}
        </p>
      </div>
    )
  }


  // ====================================================
  // DATA
  // ====================================================

  const student =
    dashboardData.student || {}

  const program =
    dashboardData.program || {}

  const academicSummary =
    dashboardData.academic_summary || {}

  const attendance =
    dashboardData.attendance || []

  const courses =
    dashboardData.courses || []

  const performance =
    dashboardData.course_performance || []


  // ====================================================
  // AVERAGE ATTENDANCE
  // ====================================================

  const averageAttendance =
    attendance.length > 0
      ? (
          attendance.reduce(
            (sum, item) =>
              sum +
              Number(
                item.percentage ||
                item.attendance_percentage ||
                0
              ),
            0
          ) /
          attendance.length
        ).toFixed(1)
      : "0.0"


  // ====================================================
  // CHART DATA
  // ====================================================

  const chartData =
    performance.map(
      (course) => ({
        name:
          course.course_code ||
          course.code ||
          "Course",

        marks:
          Number(
            course.marks_percentage ||
            course.percentage ||
            course.final_percentage ||
            0
          ),
      })
    )


  // ====================================================
  // STUDENT INITIAL
  // ====================================================

  const studentInitial =
    student.name
      ? student.name
          .charAt(0)
          .toUpperCase()
      : "S"


  // ====================================================
  // UI
  // ====================================================

  return (
    <>
      {/* TOP BAR */}

      <header className="topbar">
        <div>
          <p className="eyebrow">
            STUDENT PORTAL
          </p>

          <h1>
            Welcome back,{" "}
            {student.name ||
              "Student"}!
          </h1>

          <p className="subtitle">
            Here’s a quick look at
            your academic performance.
          </p>
        </div>


        <div className="profile-chip">
          <div className="avatar">
            {studentInitial}
          </div>

          <div>
            <strong>
              {student.name ||
                "Student"}
            </strong>

            <span>
              MCA • Semester{" "}
              {program.current_semester ??
                "-"}
            </span>
          </div>
        </div>
      </header>


      {/* SUMMARY CARDS */}

      <section className="stats-grid">
        {/* SGPA */}

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">
              Current SGPA
            </span>

            <span className="badge success">
              Current
            </span>
          </div>

          <h2>
            {academicSummary.sgpa ??
              0}
          </h2>

          <p>
            Semester{" "}
            {program.current_semester ??
              "-"}{" "}
            performance
          </p>
        </div>


        {/* CGPA */}

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">
              Overall CGPA
            </span>

            <span className="badge">
              Overall
            </span>
          </div>

          <h2>
            {cgpaData?.cgpa ?? 0}
          </h2>

          <p>
            Across completed
            semesters
          </p>
        </div>


        {/* ATTENDANCE */}

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">
              Attendance
            </span>

            <span
              className={
                Number(
                  averageAttendance
                ) >= 75
                  ? "badge success"
                  : "badge"
              }
            >
              {Number(
                averageAttendance
              ) >= 75
                ? "Safe"
                : "Shortage"}
            </span>
          </div>

          <h2>
            {averageAttendance}%
          </h2>

          <p>
            Average attendance
          </p>
        </div>


        {/* COURSES */}

        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">
              Courses
            </span>

            <span className="badge">
              Active
            </span>
          </div>

          <h2>
            {courses.length}
          </h2>

          <p>
            Current semester courses
          </p>
        </div>
      </section>


      {/* DASHBOARD DETAILS */}

      <section className="dashboard-grid">
        {/* PERFORMANCE */}

        <div className="panel large-panel">
          <div className="panel-header">
            <div>
              <h3>
                Performance Overview
              </h3>

              <p>
                Current semester
                subject performance
              </p>
            </div>
          </div>


          <div
            style={{
              width: "100%",
              height: "260px",
              marginTop: "25px",
            }}
          >
            {chartData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={chartData}
                >
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    domain={[0, 100]}
                    tick={{
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="marks"
                    fill="#7867e8"
                    radius={[
                      8,
                      8,
                      0,
                      0,
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  justifyContent:
                    "center",
                  alignItems:
                    "center",
                  color: "#9a9daf",
                }}
              >
                Marks will appear
                here once entered.
              </div>
            )}
          </div>
        </div>


        {/* ATTENDANCE CIRCLE */}

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>
                Attendance
              </h3>

              <p>
                Current semester
              </p>
            </div>
          </div>


          <div
            className="attendance-circle"
            style={{
              background:
                `conic-gradient(
                  #7867e8 0%
                  ${averageAttendance}%,
                  #eceaf9
                  ${averageAttendance}%
                  100%
                )`,
            }}
          >
            <div className="circle-inner">
              <strong>
                {averageAttendance}%
              </strong>

              <span>
                Present
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}


// ======================================================
// APP
// ======================================================

function App() {
  return (
    <Routes>

      {/* =================================================
          LOGIN
      ================================================= */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* =================================================
          STUDENT PORTAL
      ================================================= */}

      <Route
        path="/student"
        element={
          <ProtectedRoute
            allowedRole="student"
          >
            <StudentLayout />
          </ProtectedRoute>
        }
      >

        <Route
          index
          element={
            <StudentDashboard />
          }
        />

        <Route
          path="marks"
          element={<Marks />}
        />

        <Route
          path="attendance"
          element={<Attendance />}
        />

        <Route
          path="courses"
          element={<Courses />}
        />

        <Route
          path="performance"
          element={<Performance />}
        />

        <Route
          path="profile"
          element={<Profile />}
        />

      </Route>


      {/* =================================================
          FACULTY PORTAL
      ================================================= */}

      <Route
        path="/faculty"
        element={
          <ProtectedRoute
            allowedRole="faculty"
          >
            <FacultyLayout />
          </ProtectedRoute>
        }
      >

        <Route
          index
          element={
            <FacultyDashboard />
          }
        />

        <Route
          path="courses"
          element={
            <FacultyCourses />
          }
        />

        <Route
          path="students"
          element={
            <FacultyStudents />
          }
        />

        <Route
          path="marks"
          element={
            <FacultyMarks />
          }
        />

        <Route
          path="attendance"
          element={
            <FacultyAttendance />
          }
        />

        <Route
          path="performance"
          element={
            <FacultyPerformance />
          }
        />

        <Route
          path="profile"
          element={
            <FacultyProfile />
          }
        />

      </Route>


      {/* =================================================
          ADMIN PORTAL
      ================================================= */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute
            allowedRole="admin"
          >
            <AdminLayout />
          </ProtectedRoute>
        }
      >

        <Route
          index
          element={
            <AdminDashboard />
          }
        />


        <Route
          path="students"
          element={
            <AdminStudents />
          }
        />


        <Route
          path="faculty"
          element={
            <AdminFaculty />
          }
        />


        <Route
          path="courses"
          element={
            <AdminCourses />
          }
        />


        <Route
          path="semesters"
          element={
            <AdminSemesters />
          }
        />


        <Route
          path="course-mapping"
          element={
            <AdminCourseMapping />
          }
        />


        <Route
          path="analytics"
          element={
            <AdminAnalytics />
          }
        />


        <Route
          path="profile"
          element={
            <AdminProfile />
          }
        />

      </Route>


      {/* =================================================
          DEFAULT ROUTES
      ================================================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>
  )
}


export default App