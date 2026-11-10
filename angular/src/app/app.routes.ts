import { Routes } from '@angular/router';
import { RequestListPage } from './pages/request-list-page';

export const routes: Routes = [
// Home: the dashboard comes in step 6; until then, go to the list 
{
    path: '',
    loadComponent: () => import('./pages/dashboard-page').then(m => m.DashboardPage),
    title: 'Dashboard · Northline Job Manager',
},
{
    path: 'requests',
    component: RequestListPage,
    title: 'Quote requests · Northline Job Manager',
},
{
    path: 'requests/new',
    loadComponent: () => import('./pages/new-request-page').then(m => m.NewRequestPage),
    title: 'New request · Northline Job Manager',
},
{
    path: 'requests/:id',
    // Lazy loading: this page's code downloads only when someone opens a request 
    loadComponent: () => import('./pages/request-details-page').then(m => m.RequestDetailsPage),
    title: 'Request details · Northline Job Manager',
},
{
    path: '**',
    loadComponent: () => import('./pages/not-found-page').then(m => m.NotFoundPage),
    title: 'Page not found · Northline Job Manager',
},
];