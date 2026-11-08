// Allowed values: same as the API's validation and the SQL CHECK constraints.
// "as const" keeps the exact words, so the types below can be built from these lists.
export const STATUSES = ['New', 'Quoted', 'Scheduled', 'Completed'] as const;
export const SERVICE_TYPES = ['Landscaping', 'Snow Removal', 'Lawn Care', 'Yard Cleanup'] as const;
export const PROPERTY_TYPES = ['Residential', 'Commercial'] as const;
export const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'] as const;
export const NEEDS_DATE: readonly QuoteStatus[] = ['Scheduled', 'Completed'];

export type QuoteStatus = (typeof STATUSES)[number];
export type ServiceType = (typeof SERVICE_TYPES)[number];
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type Season = (typeof SEASONS)[number];

// What the API returns
export interface QuoteRequest {
  id: number;
  customerName: string;
  email: string | null;
  phone: string | null;
  address: string;
  serviceType: ServiceType;
  propertyType: PropertyType;
  season: Season;
  status?: QuoteStatus | '';
  scheduledDate: string | null; // "2026-11-15"
  notes: string | null;
  createdAt: string;            // UTC, ends in "Z"
  updatedAt: string | null;
}

// What we send to create one
export interface CreateQuoteRequest {
  customerName: string;
  email: string | null;
  phone: string | null;
  address: string;
  serviceType: ServiceType;
  propertyType: PropertyType;
  season: Season;
  notes: string | null;
}

// What we send to change status
export interface UpdateStatus {
  status: QuoteStatus;
  scheduledDate: string | null;
}

export interface Summary {
  total: number;
  byStatus: { status: string; count: number }[];
  byService: { serviceType: string; count: number }[];
}

export interface QuoteFilters {
  search?: string;
  status?: string;
  serviceType?: string;
  season?: string;
}