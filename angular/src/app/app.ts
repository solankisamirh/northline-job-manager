import { Component, ElementRef, viewChild } from '@angular/core';
import { IsActiveMatchOptions, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // "Requests" is active on /requests with or without filters, but not on /requests/5 or /requests/new
  protected readonly requestsLinkMatch: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'ignored',
    fragment: 'ignored',
    matrixParams: 'ignored',
  };

  // A handle on the <main> element (template reference #main)
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  // Skip link: move keyboard focus straight to the page content
  protected skipToMain(): void {
    this.main().nativeElement.focus();
  }
}