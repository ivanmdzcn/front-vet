import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Consulta, CreateConsultaDto, UpdateConsultaDto } from '../../../core/models/consulta.models';

@Injectable({
  providedIn: 'root'
})
export class ConsultaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/consultas`;

  getAll(): Observable<Consulta[]> {
    return this.http.get<Consulta[]>(this.apiUrl);
  }

  getById(id: number): Observable<Consulta> {
    return this.http.get<Consulta>(`${this.apiUrl}/${id}`);
  }

  getByMascotaId(mascotaId: number): Observable<Consulta[]> {
    return this.http.get<Consulta[]>(`${this.apiUrl}/mascota/${mascotaId}`);
  }

  getByClienteId(clienteId: number): Observable<Consulta[]> {
    return this.http.get<Consulta[]>(`${this.apiUrl}/cliente/${clienteId}`);
  }

  getByVeterinarioId(veterinarioId: number, fechaInicio?: Date, fechaFin?: Date): Observable<Consulta[]> {
    let url = `${this.apiUrl}/veterinario/${veterinarioId}`;
    const params: string[] = [];
    
    if (fechaInicio) {
      params.push(`fechaInicio=${fechaInicio.toISOString()}`);
    }
    if (fechaFin) {
      params.push(`fechaFin=${fechaFin.toISOString()}`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    return this.http.get<Consulta[]>(url);
  }

  getByCitaId(citaId: number): Observable<Consulta[]> {
    return this.http.get<Consulta[]>(`${this.apiUrl}/cita/${citaId}`);
  }

  create(consulta: CreateConsultaDto): Observable<Consulta> {
    return this.http.post<Consulta>(this.apiUrl, consulta);
  }

  update(id: number, consulta: UpdateConsultaDto): Observable<Consulta> {
    return this.http.put<Consulta>(`${this.apiUrl}/${id}`, consulta);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}