import {
  API_URL,
  authFetch,
} from "./auth"


async function handleResponse(
  response
) {

  let data = null


  try {

    data = await response.json()

  } catch {

    data = null
  }


  if (!response.ok) {

    const message =
      data?.detail ||
      data?.error ||
      "Something went wrong."

    throw new Error(message)
  }


  return data
}


export async function apiGet(
  endpoint
) {

  const response =
    await authFetch(
      `${API_URL}${endpoint}`
    )

  return handleResponse(
    response
  )
}


export async function apiPost(
  endpoint,
  body
) {

  const response =
    await authFetch(
      `${API_URL}${endpoint}`,
      {
        method: "POST",

        body:
          JSON.stringify(body),
      }
    )

  return handleResponse(
    response
  )
}


export async function apiPut(
  endpoint,
  body
) {

  const response =
    await authFetch(
      `${API_URL}${endpoint}`,
      {
        method: "PUT",

        body:
          JSON.stringify(body),
      }
    )

  return handleResponse(
    response
  )
}


export async function apiDelete(
  endpoint
) {

  const response =
    await authFetch(
      `${API_URL}${endpoint}`,
      {
        method: "DELETE",
      }
    )

  return handleResponse(
    response
  )
}