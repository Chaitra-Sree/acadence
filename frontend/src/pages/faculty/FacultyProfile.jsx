import {
  useEffect,
  useState,
} from "react"

import {
  UserRound,
  Mail,
  Building2,
  BadgeCheck,
  BookOpen,
} from "lucide-react"

import {
  apiGet,
} from "../../auth/api"


function FacultyProfile() {
  const [faculty, setFaculty] =
    useState(null)

  const [courses, setCourses] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")


  useEffect(() => {
    let mounted = true

    async function loadProfile() {
      try {
        const [
          profileData,
          courseData,
        ] = await Promise.all([
          apiGet(
            "/faculty-portal/me"
          ),

          apiGet(
            "/faculty-portal/me/courses"
          ),
        ])

        if (!mounted) {
          return
        }

        setFaculty(profileData)

        setCourses(
          Array.isArray(courseData)
            ? courseData
            : []
        )
      } catch (err) {
        console.error(
          "Faculty profile error:",
          err
        )

        if (mounted) {
          setError(
            err.message ||
            "Could not load faculty profile."
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [])


  if (loading) {
    return (
      <div className="panel">
        <h3>Loading profile...</h3>

        <p className="subtitle">
          Fetching your faculty
          information.
        </p>
      </div>
    )
  }


  if (error || !faculty) {
    return (
      <div className="panel">
        <h3>
          Could not load profile.
        </h3>

        <p className="subtitle">
          {error ||
            "Please sign in again."}
        </p>
      </div>
    )
  }


  const initial =
    faculty.name
      ? faculty.name
          .charAt(0)
          .toUpperCase()
      : "F"


  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">
            FACULTY PORTAL
          </p>

          <h1>Faculty Profile</h1>

          <p className="subtitle">
            Your faculty account,
            department and assigned
            teaching load.
          </p>
        </div>

        <div className="profile-chip">
          <div className="avatar">
            {initial}
          </div>

          <div>
            <strong>
              {faculty.name ||
                "Faculty"}
            </strong>

            <span>
              {faculty.department ||
                "MCA"}
            </span>
          </div>
        </div>
      </header>


      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">
              Faculty Code
            </span>

            <span className="badge">
              ID
            </span>
          </div>

          <h2
            style={{
              fontSize: "24px",
            }}
          >
            {faculty.faculty_code ||
              "-"}
          </h2>

          <p>
            Institutional faculty
            identifier
          </p>
        </div>


        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">
              Department
            </span>

            <span className="badge">
              Academic
            </span>
          </div>

          <h2
            style={{
              fontSize: "24px",
            }}
          >
            {faculty.department ||
              "MCA"}
          </h2>

          <p>
            Current department
          </p>
        </div>


        <div className="stat-card">
          <div className="stat-top">
            <span className="stat-label">
              Assigned Courses
            </span>

            <span className="badge success">
              Active
            </span>
          </div>

          <h2>
            {courses.length}
          </h2>

          <p>
            Courses currently mapped
            to you
          </p>
        </div>
      </section>


      <section
        className="dashboard-grid"
        style={{
          marginTop: "20px",
        }}
      >
        <div className="panel large-panel">
          <div className="panel-header">
            <div>
              <h3>
                Personal Information
              </h3>

              <p>
                Faculty account details
              </p>
            </div>

            <span className="badge success">
              Active
            </span>
          </div>


          <div
            style={{
              display: "grid",
              gap: "16px",
              marginTop: "24px",
            }}
          >
            <ProfileRow
              icon={<UserRound size={19} />}
              label="Name"
              value={
                faculty.name || "-"
              }
            />

            <ProfileRow
              icon={<Mail size={19} />}
              label="Email"
              value={
                faculty.email || "-"
              }
            />

            <ProfileRow
              icon={
                <BadgeCheck
                  size={19}
                />
              }
              label="Faculty Code"
              value={
                faculty.faculty_code ||
                "-"
              }
            />

            <ProfileRow
              icon={
                <Building2
                  size={19}
                />
              }
              label="Department"
              value={
                faculty.department ||
                "MCA"
              }
            />
          </div>
        </div>


        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>
                Teaching Access
              </h3>

              <p>
                Assigned course scope
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: "22px",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "16px",
                display: "grid",
                placeItems: "center",
                background: "#f0edff",
                marginBottom: "15px",
              }}
            >
              <BookOpen size={23} />
            </div>

            <strong>
              {courses.length} Assigned{" "}
              {courses.length === 1
                ? "Course"
                : "Courses"}
            </strong>

            <p
              className="subtitle"
              style={{
                marginTop: "7px",
              }}
            >
              Marks and attendance
              access is restricted to
              courses assigned to your
              faculty account.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}


function ProfileRow({
  icon,
  label,
  value,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "15px 16px",
        border:
          "1px solid #ececf3",
        borderRadius: "14px",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          display: "grid",
          placeItems: "center",
          background: "#f6f4ff",
        }}
      >
        {icon}
      </div>

      <div>
        <span
          className="subtitle"
          style={{
            display: "block",
            marginBottom: "3px",
          }}
        >
          {label}
        </span>

        <strong>
          {value}
        </strong>
      </div>
    </div>
  )
}


export default FacultyProfile
