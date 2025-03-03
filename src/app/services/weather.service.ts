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
  private baseUrl = '/api';
//   private baseUrl = environment.weatherApiBaseUrl;


  // In weather.service.ts constructor
  constructor(private http: HttpClient) {
    console.log('Weather service initialized with:');
    console.log('API URL:', this.baseUrl);
    console.log('API Key present:', !!this.apiKey);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred';
    if (error.error && error.error.error) {
      errorMessage = error.error.error.message;
    }
    return throwError(() => errorMessage);
  }
/*
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
    */
  getWeatherByCity(city: string): Observable<any> {
    const encodedCity = encodeURIComponent(city);
    // Use your Netlify function as a proxy
    const url = `/.netlify/functions/weather-proxy`;
    
    // Send parameters to the proxy
    const params = {
      endpoint: '/current.json',
      q: encodedCity,
      aqi: 'no'
    };
    
    return this.http.get(url, { params }).pipe(
      catchError(this.handleError)
    );
  }
  
  getForecast(city: string): Observable<any> {
    const encodedCity = encodeURIComponent(city);
    // Use your Netlify function as a proxy
    const url = `/.netlify/functions/weather-proxy`;
    
    // Send parameters to the proxy
    const params = {
      endpoint: '/forecast.json',
      q: encodedCity,
      days: '1',
      aqi: 'no',
      hour: '24'
    };
    
    return this.http.get(url, { params }).pipe(
      catchError(this.handleError)
    );
  }
} 