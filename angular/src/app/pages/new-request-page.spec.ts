import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NewRequestPage } from './new-request-page';

describe('NewRequestPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewRequestPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
  });

  it('shows messages when an empty form is submitted', async () => {
    const fixture = TestBed.createComponent(NewRequestPage);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;

    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(page.textContent).toContain('Please fix the highlighted fields.');
    expect(page.textContent).toContain('Enter the customer name.');
    expect(page.textContent).toContain('Enter an email or a phone number.');
    expect(page.querySelector('#customerName')!.getAttribute('aria-invalid')).toBe('true');
  });

  it('clears the email-or-phone message once a phone is typed', async () => {
    const fixture = TestBed.createComponent(NewRequestPage);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;

    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    const phone = page.querySelector('#phone') as HTMLInputElement;
    phone.value = '780-555-0110';
    phone.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(page.textContent).not.toContain('Enter an email or a phone number.');
  });
});