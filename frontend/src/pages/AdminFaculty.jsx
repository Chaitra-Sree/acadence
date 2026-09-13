import {
  useEffect,
  useState,
} from "react"

import {
  Pencil,
  Trash2,
  Search,
  X,
  Plus,
} from "lucide-react"

import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
} from "../auth/api"


// ======================================================
// EMPTY FACULTY FORM
// ======================================================

const emptyFaculty = {
  faculty_code: "",
  name: "",
  email: "",
  department: "MCA",
  password: "",
}


// ======================================================
// ADMIN FACULTY PAGE
// ======================================================

function AdminFaculty() {
  const [faculty, setFaculty] =
    useState([])

  const [search, setSearch] =
    useState("")

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const [message, setMessage] =
    useState("")

  const [creating, setCreating] =
    useState(false)

  const [editing, setEditing] =
    useState(null)

  const [
    newFaculty,
    setNewFaculty,
  ] = useState(emptyFaculty)


  // ====================================================
  // LOAD FACULTY
  // ====================================================

  async function loadFaculty() {
    try {
      setError("")

      const data =
        await apiGet(
          "/admin/faculty"
        )

      setFaculty(
        Array.isArray(data)
          ? data
          : []
      )

    } catch (err) {
      console.error(
        "Faculty loading error:",
        err
      )

      setError(
        err.message ||
        "Could not load faculty."
      )

    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadFaculty()
  }, [])


  // ====================================================
  // CREATE FACULTY
  // ====================================================

  async function handleCreate(
    event
  ) {
    event.preventDefault()

    setError("")
    setMessage("")

    try {
      await apiPost(
        "/admin/faculty",
        {
          faculty_code:
            newFaculty.faculty_code.trim(),

          name:
            newFaculty.name.trim(),

          email:
            newFaculty.email
              .trim()
              .toLowerCase(),

          department:
            newFaculty.department.trim(),

          password:
            newFaculty.password,
        }
      )

      setMessage(
        "Faculty member and login account created successfully."
      )

      setNewFaculty(
        emptyFaculty
      )

      setCreating(false)

      await loadFaculty()

    } catch (err) {
      console.error(
        "Faculty creation error:",
        err
      )

      setError(
        err.message ||
        "Could not create faculty member."
      )
    }
  }


  // ====================================================
  // UPDATE FACULTY
  // ====================================================

  async function handleSave(
    event
  ) {
    event.preventDefault()

    if (!editing) {
      return
    }

    setError("")
    setMessage("")

    try {
      await apiPut(
        `/admin/faculty/${editing.id}`,
        {
          faculty_code:
            editing.faculty_code.trim(),

          name:
            editing.name.trim(),

          email:
            editing.email
              .trim()
              .toLowerCase(),

          department:
            editing.department.trim(),
        }
      )

      setEditing(null)

      setMessage(
        "Faculty member updated successfully."
      )

      await loadFaculty()

    } catch (err) {
      console.error(
        "Faculty update error:",
        err
      )

      setError(
        err.message ||
        "Could not update faculty member."
      )
    }
  }


  // ====================================================
  // DELETE FACULTY
  // ====================================================

  async function handleDelete(
    member
  ) {
    const confirmed =
      window.confirm(
        `Delete ${member.name}?\n\nTheir login account and faculty-course mappings will also be removed.`
      )

    if (!confirmed) {
      return
    }

    setError("")
    setMessage("")

    try {
      await apiDelete(
        `/admin/faculty/${member.id}`
      )

      setMessage(
        "Faculty member deleted successfully."
      )

      await loadFaculty()

    } catch (err) {
      console.error(
        "Faculty deletion error:",
        err
      )

      setError(
        err.message ||
        "Could not delete faculty member."
      )
    }
  }


  // ====================================================
  // SEARCH
  // ====================================================

  const filteredFaculty =
    faculty.filter(
      (member) => {
        const searchableText =
          `
            ${member.faculty_code || ""}
            ${member.name || ""}
            ${member.email || ""}
            ${member.department || ""}
          `.toLowerCase()

        return searchableText.includes(
          search
            .trim()
            .toLowerCase()
        )
      }
    )


  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="panel">
        <h3>
          Loading faculty...
        </h3>

        <p className="subtitle">
          Fetching faculty records.
        </p>
      </div>
    )
  }


  // ====================================================
  // PAGE
  // ====================================================

  return (
    <div>

      {/* PAGE HEADER */}

      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "18px",
          flexWrap: "wrap",
          marginBottom: "22px",
        }}
      >
        <div>
          <p className="eyebrow">
            ADMIN PORTAL
          </p>

          <h1
            style={{
              marginBottom: "6px",
            }}
          >
            Faculty
          </h1>

          <p className="subtitle">
            Manage faculty records,
            login accounts and
            academic staff.
          </p>
        </div>


        <button
          type="button"
          onClick={() => {
            setError("")
            setMessage("")
            setNewFaculty(
              emptyFaculty
            )
            setCreating(true)
          }}
          style={primaryButton}
        >
          <Plus size={18} />

          Add Faculty
        </button>
      </div>


      {/* MESSAGE */}

      {message && (
        <MessageCard
          text={message}
        />
      )}


      {/* ERROR */}

      {error && (
        <MessageCard
          text={error}
          error
        />
      )}


      {/* SEARCH */}

      <div
        className="panel"
        style={{
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "440px",
          }}
        >
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform:
                "translateY(-50%)",
              color: "#9295a5",
              pointerEvents: "none",
            }}
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search by name, code, email or department..."
            style={{
              ...inputStyle,
              paddingLeft: "43px",
            }}
          />
        </div>
      </div>


      {/* FACULTY TABLE */}

      <div className="panel">
        <div
          className="panel-header"
          style={{
            marginBottom: "18px",
          }}
        >
          <div>
            <h3>
              Faculty Members
            </h3>

            <p>
              {filteredFaculty.length}{" "}
              record
              {filteredFaculty.length ===
              1
                ? ""
                : "s"}{" "}
              found
            </p>
          </div>
        </div>


        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>
                  Faculty Code
                </th>

                <th style={thStyle}>
                  Name
                </th>

                <th style={thStyle}>
                  Email
                </th>

                <th style={thStyle}>
                  Department
                </th>

                <th
                  style={{
                    ...thStyle,
                    textAlign: "center",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>


            <tbody>
              {filteredFaculty.map(
                (member) => (
                  <tr
                    key={member.id}
                  >
                    <td style={tdStyle}>
                      <strong>
                        {member.faculty_code}
                      </strong>
                    </td>


                    <td style={tdStyle}>
                      {member.name}
                    </td>


                    <td style={tdStyle}>
                      {member.email}
                    </td>


                    <td style={tdStyle}>
                      <span
                        style={
                          departmentBadge
                        }
                      >
                        {member.department}
                      </span>
                    </td>


                    <td
                      style={{
                        ...tdStyle,
                        textAlign:
                          "center",
                      }}
                    >
                      <button
                        type="button"
                        title="Edit faculty"
                        onClick={() => {
                          setError("")
                          setMessage("")

                          setEditing({
                            ...member,
                          })
                        }}
                        style={
                          iconButton
                        }
                      >
                        <Pencil
                          size={16}
                        />
                      </button>


                      <button
                        type="button"
                        title="Delete faculty"
                        onClick={() =>
                          handleDelete(
                            member
                          )
                        }
                        style={{
                          ...iconButton,
                          color:
                            "#c84b4b",
                        }}
                      >
                        <Trash2
                          size={16}
                        />
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>


          {filteredFaculty.length ===
            0 && (
            <div style={emptyState}>
              <h3>
                No faculty found
              </h3>

              <p className="subtitle">
                Try another search or
                add a new faculty
                member.
              </p>
            </div>
          )}
        </div>
      </div>


      {/* =================================================
          CREATE MODAL
      ================================================= */}

      {creating && (
        <Modal
          title="Add Faculty"
          subtitle="Create a faculty profile and login account."
          onClose={() => {
            setCreating(false)

            setNewFaculty(
              emptyFaculty
            )
          }}
        >
          <form
            onSubmit={
              handleCreate
            }
          >
            <Input
              label="Faculty Code"
              placeholder="Example: FAC001"
              value={
                newFaculty.faculty_code
              }
              onChange={(value) =>
                setNewFaculty({
                  ...newFaculty,
                  faculty_code:
                    value,
                })
              }
            />


            <Input
              label="Faculty Name"
              placeholder="Enter full name"
              value={
                newFaculty.name
              }
              onChange={(value) =>
                setNewFaculty({
                  ...newFaculty,
                  name: value,
                })
              }
            />


            <Input
              label="Email Address"
              type="email"
              placeholder="faculty@example.com"
              value={
                newFaculty.email
              }
              onChange={(value) =>
                setNewFaculty({
                  ...newFaculty,
                  email: value,
                })
              }
            />


            <Input
              label="Department"
              placeholder="MCA"
              value={
                newFaculty.department
              }
              onChange={(value) =>
                setNewFaculty({
                  ...newFaculty,
                  department:
                    value,
                })
              }
            />


            <Input
              label="Initial Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={
                newFaculty.password
              }
              onChange={(value) =>
                setNewFaculty({
                  ...newFaculty,
                  password: value,
                })
              }
              minLength={6}
            />


            <div
              style={
                modalActions
              }
            >
              <button
                type="button"
                onClick={() => {
                  setCreating(false)

                  setNewFaculty(
                    emptyFaculty
                  )
                }}
                style={
                  secondaryButton
                }
              >
                Cancel
              </button>


              <button
                type="submit"
                style={
                  primaryButton
                }
              >
                <Plus size={17} />

                Create Faculty
              </button>
            </div>
          </form>
        </Modal>
      )}


      {/* =================================================
          EDIT MODAL
      ================================================= */}

      {editing && (
        <Modal
          title="Edit Faculty"
          subtitle="Update this faculty member's profile."
          onClose={() =>
            setEditing(null)
          }
        >
          <form
            onSubmit={
              handleSave
            }
          >
            <Input
              label="Faculty Code"
              value={
                editing.faculty_code
              }
              onChange={(value) =>
                setEditing({
                  ...editing,
                  faculty_code:
                    value,
                })
              }
            />


            <Input
              label="Faculty Name"
              value={
                editing.name
              }
              onChange={(value) =>
                setEditing({
                  ...editing,
                  name: value,
                })
              }
            />


            <Input
              label="Email Address"
              type="email"
              value={
                editing.email
              }
              onChange={(value) =>
                setEditing({
                  ...editing,
                  email: value,
                })
              }
            />


            <Input
              label="Department"
              value={
                editing.department
              }
              onChange={(value) =>
                setEditing({
                  ...editing,
                  department:
                    value,
                })
              }
            />


            <div
              style={
                modalActions
              }
            >
              <button
                type="button"
                onClick={() =>
                  setEditing(null)
                }
                style={
                  secondaryButton
                }
              >
                Cancel
              </button>


              <button
                type="submit"
                style={
                  primaryButton
                }
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  )
}


// ======================================================
// MESSAGE
// ======================================================

function MessageCard({
  text,
  error = false,
}) {
  return (
    <div
      className="panel"
      style={{
        marginBottom: "18px",
        padding: "14px 18px",
        border:
          error
            ? "1px solid #f1cccc"
            : "1px solid #cce8d5",

        background:
          error
            ? "#fff7f7"
            : "#f6fff8",
      }}
    >
      <p
        style={{
          margin: 0,
          fontWeight: 600,
          color:
            error
              ? "#b83d3d"
              : "#278346",
        }}
      >
        {text}
      </p>
    </div>
  )
}


// ======================================================
// MODAL
// ======================================================

function Modal({
  title,
  subtitle,
  children,
  onClose,
}) {
  return (
    <div
      style={modalOverlay}
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose()
        }
      }}
    >
      <div style={modalCard}>
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "flex-start",
            gap: "16px",
            marginBottom: "22px",
          }}
        >
          <div>
            <h2
              style={{
                margin:
                  "0 0 5px",
              }}
            >
              {title}
            </h2>

            <p
              className="subtitle"
              style={{
                margin: 0,
              }}
            >
              {subtitle}
            </p>
          </div>


          <button
            type="button"
            onClick={onClose}
            style={closeButton}
          >
            <X size={19} />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}


