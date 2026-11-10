import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import { QuoteFilters, QuoteRequest } from '../models/quote-request';
import { ApiError, QuoteRequestService } from '../services/quote-request.service';
import { RequestFilters } from '../components/request-filters';
import { RequestTable } from '../components/request-table';

@Component({
  selector: 'app-request-list-page',
  imports: [RequestFilters, RequestTable],
  template: `
    <section>
      <div class="page-header">
        <h1>Quote requests</h1>
        <span class="muted">{{ loading() ? 'Loading…' : requests().length + ' shown' }}</span>
      </div>

      <app-request-filters [(filters)]="filters" />

      @if (error()) {
        <p class="error">Error: {{ error() }}</p>
      } @else if (loading() && requests().length === 0) {
        <p class="muted">Loading…</p>
      } @else {
        <app-request-table [requests]="requests()" />
      }
    </section>
  `,
})
export class RequestListPage {
  private readonly api = inject(QuoteRequestService);

  protected readonly filters = signal<QuoteFilters>({});
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  // Every time the filters change: wait 300 ms, then load; a newer change cancels the older request
  protected readonly requests = toSignal(
    toObservable(this.filters).pipe(
      debounceTime(300),
      tap(() => {
        this.loading.set(true);
        this.error.set(null);
      }),
      switchMap(filters =>
        this.api.getAll(filters).pipe(
          catchError((err: ApiError) => {
            this.error.set(err.message);
            return of([] as QuoteRequest[]);
          }),
        ),
      ),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: [] as QuoteRequest[] },
  );
}