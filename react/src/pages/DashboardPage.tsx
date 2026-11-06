import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getQuoteRequests, getSummary } from '../api/quoteRequests'
import StatusBadge from '../components/StatusBadge'
import { SERVICE_TYPES, STATUSES, type QuoteRequest, type Summary } from '../types/quoteRequest'
import { formatDate } from '../utils/format'

type DashboardData = {
  summary: Summary
  newRequests: QuoteRequest[]
  scheduled: QuoteRequest[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    Promise.all([
      getSummary(),
      getQuoteRequests({ status: 'New' }),
      getQuoteRequests({ status: 'Scheduled' }),
    ])
      .then(([summary, newRequests, scheduled]) => {
        if (!ignore) setData({ summary, newRequests, scheduled })
      })
      .catch(err => { if (!ignore) setError(err.message) })
    return () => { ignore = true }
  }, [])

  if (error) return <p className="error">Error: {error}</p>
  if (!data) return <p className="muted">Loading…</p>

  const { summary, newRequests, scheduled } = data

  // Derived values: worked out from the data each time, not stored in state
  const countFor = (status: string) =>
    summary.byStatus.find(s => s.status === status)?.count ?? 0

  const serviceCounts = SERVICE_TYPES.map(service => ({
    service,
    count: summary.byService.find(s => s.serviceType === service)?.count ?? 0,
  }))
  const maxServiceCount = Math.max(1, ...serviceCounts.map(s => s.count))

  const latestNew = newRequests.slice(0, 5)
  const nextScheduled = [...scheduled]
    .sort((a, b) => (a.scheduledDate ?? '').localeCompare(b.scheduledDate ?? ''))
    .slice(0, 5)

  return (
    <section>
      <div className="page-header">
        <h1>Dashboard</h1>
        <Link to="/requests/new" className="button primary">+ New request</Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Total requests</span>
          <span className="stat-value">{summary.total}</span>
        </div>
        {STATUSES.map(status => (
          <div key={status} className="stat-card">
            <span className="stat-label"><StatusBadge status={status} /></span>
            <span className="stat-value">{countFor(status)}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2>Requests by service</h2>
          <ul className="bar-list">
            {serviceCounts.map(({ service, count }) => (
              <li key={service}>
                <span>{service}</span>
                <span className="bar-track" aria-hidden="true">
                  <span
                    className="bar-fill"
                    style={{ width: `${(count / maxServiceCount) * 100}%` }}
                  />
                </span>
                <span className="bar-count">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>New requests to quote</h2>
          {latestNew.length === 0 ? (
            <p className="muted">Nothing waiting.</p>
          ) : (
            <ul className="mini-list">
              {latestNew.map(r => (
                <li key={r.id}>
                  <Link to={`/requests/${r.id}`}>{r.customerName}</Link>
                  <span className="muted">{r.serviceType} · received {formatDate(r.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2>Scheduled jobs</h2>
          {nextScheduled.length === 0 ? (
            <p className="muted">No jobs scheduled.</p>
          ) : (
            <ul className="mini-list">
              {nextScheduled.map(r => (
                <li key={r.id}>
                  <Link to={`/requests/${r.id}`}>{r.customerName}</Link>
                  <span className="muted">{r.serviceType} · {formatDate(r.scheduledDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}