import { useEffect, useState } from "react"
import {
  User,
  Mail,
  GraduationCap,
  BookOpen
} from "lucide-react"

const API = "http://127.0.0.1:8000"


function Profile() {

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {

    fetch(`${API}/dashboard/student/1`)

      .then((response) =>
        response.json()
      )

      .then((dashboard) => {

        setData(dashboard)
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
        Loading profile...
      </div>
    )

  }


  if (!data) {

    return (
      <div className="panel">
        Profile unavailable.
      </div>
    )

  }


  return (
    <>

      <header className="topbar">

        <div>

          <p className="eyebrow">
            STUDENT PROFILE
          </p>

          <h1>
            Profile
          </h1>

          <p className="subtitle">
            Your student and academic information.
          </p>

        </div>

      </header>


      <div
        className="panel"
        style={{
          maxWidth: "850px"
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            paddingBottom: "25px",
            borderBottom: "1px solid #eee"
          }}
        >

          <div
            className="avatar"
            style={{
              width: "70px",
              height: "70px",
              fontSize: "24px"
            }}
          >
            {data.student.name
              .charAt(0)
              .toUpperCase()}
          </div>


          <div>

            <h2
              style={{
                margin: "0 0 6px"
              }}
            >
              {data.student.name}
            </h2>

            <p
              className="subtitle"
            >
              {data.student.roll_number}
            </p>

          </div>

        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "18px",
            marginTop: "25px"
          }}
        >

          <InfoCard
            icon={<User size={19} />}
            title="Student Name"
            value={data.student.name}
          />

          <InfoCard
            icon={<Mail size={19} />}
            title="Email"
            value={data.student.email}
          />

          <InfoCard
            icon={<GraduationCap size={19} />}
            title="Batch"
            value={data.student.batch}
          />

          <InfoCard
            icon={<BookOpen size={19} />}
            title="Current Semester"
            value={`Semester ${data.program.current_semester}`}
          />

        </div>

      </div>

    </>
  )
}


function InfoCard({
  icon,
  title,
  value
}) {

  return (

    <div
      style={{
        padding: "18px",
        borderRadius: "14px",
        border: "1px solid #eeeeF4",
        background: "#fafafe"
      }}
    >

      <div
        style={{
          color: "#7867e8",
          marginBottom: "12px"
        }}
      >
        {icon}
      </div>

      <span
        style={{
          display: "block",
          fontSize: "11px",
          color: "#999",
          marginBottom: "6px"
        }}
      >
        {title}
      </span>

      <strong
        style={{
          fontSize: "13px"
        }}
      >
        {value}
      </strong>

    </div>

  )
}


export default Profile