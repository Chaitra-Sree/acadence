import { useEffect, useState } from "react"

import {
  User,
  Mail,
  GraduationCap,
  BookOpen,
} from "lucide-react"

import {
  API_URL,
  getStudentId,
  authFetch,
} from "../auth/auth"


function Profile() {
  const studentId = getStudentId()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  useEffect(() => {
    async function loadProfile() {
      if (!studentId) {
        setError("Student account is not linked correctly.")
        setLoading(false)
        return
      }

      try {
        const response = await authFetch(
          `${API_URL}/dashboard/student/${studentId}`
        )

        const dashboard = await response.json()

        if (!response.ok || dashboard.error) {
          throw new Error(
            dashboard.detail ||
            dashboard.error ||
            "Unable to load profile."
          )
        }

        setData(dashboard)
      } catch (err) {
        setError(
          err.message ||
          "Unable to load profile."
        )
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [studentId])


  if (loading) {
    return (
      <div className="page-card">
        Loading profile...
      </div>
    )
  }


  if (error) {
    return (
      <div className="page-card">
        <p style={{ color: "#c0392b" }}>
          {error}
        </p>
      </div>
    )
  }


  if (!data?.student) {
    return (
      <div className="page-card">
        Profile unavailable.
      </div>
    )
  }


  const student = data.student
  const semester =
    data.program?.current_semester ?? "-"


  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Profile</h1>
          <p>
            Your student and academic information.
          </p>
        </div>
      </div>

      <div
        className="page-card"
        style={{
          maxWidth: "850px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            paddingBottom: "25px",
            borderBottom: "1px solid #eee",
          }}
        >
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              background: "#f0edff",
              color: "#6757d8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 800,
            }}
          >
            {student.name
              ?.charAt(0)
              .toUpperCase() || "S"}
          </div>

          <div>
            <h2
              style={{
                margin: "0 0 6px",
              }}
            >
              {student.name}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#858794",
              }}
            >
              {student.roll_number}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "18px",
            marginTop: "25px",
          }}
        >
          <InfoCard
            icon={<User size={19} />}
            title="Student Name"
            value={student.name}
          />

          <InfoCard
            icon={<Mail size={19} />}
            title="Email"
            value={student.email}
          />

          <InfoCard
            icon={<GraduationCap size={19} />}
            title="Batch"
            value={student.batch}
          />

          <InfoCard
            icon={<BookOpen size={19} />}
            title="Current Semester"
            value={`Semester ${semester}`}
          />
        </div>
      </div>
    </div>
  )
}


function InfoCard({
  icon,
  title,
  value,
}) {
  return (
    <div
      style={{
        padding: "18px",
        borderRadius: "14px",
        border: "1px solid #eeeeF4",
        background: "#fafafe",
      }}
    >
      <div
        style={{
          color: "#7867e8",
          marginBottom: "12px",
        }}
      >
        {icon}
      </div>

      <span
        style={{
          display: "block",
          fontSize: "11px",
          color: "#999",
          marginBottom: "6px",
        }}
      >
        {title}
      </span>

      <strong
        style={{
          fontSize: "13px",
        }}
      >
        {value || "—"}
      </strong>
    </div>
  )
}


export default Profile
