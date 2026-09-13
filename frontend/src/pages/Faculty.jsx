import { useEffect, useState } from "react"

import {
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Save,
  Users,
  CheckCircle,
  AlertCircle
} from "lucide-react"


const API = "http://127.0.0.1:8000"


function Faculty() {

  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [components, setComponents] = useState([])

  const [selectedStudent, setSelectedStudent] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")
  const [selectedComponent, setSelectedComponent] = useState("")

  const [marks, setMarks] = useState("")

  const [classesHeld, setClassesHeld] = useState("")
  const [classesAttended, setClassesAttended] = useState("")

  const [marksMessage, setMarksMessage] = useState("")
  const [attendanceMessage, setAttendanceMessage] = useState("")

  const [loading, setLoading] = useState(true)


  // LOAD STUDENTS + COURSES

  useEffect(() => {

    Promise.all([
      fetch(`${API}/students`).then((response) => response.json()),
      fetch(`${API}/courses`).then((response) => response.json())
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



  // LOAD ASSESSMENT COMPONENTS WHEN COURSE CHANGES

  useEffect(() => {

    if (!selectedCourse) {

      setComponents([])
      setSelectedComponent("")

      return

    }


    fetch(
      `${API}/assessment-components/course/${selectedCourse}`
    )

      .then((response) => response.json())

      .then((data) => {

        setComponents(data)
        setSelectedComponent("")

      })

      .catch((error) => {

        console.error(error)

      })

  }, [selectedCourse])



  // SAVE MARKS

  const saveMarks = async (event) => {

    event.preventDefault()

    setMarksMessage("")


    if (
      !selectedStudent ||
      !selectedComponent ||
      marks === ""
    ) {

      setMarksMessage(
        "Please select a student, assessment and enter marks."
      )

      return
    }


    try {

      const response = await fetch(
        `${API}/marks`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            student_id: Number(selectedStudent),
            assessment_component_id: Number(selectedComponent),
            marks_obtained: Number(marks)
          })
        }
      )


      const data = await response.json()


      if (data.error) {

        setMarksMessage(data.error)

        return

      }


      setMarksMessage(
        data.message || "Marks saved successfully."
      )


      setMarks("")


    } catch (error) {

      console.error(error)

      setMarksMessage(
        "Unable to save marks."
      )

    }

  }



  // SAVE ATTENDANCE

  const saveAttendance = async (event) => {

    event.preventDefault()

    setAttendanceMessage("")


    if (
      !selectedStudent ||
      !selectedCourse ||
      classesHeld === "" ||
      classesAttended === ""
    ) {

      setAttendanceMessage(
        "Please complete all attendance fields."
      )

      return
    }


    try {

      const response = await fetch(
        `${API}/attendance`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            student_id: Number(selectedStudent),
            course_id: Number(selectedCourse),
            classes_held: Number(classesHeld),
            classes_attended: Number(classesAttended)
          })
        }
      )


      const data = await response.json()


      if (data.error) {

        setAttendanceMessage(data.error)

        return

      }


      setAttendanceMessage(
        data.message ||
        "Attendance saved successfully."
      )


      setClassesHeld("")
      setClassesAttended("")


    } catch (error) {

      console.error(error)

      setAttendanceMessage(
        "Unable to save attendance."
      )

    }

  }



  if (loading) {

    return (

      <div className="panel">
        Loading faculty dashboard...
      </div>

    )

  }



  const selectedComponentObject =
    components.find(
      (component) =>
        component.id === Number(selectedComponent)
    )



  return (

    <>

      {/* HEADER */}

      <header className="topbar">

        <div>

          <p className="eyebrow">
            FACULTY PORTAL
          </p>

          <h1>
            Faculty Dashboard
          </h1>

          <p className="subtitle">
            Manage student marks and attendance.
          </p>

        </div>


        <div className="profile-chip">

          <div className="avatar">
            F
          </div>

          <div>

            <strong>
              Faculty
            </strong>

            <span>
              MCA Department
            </span>

          </div>

        </div>

      </header>



      {/* SUMMARY */}

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

          <h2>
            {students.length}
          </h2>

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

          <h2>
            {courses.length}
          </h2>

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

          <h2>
            Active
          </h2>

          <p>
            Enter or update marks
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

          <h2>
            Active
          </h2>

          <p>
            Update attendance
          </p>

        </div>

      </section>



      {/* COMMON STUDENT / COURSE SELECTION */}

      <div
        className="panel"
        style={{
          marginBottom: "20px"
        }}
      >

        <div className="panel-header">

          <div>

            <h3>
              Select Student & Course
            </h3>

            <p>
              Choose who you want to update.
            </p>

          </div>

        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "18px",
            marginTop: "24px"
          }}
        >


          {/* STUDENT */}

          <div>

            <label style={labelStyle}>
              Student
            </label>

            <select
              style={inputStyle}
              value={selectedStudent}
              onChange={(event) =>
                setSelectedStudent(event.target.value)
              }
            >

              <option value="">
                Select student
              </option>

              {students.map((student) => (

                <option
                  key={student.id}
                  value={student.id}
                >
                  {student.name}
                  {" — "}
                  {student.roll_number}
                </option>

              ))}

            </select>

          </div>



          {/* COURSE */}

          <div>

            <label style={labelStyle}>
              Course
            </label>

            <select
              style={inputStyle}
              value={selectedCourse}
              onChange={(event) =>
                setSelectedCourse(event.target.value)
              }
            >

              <option value="">
                Select course
              </option>

              {courses.map((course) => (

                <option
                  key={course.id}
                  value={course.id}
                >
                  {course.course_code}
                  {" — "}
                  {course.course_name}
                </option>

              ))}

            </select>

          </div>

        </div>

      </div>



      {/* MARKS + ATTENDANCE */}

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "20px"
        }}
      >


        {/* MARKS */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <h3>
                Enter / Update Marks
              </h3>

              <p>
                Select an assessment component.
              </p>

            </div>

            <GraduationCap
              size={22}
              color="#7867e8"
            />

          </div>


          <form
            onSubmit={saveMarks}
            style={{
              marginTop: "24px"
            }}
          >


            <div style={fieldStyle}>

              <label style={labelStyle}>
                Assessment Component
              </label>

              <select
                style={inputStyle}
                value={selectedComponent}
                onChange={(event) =>
                  setSelectedComponent(
                    event.target.value
                  )
                }
                disabled={!selectedCourse}
              >

                <option value="">
                  Select assessment
                </option>

                {components.map((component) => (

                  <option
                    key={component.id}
                    value={component.id}
                  >
                    {component.component_name}
                    {" — "}
                    Max {component.max_marks}
                  </option>

                ))}

              </select>

            </div>



            <div style={fieldStyle}>

              <label style={labelStyle}>
                Marks Obtained
              </label>

              <input
                type="number"
                step="0.5"
                min="0"
                max={
                  selectedComponentObject
                    ? selectedComponentObject.max_marks
                    : undefined
                }
                placeholder={
                  selectedComponentObject
                    ? `Maximum ${selectedComponentObject.max_marks}`
                    : "Enter marks"
                }
                style={inputStyle}
                value={marks}
                onChange={(event) =>
                  setMarks(event.target.value)
                }
              />

            </div>



            <button
              type="submit"
              className="primary-button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >

              <Save size={16} />

              Save Marks

            </button>


            {marksMessage && (

              <Message
                text={marksMessage}
                success={
                  marksMessage
                    .toLowerCase()
                    .includes("success")
                }
              />

            )}

          </form>

        </div>



        {/* ATTENDANCE */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <h3>
                Update Attendance
              </h3>

              <p>
                Enter cumulative attendance.
              </p>

            </div>

            <ClipboardCheck
              size={22}
              color="#7867e8"
            />

          </div>


          <form
            onSubmit={saveAttendance}
            style={{
              marginTop: "24px"
            }}
          >


            <div style={fieldStyle}>

              <label style={labelStyle}>
                Classes Held
              </label>

              <input
                type="number"
                min="0"
                placeholder="Example: 40"
                style={inputStyle}
                value={classesHeld}
                onChange={(event) =>
                  setClassesHeld(
                    event.target.value
                  )
                }
              />

            </div>



            <div style={fieldStyle}>

              <label style={labelStyle}>
                Classes Attended
              </label>

              <input
                type="number"
                min="0"
                placeholder="Example: 34"
                style={inputStyle}
                value={classesAttended}
                onChange={(event) =>
                  setClassesAttended(
                    event.target.value
                  )
                }
              />

            </div>



            <button
              type="submit"
              className="primary-button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >

              <Save size={16} />

              Save Attendance

            </button>


            {attendanceMessage && (

              <Message
                text={attendanceMessage}
                success={
                  attendanceMessage
                    .toLowerCase()
                    .includes("success")
                }
              />

            )}

          </form>

        </div>

      </section>

    </>

  )

}



function Message({
  text,
  success
}) {

  return (

    <div
      style={{
        marginTop: "18px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px",
        borderRadius: "10px",
        fontSize: "12px",
        background: success
          ? "#edf8f1"
          : "#fff3ed",
        color: success
          ? "#458f62"
          : "#bd6b3d"
      }}
    >

      {success ? (

        <CheckCircle size={16} />

      ) : (

        <AlertCircle size={16} />

      )}

      {text}

    </div>

  )

}



const fieldStyle = {
  marginBottom: "18px"
}


const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "12px",
  fontWeight: "600",
  color: "#666b7c"
}


const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "11px",
  border: "1px solid #e2e4ec",
  outline: "none",
  background: "#fafafe",
  fontSize: "13px",
  color: "#252836"
}


export default Faculty