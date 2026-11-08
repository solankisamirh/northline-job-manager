import { HttpClient, HttpParams, HttpResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { CreateQuoteRequest, QuoteFilters, QuoteRequest, Summary, UpdateStatus } from "../models/quote-request";
import { catchError, Observable, throwError } from "rxjs";

// An error that carries the API's readable messages 
export class ApiError extends Error { 
    readonly status: number;
    readonly errors: Record<string, string[]>;
    readonly messages: string[];
    
  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
    const all = Object.values(errors).flat();
    this.messages = all.length > 0 ? all : [message];
  }
}

@Injectable({
  providedIn: "root"
})
export class QuoteRequestService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/quoterequests`;

  getAll(filters: QuoteFilters = {}): Observable<QuoteRequest[]> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) params = params.set(key, value);
    }
    return this.http.get<QuoteRequest[]>(`${this.baseUrl}`, { params }).pipe(catchError(toApiError));
  }

  getById(id: number): Observable<QuoteRequest> {
    return this.http.get<QuoteRequest>(`${this.baseUrl}/${id}`).pipe(catchError(toApiError));
  } 

  create(data: CreateQuoteRequest): Observable<QuoteRequest> {
    return this.http.post<QuoteRequest>(this.baseUrl, data).pipe(catchError(toApiError));
  } 

  updateStatus(id: number, data: UpdateStatus): Observable<QuoteRequest> {
    return this.http.patch<QuoteRequest>(`${this.baseUrl}/${id}/status`, data).pipe(catchError(toApiError));
  } 

  getSummary(): Observable<Summary> {
    return this.http.get<Summary>(`${this.baseUrl}/summary`).pipe(catchError(toApiError));
  };
}

// Turns any HTTP failure into an ApiError with readable messages
function toApiError(err: any): Observable<never> {
  // Status 0 = no answer at all (API not running, network or CORS problem)
  if (err.status === 0) {
    return throwError(() => new ApiError(0, "Could not reach the server. Is the API running?"));
  }

  let message = `Request failed (${err.status})`;
  let errors: Record<string, string[]> = {};
  const body: unknown = err.error;

  if(body && typeof body === 'object') {
    const b = body as Record<string, unknown>;
    if (typeof b['title'] === 'string') message = b['title'];
     if (typeof b['detail'] === 'string') message = b['detail'];
        errors = normalizeErrors(b['errors']);
  }

  return throwError(() => new ApiError(err.status, message, errors));
}

// The API's "errors" part → { field: [messages] }, whatever shape it has
function normalizeErrors(raw: unknown): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        for (const [field, value] of Object.entries(raw)) {
           const list = toMessages(value);
           if (list.length > 0 ) result[field] = list;
        }
    }
    return result; 
}

// Any value (text, list, object with a message) → a list of text messages
function toMessages(value: unknown): string[] {
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return value.flatMap(toMessages);
    if (value && typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        for (const key of ['errorMessage', 'message', 'detail']) {
            if(typeof obj[key] === 'string') return [obj[key] as string];
        }
        return Object.values(obj).flatMap(toMessages);
    }
    return [];
}