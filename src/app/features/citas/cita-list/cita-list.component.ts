import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';  // ✅ CORREGIDO: chips (con 's')
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';  // ✅ AGREGAR ESTE

import { CitaService } from '../services/cita.service';
import { Cita, EstadoCita } from '../../../core/models/cita.models';
import { CitaFormComponent } from '../cita-form/cita-form.component';

import { ConsultaFormComponent } from '../../consultas/consulta-form/consulta-form.component';


@Component({
  selector: 'app-cita-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule  // ✅ AGREGAR AQUÍ
  ],
  templateUrl: './cita-list.component.html',
  styleUrl: './cita-list.component.scss'
})
export class CitaListComponent implements OnInit {
  private citaService = inject(CitaService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  citas = signal<Cita[]>([]);
  displayedCitas = signal<Cita[]>([]);
  loading = signal(true);

  fechaFiltro = new FormControl<Date | null>(null);

  displayedColumns: string[] = ['fechaHora', 'mascota', 'cliente', 'veterinario', 'motivo', 'estado', 'acciones'];

  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  EstadoCita = EstadoCita;

  ngOnInit(): void {
    this.loadCitas();
    this.setupFechaFilter();
  }

  setupFechaFilter(): void {
    this.fechaFiltro.valueChanges.subscribe(fecha => {
      if (fecha) {
        this.filterByFecha(fecha);
      } else {
        this.loadCitas();
      }
    });
  }

  loadCitas(): void {
    this.loading.set(true);
    this.citaService.getAll().subscribe({
      next: (data) => {
        this.citas.set(data);
        this.totalItems = data.length;
        this.updateDisplayedCitas();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
        this.showMessage('Error al cargar citas');
        this.loading.set(false);
      }
    });
  }

  filterByFecha(fecha: Date): void {
    this.loading.set(true);
    this.citaService.getByFecha(fecha).subscribe({
      next: (data) => {
        this.citas.set(data);
        this.totalItems = data.length;
        this.pageIndex = 0;
        this.updateDisplayedCitas();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al filtrar citas:', error);
        this.showMessage('Error al filtrar citas');
        this.loading.set(false);
      }
    });
  }

  updateDisplayedCitas(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedCitas.set(this.citas().slice(startIndex, endIndex));
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updateDisplayedCitas();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CitaFormComponent, {
      width: '700px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCitas();
        this.showMessage('Cita creada exitosamente');
      }
    });
  }

  openEditDialog(cita: Cita): void {
    const dialogRef = this.dialog.open(CitaFormComponent, {
      width: '700px',
      disableClose: true,
      data: cita
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCitas();
        this.showMessage('Cita actualizada exitosamente');
      }
    });
  }

  cambiarEstado(cita: Cita, nuevoEstado: EstadoCita): void {
    this.citaService.cambiarEstado(cita.id, nuevoEstado).subscribe({
      next: () => {
        this.loadCitas();
        this.showMessage('Estado actualizado exitosamente');
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        this.showMessage('Error al cambiar estado');
      }
    });
  }

  deleteCita(cita: Cita): void {
    if (confirm(`¿Está seguro de cancelar la cita de ${cita.mascotaNombre}?`)) {
      this.citaService.delete(cita.id).subscribe({
        next: () => {
          this.loadCitas();
          this.showMessage('Cita cancelada exitosamente');
        },
        error: (error) => {
          console.error('Error al cancelar cita:', error);
          this.showMessage('Error al cancelar cita');
        }
      });
    }
  }

  getEstadoClass(estado: EstadoCita): string {
    switch (estado) {
      case EstadoCita.Pendiente:
        return 'estado-pendiente';
      case EstadoCita.Confirmada:
        return 'estado-confirmada';
      case EstadoCita.Completada:
        return 'estado-completada';
      case EstadoCita.Cancelada:
        return 'estado-cancelada';
      case EstadoCita.NoAsistio:
        return 'estado-no-asistio';
      default:
        return '';
    }
  }

  formatFechaHora(fecha: Date): string {
    const date = new Date(fecha);
    return date.toLocaleString('es-GT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  clearFiltro(): void {
    this.fechaFiltro.setValue(null);
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  // NUEVO MÉTODO PARA ABRIR EL FORMULARIO DE CONSULTA DESDE LA CITA
  atenderCita(cita: Cita): void {
    const dialogRef = this.dialog.open(ConsultaFormComponent, {
      width: '800px',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        citaId: cita.id,
        mascotaId: cita.mascotaId,
        clienteId: cita.clienteId,
        veterinarioId: cita.veterinarioId,
        fechaHora: new Date(),
        motivo: cita.motivo
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCitas();
        this.showMessage('Consulta registrada y cita completada');
      }
    });
  }
}