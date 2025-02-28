import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = environment.weatherApiKey;
  private baseUrl = environment.weatherApiBaseUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred';
    if (error.error && error.error.error) {
      errorMessage = error.error.error.message;
    }
    return throwError(() => errorMessage);
  }

  getWeatherByCity(city: string): Observable<any> {
    const encodedCity = encodeURIComponent(city);
    const url = `${this.baseUrl}/current.json?key=${this.apiKey}&q=${encodedCity}&aqi=no`;
    
    console.log('Requesting weather for URL:', url); // Debug log
    
    return this.http.get(url).pipe(
      tap(response => console.log('Raw weather response:', response)),
      catchError(this.handleError)
    );
  }

  getForecast(city: string): Observable<any> {
    const encodedCity = encodeURIComponent(city);
    const url = `${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${encodedCity}&days=1&aqi=no&hour=24`;
    
    console.log('Requesting forecast for URL:', url); // Debug log
    
    return this.http.get(url).pipe(
      tap(response => console.log('Raw forecast response:', response)),
      catchError(this.handleError)
    );
  }
} 