import type { QuoteRequest } from '../types/quoteRequest'
import { formatDate } from '../utils/format'
import StatusBadge from './StatusBadge'
import { Link } from 'react-router'

type RequestTableProps = {
  requests: QuoteRequest[]
}

export default function RequestTable({ requests }: RequestTableProps) {
  if (requests.length === 0) {
    return <p className="empty">No requests match these filters.</p>
  }

  return (
    <div className="table-wrap">
      <table className="request-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Service</th>
            <th>Property</th>
            <th>Season</th>
            <th>Status</th>
            <th>Received</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(r => (
            <tr key={r.id}>
              <td>
  <strong>
    <Link to={`/requests/${r.id}`}>{r.customerName}</Link>
  </strong>
  <div className="muted">{r.address}</div>
</td>
              <td>{r.serviceType}</td>
              <td>{r.propertyType}</td>
              <td>{r.season}</td>
              <td><StatusBadge status={r.status} /></td>
              <td>{formatDate(r.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}