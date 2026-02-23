import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Rol, RolConPermisos, CreateRolDto, UpdateRolDto, AsignarPermisosDto } from '../../../core/models/rol.models';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/roles`;

  getAll(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.apiUrl);
  }

  getById(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.apiUrl}/${id}`);
  }

  getConPermisos(id: number): Observable<RolConPermisos> {
    return this.http.get<RolConPermisos>(`${this.apiUrl}/${id}/permisos`);
  }

  create(rol: CreateRolDto): Observable<Rol> {
    return this.http.post<Rol>(this.apiUrl, rol);
  }

  update(id: number, rol: UpdateRolDto): Observable<Rol> {
    return this.http.put<Rol>(`${this.apiUrl}/${id}`, rol);
  }

  asignarPermisos(rolId: number, dto: AsignarPermisosDto): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${rolId}/asignar-permisos`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}