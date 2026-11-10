import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { QuoteRequest } from '../models/quote-request';
import { StatusBadge } from './status-badge';
import { RouterLink } from '@angular/router'; 

@Component({
  selector: 'app-request-table',
  imports: [StatusBadge, DatePipe, RouterLink],
  template: `
    @if (requests().length === 0) {
      <p class="empty">No requests match these filters.</p>
    } @else {
      <div class="table-wrap">
        <table class="request-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Service</th>
              <th>Property</th>
              <th>Season</th>
              <th>Status</th>
              <th>Received</th>
            </tr>
          </thead>
          <tbody>
            @for (r of requests(); track r.id) {
              <tr>
                <td>
                  <strong><a [routerLink]="['/requests', r.id]">{{ r.customerName }}</a></strong>
                  <div class="muted">{{ r.address }}</div>
                </td>
                <td>{{ r.serviceType }}</td>
                <td>{{ r.propertyType }}</td>
                <td>{{ r.season }}</td>
                <td><app-status-badge [status]="r.status" /></td>
                <td>{{ r.createdAt | date: 'MMM d, y' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class RequestTable {
  readonly requests = input.required<QuoteRequest[]>();
}