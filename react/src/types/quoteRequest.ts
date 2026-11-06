// Allowed values, matching the C# validation and SQL CHECK constraints
export type QuoteStatus = 'New' | 'Quoted' | 'Scheduled' | 'Completed'
export type ServiceType = 'Landscaping' | 'Snow Removal' | 'Lawn Care' | 'Yard Cleanup'
export type PropertyType = 'Residential' | 'Commercial'
export type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter' 

// Lists for dropdowns and buttons
export const STATUSES: QuoteStatus[] = ['New', 'Quoted', 'Scheduled', 'Completed']
export const SERVICE_TYPES: ServiceType[] = ['Landscaping', 'Snow Removal', 'Lawn Care', 'Yard Cleanup']
export const PROPERTY_TYPES: PropertyType[] = ['Residential', 'Commercial']
export const SEASONS: Season[] = ['Spring', 'Summer', 'Fall', 'Winter']

export type QuoteRequest = {
    id: number
    customerName: string
    email: string | null
  phone: string | null
  address: string
  serviceType: ServiceType
  propertyType: PropertyType
  season: Season
  status: QuoteStatus
  scheduledDate: string | null // "2026-11-15"
  notes: string | null
  createdAt: string            // "2026-10-20T00:00:00"
  updatedAt: string | null
}

// What we send to create one (matches CreateQuoteRequestDto)
export type CreateQuoteRequest = {
  customerName: string
  email?: string | null
  phone?: string | null
  address: string
  serviceType: ServiceType
  propertyType: PropertyType
  season: Season
  notes?: string | null
}

// What we send to change status (matches UpdateStatusDto)
export type UpdateStatus = {
  status: QuoteStatus
  scheduledDate: string | null
}

// Summary endpoint
export type Summary = {
  total: number
  byStatus: { status: string; count: number }[]
  byService: { serviceType: string; count: number }[]
}

// Optional filters for the list
export type QuoteFilters = {
    search?: string
    status?: string
    serviceType?: string
    season?: string
}