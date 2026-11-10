import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { DashboardPage } from './dashboard-page';

describe('DashboardPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
  });

  it('shows counts from the API, including zero for missing statuses', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    const http = TestBed.inject(HttpTestingController);

    // Answer the three API calls with sample data
    http.expectOne(r => r.url.endsWith('/summary')).flush({
      total: 3,
      byStatus: [{ status: 'New', count: 2 }, { status: 'Quoted', count: 1 }],
      byService: [{ serviceType: 'Snow Removal', count: 3 }],
    });
    http.expectOne(r => r.params.get('status') === 'New').flush([]);
    http.expectOne(r => r.params.get('status') === 'Scheduled').flush([]);
    await fixture.whenStable();

    const values = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.stat-value'),
    ).map(el => el.textContent?.trim());

    // Total, New, Quoted, Scheduled, Completed
    expect(values).toEqual(['3', '2', '1', '0', '0']);
    http.verify();
  });
});