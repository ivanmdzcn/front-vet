import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConfiguracionEmpresa, CreateConfiguracionDto, UpdateConfiguracionDto } from '../models/configuracion.models';

export interface Result<T> {
  isSuccess: boolean;
  data?: T;
  errorMessage?: string;
  message?: string;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ConfiguracionEmpresa`;

  getConfiguracion(): Observable<Result<ConfiguracionEmpresa>> {
    return this.http.get<Result<ConfiguracionEmpresa>>(this.apiUrl);
  }

  getConfiguracionById(id: number): Observable<Result<ConfiguracionEmpresa>> {
    return this.http.get<Result<ConfiguracionEmpresa>>(`${this.apiUrl}/${id}`);
  }

  crear(dto: CreateConfiguracionDto): Observable<Result<ConfiguracionEmpresa>> {
    return this.http.post<Result<ConfiguracionEmpresa>>(this.apiUrl, dto);
  }

  actualizar(id: number, dto: UpdateConfiguracionDto): Observable<Result<ConfiguracionEmpresa>> {
    return this.http.put<Result<ConfiguracionEmpresa>>(`${this.apiUrl}/${id}`, dto);
  }

  uploadLogo(file: File): Observable<{ logoUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ logoUrl: string }>(`${this.apiUrl}/logo`, formData);
  }

  /**
   * Convierte una URL relativa de logo en una URL absoluta
   * @param logoUrl URL relativa del logo (ej: /uploads/empresa/logo.png)
   * @returns URL completa (ej: http://localhost:5292/uploads/empresa/logo.png)
   */
  getFullImageUrl(logoUrl: string | null): string | null {
    if (!logoUrl) return null;
    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      return logoUrl;
    }
    return `${environment.apiUrl.replace('/api', '')}${logoUrl}`;
  }
}
