import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { RolService } from '../services/rol.service';
import { Rol } from '../../../core/models/rol.models';
import { RolFormComponent } from '../rol-form/rol-form.component';
import { AsignarPermisosComponent } from '../asignar-permisos/asignar-permisos.component';

@Component({
  selector: 'app-rol-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './rol-list.component.html',
  styleUrl: './rol-list.component.scss'
})
export class RolListComponent implements OnInit {
  private rolService = inject(RolService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  roles = signal<Rol[]>([]);
  displayedRoles = signal<Rol[]>([]);
  loading = signal(true);
  
  displayedColumns: string[] = ['nombre', 'descripcion', 'acciones'];
  
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading.set(true);
    this.rolService.getAll().subscribe({
      next: (data) => {
        this.roles.set(data);
        this.totalItems = data.length;
        this.updateDisplayedRoles();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.showMessage('Error al cargar roles');
        this.loading.set(false);
      }
    });
  }

  updateDisplayedRoles(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedRoles.set(this.roles().slice(startIndex, endIndex));
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updateDisplayedRoles();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(RolFormComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRoles();
        this.showMessage('Rol creado exitosamente');
      }
    });
  }

  openEditDialog(rol: Rol): void {
    const dialogRef = this.dialog.open(RolFormComponent, {
      width: '600px',
      disableClose: true,
      data: rol
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadRoles();
        this.showMessage('Rol actualizado exitosamente');
      }
    });
  }

  openPermisosDialog(rol: Rol): void {
    const dialogRef = this.dialog.open(AsignarPermisosComponent, {
      width: '800px',
      maxHeight: '90vh',
      disableClose: true,
      data: rol
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showMessage('Permisos actualizados exitosamente');
      }
    });
  }

  deleteRol(rol: Rol): void {
    if (confirm(`¿Está seguro de eliminar el rol ${rol.nombre}?`)) {
      this.rolService.delete(rol.id).subscribe({
        next: () => {
          this.loadRoles();
          this.showMessage('Rol eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar rol:', error);
          this.showMessage('Error al eliminar rol');
        }
      });
    }
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}