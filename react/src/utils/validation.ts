// Form values are all text while the user is typing
export type FormValues = {
  customerName: string
  email: string
  phone: string
  address: string
  serviceType: string
  propertyType: string
  season: string
  notes: string
}

// Each field may have one message
export type FormErrors = Partial<Record<keyof FormValues, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[0-9+()\-.\s]{7,30}$/

// Same rules as the C# DTO and the SQL CHECK constraints
export function validateQuoteRequest(v: FormValues): FormErrors {
  const errors: FormErrors = {}

  const name = v.customerName.trim()
  if (!name) errors.customerName = 'Enter the customer name.'
  else if (name.length > 100) errors.customerName = 'Use 100 characters or fewer.'

  const email = v.email.trim()
  const phone = v.phone.trim()
  if (!email && !phone) errors.email = 'Enter an email or a phone number.'
  if (email && !EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email, like name@example.com.'
  if (phone && !PHONE_PATTERN.test(phone)) errors.phone = 'Enter a valid phone number, like 780-555-0101.'

  const address = v.address.trim()
  if (!address) errors.address = 'Enter the property address.'
  else if (address.length > 200) errors.address = 'Use 200 characters or fewer.'

  if (!v.serviceType) errors.serviceType = 'Choose a service.'
  if (!v.propertyType) errors.propertyType = 'Choose a property type.'
  if (!v.season) errors.season = 'Choose a season.'
  if (v.notes.length > 1000) errors.notes = 'Use 1000 characters or fewer.'

  return errors
}