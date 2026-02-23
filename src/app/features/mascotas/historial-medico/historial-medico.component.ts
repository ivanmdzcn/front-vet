import { Component, inject, OnInit, signal, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog
} from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HistorialMedicoService } from '../services/historial-medico.service';
import {
  HistorialMedicoCompleto,
  Vacuna,
  Desparasitacion,
  ExamenLaboratorio,
  Cirugia,
  Alergia,
  AntecedentePatologico,
  RecetaMedicamento
} from '../../../core/models/historial-medico.models';
import { VacunaFormComponent } from './forms/vacuna-form.component';
import { DesparasitacionFormComponent } from './forms/desparasitacion-form.component';
import { ExamenLaboratorioFormComponent } from './forms/examen-laboratorio-form.component';
import { CirugiaFormComponent } from './forms/cirugia-form.component';
import { AlergiaFormComponent } from './forms/alergia-form.component';
import { AntecedentePatologicoFormComponent } from './forms/antecedente-patologico-form.component';
import { RecetaMedicamentoFormComponent } from './forms/receta-medicamento-form.component';

export interface HistorialMedicoDialogData {
  mascotaId: number;
  mascotaNombre: string;
  mascotaEspecie: string;
  mascotaRaza: string | null;
  mascotaEdadAnios: number | null;
  clienteNombre: string;
}

@Component({
  selector: 'app-historial-medico',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './historial-medico.component.html',
  styleUrls: ['./historial-medico.component.scss']
})
export class HistorialMedicoComponent implements OnInit {
  private historialService = inject(HistorialMedicoService);
  private dialogRef = inject(MatDialogRef<HistorialMedicoComponent>);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  historial = signal<HistorialMedicoCompleto | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor(@Inject(MAT_DIALOG_DATA) public data: HistorialMedicoDialogData) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.loading.set(true);
    this.error.set(null);

    this.historialService.getHistorialCompleto(this.data.mascotaId).subscribe({
      next: (historial) => {
        // Sobrescribir los datos de la mascota con los datos reales del diálogo
        historial.mascota.nombre = this.data.mascotaNombre;
        historial.mascota.especie = this.data.mascotaEspecie;
        historial.mascota.raza = this.data.mascotaRaza;
        historial.mascota.edadAnios = this.data.mascotaEdadAnios;
        historial.mascota.clienteNombre = this.data.clienteNombre;
        
        this.historial.set(historial);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar historial médico:', err);
        this.error.set('Error al cargar el historial médico');
        this.loading.set(false);
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  // Utility methods para formatear fechas
  formatFecha(fecha: Date | null): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  formatFechaHora(fecha: Date | null): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Métodos para descargar archivos
  descargarArchivo(url: string | null): void {
    if (!url) return;
    const fullUrl = this.historialService.getFullFileUrl(url);
    if (fullUrl) {
      window.open(fullUrl, '_blank');
    }
  }

  // Métodos para agregar nuevos registros
  agregarVacuna(): void {
    const dialogRef = this.dialog.open(VacunaFormComponent, {
      width: '600px',
      data: { mascotaId: this.data.mascotaId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarHistorial();
      }
    });
  }

  agregarDesparasitacion(): void {
    const dialogRef = this.dialog.open(DesparasitacionFormComponent, {
      width: '600px',
      data: { mascotaId: this.data.mascotaId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarHistorial();
      }
    });
  }

  agregarExamen(): void {
    const dialogRef = this.dialog.open(ExamenLaboratorioFormComponent, {
      width: '650px',
      data: { mascotaId: this.data.mascotaId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarHistorial();
      }
    });
  }

  agregarCirugia(): void {
    const dialogRef = this.dialog.open(CirugiaFormComponent, {
      width: '650px',
      data: { mascotaId: this.data.mascotaId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarHistorial();
      }
    });
  }

  agregarAlergia(): void {
    const dialogRef = this.dialog.open(AlergiaFormComponent, {
      width: '600px',
      data: { mascotaId: this.data.mascotaId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarHistorial();
      }
    });
  }

  agregarAntecedente(): void {
    const dialogRef = this.dialog.open(AntecedentePatologicoFormComponent, {
      width: '650px',
      data: { mascotaId: this.data.mascotaId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarHistorial();
      }
    });
  }

  agregarReceta(): void {
    const dialogRef = this.dialog.open(RecetaMedicamentoFormComponent, {
      width: '650px',
      data: { mascotaId: this.data.mascotaId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarHistorial();
      }
    });
  }

  // Métodos para editar registros
  editarVacuna(vacuna: Vacuna): void {
    const dialogRef = this.dialog.open(VacunaFormComponent, {
      width: '600px',
      data: { mascotaId: this.data.mascotaId, vacuna }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarHistorial();
      }
    });
  }

  editarDesparasitacion(desp: Desparasitacion): void {
    const dialogRef = this.dialog.open(DesparasitacionFormComponent, {
      width: '600px',
      data: { mascotaId: this.data.mascotaId, desparasitacion: desp }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarHistorial();
      }
    });
  }

  editarExamen(examen: ExamenLaboratorio): void {
    const dialogRef = this.dialog.open(ExamenLaboratorioFormComponent, {
      width: '650px',
      data: { mascotaId: this.data.mascotaId, examen }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarHistorial();
      }
    });
  }

