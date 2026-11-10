import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RequestListPage } from './pages/request-list-page';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RequestListPage],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}