import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardSummary } from '../../../core/models/dashboard-summary.models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSummary(fecha?: string): Observable<DashboardSummary> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);
    const url = `${this.baseUrl}/dashboard/summary`;
    return this.http.get<DashboardSummary>(url, { params });
  }
}
