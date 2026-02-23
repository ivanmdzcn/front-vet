import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Permiso, PermisoAgrupado } from '../../../core/models/permiso.models';

@Injectable({
  providedIn: 'root'
})
export class PermisoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/permisos`;

  getAll(): Observable<Permiso[]> {
    return this.http.get<Permiso[]>(this.apiUrl);
  }

  getAllAgrupados(): Observable<PermisoAgrupado[]> {
    return this.getAll().pipe(
      map(permisos => this.agruparPorModulo(permisos))
    );
  }

  private agruparPorModulo(permisos: Permiso[]): PermisoAgrupado[] {
    const grupos = new Map<string, Permiso[]>();
    
    permisos.forEach(permiso => {
      if (!grupos.has(permiso.modulo)) {
        grupos.set(permiso.modulo, []);
      }
      grupos.get(permiso.modulo)!.push(permiso);
    });

    return Array.from(grupos.entries()).map(([modulo, permisos]) => ({
      modulo,
      permisos
    }));
  }
}