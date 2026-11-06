import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { getQuoteRequests } from '../api/quoteRequests'
import RequestFilters from '../components/RequestFilters'
import RequestTable from '../components/RequestTable'
import type { QuoteFilters, QuoteRequest } from '../types/quoteRequest'

export default function RequestListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [requests, setRequests] = useState<QuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters now live in the URL, e.g. /?status=New&search=sample
  const filters: QuoteFilters = {
    search: searchParams.get('search') ?? '',
    status: searchParams.get('status') ?? '',
    serviceType: searchParams.get('serviceType') ?? '',
    season: searchParams.get('season') ?? '',
  }
  const queryString = searchParams.toString()

  function handleFiltersChange(next: QuoteFilters) {
    const params = new URLSearchParams()
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    setSearchParams(params, { replace: true })
  }

  useEffect(() => {
    let ignore = false
    const current = Object.fromEntries(new URLSearchParams(queryString)) as QuoteFilters

    const timer = setTimeout(() => {
      setLoading(true)
      setError(null)
      getQuoteRequests(current)
        .then(data => { if (!ignore) setRequests(data) })
        .catch(err => { if (!ignore) setError(err.message) })
        .finally(() => { if (!ignore) setLoading(false) })
    }, 300)

    return () => {
      ignore = true
      clearTimeout(timer)
    }
  }, [queryString])

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
      <title>Quote requests · Northline Job Manager</title>
      <div className="page-header">
        <h1>Quote requests</h1>
        <span className="muted">{loading ? 'Loading…' : `${requests.length} shown`}</span>
      </div>
      <RequestFilters filters={filters} onChange={handleFiltersChange} />
      {content}
    </section>
  )
}