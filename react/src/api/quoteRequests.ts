import type {
    CreateQuoteRequest,
    QuoteFilters,
    QuoteRequest,
    Summary,
    UpdateStatus,
} from '../types/quoteRequest'

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/quoterequests`

export class ApiError extends Error {
  status: number
  errors: Record<string, string[]>

  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message)
    this.status = status
    this.errors = errors
  }
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
            if(body.title) message = body.title
            if(body.errors) message = body.errors
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