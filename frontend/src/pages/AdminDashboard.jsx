import { useEffect, useState } from "react"

import {
  Users,
  UserCog,
  BookOpen,
  Link2,
  ArrowRight,
} from "lucide-react"

import { apiGet } from "../auth/api"


function AdminDashboard() {
  const [summary, setSummary] = useState({
    total_students: 0,
    total_faculty: 0,
    total_courses: 0,
    total_mappings: 0,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await apiGet("/admin/summary")

        setSummary(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadSummary()
  }, [])


  if (loading) {
    return (
      <div className="page-card">
        Loading admin dashboard...
      </div>
    )
  }


  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>
            Manage Acadence academic records,
            users and programme data.
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
            "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "18px",
          marginBottom: "26px",
        }}
      >
        <SummaryCard
          icon={<Users size={22} />}
          title="Students"
          value={summary.total_students}
        />

        <SummaryCard
          icon={<UserCog size={22} />}
          title="Faculty"
          value={summary.total_faculty}
        />

        <SummaryCard
          icon={<BookOpen size={22} />}
          title="Courses"
          value={summary.total_courses}
        />

        <SummaryCard
          icon={<Link2 size={22} />}
          title="Course Mappings"
          value={summary.total_mappings}
        />
      </div>

      <div className="page-card">
        <h3 style={{ marginTop: 0 }}>
          Administration Overview
        </h3>

        <p
          style={{
            color: "#777987",
            lineHeight: 1.7,
          }}
        >
          Use the administration portal to manage
          students, faculty, academic courses,
          faculty-course assignments and programme
          analytics.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
            marginTop: "22px",
          }}
        >
          <QuickCard
            title="Student Management"
            text="View and maintain student records."
          />

          <QuickCard
            title="Faculty Management"
            text="Maintain faculty information."
          />

          <QuickCard
            title="Academic Courses"
            text="Review course structures and marks schemes."
          />

          <QuickCard
            title="Programme Analytics"
            text="View academic and attendance statistics."
          />
        </div>
      </div>
    </div>
  )
}


function SummaryCard({
  icon,
  title,
  value,
}) {
  return (
    <div className="page-card">
      <div
        style={{
          width: "45px",
          height: "45px",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0edff",
          color: "#6757d8",
          marginBottom: "18px",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontSize: "13px",
          color: "#858794",
          marginBottom: "7px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "32px",
          fontWeight: 800,
        }}
      >
        {value}
      </div>
    </div>
  )
}


function QuickCard({
  title,
  text,
}) {
  return (
    <div
      style={{
        border: "1px solid #ececf2",
        borderRadius: "13px",
        padding: "17px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <strong>{title}</strong>

        <ArrowRight
          size={17}
          color="#8d8f9c"
        />
      </div>

      <div
        style={{
          fontSize: "13px",
          color: "#858794",
          lineHeight: 1.5,
        }}
      >
        {text}
      </div>
    </div>
  )
}


export default AdminDashboard