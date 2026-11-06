import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ApiError, createQuoteRequest } from '../api/quoteRequests'
import FormField from '../components/FormField'
import {
  PROPERTY_TYPES, SEASONS, SERVICE_TYPES,
  type PropertyType, type Season, type ServiceType,
} from '../types/quoteRequest'
import { validateQuoteRequest, type FormErrors, type FormValues } from '../utils/validation'

const EMPTY_FORM: FormValues = {
  customerName: '', email: '', phone: '', address: '',
  serviceType: '', propertyType: '', season: '', notes: '',
}

// API error keys look like "Email" or "$.email" → our field names look like "email"
function toFieldName(key: string): keyof FormValues | null {
  const clean = key.replace(/^\$\./, '')
  const name = clean.charAt(0).toLowerCase() + clean.slice(1)
  return name in EMPTY_FORM ? (name as keyof FormValues) : null
}

export default function NewRequestPage() {
  const navigate = useNavigate()
  const [values, setValues] = useState<FormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // One change handler for every field, using the field's "name"
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: undefined })) // hide the message while the user fixes it
  }

  // The props every field needs, so we don't repeat them 8 times
  function fieldProps(name: keyof FormValues) {
    return {
      id: name,
      name,
      value: values[name],
      onChange: handleChange,
      'aria-invalid': errors[name] ? true : undefined,
      'aria-describedby': errors[name] ? `${name}-error` : undefined,
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault() // stop the browser's own page reload
    setFormMessage(null)

    // 1. Check in the browser first
    const clientErrors = validateQuoteRequest(values)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length > 0) {
      setFormMessage('Please fix the highlighted fields.')
      return
    }

    // 2. Send to the API (which checks again)
    setSaving(true)
    try {
      const created = await createQuoteRequest({
        customerName: values.customerName.trim(),
        email: values.email.trim() || null,
        phone: values.phone.trim() || null,
        address: values.address.trim(),
        serviceType: values.serviceType as ServiceType,
        propertyType: values.propertyType as PropertyType,
        season: values.season as Season,
        notes: values.notes.trim() || null,
      })
      navigate(`/requests/${created.id}`, { state: { message: 'Request created.' } })
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.errors).length > 0) {
        // Put the API's messages under the matching fields
        const fieldErrors: FormErrors = {}
        const otherMessages: string[] = []
        for (const [key, list] of Object.entries(err.errors)) {
          const field = toFieldName(key)
          if (field) fieldErrors[field] = list[0]
          else otherMessages.push(...list)
        }
        setErrors(fieldErrors)
        setFormMessage(otherMessages.length > 0 ? otherMessages.join(' ') : 'Please fix the highlighted fields.')
      } else if (err instanceof ApiError) {
        setFormMessage(err.message)
      } else {
        setFormMessage('Could not reach the server. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <Link to="/" className="back-link">← Back to requests</Link>
      <h1>New quote request</h1>

      <form className="card form" onSubmit={handleSubmit} noValidate>
        {formMessage && <p className="form-message" role="alert">{formMessage}</p>}

        <FormField id="customerName" label="Customer name" required error={errors.customerName}>
          <input {...fieldProps('customerName')} required autoComplete="name" />
        </FormField>

        <p className="muted hint">Enter at least an email or a phone number.</p>
        <div className="form-row">
          <FormField id="email" label="Email" error={errors.email}>
            <input {...fieldProps('email')} type="email" autoComplete="email" />
          </FormField>
          <FormField id="phone" label="Phone" error={errors.phone}>
            <input {...fieldProps('phone')} type="tel" autoComplete="tel" />
          </FormField>
        </div>

        <FormField id="address" label="Property address" required error={errors.address}>
          <input {...fieldProps('address')} required autoComplete="street-address" />
        </FormField>

        <div className="form-row">
          <FormField id="serviceType" label="Service" required error={errors.serviceType}>
            <select {...fieldProps('serviceType')} required>
              <option value="">Choose…</option>
              {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>
          <FormField id="propertyType" label="Property type" required error={errors.propertyType}>
            <select {...fieldProps('propertyType')} required>
              <option value="">Choose…</option>
              {PROPERTY_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </FormField>
          <FormField id="season" label="Season" required error={errors.season}>
            <select {...fieldProps('season')} required>
              <option value="">Choose…</option>
              {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>
        </div>

        <FormField id="notes" label="Notes" error={errors.notes}>
          <textarea {...fieldProps('notes')} rows={4} />
        </FormField>

        <div className="form-actions">
          <button type="submit" className="primary" disabled={saving}>
            {saving ? 'Saving…' : 'Create request'}
          </button>
          <Link to="/">Cancel</Link>
        </div>
      </form>
    </section>
  )
}