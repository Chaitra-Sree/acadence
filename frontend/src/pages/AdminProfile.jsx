import {
  useEffect,
  useState,
} from "react"

import {
  ShieldCheck,
  Mail,
  UserRound,
  CheckCircle2,
  KeyRound,
} from "lucide-react"

import {
  apiGet,
} from "../auth/api"


function AdminProfile() {
  const [account, setAccount] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")


  useEffect(() => {
    let mounted = true

    async function loadProfile() {
      try {
        const data =
          await apiGet("/auth/me")

        if (mounted) {
          setAccount(data)
        }
      } catch (err) {
        console.error(
          "Admin profile error:",
          err
        )

        if (mounted) {
          setError(
            err.message ||
            "Could not load admin profile."
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
          Fetching your administrator
          account.
        </p>
      </div>
    )
  }


  if (error || !account) {
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


  const displayName =
    account.name ||
    account.email
      ?.split("@")[0]
      ?.replace(/[._-]/g, " ")
      ?.replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      ) ||
    "Administrator"

  const initial =
    displayName
      .charAt(0)
      .toUpperCase()


  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">
            ADMIN PORTAL
          </p>

          <h1>Admin Profile</h1>

          <p className="subtitle">
            Your Acadence administrator
            account and access details.
          </p>
        </div>

        <div className="profile-chip">
          <div className="avatar">
            {initial}
          </div>

          <div>
            <strong>
              {displayName}
            </strong>

            <span>
              Administrator
            </span>
          </div>
        </div>
      </header>


      <section
        className="dashboard-grid"
      >
        <div className="panel large-panel">
          <div className="panel-header">
            <div>
              <h3>
                Account Information
              </h3>

              <p>
                Logged-in administrator
                details
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
              label="Account"
              value={displayName}
            />

            <ProfileRow
              icon={<Mail size={19} />}
              label="Email"
              value={
                account.email || "-"
              }
            />

            <ProfileRow
              icon={
                <ShieldCheck
                  size={19}
                />
              }
              label="Role"
              value="Administrator"
            />

            <ProfileRow
              icon={
                <CheckCircle2
                  size={19}
                />
              }
              label="Account Status"
              value="Active"
            />
          </div>
        </div>


        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Access Level</h3>

              <p>
                System permissions
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: "24px",
              display: "grid",
              gap: "14px",
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
              }}
            >
              <KeyRound size={23} />
            </div>

            <div>
              <strong>
                Full Administrative
                Access
              </strong>

              <p
                className="subtitle"
                style={{
                  marginTop: "6px",
                }}
              >
                Manage students,
                faculty, courses,
                semesters, course
                mappings and academic
                analytics.
              </p>
            </div>
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


export default AdminProfile
