import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ReviewResponse, ReviewListItem } from '../models/review';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private apiUrl = 'http://localhost:3000/api/reviews';

  constructor(private http: HttpClient) {}

  private handleError(err: HttpErrorResponse): Observable<never> {
    return throwError(() => err.error || { message: 'Unknown error' });
  }

  registerReview(formData: FormData): Observable<ReviewResponse> {
    return this.http
      .post<ReviewResponse>(this.apiUrl, formData)
      .pipe(catchError(this.handleError));
  }

  getRecentReviews(serviceId?: string, limit: number = 5): Observable<ReviewListItem[]> {
    let url = `${this.apiUrl}/recent?limit=${limit}`;
    if (serviceId) {
      url += `&serviceId=${serviceId}`;
    }
    return this.http
      .get<ReviewListItem[]>(url)
      .pipe(catchError(this.handleError));
  }
}