// ======================================================
// INPUT
// ======================================================

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  minLength,
}) {
  return (
    <div
      style={{
        marginBottom: "17px",
      }}
    >
      <label
        style={labelStyle}
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        minLength={minLength}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        style={inputStyle}
        required
      />
    </div>
  )
}


// ======================================================
// STYLES
// ======================================================

const tableStyle = {
  width: "100%",
  borderCollapse:
    "collapse",
}


const thStyle = {
  textAlign: "left",
  padding: "14px 12px",
  borderBottom:
    "1px solid #e8e8ef",
  color: "#767988",
  fontSize: "12px",
  fontWeight: 700,
  textTransform:
    "uppercase",
  letterSpacing: "0.04em",
}


const tdStyle = {
  padding: "15px 12px",
  borderBottom:
    "1px solid #f0f0f4",
  fontSize: "13px",
  color: "#363846",
}


const departmentBadge = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#f0edff",
  color: "#6757d8",
  fontWeight: 650,
  fontSize: "12px",
}


const iconButton = {
  border: "none",
  background:
    "transparent",
  cursor: "pointer",
  padding: "8px",
  borderRadius: "8px",
  color: "#6757d8",
}


const closeButton = {
  border: "none",
  background: "#f2f2f6",
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#555867",
}


const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontSize: "13px",
  fontWeight: 700,
  color: "#454755",
}


