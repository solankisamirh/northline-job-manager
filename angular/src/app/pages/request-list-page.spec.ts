import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { RequestListPage } from './request-list-page';

describe('RequestListPage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'requests', component: RequestListPage }], withComponentInputBinding()),
      ],
    });
  });

  it('loads the list with the filters from the URL', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/requests?status=Quoted&serviceType=Snow%20Removal', RequestListPage);

    // Wait for the 300 ms debounce
    await new Promise(resolve => setTimeout(resolve, 350));

    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne(r => r.url.endsWith('/api/quoterequests'));
    expect(req.request.params.get('status')).toBe('Quoted');
    expect(req.request.params.get('serviceType')).toBe('Snow Removal');
    req.flush([]);
    http.verify();
  });
});