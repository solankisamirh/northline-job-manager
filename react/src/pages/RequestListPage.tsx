import { useEffect, useState } from 'react'
import { getQuoteRequests } from '../api/quoteRequests'
import RequestFilters from '../components/RequestFilters'
import RequestTable from '../components/RequestTable'
import type { QuoteFilters, QuoteRequest } from '../types/quoteRequest'

export default function RequestListPage() {
  const [filters, setFilters] = useState<QuoteFilters>({})
  const [requests, setRequests] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Runs on first load and again every time the filters change
  useEffect(() => {
    let ignore = false

    // Wait 300 ms after the last keystroke before calling the API (debounce)
    const timer = setTimeout(() => {
      setLoading(true)
      setError(null)
      getQuoteRequests(filters)
        .then(data => { if (!ignore) setRequests(data) })
        .catch(err => { if (!ignore) setError(err.message) })
        .finally(() => { if (!ignore) setLoading(false) })
    }, 300)

    // Cleanup: runs before the next effect or when the page closes
    return () => {
      ignore = true
      clearTimeout(timer)
    }
  }, [filters])

  let content
  if (error) {
    content = <p className="error">Error: {error}</p>
  } else if (loading && requests.length === 0) {
    content = <p className="muted">Loading…</p>
  } else {
    content = <RequestTable requests={requests} />
  }

  return (
    <section>
      <div className="page-header">
        <h1>Quote requests</h1>
        <span className="muted">{loading ? 'Loading…' : `${requests.length} shown`}</span>
      </div>
      <RequestFilters filters={filters} onChange={setFilters} />
      {content}
    </section>
  )
}