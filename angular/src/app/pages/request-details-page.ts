import { Component, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EMPTY, catchError, switchMap, tap } from 'rxjs';
import { QuoteRequest } from '../models/quote-request';
import { ApiError, QuoteRequestService } from '../services/quote-request.service';
import { StatusBadge } from '../components/status-badge';
import { StatusActions } from '../components/status-actions';

@Component({
  selector: 'app-request-details-page',
  imports: [RouterLink, DatePipe, StatusBadge, StatusActions],
  template: `
    @if (notFound()) {
      <section>
        <h1>Request not found</h1>
        <a routerLink="/requests">← Back to requests</a>
      </section>
    } @else if (error()) {
      <p class="error">Error: {{ error() }}</p>
    } @else if (request(); as r) {
      <section>
        <a routerLink="/requests" class="back-link">← Back to requests</a>

        <div class="page-header">
          <h1>{{ r.customerName }}</h1>
          <app-status-badge [status]="r.status" />
        </div>
                @if (created() === 'true' && !saved()) {
          <p class="success" role="status">Request created.</p>
        }

        <div class="details-grid">
          <div class="panel">
            <h2>Request details</h2>
            <dl class="details">
              <dt>Address</dt><dd>{{ r.address }}</dd>
              <dt>Email</dt><dd>{{ r.email ?? '—' }}</dd>
              <dt>Phone</dt><dd>{{ r.phone ?? '—' }}</dd>
              <dt>Service</dt><dd>{{ r.serviceType }}</dd>
              <dt>Property</dt><dd>{{ r.propertyType }}</dd>
              <dt>Season</dt><dd>{{ r.season }}</dd>
              <dt>Scheduled</dt><dd>{{ (r.scheduledDate | date: 'MMM d, y' : 'UTC') ?? '—' }}</dd>
              <dt>Received</dt><dd>{{ r.createdAt | date: 'MMM d, y' }}</dd>
              <dt>Last updated</dt><dd>{{ (r.updatedAt | date: 'MMM d, y') ?? '—' }}</dd>
              <dt>Notes</dt><dd>{{ r.notes ?? '—' }}</dd>
            </dl>
          </div>

          <div>
            <app-status-actions [request]="r" (updated)="onUpdated($event)" />
            @if (saved()) {
              <p class="success" role="status">Status saved.</p>
            }
          </div>
        </div>
      </section>
    } @else {
      <p class="muted">Loading…</p>
    }
  `,
})
export class RequestDetailsPage {
  private readonly api = inject(QuoteRequestService);

  // Filled from the URL's :id (withComponentInputBinding)
  readonly id = input.required<string>();
  // Filled from ?created=true after a new request is saved
  readonly created = input<string>();

  protected readonly request = signal<QuoteRequest | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly notFound = signal(false);
  protected readonly saved = signal(false);

  constructor() {
    // Load the request whenever the id in the URL changes; a newer id cancels the older call
    toObservable(this.id)
      .pipe(
        tap(() => {
          this.request.set(null);
          this.error.set(null);
          this.notFound.set(false);
          this.saved.set(false);
        }),
        switchMap(id =>
          this.api.getById(Number(id)).pipe(
            catchError((err: ApiError) => {
              if (err.status === 404) this.notFound.set(true);
              else this.error.set(err.message);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(r => this.request.set(r));
  }

  protected onUpdated(updated: QuoteRequest): void {
    this.request.set(updated);
    this.saved.set(true);
  }
}