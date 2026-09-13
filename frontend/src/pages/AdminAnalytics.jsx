import { useEffect, useState } from "react"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  Users,
  UserCog,
  BookOpen,
  CalendarCheck,
} from "lucide-react"

import { apiGet } from "../auth/api"


function AdminAnalytics() {
  const [analytics, setAnalytics] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")


  useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await apiGet(
          "/admin/analytics"
        )

        setAnalytics(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])


  if (loading) {
    return (
      <div className="page-card">
        Loading analytics...
      </div>
    )
  }


  if (!analytics) {
    return (
      <div className="page-card">
        {error ||
          "Analytics unavailable."}
      </div>
    )
  }


  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Programme Analytics</h1>

          <p>
            MCA programme-level academic
            overview.
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
            "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "16px",
          marginBottom: "22px",
        }}
      >
        <StatCard
          icon={<Users size={21} />}
          title="Students"
          value={
            analytics.total_students
          }
        />

        <StatCard
          icon={<UserCog size={21} />}
          title="Faculty"
          value={
            analytics.total_faculty
          }
        />

        <StatCard
          icon={<BookOpen size={21} />}
          title="Courses"
          value={
            analytics.total_courses
          }
        />

        <StatCard
          icon={
            <CalendarCheck
              size={21}
            />
          }
          title="Average Attendance"
          value={`${analytics.average_attendance}%`}
        />
      </div>

      <div className="page-card">
        <h3
          style={{
            marginTop: 0,
          }}
        >
          Course Distribution by Semester
        </h3>

        <div
          style={{
            width: "100%",
            height: "350px",
          }}
        >
          <ResponsiveContainer>
            <BarChart
              data={
                analytics.semester_course_distribution
              }
            >
              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="semester"
                tickFormatter={(value) =>
                  `Sem ${value}`
                }
              />

              <YAxis
                allowDecimals={false}
              />

              <Tooltip
                labelFormatter={(value) =>
                  `Semester ${value}`
                }
              />

              <Bar
                dataKey="courses"
                name="Courses"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}


function StatCard({
  icon,
  title,
  value,
}) {
  return (
    <div className="page-card">
      <div
        style={{
          width: "42px",
          height: "42px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "11px",
          background: "#f0edff",
          color: "#6757d8",
          marginBottom: "15px",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: "#858794",
          fontSize: "13px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "28px",
          fontWeight: 800,
          marginTop: "5px",
        }}
      >
        {value}
      </div>
    </div>
  )
}


export default AdminAnalytics