const AUTH_KEY = "acadlytics_user"

export const API_URL = "http://127.0.0.1:8000"


export function saveAuth(authData) {
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify(authData)
  )
}


export function getAuth() {
  const stored = localStorage.getItem(AUTH_KEY)

  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored)
  } catch (error) {
    console.error("Could not read login data:", error)

    localStorage.removeItem(AUTH_KEY)

    return null
  }
}


export function clearAuth() {
  localStorage.removeItem(AUTH_KEY)
}


export function getToken() {
  const auth = getAuth()

  return auth?.access_token || null
}


export function getRole() {
  const auth = getAuth()

  return auth?.role || null
}


export function getStudentId() {
  const auth = getAuth()

  return auth?.student_id || null
}


export function getFacultyId() {
  const auth = getAuth()

  return auth?.faculty_id || null
}


export function isLoggedIn() {
  const auth = getAuth()

  return Boolean(
    auth &&
    auth.access_token &&
    auth.role
  )
}


export async function authFetch(
  url,
  options = {}
) {
  const token = getToken()

  const headers = {
    ...(options.headers || {}),
  }

  if (
    options.body &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] =
      "application/json"
  }

  if (token) {
    headers.Authorization =
      `Bearer ${token}`
  }

  const response = await fetch(
    url,
    {
      ...options,
      headers,
    }
  )

  if (response.status === 401) {
    clearAuth()
  }

  return response
}


export async function validateCurrentUser() {
  const token = getToken()

  if (!token) {
    return null
  }

  try {
    const response = await fetch(
      `${API_URL}/auth/me`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      clearAuth()

      return null
    }

    const user = await response.json()

    const existingAuth =
      getAuth() || {}

    const updatedAuth = {
      ...existingAuth,

      user_id: user.id,
      email: user.email,
      role: user.role,
      student_id: user.student_id,
      faculty_id: user.faculty_id,
    }

    saveAuth(updatedAuth)

    return updatedAuth

  } catch (error) {
    console.error(
      "Unable to validate login:",
      error
    )

    return null
  }
}