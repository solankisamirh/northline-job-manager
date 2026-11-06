import { useEffect, useState } from 'react'
import { Link, useParams, useLocation } from 'react-router'
import { ApiError, getQuoteRequest } from '../api/quoteRequests'
import StatusActions from '../components/StatusActions'
import StatusBadge from '../components/StatusBadge'
import type { QuoteRequest } from '../types/quoteRequest'
import { formatDate } from '../utils/format'

export default function RequestDetailsPage() {
  const { id } = useParams()
  const requestId = Number(id)

    const location = useLocation()
  const createdMessage = (location.state as { message?: string } | null)?.message

  const [request, setRequest] = useState<QuoteRequest | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let ignore = false
    getQuoteRequest(requestId)
      .then(data => { if (!ignore) setRequest(data) })
      .catch(err => {
        if (ignore) return
        if (err instanceof ApiError && err.status === 404) setNotFound(true)
        else setError(err.message)
      })
    return () => { ignore = true }
  }, [requestId])

  function handleUpdated(updated: QuoteRequest) {
    setRequest(updated)
    setSaved(true)
  }

  if (notFound) {
    return (
      <section>
        <h1>Request not found</h1>
        <Link to="/">← Back to requests</Link>
      </section>
    )
  }
  if (error) return <p className="error">Error: {error}</p>
  if (!request) return <p className="muted">Loading…</p>

  return (
    <section>
        <title>{`${request.customerName} · Northline Job Manager`}</title>
      <Link to="/" className="back-link">← Back to requests</Link>

      <div className="page-header">
        <h1>{request.customerName}</h1>
        <StatusBadge status={request.status} />
      </div>

            {createdMessage && !saved && <p className="success" role="status">{createdMessage}</p>}

      <div className="details-grid">
        <div className="card">
          <h2>Request details</h2>
          <dl className="details">
            <dt>Address</dt><dd>{request.address}</dd>
            <dt>Email</dt><dd>{request.email ?? '—'}</dd>
            <dt>Phone</dt><dd>{request.phone ?? '—'}</dd>
            <dt>Service</dt><dd>{request.serviceType}</dd>
            <dt>Property</dt><dd>{request.propertyType}</dd>
            <dt>Season</dt><dd>{request.season}</dd>
            <dt>Scheduled</dt><dd>{formatDate(request.scheduledDate)}</dd>
            <dt>Received</dt><dd>{formatDate(request.createdAt)}</dd>
            <dt>Last updated</dt><dd>{formatDate(request.updatedAt)}</dd>
            <dt>Notes</dt><dd>{request.notes ?? '—'}</dd>
          </dl>
        </div>

        <div>
          <StatusActions key={request.id} request={request} onUpdated={handleUpdated} />
          {saved && <p className="success" role="status">Status saved.</p>}
        </div>
      </div>
    </section>
  )
}