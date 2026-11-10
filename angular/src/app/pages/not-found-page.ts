import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <section>
      <h1>Page not found</h1>
      <a routerLink="/requests">← Back to requests</a>
    </section>
  `,
})
export class NotFoundPage {}