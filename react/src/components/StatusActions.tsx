import { useState } from 'react'
import { ApiError, updateStatus } from '../api/quoteRequests'
import { STATUSES, type QuoteRequest, type QuoteStatus } from '../types/quoteRequest'

type StatusActionsProps = {
  request: QuoteRequest
  onUpdated: (updated: QuoteRequest) => void
}

const NEEDS_DATE: QuoteStatus[] = ['Scheduled', 'Completed']

export default function StatusActions({ request, onUpdated }: StatusActionsProps) {
  const [status, setStatus] = useState<QuoteStatus>(request.status)
  const [scheduledDate, setScheduledDate] = useState(request.scheduledDate ?? '')
  const [saving, setSaving] = useState(false)
  const [messages, setMessages] = useState<string[]>([])

  const needsDate = NEEDS_DATE.includes(status)
  const unchanged =
    status === request.status && (scheduledDate || null) === request.scheduledDate

  async function handleSave() {
    setSaving(true)
    setMessages([])
    try {
      const updated = await updateStatus(request.id, {
        status,
        scheduledDate: needsDate ? scheduledDate || null : null,
      })
      onUpdated(updated)
    } catch (err) {
      if (err instanceof ApiError) {
        // Validation messages from the C# API, or the general error message
        setMessages(err.messages.length > 0 ? err.messages : [err.message])
      } else {
        setMessages(['Could not reach the server. Please try again.'])
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card">
      <h2>Update status</h2>

      <div className="status-buttons" role="group" aria-label="Status">
        {STATUSES.map(s => (
          <button
            key={s}
            type="button"
            className={s === status ? 'selected' : ''}
            aria-pressed={s === status}
            onClick={() => setStatus(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {needsDate && (
        <label className="field">
          Scheduled date
          <input
            type="date"
            value={scheduledDate}
            onChange={e => setScheduledDate(e.target.value)}
          />
        </label>
      )}

      {messages.length > 0 && (
        <ul className="error" role="alert">
          {messages.map(m => <li key={m}>{m}</li>)}
        </ul>
      )}

      <button
        type="button"
        className="primary"
        onClick={handleSave}
        disabled={saving || unchanged}
      >
        {saving ? 'Saving…' : 'Save status'}
      </button>
    </div>
  )
}