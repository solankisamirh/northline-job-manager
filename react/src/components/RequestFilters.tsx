import { SEASONS, SERVICE_TYPES, STATUSES, type QuoteFilters } from "../types/quoteRequest"

type RequestFiltersProps = {
    filters: QuoteFilters
    onChange: (filters: QuoteFilters) => void
}

export default function RequestFiltersProps ({ filters, onChange }: RequestFiltersProps) {
    function update(field: keyof QuoteFilters, value: string) {
        onChange({ ...filters, [field]: value})
    }

    return (
        <div className="filters">
            <label>
                Search 
                <input 
                    type="search"
                    placeholder="Name, address or email"
                    value={filters.search ?? ''}
                    onChange={e => update('search', e.target.value)}
                />
            </label>

            

            <FilterSelect label="Status" value={filters.status ?? ''} options={STATUSES}
        onChange={value => update('status', value)} />
      <FilterSelect label="Service" value={filters.serviceType ?? ''} options={SERVICE_TYPES}
        onChange={value => update('serviceType', value)} />
      <FilterSelect label="Season" value={filters.season ?? ''} options={SEASONS}
        onChange={value => update('season', value)} />

      <button type="button" onClick={() => onChange({})}>Clear</button>
        </div>
    )
}

// A small reusable dropdown, only used in this file
type FilterSelectProps = {
    label: string
    value: string
    options: readonly string[]
    onChange: (value: string) => void
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label>
      {label}
      <select value={value} onChange={e => onChange(e.target.value)}>
        <option value="">All</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}