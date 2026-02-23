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

import { UsuarioService } from '../services/usuario.service';
import { Usuario } from '../../../core/models/usuario.models';
import { UsuarioFormComponent } from '../usuario-form/usuario-form.component';

@Component({
  selector: 'app-usuario-list',
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
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.scss'
})
export class UsuarioListComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  usuarios = signal<Usuario[]>([]);
  displayedUsuarios = signal<Usuario[]>([]);
  loading = signal(true);
  
  displayedColumns: string[] = ['username', 'nombreCompleto', 'email', 'rol', 'estado', 'acciones'];
  
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.loading.set(true);
    this.usuarioService.getAll().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.totalItems = data.length;
        this.updateDisplayedUsuarios();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.showMessage('Error al cargar usuarios');
        this.loading.set(false);
      }
    });
  }

  updateDisplayedUsuarios(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedUsuarios.set(this.usuarios().slice(startIndex, endIndex));
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updateDisplayedUsuarios();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UsuarioFormComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsuarios();
        this.showMessage('Usuario creado exitosamente');
      }
    });
  }

  openEditDialog(usuario: Usuario): void {
    const dialogRef = this.dialog.open(UsuarioFormComponent, {
      width: '600px',
      disableClose: true,
      data: usuario
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsuarios();
        this.showMessage('Usuario actualizado exitosamente');
      }
    });
  }

  deleteUsuario(usuario: Usuario): void {
    if (confirm(`¿Está seguro de eliminar al usuario ${usuario.username}?`)) {
      this.usuarioService.delete(usuario.id).subscribe({
        next: () => {
          this.loadUsuarios();
          this.showMessage('Usuario eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar usuario:', error);
          this.showMessage('Error al eliminar usuario');
        }
      });
    }
  }

  getRolClass(rol: string): string {
    const rolLower = rol.toLowerCase();
    if (rolLower.includes('admin')) return 'rol-admin';
    if (rolLower.includes('veterinario')) return 'rol-veterinario';
    if (rolLower.includes('recepcion')) return 'rol-recepcionista';
    return 'rol-default';
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}