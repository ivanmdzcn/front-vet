import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';

import { RolService } from '../services/rol.service';
import { PermisoService } from '../../permisos/services/permiso.service';
import { Rol, RolConPermisos, AsignarPermisosDto } from '../../../core/models/rol.models';
import { PermisoAgrupado, Permiso } from '../../../core/models/permiso.models';

@Component({
  selector: 'app-asignar-permisos',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatDividerModule
  ],
  templateUrl: './asignar-permisos.component.html',
  styleUrl: './asignar-permisos.component.scss'
})
export class AsignarPermisosComponent implements OnInit {
  private rolService = inject(RolService);
  private permisoService = inject(PermisoService);
  private dialogRef = inject(MatDialogRef<AsignarPermisosComponent>);
  rol: Rol = inject(MAT_DIALOG_DATA);

  loading = signal(true);
  saving = signal(false);
  
  permisosAgrupados = signal<PermisoAgrupado[]>([]);
  permisosAsignados = signal<Map<number, boolean>>(new Map());

  ngOnInit(): void {
    this.loadPermisos();
  }

  loadPermisos(): void {
    this.loading.set(true);
    
    // Cargar rol con permisos
    this.rolService.getConPermisos(this.rol.id).subscribe({
      next: (rolConPermisos: RolConPermisos) => {
        // Crear mapa de permisos asignados
        const map = new Map<number, boolean>();
        rolConPermisos.permisos.forEach(p => {
          map.set(p.permisoId, p.asignado);
        });
        this.permisosAsignados.set(map);

        // Agrupar permisos por módulo
        this.agruparPermisos(rolConPermisos.permisos.map(p => ({
          id: p.permisoId,
          codigo: p.codigo,
          modulo: p.modulo,
          accion: p.accion,
          descripcion: null
        })));

        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar permisos:', error);
        this.loading.set(false);
      }
    });
  }

  private agruparPermisos(permisos: Permiso[]): void {
    const grupos = new Map<string, Permiso[]>();
    
    permisos.forEach(permiso => {
      if (!grupos.has(permiso.modulo)) {
        grupos.set(permiso.modulo, []);
      }
      grupos.get(permiso.modulo)!.push(permiso);
    });

    const agrupados = Array.from(grupos.entries()).map(([modulo, permisos]) => ({
      modulo,
      permisos
    }));

    this.permisosAgrupados.set(agrupados);
  }

  togglePermiso(permisoId: number): void {
    const map = this.permisosAsignados();
    map.set(permisoId, !map.get(permisoId));
    this.permisosAsignados.set(new Map(map));
  }

  isPermisoAsignado(permisoId: number): boolean {
    return this.permisosAsignados().get(permisoId) || false;
  }

  selectAllInModule(modulo: PermisoAgrupado, select: boolean): void {
    const map = this.permisosAsignados();
    modulo.permisos.forEach(p => {
      map.set(p.id, select);
    });
    this.permisosAsignados.set(new Map(map));
  }

  isModuleFullySelected(modulo: PermisoAgrupado): boolean {
    return modulo.permisos.every(p => this.isPermisoAsignado(p.id));
  }

  isModulePartiallySelected(modulo: PermisoAgrupado): boolean {
    const selected = modulo.permisos.filter(p => this.isPermisoAsignado(p.id)).length;
    return selected > 0 && selected < modulo.permisos.length;
  }

  onSave(): void {
    this.saving.set(true);

    const permisosIds = Array.from(this.permisosAsignados().entries())
      .filter(([_, asignado]) => asignado)
      .map(([id, _]) => id);

    const dto: AsignarPermisosDto = {
      permisosIds
    };

    this.rolService.asignarPermisos(this.rol.id, dto).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error al asignar permisos:', error);
        this.saving.set(false);
        alert('Error al asignar permisos');
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getSelectedCount(): number {
    return Array.from(this.permisosAsignados().values()).filter(v => v).length;
  }

  getTotalCount(): number {
    return this.permisosAgrupados().reduce((total, grupo) => total + grupo.permisos.length, 0);
  }

  getModuleIcon(modulo: string): string {
    const icons: { [key: string]: string } = {
      'Clientes': 'people',
      'Mascotas': 'pets',
      'Citas': 'event',
      'Consultas': 'medical_services',
      'Usuarios': 'person',
      'Roles': 'admin_panel_settings'
    };
    return icons[modulo] || 'folder';
  }
}