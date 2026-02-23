import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Cita, CreateCitaDto, UpdateCitaDto, EstadoCita } from '../../../core/models/cita.models';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/citas`;

  getAll(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.apiUrl);
  }

  getById(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.apiUrl}/${id}`);
  }

  getByFecha(fecha: Date): Observable<Cita[]> {
    const fechaStr = fecha.toISOString().split('T')[0];
    return this.http.get<Cita[]>(`${this.apiUrl}/fecha/${fechaStr}`);
  }

  getByVeterinario(veterinarioId: number, fechaInicio?: Date, fechaFin?: Date): Observable<Cita[]> {
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
    
    return this.http.get<Cita[]>(url);
  }

  getByCliente(clienteId: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/cliente/${clienteId}`);
  }

  getByMascota(mascotaId: number): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/mascota/${mascotaId}`);
  }

  create(cita: CreateCitaDto): Observable<Cita> {
    return this.http.post<Cita>(this.apiUrl, cita);
  }

  update(id: number, cita: UpdateCitaDto): Observable<Cita> {
    return this.http.put<Cita>(`${this.apiUrl}/${id}`, cita);
  }

  cambiarEstado(id: number, nuevoEstado: EstadoCita): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, {
      id,
      nuevoEstado
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}