  editarCirugia(cirugia: Cirugia): void {
    const dialogRef = this.dialog.open(CirugiaFormComponent, {
      width: '650px',
      data: { mascotaId: this.data.mascotaId, cirugia }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarHistorial();
      }
    });
  }

  editarAlergia(alergia: Alergia): void {
    const dialogRef = this.dialog.open(AlergiaFormComponent, {
      width: '600px',
      data: { mascotaId: this.data.mascotaId, alergia }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarHistorial();
      }
    });
  }

  editarAntecedente(antecedente: AntecedentePatologico): void {
    const dialogRef = this.dialog.open(AntecedentePatologicoFormComponent, {
      width: '650px',
      data: { mascotaId: this.data.mascotaId, antecedente }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarHistorial();
      }
    });
  }

  editarReceta(receta: RecetaMedicamento): void {
    const dialogRef = this.dialog.open(RecetaMedicamentoFormComponent, {
      width: '650px',
      data: { mascotaId: this.data.mascotaId, receta }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarHistorial();
      }
    });
  }

  // Métodos para eliminar registros
  eliminarVacuna(vacuna: Vacuna): void {
    if (confirm(`¿Estás seguro de eliminar la vacuna "${vacuna.nombreVacuna}"?`)) {
      this.historialService.deleteVacuna(vacuna.id).subscribe({
        next: () => {
          this.snackBar.open('Vacuna eliminada', 'Cerrar', { duration: 3000 });
          this.cargarHistorial();
        },
        error: () => {
          this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  eliminarDesparasitacion(desp: Desparasitacion): void {
    if (confirm(`¿Estás seguro de eliminar esta desparasitación?`)) {
      this.historialService.deleteDesparasitacion(desp.id).subscribe({
        next: () => {
          this.snackBar.open('Desparasitación eliminada', 'Cerrar', { duration: 3000 });
          this.cargarHistorial();
        },
        error: () => {
          this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  eliminarExamen(examen: ExamenLaboratorio): void {
    if (confirm(`¿Estás seguro de eliminar el examen "${examen.tipoExamen}"?`)) {
      this.historialService.deleteExamen(examen.id).subscribe({
        next: () => {
          this.snackBar.open('Examen eliminado', 'Cerrar', { duration: 3000 });
          this.cargarHistorial();
        },
        error: () => {
          this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  eliminarCirugia(cirugia: Cirugia): void {
    if (confirm(`¿Estás seguro de eliminar la cirugía "${cirugia.tipoCirugia}"?`)) {
      this.historialService.deleteCirugia(cirugia.id).subscribe({
        next: () => {
          this.snackBar.open('Cirugía eliminada', 'Cerrar', { duration: 3000 });
          this.cargarHistorial();
        },
        error: () => {
          this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  eliminarAlergia(alergia: Alergia): void {
    if (confirm(`¿Estás seguro de eliminar la alergia a "${alergia.alergia}"?`)) {
      this.historialService.deleteAlergia(alergia.id).subscribe({
        next: () => {
          this.snackBar.open('Alergia eliminada', 'Cerrar', { duration: 3000 });
          this.cargarHistorial();
        },
        error: () => {
          this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  eliminarAntecedente(antecedente: AntecedentePatologico): void {
    if (confirm(`¿Estás seguro de eliminar el antecedente "${antecedente.enfermedad}"?`)) {
      this.historialService.deleteAntecedente(antecedente.id).subscribe({
        next: () => {
          this.snackBar.open('Antecedente eliminado', 'Cerrar', { duration: 3000 });
          this.cargarHistorial();
        },
        error: () => {
          this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  eliminarReceta(receta: RecetaMedicamento): void {
    if (confirm(`¿Estás seguro de eliminar la receta "${receta.medicamento}"?`)) {
      this.historialService.deleteReceta(receta.id).subscribe({
        next: () => {
          this.snackBar.open('Receta eliminada', 'Cerrar', { duration: 3000 });
          this.cargarHistorial();
        },
        error: () => {
          this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  // Métodos para obtener clases CSS según estado
  getSeveridadClass(severidad: string): string {
    const sev = severidad?.toLowerCase() || '';
    if (sev.includes('baja') || sev.includes('leve')) return 'severidad-leve';
    if (sev.includes('media') || sev.includes('moderada')) return 'severidad-moderada';
    if (sev.includes('alta') || sev.includes('severa')) return 'severidad-severa';
    if (sev.includes('muy alta') || sev.includes('critica')) return 'severidad-critica';
    return '';
  }

  getEstadoClass(estado: string): string {
    const est = estado?.toLowerCase() || '';
    if (est.includes('activo')) return 'estado-activo';
    if (est.includes('controlado')) return 'estado-controlado';
    if (est.includes('remision')) return 'estado-remision';
    if (est.includes('curado') || est.includes('resuelto')) return 'estado-curado';
    return '';
  }
}
