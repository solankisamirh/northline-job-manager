import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  template: `<span class="badge" [class]="cssClass()">{{ status() }}</span>`,
  styles: `
    .badge {display: inline-block;
    padding: 2px 10px;
    border-radious: 999px;
    font-size: 0.8rem;
    font-weight: 600;}
    .status-new { background: #e3edfb; color: #1d4f91;}
    .status-quoted { background: #fdf0d5; color: #8a5a00;}
    .status-scheduled { background: #e6f3e8; color: #2f6b3f; }
    .status-completed { background: #ececec; color: #444; }

  `,
})
export class StatusBadge {
  readonly status = input.required<string>();
  protected readonly cssClass = computed(() => `badge status-${this.status().toLowerCase()}`);
}