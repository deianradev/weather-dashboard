import { Component } from '@angular/core';
import { WeatherDashboardComponent } from './components/weather-dashboard/weather-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WeatherDashboardComponent],
  template: `
    <app-weather-dashboard></app-weather-dashboard>
  `
})
export class AppComponent {}
