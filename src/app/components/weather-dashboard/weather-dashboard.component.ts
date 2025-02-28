import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherService } from '../../services/weather.service';
import { HttpClientModule } from '@angular/common/http';
import { 
  trigger, 
  transition, 
  style, 
  animate, 
  state 
} from '@angular/animations';

interface WeatherData {
  location: {
    name: string;
  };
  current: {
    temp_c: number;
    feelslike_c: number;
    humidity: number;
    wind_kph: number;
    condition: {
      text: string;
      icon: string;
    };
    precip_mm: number;
  };
}

interface ForecastData {
  forecast: {
    forecastday: [{
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        daily_chance_of_rain: number;
        daily_chance_of_snow: number;
      };
      astro: {
        sunrise: string;
        sunset: string;
        moonrise: string;
        moonset: string;
        moon_phase: string;
        moon_illumination: string;
      };
    }];
  };
}

@Component({
  selector: 'app-weather-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="dashboard-container">
      <h1 class="app-title">Weather Dashboard</h1>
      <div class="glass-panel">
        <div class="search-container">
          <input 
            type="text" 
            [(ngModel)]="cityName" 
            placeholder="Enter city name"
            (keyup.enter)="getWeather()"
          >
          <button (click)="getWeather()">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="search-icon">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        <!-- Unit Toggle -->
        <div class="unit-toggle">
          <button 
            [class.active]="!isFahrenheit" 
            (click)="setUnit(false)"
          >°C</button>
          <button 
            [class.active]="isFahrenheit" 
            (click)="setUnit(true)"
          >°F</button>
        </div>

        <!-- Loading State -->
        <div class="loading-state" *ngIf="isLoading">
          <div class="loader"></div>
          <p>Loading weather data...</p>
        </div>

        <!-- Error State -->
        <div class="error-state" *ngIf="error" [@fadeIn]>
          <p>{{ error }}</p>
          <button (click)="getWeather()">Try Again</button>
        </div>

        <!-- Weather Data -->
        <div class="weather-container" *ngIf="weatherData && !isLoading && !error" [@fadeIn]>
          <div class="current-weather">
            <h1>{{weatherData.location.name}}</h1>
            <div class="temperature">
              {{convertTemp(weatherData.current.temp_c) | number:'1.0-0'}}°
              <span class="unit">{{isFahrenheit ? 'F' : 'C'}}</span>
            </div>
            
            <!-- Add current condition and high/low temps -->
            <div class="condition-container">
              <img [src]="weatherData.current.condition.icon" 
                   [alt]="weatherData.current.condition.text"
                   class="condition-icon">
              <div class="condition-text">{{weatherData.current.condition.text}}</div>
              <div class="high-low">
                H: {{convertTemp(forecastData.forecast.forecastday[0].day.maxtemp_c) | number:'1.0-0'}}° 
                L: {{convertTemp(forecastData.forecast.forecastday[0].day.mintemp_c) | number:'1.0-0'}}°
              </div>
            </div>

            <!-- Add precipitation chance -->
            <div class="precipitation-info">
              <div class="precip-item" *ngIf="forecastData.forecast.forecastday[0].day.daily_chance_of_rain > 0">
                <svg xmlns="http://www.w3.org/2000/svg" class="weather-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                Rain: {{forecastData.forecast.forecastday[0].day.daily_chance_of_rain}}%
              </div>
              <div class="precip-item" *ngIf="forecastData.forecast.forecastday[0].day.daily_chance_of_snow > 0">
                <svg xmlns="http://www.w3.org/2000/svg" class="weather-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21l-7-7m0 0l-7 7m7-7V3" />
                </svg>
                Snow: {{forecastData.forecast.forecastday[0].day.daily_chance_of_snow}}%
              </div>
              <div class="precip-item" *ngIf="weatherData.current.precip_mm > 0">
                Current: {{weatherData.current.precip_mm}} mm
              </div>
            </div>

            <div class="weather-description">
              <img [src]="weatherData.current.condition.icon" 
                   [alt]="weatherData.current.condition.text">
              <span>{{weatherData.current.condition.text}}</span>
            </div>
            <div class="weather-details">
              <div class="detail">
                <svg xmlns="http://www.w3.org/2000/svg" class="detail-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <span>Humidity</span>
                <span class="value">{{weatherData.current.humidity}}%</span>
              </div>
              <div class="detail">
                <svg xmlns="http://www.w3.org/2000/svg" class="detail-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span>Wind</span>
                <span class="value">{{weatherData.current.wind_kph}} km/h</span>
              </div>
              <div class="detail">
                <svg xmlns="http://www.w3.org/2000/svg" class="detail-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Feels Like</span>
                <span class="value">{{convertTemp(weatherData.current.feelslike_c) | number:'1.0-0'}}°{{isFahrenheit ? 'F' : 'C'}}</span>
              </div>
            </div>
          </div>

          <div class="forecast" *ngIf="forecastData">
            <h2>Astronomical Data</h2>
            <div class="astro-grid">
              <div class="astro-item">
                <svg xmlns="http://www.w3.org/2000/svg" class="astro-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <div class="astro-label">Sunrise</div>
                <div class="astro-value">{{forecastData.forecast.forecastday[0].astro.sunrise}}</div>
              </div>
              <div class="astro-item">
                <svg xmlns="http://www.w3.org/2000/svg" class="astro-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <div class="astro-label">Sunset</div>
                <div class="astro-value">{{forecastData.forecast.forecastday[0].astro.sunset}}</div>
              </div>
              <div class="astro-item">
                <svg xmlns="http://www.w3.org/2000/svg" class="astro-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <div class="astro-label">Moonrise</div>
                <div class="astro-value">{{forecastData.forecast.forecastday[0].astro.moonrise}}</div>
              </div>
              <div class="astro-item">
                <svg xmlns="http://www.w3.org/2000/svg" class="astro-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <div class="astro-label">Moonset</div>
                <div class="astro-value">{{forecastData.forecast.forecastday[0].astro.moonset}}</div>
              </div>
              <div class="astro-item">
                <svg xmlns="http://www.w3.org/2000/svg" class="astro-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <div class="astro-label">Moon Phase</div>
                <div class="astro-value">{{forecastData.forecast.forecastday[0].astro.moon_phase}}</div>
              </div>
              <div class="astro-item">
                <svg xmlns="http://www.w3.org/2000/svg" class="astro-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <div class="astro-label">Moon Illumination</div>
                <div class="astro-value">{{forecastData.forecast.forecastday[0].astro.moon_illumination}}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      width: 100%;
      padding: 2rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
      position: relative;
      overflow: hidden;
    }

    .app-title {
      color: white;
      font-size: 2.5rem;
      font-weight: 300;
      text-align: center;
      margin-top: 1rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      background: linear-gradient(to right, #fff, #a5d8ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    .glass-panel {
      background: rgba(255, 255, 255, 0.1);
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
      will-change: transform;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 24px;
      padding: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
    }

    .glass-panel::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.1) 0%,
        rgba(255, 255, 255, 0.05) 100%
      );
      z-index: 0;
    }

    .search-container {
      position: relative;
      z-index: 1;
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      width: 100%;
    }

    input {
      flex: 1;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      color: white;
      font-size: 1.1rem;
      background: rgba(255, 255, 255, 0.15);
      border: 2px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      backdrop-filter: blur(5px);
      min-width: 0;
    }

    input::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }

    input:focus {
      outline: none;
      background: rgba(255, 255, 255, 0.25);
      border-color: rgba(255, 255, 255, 0.4);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }

    .search-container button {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 48px;
      flex-shrink: 0;
    }

    button:hover {
      background: rgba(82, 152, 255, 0.3);
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.4);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .search-icon {
      width: 24px;
      height: 24px;
      stroke: white;
    }

    button:hover .search-icon {
      transform: scale(1.1);
    }

    .unit-toggle {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin: 1rem 0;
      position: relative;
      z-index: 2;
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
      will-change: transform;
    }

    .unit-toggle button {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      background: #2a5298;
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 50px;
      font-size: 1rem;
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
      will-change: transform;
    }

    .unit-toggle button.active {
      background: #1e3c72;
      border-color: rgba(255, 255, 255, 0.4);
      box-shadow: 0 0 15px rgba(82, 152, 255, 0.4);
      font-weight: 500;
      transform: scale(1.05) translateZ(0);
      -webkit-transform: scale(1.05) translateZ(0);
    }

    .unit-toggle button:hover:not(.active) {
      background: #3a62a8;
      transform: translateY(-2px) translateZ(0);
      -webkit-transform: translateY(-2px) translateZ(0);
    }

    .astro-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-top: 1rem;
      position: relative;
      z-index: 1;
    }

    .astro-item {
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.1) 0%,
        rgba(255, 255, 255, 0.05) 100%
      );
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .astro-item:hover {
      transform: translateY(-5px);
      background: linear-gradient(
        135deg,
        rgba(82, 152, 255, 0.2) 0%,
        rgba(82, 152, 255, 0.1) 100%
      );
      border-color: rgba(82, 152, 255, 0.4);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15),
                  0 0 15px rgba(82, 152, 255, 0.3);
    }

    .astro-icon {
      width: 32px;
      height: 32px;
      stroke: #a5d8ff;
      margin-bottom: 0.5rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .astro-label {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .astro-value {
      color: white;
      font-size: 1.1rem;
      font-weight: 500;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .temperature {
      background: linear-gradient(to right, #a5d8ff, #5298ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 6rem;
      font-weight: 200;
      text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      margin: 1rem 0;
    }

    .weather-details {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .detail {
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.1) 0%,
        rgba(255, 255, 255, 0.05) 100%
      );
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .detail:hover {
      background: linear-gradient(
        135deg,
        rgba(82, 152, 255, 0.15) 0%,
        rgba(82, 152, 255, 0.1) 100%
      );
      border-color: rgba(82, 152, 255, 0.3);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    /* Add some ambient background effects */
    .dashboard-container::before {
      content: '';
      position: fixed;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(
        circle at center,
        rgba(82, 152, 255, 0.1) 0%,
        transparent 60%
      );
      animation: rotate 30s linear infinite;
      z-index: -1;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .weather-container {
      color: white;
    }

    .current-weather {
      text-align: center;
      margin-bottom: 3rem;
    }

    h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 300;
      margin-bottom: 1rem;
    }

    .weather-description {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 1.4rem;
      margin: 1rem 0;
    }

    .weather-description img {
      width: 50px;
      height: 50px;
      filter: brightness(1.2);
    }

    .weather-details {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      margin-top: 2rem;
    }

    .detail {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      transition: transform 0.3s ease;
    }

    .detail:hover {
      transform: translateY(-5px);
    }

    .detail-icon {
      width: 24px;
      height: 24px;
      stroke: white;
    }

    .detail span {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .detail .value {
      font-size: 1.2rem;
      font-weight: 500;
    }

    .forecast {
      margin-top: 2rem;
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 300;
      margin-bottom: 1rem;
    }

    @media (max-width: 768px) {
      .app-title {
        font-size: 2rem;
        margin-top: 0.5rem;
      }

      .dashboard-container {
        padding: 1rem;
        gap: 1rem;
      }

      .glass-panel {
        padding: 1.5rem;
      }

      .search-container {
        gap: 0.5rem;
      }

      input {
        padding: 0.8rem 1rem;
        font-size: 1rem;
      }

      .search-container button {
        padding: 0.8rem;
      }

      .search-icon {
        width: 20px;
        height: 20px;
      }

      .weather-details {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .temperature {
        font-size: 4rem;
      }

      h1 {
        font-size: 2rem;
      }

      .astro-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }
    }

    @media (max-width: 480px) {
      .weather-details {
        grid-template-columns: 1fr;
      }

      .temperature {
        font-size: 3.5rem;
      }

      .astro-grid {
        grid-template-columns: 1fr;
      }

      .astro-item {
        padding: 1rem;
      }

      .dashboard-container {
        padding: 0.5rem;
      }

      .glass-panel {
        padding: 1rem;
      }

      .search-container {
        margin-bottom: 1rem;
      }
    }

    .loading-state {
      text-align: center;
      padding: 2rem;
      color: white;
    }

    .loader {
      width: 48px;
      height: 48px;
      border: 5px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: white;
      margin: 0 auto 1rem;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .error-state {
      text-align: center;
      padding: 2rem;
      color: white;
    }

    .error-state p {
      margin-bottom: 1rem;
      color: #ff6b6b;
    }

    .error-state button {
      background: rgba(255,255,255,0.2);
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      color: white;
      cursor: pointer;
    }

    .unit {
      font-size: 2rem;
      vertical-align: super;
      margin-left: 0.5rem;
    }

    .condition-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      margin: 1rem 0;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      backdrop-filter: blur(5px);
    }

    .condition-icon {
      width: 64px;
      height: 64px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .condition-text {
      font-size: 1.4rem;
      color: white;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .high-low {
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.9);
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .precipitation-info {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      margin: 1rem 0;
      flex-wrap: wrap;
    }

    .precip-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: white;
      font-size: 1rem;
      backdrop-filter: blur(5px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .precip-item:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
    }

    .weather-icon {
      width: 20px;
      height: 20px;
      stroke: #a5d8ff;
    }

    @media (max-width: 480px) {
      .precipitation-info {
        flex-direction: column;
        gap: 0.5rem;
      }

      .condition-text {
        font-size: 1.2rem;
      }

      .high-low {
        font-size: 1rem;
      }
    }
  `],
  animations: [
    trigger('fadeIn', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(20px)'
      })),
      transition(':enter', [
        animate('300ms ease-out', style({
          opacity: 1,
          transform: 'translateY(0)'
        }))
      ])
    ])
  ]
})
export class WeatherDashboardComponent implements OnInit {
  cityName: string = '';
  weatherData: WeatherData | null = null;
  forecastData!: ForecastData;
  isLoading: boolean = false;
  error: string | null = null;
  isFahrenheit: boolean = true;

  constructor(private weatherService: WeatherService) {}

  ngOnInit() {
    this.cityName = 'washington, dc';
    this.getWeather();
  }

  setUnit(fahrenheit: boolean) {
    this.isFahrenheit = fahrenheit;
    console.log('Temperature unit changed to:', fahrenheit ? 'Fahrenheit' : 'Celsius');
  }

  convertTemp(celsius: number): number {
    if (this.isFahrenheit) {
      return (celsius * 9/5) + 32;
    }
    return celsius;
  }

  getWeather() {
    if (!this.cityName.trim()) {
      this.error = 'Please enter a city name';
      return;
    }

    this.isLoading = true;
    this.error = null;

    const cleanCityName = this.cityName.trim().toLowerCase();
    console.log('Searching for city:', cleanCityName);

    this.weatherService.getWeatherByCity(cleanCityName).subscribe({
      next: (data) => {
        console.log('Weather data received:', data);
        this.weatherData = data;
        this.getForcast();
      },
      error: (err) => {
        console.error('Weather API error:', err);
        this.error = 'Unable to fetch weather data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  getForcast() {
    const cleanCityName = this.cityName.trim().toLowerCase();
    this.weatherService.getForecast(cleanCityName).subscribe({
      next: (data) => {
        console.log('Forecast data received:', data);
        const currentHour = new Date().getHours();
        const hourlyData = data.forecast.forecastday[0].hour;
        const futureHours = hourlyData.slice(currentHour);
        const pastHours = hourlyData.slice(0, currentHour);
        data.forecast.forecastday[0].hour = [...futureHours, ...pastHours];
        
        this.forecastData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Forecast API error:', err);
        this.error = 'Unable to fetch forecast data. Please try again.';
        this.isLoading = false;
      }
    });
  }
} 