const inputStyle = {
  width: "100%",
  boxSizing:
    "border-box",
  padding: "12px 13px",
  borderRadius: "10px",
  border:
    "1px solid #dddfe7",
  outline: "none",
  fontSize: "14px",
  background: "#fff",
}


const primaryButton = {
  border: "none",
  borderRadius: "10px",
  padding: "12px 18px",
  background: "#6757d8",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent:
    "center",
  gap: "8px",
}


const secondaryButton = {
  border:
    "1px solid #dddfe7",
  borderRadius: "10px",
  padding: "12px 18px",
  background: "#ffffff",
  color: "#555867",
  cursor: "pointer",
  fontWeight: 650,
}


const modalActions = {
  display: "flex",
  justifyContent:
    "flex-end",
  alignItems: "center",
  gap: "10px",
  marginTop: "24px",
}


const modalOverlay = {
  position: "fixed",
  inset: 0,
  background:
    "rgba(18, 19, 29, 0.52)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  zIndex: 1000,
}


const modalCard = {
  width: "100%",
  maxWidth: "540px",
  maxHeight: "88vh",
  overflowY: "auto",
  background: "#ffffff",
  borderRadius: "18px",
  padding: "26px",
  boxShadow:
    "0 28px 80px rgba(0, 0, 0, 0.22)",
}


const emptyState = {
  textAlign: "center",
  padding: "50px 20px",
}


export default AdminFaculty