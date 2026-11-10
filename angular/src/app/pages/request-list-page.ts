import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';
import { QuoteFilters, QuoteRequest, QuoteStatus } from '../models/quote-request';
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

      <app-request-filters [filters]="filters()" (filtersChange)="updateUrl($event)" />

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
  private readonly router = inject(Router);

  // Filters live in the URL, e.g. /requests?status=New&search=sample
  // (withComponentInputBinding fills these inputs from the query string)
  readonly search = input<string>();
  readonly status = input<string>();
  readonly serviceType = input<string>();
  readonly season = input<string>();

  // The URL is the single source of truth: the filters are worked out from it
  protected readonly filters = computed<QuoteFilters>(() => ({
    search: this.search() ?? '',
    status: (this.status() ?? '') as QuoteStatus | '',
    serviceType: this.serviceType() ?? '',
    season: this.season() ?? '',
  }));

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  // Every time the filters change: wait 300 ms, skip if nothing really changed, then load;
  // a newer change cancels the older request
  protected readonly requests = toSignal(
    toObservable(this.filters).pipe(
      debounceTime(300),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
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

  // The filters changed on screen → write them into the URL, without adding a Back-button step.
  // A null value removes that part from the URL.
  protected updateUrl(next: QuoteFilters): void {
    this.router.navigate([], {
      queryParams: {
        search: next.search || null,
        status: next.status || null,
        serviceType: next.serviceType || null,
        season: next.season || null,
      },
      replaceUrl: true,
    });
  }
}