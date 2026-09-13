import {
  useEffect,
  useState,
} from "react"

import {
  useNavigate,
} from "react-router-dom"

import {
  API_URL,
  getAuth,
  saveAuth,
} from "../auth/auth"

import {
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Users,
} from "lucide-react"


function Login() {

  const navigate =
    useNavigate()


  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")


  useEffect(() => {

    const existingUser =
      getAuth()


    if (
      !existingUser ||
      !existingUser.access_token
    ) {
      return
    }


    if (
      existingUser.role ===
      "student"
    ) {

      navigate(
        "/student",
        {
          replace: true,
        }
      )
    }


    else if (
      existingUser.role ===
      "faculty"
    ) {

      navigate(
        "/faculty",
        {
          replace: true,
        }
      )
    }


    else if (
      existingUser.role ===
      "admin"
    ) {

      navigate(
        "/admin",
        {
          replace: true,
        }
      )
    }

  }, [navigate])


  async function handleLogin(
    event
  ) {

    event.preventDefault()

    setError("")


    if (
      !email.trim() ||
      !password.trim()
    ) {

      setError(
        "Please enter your email and password."
      )

      return
    }


    setLoading(true)


    try {

      const response =
        await fetch(
          `${API_URL}/auth/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email:
                email.trim(),
              password,
            }),
          }
        )


      const data =
        await response.json()


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Login failed."
        )
      }


      saveAuth(data)


      if (
        data.role ===
        "student"
      ) {

        navigate(
          "/student",
          {
            replace: true,
          }
        )

        return
      }


      if (
        data.role ===
        "faculty"
      ) {

        navigate(
          "/faculty",
          {
            replace: true,
          }
        )

        return
      }


      if (
        data.role ===
        "admin"
      ) {

        navigate(
          "/admin",
          {
            replace: true,
          }
        )

        return
      }


      throw new Error(
        "Unknown account role."
      )


    } catch (error) {

      console.error(error)

      setError(
        error.message ||
        "Unable to login."
      )

    } finally {

      setLoading(false)
    }
  }


  function useDemoAccount(
    role
  ) {

    setError("")


    if (
      role === "student"
    ) {

      setEmail(
        "student@acadence.com"
      )

      setPassword(
        "student123"
      )
    }


    if (
      role === "faculty"
    ) {

      setEmail(
        "faculty@acadence.com"
      )

      setPassword(
        "faculty123"
      )
    }


    if (
      role === "admin"
    ) {

      setEmail(
        "admin@acadence.com"
      )

      setPassword(
        "admin123"
      )
    }
  }


  return (

    <div
      style={styles.page}
    >

      <section
        style={styles.brandSection}
      >

        <div
          style={
            styles.brandContent
          }
        >

          <div
            style={styles.logo}
          >

            <GraduationCap
              size={32}
            />

          </div>


          <div
            style={
              styles.brandName
            }
          >
            Acadence
          </div>


          <h1
            style={styles.heading}
          >
            Your academic journey,
            <br />
            clearly understood.
          </h1>


          <p
            style={
              styles.description
            }
          >
            A unified academic
            performance analytics and
            management platform for
            students, faculty and
            administrators.
          </p>


          <div
            style={
              styles.featureList
            }
          >

            <Feature
              icon={
                <BarChart3
                  size={19}
                />
              }
              text=
                "Track academic performance"
            />


            <Feature
              icon={
                <Users
                  size={19}
                />
              }
              text=
                "Separate role-based portals"
            />


            <Feature
              icon={
                <ShieldCheck
                  size={19}
                />
              }
              text=
                "Secure authenticated access"
            />

          </div>

        </div>

      </section>


      <section
        style={styles.formSection}
      >

        <div
          style={styles.formCard}
        >

          <div
            style={styles.mobileLogo}
          >

            <GraduationCap
              size={26}
            />

            <span>
              Acadence
            </span>

          </div>


          <div
            style={
              styles.titleArea
            }
          >

            <h2
              style={styles.formTitle}
            >
              Welcome back
            </h2>


            <p
              style={
                styles.formSubtitle
              }
            >
              Sign in to continue to
              your Acadence portal.
            </p>

          </div>


          <form
            onSubmit={
              handleLogin
            }
          >

            <div
              style={
                styles.fieldGroup
              }
            >

              <label
                style={styles.label}
              >
                Email address
              </label>


              <div
                style={
                  styles.inputWrapper
                }
              >

                <Mail
                  size={18}
                  style={
                    styles.inputIcon
                  }
                />


                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder=
                    "you@acadence.com"
                  autoComplete="email"
                  style={styles.input}
                />

              </div>

            </div>


            <div
              style={
                styles.fieldGroup
              }
            >

              <label
                style={styles.label}
              >
                Password
              </label>


              <div
                style={
                  styles.inputWrapper
                }
              >

                <Lock
                  size={18}
                  style={
                    styles.inputIcon
                  }
                />


                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder=
                    "Enter your password"
                  autoComplete=
                    "current-password"
                  style={{
                    ...styles.input,
                    paddingRight:
                      "48px",
                  }}
                />


                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  style={
                    styles.eyeButton
                  }
                  aria-label=
                    "Show or hide password"
                >

                  {
                    showPassword
                      ? (
                        <EyeOff
                          size={18}
                        />
                      )
                      : (
                        <Eye
                          size={18}
                        />
                      )
                  }

                </button>

              </div>

            </div>


            {
              error && (

                <div
                  style={
                    styles.errorBox
                  }
                >
                  {error}
                </div>

              )
            }


            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.loginButton,

                opacity:
                  loading
                    ? 0.7
                    : 1,

                cursor:
                  loading
                    ? "not-allowed"
                    : "pointer",
              }}
            >

              <span>

                {
                  loading
                    ? "Signing in..."
                    : "Sign in"
                }

              </span>


              {
                !loading && (
                  <ArrowRight
                    size={18}
                  />
                )
              }

            </button>

          </form>


          <div
            style={
              styles.dividerArea
            }
          >

            <div
              style={
                styles.dividerLine
              }
            />

            <span
              style={
                styles.dividerText
              }
            >
              Demo accounts
            </span>

            <div
              style={
                styles.dividerLine
              }
            />

          </div>


          <div
            style={
              styles.demoButtons
            }
          >

            <button
              type="button"
              onClick={() =>
                useDemoAccount(
                  "student"
                )
              }
              style={
                styles.demoButton
              }
            >
              Student
            </button>


            <button
              type="button"
              onClick={() =>
                useDemoAccount(
                  "faculty"
                )
              }
              style={
                styles.demoButton
              }
            >
              Faculty
            </button>


            <button
              type="button"
              onClick={() =>
                useDemoAccount(
                  "admin"
                )
              }
              style={
                styles.demoButton
              }
            >
              Admin
            </button>

          </div>


          <p
            style={
              styles.securityText
            }
          >
            Authentication is secured
            using password hashing and
            JWT access tokens.
          </p>

        </div>

      </section>

    </div>
  )
}


function Feature({
  icon,
  text,
}) {

  return (

    <div
      style={
        styles.featureItem
      }
    >

      <div
        style={
          styles.featureIcon
        }
      >
        {icon}
      </div>

      <span>
        {text}
      </span>

    </div>
  )
}


const styles = {

  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns:
      "minmax(360px, 1fr) minmax(480px, 1fr)",
    background: "#f7f7fb",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },


  brandSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "70px",
    background:
      "linear-gradient(145deg, #151722 0%, #201b3b 55%, #33266b 100%)",
    color: "#ffffff",
  },


  brandContent: {
    width: "100%",
    maxWidth: "550px",
  },


  logo: {
    width: "62px",
    height: "62px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "18px",
    background:
      "rgba(255, 255, 255, 0.12)",
    backdropFilter:
      "blur(10px)",
    marginBottom: "18px",
  },


  brandName: {
    fontSize: "24px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    marginBottom: "52px",
  },


  heading: {
    margin: 0,
    fontSize:
      "clamp(38px, 4vw, 58px)",
    lineHeight: 1.08,
    letterSpacing: "-2px",
    fontWeight: "800",
  },


  description: {
    maxWidth: "500px",
    fontSize: "17px",
    lineHeight: 1.7,
    color:
      "rgba(255,255,255,0.72)",
    margin:
      "28px 0 38px",
  },


  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },


  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    color:
      "rgba(255,255,255,0.88)",
    fontSize: "14px",
    fontWeight: "500",
  },


  featureIcon: {
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "11px",
    background:
      "rgba(255,255,255,0.10)",
  },


  formSection: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "50px",
  },


  formCard: {
    width: "100%",
    maxWidth: "450px",
  },


  mobileLogo: {
    display: "none",
  },


  titleArea: {
    marginBottom: "34px",
  },


  formTitle: {
    margin: "0 0 9px",
    color: "#171821",
    fontSize: "34px",
    letterSpacing: "-1px",
    fontWeight: "800",
  },


  formSubtitle: {
    margin: 0,
    color: "#777987",
    lineHeight: 1.6,
  },


  fieldGroup: {
    marginBottom: "21px",
  },


  label: {
    display: "block",
    marginBottom: "8px",
    color: "#333542",
    fontSize: "13px",
    fontWeight: "650",
  },


  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },


  inputIcon: {
    position: "absolute",
    left: "15px",
    color: "#9194a3",
    pointerEvents: "none",
  },


  input: {
    width: "100%",
    boxSizing: "border-box",
    border:
      "1px solid #dedfe8",
    borderRadius: "13px",
    padding:
      "14px 15px 14px 46px",
    fontSize: "14px",
    background: "#ffffff",
    outline: "none",
    color: "#242631",
  },


  eyeButton: {
    position: "absolute",
    right: "13px",
    background: "transparent",
    border: "none",
    color: "#8b8e9c",
    cursor: "pointer",
    display: "flex",
    padding: "5px",
  },


  errorBox: {
    background: "#fff1f2",
    border:
      "1px solid #fecdd3",
    color: "#be123c",
    borderRadius: "11px",
    padding: "11px 13px",
    marginBottom: "18px",
    fontSize: "13px",
  },


  loginButton: {
    width: "100%",
    border: "none",
    borderRadius: "13px",
    background:
      "linear-gradient(135deg, #6557db, #806be8)",
    color: "#ffffff",
    padding: "14px 18px",
    fontSize: "14px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    boxShadow:
      "0 12px 24px rgba(101,87,219,0.22)",
  },


  dividerArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "30px 0 18px",
  },


  dividerLine: {
    height: "1px",
    flex: 1,
    background: "#e5e5ec",
  },


  dividerText: {
    fontSize: "12px",
    color: "#9294a1",
  },


  demoButtons: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "9px",
  },


  demoButton: {
    border:
      "1px solid #e0e1e9",
    background: "#ffffff",
    color: "#525461",
    padding: "10px 8px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "650",
  },


  securityText: {
    textAlign: "center",
    margin:
      "25px auto 0",
    maxWidth: "330px",
    fontSize: "11px",
    lineHeight: 1.6,
    color: "#a0a2ad",
  },
}


export default Login