import { Component, model } from '@angular/core';
import { QuoteFilters, SEASONS, SERVICE_TYPES, STATUSES } from '../models/quote-request';

type SelectField = 'status' | 'serviceType' | 'season';

@Component({
  selector: 'app-request-filters',
  template: `
    <div class="filters">
      <label>
        Search
        <input
          type="search"
          placeholder="Name, address or email"
          [value]="filters().search ?? ''"
          (input)="update('search', $event)"
        />
      </label>

      @for (s of selects; track s.field) {
        <label>
          {{ s.label }}
          <select (change)="update(s.field, $event)">
            <option value="" [selected]="!filters()[s.field]">All</option>
            @for (option of s.options; track option) {
              <option [value]="option" [selected]="filters()[s.field] === option">{{ option }}</option>
            }
          </select>
        </label>
      }

      <button type="button" (click)="filters.set({})">Clear</button>
    </div>
  `,
})
export class RequestFilters {
  // Two-way bindable: the parent writes [(filters)]="filters"
  readonly filters = model.required<QuoteFilters>();

  protected readonly selects: { field: SelectField; label: string; options: readonly string[] }[] = [
    { field: 'status', label: 'Status', options: STATUSES },
    { field: 'serviceType', label: 'Service', options: SERVICE_TYPES },
    { field: 'season', label: 'Season', options: SEASONS },
  ];

  protected update(field: keyof QuoteFilters, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;
    // A new object with one field changed (same idea as React's spread and Blazor's "with")
    this.filters.set({ ...this.filters(), [field]: value } as QuoteFilters);
  }
}