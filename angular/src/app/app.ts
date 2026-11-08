import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiError, QuoteRequestService } from './services/quote-request.service';
import { QuoteRequest, Summary } from './models/quote-request';
import { forkJoin } from 'rxjs';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly api = inject(QuoteRequestService);

  private readonly http = inject(HttpClient);

  protected readonly summary = signal<Summary | null>(null);
  protected readonly newRequests = signal<QuoteRequest[]>([]);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    // Run both calls at the same time and wait for both (like Promise.all / Task.WhenAll)
    forkJoin({
      summary: this.api.getSummary(),
      newRequests: this.api.getAll({ status: 'new' }),
    }).subscribe({
      next: ({ summary, newRequests }) => {
        this.summary.set(summary);
        this.newRequests.set(newRequests);
      },
      error: (err: ApiError) => this.error.set(err.message),
    });
  }
}