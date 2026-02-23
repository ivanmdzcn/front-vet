import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { OrdenPagoReporte } from '../../../core/models/orden-pago-reporte.models';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener reporte completo de orden de pago
   */
  getOrdenPagoReporte(ordenId: number): Observable<OrdenPagoReporte> {
    return this.http.get<OrdenPagoReporte>(`${this.apiUrl}/orden-pago/${ordenId}`);
  }

  /**
   * Construir URL completa para el logo de la empresa
   * @param logoPath URL relativa del logo (ej: /uploads/empresa/logo.png)
   * @returns URL completa (ej: http://localhost:5292/uploads/empresa/logo.png)
   */
  getLogoUrl(logoPath: string): string {
    if (!logoPath) return '';
    if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) return logoPath;
    // Quitar /api del environment.apiUrl para acceder a archivos estáticos
    return `${environment.apiUrl.replace('/api', '')}${logoPath}`;
  }
}
