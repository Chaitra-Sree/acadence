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


const emptyStudent = {
  roll_number: "",
  name: "",
  email: "",
  batch: "",
  semester: "1",
  password: "",
}


function AdminStudents() {
  const [students, setStudents] =
    useState([])

  const [search, setSearch] =
    useState("")

  const [editing, setEditing] =
    useState(null)

  const [creating, setCreating] =
    useState(false)

  const [newStudent, setNewStudent] =
    useState(emptyStudent)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const [message, setMessage] =
    useState("")


  async function loadStudents() {
    try {
      const data =
        await apiGet(
          "/admin/students"
        )

      setStudents(data)

    } catch (err) {
      setError(err.message)

    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadStudents()
  }, [])


  async function handleCreate(
    event
  ) {
    event.preventDefault()

    setError("")
    setMessage("")

    try {
      await apiPost(
        "/admin/students",
        {
          ...newStudent,

          semester:
            Number(
              newStudent.semester
            ),
        }
      )

      setMessage(
        "Student and login account created successfully."
      )

      setNewStudent(
        emptyStudent
      )

      setCreating(false)

      await loadStudents()

    } catch (err) {
      setError(err.message)
    }
  }


  async function handleSave(
    event
  ) {
    event.preventDefault()

    setError("")
    setMessage("")

    try {
      await apiPut(
        `/admin/students/${editing.id}`,
        {
          roll_number:
            editing.roll_number,

          name:
            editing.name,

          email:
            editing.email,

          batch:
            editing.batch,
        }
      )

      setMessage(
        "Student updated successfully."
      )

      setEditing(null)

      await loadStudents()

    } catch (err) {
      setError(err.message)
    }
  }


  async function handleDelete(
    student
  ) {
    const confirmed =
      window.confirm(
        `Delete ${student.name}? This will also remove their marks, attendance, enrollment and login account.`
      )

    if (!confirmed) {
      return
    }

    setError("")
    setMessage("")

    try {
      await apiDelete(
        `/admin/students/${student.id}`
      )

      setMessage(
        "Student deleted successfully."
      )

      await loadStudents()

    } catch (err) {
      setError(err.message)
    }
  }


  const filtered =
    students.filter(
      (student) => {
        const text =
          `${student.roll_number} ${student.name} ${student.email} ${student.batch}`
            .toLowerCase()

        return text.includes(
          search.toLowerCase()
        )
      }
    )


  if (loading) {
    return (
      <div className="page-card">
        Loading students...
      </div>
    )
  }


  return (
    <div>
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div>
          <h1>
            Students
          </h1>

          <p>
            Manage student academic
            profiles and login accounts.
          </p>
        </div>

        <button
          onClick={() =>
            setCreating(true)
          }
          style={primaryButton}
        >
          <Plus size={17} />
          Add Student
        </button>
      </div>


      <div
        className="page-card"
        style={{
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            position: "relative",
            maxWidth: "420px",
          }}
        >
          <Search
            size={17}
            style={{
              position: "absolute",
              left: "13px",
              top: "50%",
              transform:
                "translateY(-50%)",
              color: "#8b8d9a",
            }}
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search students"
            style={{
              ...inputStyle,
              paddingLeft: "40px",
            }}
          />
        </div>
      </div>


      {error && (
        <MessageCard
          text={error}
          error
        />
      )}


      {message && (
        <MessageCard
          text={message}
        />
      )}


      <div className="page-card">
        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>
                  Roll Number
                </th>

                <th style={th}>
                  Name
                </th>

                <th style={th}>
                  Email
                </th>

                <th style={th}>
                  Batch
                </th>

                <th style={th}>
                  Semester
                </th>

                <th style={th}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(
                (student) => (
                  <tr
                    key={student.id}
                  >
                    <td style={td}>
                      {
                        student.roll_number
                      }
                    </td>

                    <td style={td}>
                      {student.name}
                    </td>

                    <td style={td}>
                      {student.email}
                    </td>

                    <td style={td}>
                      {student.batch}
                    </td>

                    <td style={td}>
                      {student.semester
                        ? `Semester ${student.semester}`
                        : "-"}
                    </td>

                    <td style={td}>
                      <button
                        onClick={() =>
                          setEditing({
                            ...student,
                          })
                        }
                        style={
                          iconButton
                        }
                      >
                        <Pencil
                          size={16}
                        />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            student
                          )
                        }
                        style={{
                          ...iconButton,
                          color:
                            "#c0392b",
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


          {filtered.length === 0 && (
            <p>
              No students found.
            </p>
          )}
        </div>
      </div>


      {creating && (
        <Modal
          title="Add Student"
          onClose={() => {
            setCreating(false)
            setNewStudent(
              emptyStudent
            )
          }}
        >
          <form
            onSubmit={
              handleCreate
            }
          >
            <Input
              label="Roll Number"
              value={
                newStudent.roll_number
              }
              onChange={(value) =>
                setNewStudent({
                  ...newStudent,
                  roll_number: value,
                })
              }
            />

            <Input
              label="Student Name"
              value={
                newStudent.name
              }
              onChange={(value) =>
                setNewStudent({
                  ...newStudent,
                  name: value,
                })
              }
            />

            <Input
              label="Email"
              type="email"
              value={
                newStudent.email
              }
              onChange={(value) =>
                setNewStudent({
                  ...newStudent,
                  email: value,
                })
              }
            />

            <Input
              label="Batch"
              value={
                newStudent.batch
              }
              placeholder="Example: 2026-2028"
              onChange={(value) =>
                setNewStudent({
                  ...newStudent,
                  batch: value,
                })
              }
            />

            <label
              style={labelStyle}
            >
              Current Semester
            </label>

            <select
              value={
                newStudent.semester
              }
              onChange={(e) =>
                setNewStudent({
                  ...newStudent,
                  semester:
                    e.target.value,
                })
              }
              style={{
                ...inputStyle,
                marginBottom:
                  "16px",
              }}
            >
              <option value="1">
                Semester I
              </option>

              <option value="2">
                Semester II
              </option>

              <option value="3">
                Semester III
              </option>

              <option value="4">
                Semester IV
              </option>
            </select>

            <Input
              label="Initial Password"
              type="password"
              value={
                newStudent.password
              }
              placeholder="Minimum 6 characters"
              onChange={(value) =>
                setNewStudent({
                  ...newStudent,
                  password: value,
                })
              }
            />

            <button
              type="submit"
              style={
                primaryButton
              }
            >
              Create Student
            </button>
          </form>
        </Modal>
      )}


      {editing && (
        <Modal
          title="Edit Student"
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
              label="Roll Number"
              value={
                editing.roll_number
              }
              onChange={(value) =>
                setEditing({
                  ...editing,
                  roll_number:
                    value,
                })
              }
            />

            <Input
              label="Name"
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
              label="Email"
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
              label="Batch"
              value={
                editing.batch
              }
              onChange={(value) =>
                setEditing({
                  ...editing,
                  batch: value,
                })
              }
            />

            <button
              type="submit"
              style={
                primaryButton
              }
            >
              Save Changes
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}


function MessageCard({
  text,
  error = false,
}) {
  return (
    <div
      className="page-card"
      style={{
        marginBottom: "18px",
      }}
    >
      <p
        style={{
          margin: 0,
          color: error
            ? "#c0392b"
            : "#218838",
        }}
      >
        {text}
      </p>
    </div>
  )
}


function Modal({
  title,
  children,
  onClose,
}) {
  return (
    <div style={modalOverlay}>
      <div style={modalCard}>
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              margin: 0,
            }}
          >
            {title}
          </h3>

          <button
            onClick={onClose}
            style={iconButton}
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}


function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) {
  return (
    <div
      style={{
        marginBottom: "16px",
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
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        style={inputStyle}
        required
      />
    </div>
  )
}


const tableStyle = {
  width: "100%",
  borderCollapse:
    "collapse",
}


const th = {
  textAlign: "left",
  padding: "13px",
  borderBottom:
    "1px solid #e8e8ef",
  fontSize: "13px",
}


const td = {
  padding: "13px",
  borderBottom:
    "1px solid #f0f0f4",
  fontSize: "13px",
}


const iconButton = {
  border: "none",
  background:
    "transparent",
  cursor: "pointer",
  padding: "7px",
  color: "#6757d8",
}


const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontSize: "13px",
  fontWeight: 650,
}


const inputStyle = {
  width: "100%",
  boxSizing:
    "border-box",
  padding: "11px 13px",
  borderRadius: "10px",
  border:
    "1px solid #dddfe7",
}


const primaryButton = {
  border: "none",
  borderRadius: "10px",
  padding: "12px 18px",
  background: "#6757d8",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
}


const modalOverlay = {
  position: "fixed",
  inset: 0,
  background:
    "rgba(14,15,22,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
}


const modalCard = {
  width: "90%",
  maxWidth: "520px",
  maxHeight: "88vh",
  overflowY: "auto",
  background: "#fff",
  borderRadius: "16px",
  padding: "24px",
  boxShadow:
    "0 24px 60px rgba(0,0,0,0.18)",
}


export default AdminStudents