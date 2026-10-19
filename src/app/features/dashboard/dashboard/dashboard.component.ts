import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../services/dashboard.service';
import { DashboardSummary } from '../../../core/models/dashboard-summary.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);

  currentUser = this.authService.getCurrentUser();
  summary = signal<DashboardSummary | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(fecha?: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.dashboardService.getSummary(fecha).subscribe({
      next: (data) => {
        this.summary.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? err?.message ?? 'Error al obtener resumen');
        console.error('Error al cargar dashboard:', err);
      }
    });
  }
}