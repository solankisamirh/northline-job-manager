import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

type Summary = {
  total: number;
  byStatus: {
    status: string;
    count: number;
  }[];
  byService: {
    serviceType: string;
    count: number;
  }[];
};

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly http = inject(HttpClient);

  protected readonly summary = signal<Summary | null>(null);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.http.get<Summary>(`${environment.apiUrl}/api/quoterequests/summary`).subscribe({
      next: data => this.summary.set(data),
      error: err => this.error.set(err.message),
    });
  }
}