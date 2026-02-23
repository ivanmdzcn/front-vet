import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Mascota, CreateMascotaDto, UpdateMascotaDto } from '../../../core/models/mascota.models';

@Injectable({
  providedIn: 'root'
})
export class MascotaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/mascotas`;

  getAll(): Observable<Mascota[]> {
    return this.http.get<Mascota[]>(this.apiUrl);
  }

  getById(id: number): Observable<Mascota> {
    return this.http.get<Mascota>(`${this.apiUrl}/${id}`);
  }

  getByClienteId(clienteId: number): Observable<Mascota[]> {
    return this.http.get<Mascota[]>(`${this.apiUrl}/cliente/${clienteId}`);
  }

  search(query: string): Observable<Mascota[]> {
    return this.http.get<Mascota[]>(`${this.apiUrl}/buscar?q=${query}`);
  }

  create(mascota: CreateMascotaDto): Observable<Mascota> {
    return this.http.post<Mascota>(this.apiUrl, mascota);
  }

  update(id: number, mascota: UpdateMascotaDto): Observable<Mascota> {
    return this.http.put<Mascota>(`${this.apiUrl}/${id}`, mascota);
  }

  uploadPhoto(id: number, file: File): Observable<{ fotoUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ fotoUrl: string }>(`${this.apiUrl}/${id}/foto`, formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Convierte una URL relativa de imagen en una URL absoluta
   * @param fotoUrl URL relativa de la foto (ej: /uploads/mascotas/imagen.jpg)
   * @returns URL completa (ej: http://localhost:5292/uploads/mascotas/imagen.jpg)
   */
  getFullImageUrl(fotoUrl: string | null): string | null {
    if (!fotoUrl) return null;
    
    // Si ya es una URL completa (http:// o https://), devolverla tal cual
    if (fotoUrl.startsWith('http://') || fotoUrl.startsWith('https://')) {
      return fotoUrl;
    }
    
    // Si es una URL relativa, agregar la base del API
    // Quitar /api del environment.apiUrl y agregar la ruta relativa
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}${fotoUrl.startsWith('/') ? fotoUrl : '/' + fotoUrl}`;
  }
}