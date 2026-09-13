import {
  useEffect,
  useState,
} from "react"

import {
  Navigate,
} from "react-router-dom"

import {
  getAuth,
  validateCurrentUser,
} from "./auth"


function ProtectedRoute({
  children,
  allowedRole,
}) {

  const [loading, setLoading] =
    useState(true)

  const [user, setUser] =
    useState(null)


  useEffect(() => {

    let mounted = true


    async function checkAuthentication() {

      const storedUser =
        getAuth()


      if (
        !storedUser ||
        !storedUser.access_token
      ) {

        if (mounted) {
          setUser(null)
          setLoading(false)
        }

        return
      }


      const verifiedUser =
        await validateCurrentUser()


      if (mounted) {

        setUser(
          verifiedUser
        )

        setLoading(false)
      }
    }


    checkAuthentication()


    return () => {
      mounted = false
    }

  }, [])


  if (loading) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f6f7fb",
          fontFamily:
            "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              border:
                "4px solid #e4e4ec",
              borderTopColor:
                "#6c5ce7",
              borderRadius: "50%",
              margin:
                "0 auto 16px",
              animation:
                "spin 0.8s linear infinite",
            }}
          />

          <p
            style={{
              margin: 0,
              color: "#666",
              fontWeight: 500,
            }}
          >
            Verifying your session...
          </p>

          <style>
            {`
              @keyframes spin {
                from {
                  transform: rotate(0deg);
                }

                to {
                  transform: rotate(360deg);
                }
              }
            `}
          </style>
        </div>
      </div>
    )
  }


  if (!user) {

    return (
      <Navigate
        to="/"
        replace
      />
    )
  }


  if (
    allowedRole &&
    user.role !== allowedRole
  ) {

    if (
      user.role === "student"
    ) {

      return (
        <Navigate
          to="/student"
          replace
        />
      )
    }


    if (
      user.role === "faculty"
    ) {

      return (
        <Navigate
          to="/faculty"
          replace
        />
      )
    }


    if (
      user.role === "admin"
    ) {

      return (
        <Navigate
          to="/admin"
          replace
        />
      )
    }


    return (
      <Navigate
        to="/"
        replace
      />
    )
  }


  return children
}


export default ProtectedRoute