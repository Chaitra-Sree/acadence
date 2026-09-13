import { useEffect, useState } from "react"

import {
  Users,
  BookOpen,
  GraduationCap,
  ClipboardCheck
} from "lucide-react"


const API = "http://127.0.0.1:8000"


function FacultyDashboard() {

  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {

    Promise.all([
      fetch(`${API}/students`).then((res) => res.json()),
      fetch(`${API}/courses`).then((res) => res.json())
    ])

      .then(([studentData, courseData]) => {

        setStudents(studentData)
        setCourses(courseData)
        setLoading(false)

      })

      .catch((error) => {

        console.error(error)
        setLoading(false)

      })

  }, [])


  if (loading) {

    return (
      <div className="panel">
        Loading faculty dashboard...
      </div>
    )

  }


  return (

    <>

      <header className="topbar">

        <div>

          <p className="eyebrow">
            FACULTY PORTAL
          </p>

          <h1>
            Faculty Dashboard
          </h1>

          <p className="subtitle">
            Manage marks, attendance and student performance.
          </p>

        </div>


        <div className="profile-chip">

          <div className="avatar">
            F
          </div>

          <div>
            <strong>Faculty</strong>
            <span>MCA Department</span>
          </div>

        </div>

      </header>



      <section className="stats-grid">

        <div className="stat-card">

          <div className="stat-top">
            <span className="stat-label">
              Students
            </span>

            <Users
              size={18}
              color="#7867e8"
            />
          </div>

          <h2>{students.length}</h2>

          <p>
            Registered students
          </p>

        </div>



        <div className="stat-card">

          <div className="stat-top">
            <span className="stat-label">
              Courses
            </span>

            <BookOpen
              size={18}
              color="#7867e8"
            />
          </div>

          <h2>{courses.length}</h2>

          <p>
            Available courses
          </p>

        </div>



        <div className="stat-card">

          <div className="stat-top">
            <span className="stat-label">
              Marks Entry
            </span>

            <GraduationCap
              size={18}
              color="#7867e8"
            />
          </div>

          <h2>Active</h2>

          <p>
            Add or update marks
          </p>

        </div>



        <div className="stat-card">

          <div className="stat-top">
            <span className="stat-label">
              Attendance
            </span>

            <ClipboardCheck
              size={18}
              color="#7867e8"
            />
          </div>

          <h2>Active</h2>

          <p>
            Manage attendance
          </p>

        </div>

      </section>



      <section className="dashboard-grid">

        <div className="panel">

          <div className="panel-header">

            <div>

              <h3>
                Academic Management
              </h3>

              <p>
                Quick faculty overview
              </p>

            </div>

          </div>


          <div
            style={{
              marginTop: "22px",
              lineHeight: "1.9",
              color: "#74798d",
              fontSize: "13px"
            }}
          >

            <p>
              Use <strong>Marks Entry</strong> to add
              or update student assessment marks.
            </p>

            <p>
              Use <strong>Attendance</strong> to maintain
              subject-wise attendance records.
            </p>

            <p>
              Use <strong>Class Performance</strong> to
              review student performance.
            </p>

          </div>

        </div>



        <div className="panel insight-panel">

          <div>

            <span className="small-label">
              FACULTY INSIGHT
            </span>

            <h3>
              Monitor your class from one place.
            </h3>

            <p>
              Student marks and attendance entered here
              are reflected in the student academic portal.
            </p>

          </div>

        </div>

      </section>

    </>

  )

}


export default FacultyDashboard