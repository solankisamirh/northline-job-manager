import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { NEEDS_DATE, QuoteRequest, STATUSES } from '../models/quote-request';
import { ApiError, QuoteRequestService } from '../services/quote-request.service';

@Component({
  selector: 'app-status-actions',
  template: `
    <div class="panel">
      <h2>Update status</h2>

      <div class="status-buttons" role="group" aria-label="Status">
        @for (s of statuses; track s) {
          <button
            type="button"
            [class.selected]="s === status()"
            [attr.aria-pressed]="s === status()"
            (click)="status.set(s)"
          >
            {{ s }}
          </button>
        }
      </div>

      @if (needsDate()) {
        <label class="field">
          Scheduled date
          <input type="date" [value]="scheduledDate()" (input)="onDateInput($event)" />
        </label>
      }

      @if (messages().length > 0) {
        <ul class="error" role="alert">
          @for (m of messages(); track m) {
            <li>{{ m }}</li>
          }
        </ul>
      }

      <button type="button" class="primary" (click)="save()" [disabled]="saving() || unchanged()">
        {{ saving() ? 'Saving…' : 'Save status' }}
      </button>
    </div>
  `,
})
export class StatusActions {
  private readonly api = inject(QuoteRequestService);

  readonly request = input.required<QuoteRequest>();
  readonly updated = output<QuoteRequest>();

  protected readonly statuses = STATUSES;

  // Editable copies that reset automatically when a different request comes in
  protected readonly status = linkedSignal(() => this.request().status);
  protected readonly scheduledDate = linkedSignal(() => this.request().scheduledDate ?? '');

  protected readonly saving = signal(false);
  protected readonly messages = signal<string[]>([]);

  protected readonly needsDate = computed(() => NEEDS_DATE.includes(this.status()));
  protected readonly unchanged = computed(
    () =>
      this.status() === this.request().status &&
      (this.scheduledDate() || null) === this.request().scheduledDate,
  );

  protected onDateInput(event: Event): void {
    this.scheduledDate.set((event.target as HTMLInputElement).value);
  }

  protected save(): void {
    this.saving.set(true);
    this.messages.set([]);

    this.api
      .updateStatus(this.request().id, {
        status: this.status(),
        scheduledDate: this.needsDate() ? this.scheduledDate() || null : null,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: updated => this.updated.emit(updated),
        // Validation messages from the C# API (400), or the general message
        error: (err: ApiError) => this.messages.set(err.messages),
      });
  }
}