import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { QuoteRequest, SERVICE_TYPES, STATUSES, Summary } from '../models/quote-request';
import { ApiError, QuoteRequestService } from '../services/quote-request.service';
import { StatusBadge } from '../components/status-badge';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink, DatePipe, StatusBadge],
  template: `
    @if (error()) {
      <p class="error">Error: {{ error() }}</p>
    } @else if (summary(); as s) {
      <section>
        <div class="page-header">
          <h1>Dashboard</h1>
          <a routerLink="/requests/new" class="button primary">+ New request</a>
        </div>

        <div class="stat-grid">
          <a routerLink="/requests" class="stat-card">
            <span class="stat-label">Total requests</span>
            <span class="stat-value">{{ s.total }}</span>
          </a>
          @for (card of statusCards(); track card.status) {
            <a routerLink="/requests" [queryParams]="{ status: card.status }" class="stat-card">
              <span class="stat-label"><app-status-badge [status]="card.status" /></span>
              <span class="stat-value">{{ card.count }}</span>
            </a>
          }
        </div>

        <div class="dashboard-grid">
          <div class="panel">
            <h2>Requests by service</h2>
            <ul class="bar-list">
              @for (bar of serviceBars(); track bar.service) {
                <li>
                  <a routerLink="/requests" [queryParams]="{ serviceType: bar.service }">{{ bar.service }}</a>
                  <span class="bar-track" aria-hidden="true">
                    <span class="bar-fill" [style.width.%]="bar.percent"></span>
                  </span>
                  <span class="bar-count">{{ bar.count }}</span>
                </li>
              }
            </ul>
          </div>

          <div class="panel">
            <h2>New requests to quote</h2>
            @if (latestNew().length === 0) {
              <p class="muted">Nothing waiting.</p>
            } @else {
              <ul class="mini-list">
                @for (r of latestNew(); track r.id) {
                  <li>
                    <a [routerLink]="['/requests', r.id]">{{ r.customerName }}</a>
                    <span class="muted">{{ r.serviceType }} · received {{ r.createdAt | date: 'MMM d, y' }}</span>
                  </li>
                }
              </ul>
            }
          </div>

          <div class="panel">
            <h2>Scheduled jobs</h2>
            @if (nextScheduled().length === 0) {
              <p class="muted">No jobs scheduled.</p>
            } @else {
              <ul class="mini-list">
                @for (r of nextScheduled(); track r.id) {
                  <li>
                    <a [routerLink]="['/requests', r.id]">{{ r.customerName }}</a>
                    <span class="muted">{{ r.serviceType }} · {{ r.scheduledDate | date: 'MMM d, y' : 'UTC' }}</span>
                  </li>
                }
              </ul>
            }
          </div>
        </div>
      </section>
    } @else {
      <p class="muted">Loading…</p>
    }
  `,
})
export class DashboardPage {
  private readonly api = inject(QuoteRequestService);

  protected readonly summary = signal<Summary | null>(null);
  protected readonly newRequests = signal<QuoteRequest[]>([]);
  protected readonly scheduled = signal<QuoteRequest[]>([]);
  protected readonly error = signal<string | null>(null);

  // Derived values: worked out from the loaded data, never stored twice
  protected readonly statusCards = computed(() =>
    STATUSES.map(status => ({
      status,
      count: this.summary()?.byStatus.find(s => s.status === status)?.count ?? 0,
    })),
  );

  protected readonly serviceBars = computed(() => {
    const counts = SERVICE_TYPES.map(service => ({
      service,
      count: this.summary()?.byService.find(s => s.serviceType === service)?.count ?? 0,
    }));
    const max = Math.max(1, ...counts.map(c => c.count));
    return counts.map(c => ({ ...c, percent: (c.count / max) * 100 }));
  });

  protected readonly latestNew = computed(() => this.newRequests().slice(0, 5));

  protected readonly nextScheduled = computed(() =>
    [...this.scheduled()]
      .sort((a, b) => (a.scheduledDate ?? '').localeCompare(b.scheduledDate ?? ''))
      .slice(0, 5),
  );

  constructor() {
    forkJoin({
      summary: this.api.getSummary(),
      newRequests: this.api.getAll({ status: 'New' }),
      scheduled: this.api.getAll({ status: 'Scheduled' }),
    })
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: ({ summary, newRequests, scheduled }) => {
          this.summary.set(summary);
          this.newRequests.set(newRequests);
          this.scheduled.set(scheduled);
        },
        error: (err: ApiError) => this.error.set(err.message),
      });
  }
}