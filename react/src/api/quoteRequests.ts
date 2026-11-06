import type {
    CreateQuoteRequest,
    QuoteFilters,
    QuoteRequest,
    Summary,
    UpdateStatus,
} from '../types/quoteRequest'

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/quoterequests`

// An error that carries readable messages from the API
export class ApiError extends Error {
  status: number
  errors: Record<string, string[]> // field name → messages
  messages: string[]               // all messages as one list

  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message)
    this.status = status
    this.errors = errors
    this.messages = Object.values(errors).flat()
  }
}

// Turns any value (string, list, object) into a list of text messages
function toMessages(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(toMessages)
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    for (const key of ['errorMessage', 'message', 'detail']) {
      if (typeof obj[key] === 'string') return [obj[key] as string]
    }
    return Object.values(obj).flatMap(toMessages)
  }
  return []
}

// Turns the API's "errors" part into { field: [messages] }
function normalizeErrors(raw: unknown): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const [field, value] of Object.entries(raw)) {
      const list = toMessages(value)
      if (list.length > 0) result[field] = list
    }
  } else {
    const list = toMessages(raw)
    if (list.length > 0) result[''] = list
  }
  return result
}

// One shared function for every call: sends the request, checks for errors, reads the JSON
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    let errors: Record<string, string[]> = {}
    try {
      const body = await res.json()
      if (typeof body.title === 'string') message = body.title
      if (typeof body.detail === 'string') message = body.detail
      errors = normalizeErrors(body.errors)
    } catch {
      // The error body wasn't JSON; keep the default message
    }
    throw new ApiError(res.status, message, errors)
  }

  return res.json() as Promise<T>
}

export function getQuoteRequests(filters: QuoteFilters = {}) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value)
        })
    const query = params.toString()
    return request<QuoteRequest[]>(query ? `${BASE_URL}?${query}` : BASE_URL)
}

export function getQuoteRequest(id: number) {
  return request<QuoteRequest>(`${BASE_URL}/${id}`)
}

export function createQuoteRequest(data: CreateQuoteRequest) {
  return request<QuoteRequest>(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateStatus(id: number, data: UpdateStatus) {
  return request<QuoteRequest>(`${BASE_URL}/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function getSummary() {
  return request<Summary>(`${BASE_URL}/summary`)
}