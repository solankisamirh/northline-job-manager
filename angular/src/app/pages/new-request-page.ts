import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {
  CreateQuoteRequest,
  PROPERTY_TYPES,
  PropertyType,
  SEASONS,
  SERVICE_TYPES,
  Season,
  ServiceType,
} from '../models/quote-request';
import { ApiError, QuoteRequestService } from '../services/quote-request.service';

type Field = 'customerName' | 'email' | 'phone' | 'address' | 'serviceType' | 'propertyType' | 'season' | 'notes';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+()\-.\s]{7,30}$/;

// Messages that say what to do (same wording as React and Blazor)
const REQUIRED_MESSAGES: Partial<Record<Field, string>> = {
  customerName: 'Enter the customer name.',
  address: 'Enter the property address.',
  serviceType: 'Choose a service.',
  propertyType: 'Choose a property type.',
  season: 'Choose a season.',
};

// Rule across two fields: an email or a phone number is required
const emailOrPhone: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const email = String(group.get('email')?.value ?? '').trim();
  const phone = String(group.get('phone')?.value ?? '').trim();
  return email || phone ? null : { emailOrPhone: true };
};

const blankToNull = (value: string): string | null => (value.trim() === '' ? null : value.trim());

@Component({
  selector: 'app-new-request-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section>
      <a routerLink="/requests" class="back-link">← Back to requests</a>
      <h1>New quote request</h1>

      <form class="panel form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        @if (formMessage()) {
          <p class="form-message" role="alert">{{ formMessage() }}</p>
        }

        <div class="form-field">
          <label for="customerName">Customer name <span class="required" aria-hidden="true">*</span></label>
          <input id="customerName" formControlName="customerName" autocomplete="name"
                 [attr.aria-invalid]="errorFor('customerName') ? true : null"
                 [attr.aria-describedby]="errorFor('customerName') ? 'customerName-error' : null" />
          @if (errorFor('customerName'); as message) {
            <p class="field-error" id="customerName-error">{{ message }}</p>
          }
        </div>

        <p class="muted hint">Enter at least an email or a phone number.</p>
        <div class="form-row">
          <div class="form-field">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" autocomplete="email"
                   [attr.aria-invalid]="errorFor('email') ? true : null"
                   [attr.aria-describedby]="errorFor('email') ? 'email-error' : null" />
            @if (errorFor('email'); as message) {
              <p class="field-error" id="email-error">{{ message }}</p>
            }
          </div>
          <div class="form-field">
            <label for="phone">Phone</label>
            <input id="phone" type="tel" formControlName="phone" autocomplete="tel"
                   [attr.aria-invalid]="errorFor('phone') ? true : null"
                   [attr.aria-describedby]="errorFor('phone') ? 'phone-error' : null" />
            @if (errorFor('phone'); as message) {
              <p class="field-error" id="phone-error">{{ message }}</p>
            }
          </div>
        </div>

        <div class="form-field">
          <label for="address">Property address <span class="required" aria-hidden="true">*</span></label>
          <input id="address" formControlName="address" autocomplete="street-address"
                 [attr.aria-invalid]="errorFor('address') ? true : null"
                 [attr.aria-describedby]="errorFor('address') ? 'address-error' : null" />
          @if (errorFor('address'); as message) {
            <p class="field-error" id="address-error">{{ message }}</p>
          }
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="serviceType">Service <span class="required" aria-hidden="true">*</span></label>
            <select id="serviceType" formControlName="serviceType"
                    [attr.aria-invalid]="errorFor('serviceType') ? true : null"
                    [attr.aria-describedby]="errorFor('serviceType') ? 'serviceType-error' : null">
              <option value="">Choose…</option>
              @for (s of serviceTypes; track s) {
                <option [value]="s">{{ s }}</option>
              }
            </select>
            @if (errorFor('serviceType'); as message) {
              <p class="field-error" id="serviceType-error">{{ message }}</p>
            }
          </div>
          <div class="form-field">
            <label for="propertyType">Property type <span class="required" aria-hidden="true">*</span></label>
            <select id="propertyType" formControlName="propertyType"
                    [attr.aria-invalid]="errorFor('propertyType') ? true : null"
                    [attr.aria-describedby]="errorFor('propertyType') ? 'propertyType-error' : null">
              <option value="">Choose…</option>
              @for (p of propertyTypes; track p) {
                <option [value]="p">{{ p }}</option>
              }
            </select>
            @if (errorFor('propertyType'); as message) {
              <p class="field-error" id="propertyType-error">{{ message }}</p>
            }
          </div>
          <div class="form-field">
            <label for="season">Season <span class="required" aria-hidden="true">*</span></label>
            <select id="season" formControlName="season"
                    [attr.aria-invalid]="errorFor('season') ? true : null"
                    [attr.aria-describedby]="errorFor('season') ? 'season-error' : null">
              <option value="">Choose…</option>
              @for (s of seasons; track s) {
                <option [value]="s">{{ s }}</option>
              }
            </select>
            @if (errorFor('season'); as message) {
              <p class="field-error" id="season-error">{{ message }}</p>
            }
          </div>
        </div>

        <div class="form-field">
          <label for="notes">Notes</label>
          <textarea id="notes" formControlName="notes" rows="4"
                    [attr.aria-invalid]="errorFor('notes') ? true : null"
                    [attr.aria-describedby]="errorFor('notes') ? 'notes-error' : null"></textarea>
          @if (errorFor('notes'); as message) {
            <p class="field-error" id="notes-error">{{ message }}</p>
          }
        </div>

        <div class="form-actions">
          <button type="submit" class="primary" [disabled]="saving()">
            {{ saving() ? 'Saving…' : 'Create request' }}
          </button>
          <a routerLink="/requests">Cancel</a>
        </div>
      </form>
    </section>
  `,
})
export class NewRequestPage {
  private readonly api = inject(QuoteRequestService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly serviceTypes = SERVICE_TYPES;
  protected readonly propertyTypes = PROPERTY_TYPES;
  protected readonly seasons = SEASONS;

  // The form: each field with its rules (same rules as the C# API and the SQL CHECK constraints)
  protected readonly form = this.fb.group(
    {
      customerName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.pattern(EMAIL_PATTERN), Validators.maxLength(255)]],
      phone: ['', [Validators.pattern(PHONE_PATTERN)]],
      address: ['', [Validators.required, Validators.maxLength(200)]],
      serviceType: ['', [Validators.required]],
      propertyType: ['', [Validators.required]],
      season: ['', [Validators.required]],
      notes: ['', [Validators.maxLength(1000)]],
    },
    { validators: emailOrPhone },
  );

  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly formMessage = signal<string | null>(null);

  // The message to show under a field, or null when there's nothing to show yet
  protected errorFor(field: Field): string | null {
    const control = this.form.controls[field];
    if (!control.touched && !this.submitted()) return null;

    const errors = control.errors;
    if (errors?.['server']) return errors['server'];
    if (errors?.['required']) return REQUIRED_MESSAGES[field] ?? 'This field is required.';
    if (errors?.['maxlength']) return `Use ${errors['maxlength'].requiredLength} characters or fewer.`;
    if (errors?.['pattern']) {
      return field === 'email'
        ? 'Enter a valid email, like name@example.com.'
        : 'Enter a valid phone number, like 780-555-0101.';
    }
    if (field === 'email' && this.form.hasError('emailOrPhone')) return 'Enter an email or a phone number.';
    return null;
  }

  protected submit(): void {
    this.submitted.set(true);
    this.formMessage.set(null);

    // 1. Check in the browser first
    if (this.form.invalid) {
      this.formMessage.set('Please fix the highlighted fields.');
      return;
    }

    // 2. Send to the API (which checks again)
    const v = this.form.getRawValue();
    const data: CreateQuoteRequest = {
      customerName: v.customerName.trim(),
      email: blankToNull(v.email),
      phone: blankToNull(v.phone),
      address: v.address.trim(),
      serviceType: v.serviceType as ServiceType,
      propertyType: v.propertyType as PropertyType,
      season: v.season as Season,
      notes: blankToNull(v.notes),
    };

    this.saving.set(true);
    this.api
      .create(data)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: created => this.router.navigate(['/requests', created.id], { queryParams: { created: 'true' } }),
        error: (err: ApiError) => this.showServerErrors(err),
      });
  }

  // Put the API's messages under the matching fields
  private showServerErrors(err: ApiError): void {
    const otherMessages: string[] = [];
    for (const [key, messages] of Object.entries(err.errors)) {
      const field = this.toFieldName(key);
      if (field) this.form.controls[field].setErrors({ server: messages[0] });
      else otherMessages.push(...messages);
    }

    if (otherMessages.length > 0) this.formMessage.set(otherMessages.join(' '));
    else if (Object.keys(err.errors).length > 0) this.formMessage.set('Please fix the highlighted fields.');
    else this.formMessage.set(err.message);
  }

  // API error keys look like "Email" or "$.email" → form field names look like "email"
  private toFieldName(key: string): Field | null {
    const clean = key.replace(/^\$\./, '');
    const name = clean.charAt(0).toLowerCase() + clean.slice(1);
    return name in this.form.controls ? (name as Field) : null;
  }
}