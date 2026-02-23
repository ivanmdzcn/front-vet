import { Component, inject, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { ConsultaService } from '../services/consulta.service';
import { HistorialMedicoService } from '../../mascotas/services/historial-medico.service';
import { Consulta } from '../../../core/models/consulta.models';
import { RecetaMedicamento, ExamenLaboratorio } from '../../../core/models/historial-medico.models';
import { RecetaMedicamentoFormComponent } from '../../mascotas/historial-medico/forms/receta-medicamento-form.component';
import { ExamenLaboratorioFormComponent } from '../../mascotas/historial-medico/forms/examen-laboratorio-form.component';
import { HistorialMedicoComponent } from '../../mascotas/historial-medico/historial-medico.component';

export interface ConsultaDetalleData {
  consultaId: number;
}

@Component({
  selector: 'app-consulta-detalle',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './consulta-detalle.component.html',
  styleUrl: './consulta-detalle.component.scss'
})
export class ConsultaDetalleComponent implements OnInit {
  private consultaService = inject(ConsultaService);
  private historialService = inject(HistorialMedicoService);
  private dialog = inject(MatDialog);
  private dialogRef = inject(MatDialogRef<ConsultaDetalleComponent>);
  private snackBar = inject(MatSnackBar);

  consulta = signal<Consulta | null>(null);
  recetas = signal<RecetaMedicamento[]>([]);
  examenes = signal<ExamenLaboratorio[]>([]);
  loading = signal(true);

  constructor(@Inject(MAT_DIALOG_DATA) public data: ConsultaDetalleData) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);
    
    this.consultaService.getById(this.data.consultaId).subscribe({
      next: (consulta) => {
        this.consulta.set(consulta);
        
        // Extraer recetas y exámenes del objeto consulta
        const recetasData = consulta.recetas || consulta.recetasMedicamentos || [];
        const examenesData = consulta.examenes || consulta.examenesLaboratorio || [];
        
        this.recetas.set(recetasData);
        this.examenes.set(examenesData);
        
        // Si no vienen incluidos, cargar por mascotaId y filtrar
        if (recetasData.length === 0 && examenesData.length === 0) {
          this.cargarRecetasYExamenesPorMascota();
        } else {
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('Error al cargar consulta:', err);
        this.snackBar.open('Error al cargar la consulta', 'Cerrar', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  private cargarRecetasYExamenesPorMascota(): void {
    const consulta = this.consulta();
    if (!consulta?.mascotaId) {
      this.loading.set(false);
      return;
    }

    forkJoin({
      recetas: this.historialService.getRecetasByMascotaId(consulta.mascotaId),
      examenes: this.historialService.getExamenesByMascotaId(consulta.mascotaId)
    }).subscribe({
      next: ({ recetas, examenes }) => {
        // Filtrar solo los de esta consulta
        this.recetas.set(recetas.filter(r => r.consultaId === this.data.consultaId));
        this.examenes.set(examenes.filter(e => e.consultaId === this.data.consultaId));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar recetas/exámenes:', err);
        this.snackBar.open('Error al cargar recetas y exámenes', 'Cerrar', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  private recargarRecetasYExamenes(): void {
    const consulta = this.consulta();
    if (!consulta?.mascotaId) return;

    forkJoin({
      recetas: this.historialService.getRecetasByMascotaId(consulta.mascotaId),
      examenes: this.historialService.getExamenesByMascotaId(consulta.mascotaId)
    }).subscribe({
      next: ({ recetas, examenes }) => {
        this.recetas.set(recetas.filter(r => r.consultaId === this.data.consultaId));
        this.examenes.set(examenes.filter(e => e.consultaId === this.data.consultaId));
      },
      error: (err) => {
        console.error('Error al recargar:', err);
      }
    });
  }

  agregarReceta(): void {
    const dialogRef = this.dialog.open(RecetaMedicamentoFormComponent, {
      width: '650px',
      data: {
        mascotaId: this.consulta()!.mascotaId,
        veterinarioId: this.consulta()!.veterinarioId,
        receta: { 
          consultaId: this.data.consultaId,
          medicamento: '',
          dosis: null,
          unidad: '',
          frecuencia: '',
          duracionDias: null,
          viaAdministracion: '',
          fechaPrescripcion: new Date()
        } as any
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.recargarRecetasYExamenes();
      }
    });
  }

  editarReceta(receta: RecetaMedicamento): void {
    const dialogRef = this.dialog.open(RecetaMedicamentoFormComponent, {
      width: '650px',
      data: {
        mascotaId: this.consulta()!.mascotaId,
        veterinarioId: this.consulta()!.veterinarioId,
        receta
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.recargarRecetasYExamenes();
      }
    });
  }

  eliminarReceta(receta: RecetaMedicamento): void {
    if (confirm(`¿Está seguro de eliminar la receta de ${receta.medicamento}?`)) {
      this.historialService.deleteReceta(receta.id).subscribe({
        next: () => {
          this.snackBar.open('Receta eliminada', 'Cerrar', { duration: 3000 });
          this.recargarRecetasYExamenes();
        },
        error: () => {
          this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  agregarExamen(): void {
    const dialogRef = this.dialog.open(ExamenLaboratorioFormComponent, {
      width: '650px',
      data: {
        mascotaId: this.consulta()!.mascotaId,
        veterinarioId: this.consulta()!.veterinarioId,
        examen: { 
          consultaId: this.data.consultaId,
          tipoExamen: '',
          fechaSolicitud: new Date()
        } as any
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.recargarRecetasYExamenes();
      }
    });
  }

  editarExamen(examen: ExamenLaboratorio): void {
    const dialogRef = this.dialog.open(ExamenLaboratorioFormComponent, {
      width: '650px',
      data: {
        mascotaId: this.consulta()!.mascotaId,
        veterinarioId: this.consulta()!.veterinarioId,
        examen
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.recargarRecetasYExamenes();
      }
    });
  }

  eliminarExamen(examen: ExamenLaboratorio): void {
    if (confirm(`¿Está seguro de eliminar el examen ${examen.tipoExamen}?`)) {
      this.historialService.deleteExamen(examen.id).subscribe({
        next: () => {
          this.snackBar.open('Examen eliminado', 'Cerrar', { duration: 3000 });
          this.recargarRecetasYExamenes();
        },
        error: () => {
          this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  verHistorialCompleto(): void {
    const consulta = this.consulta();
    if (!consulta) return;

    this.dialogRef.close();
    this.dialog.open(HistorialMedicoComponent, {
      width: '95vw',
      maxWidth: '1400px',
      height: '90vh',
      data: {
        mascotaId: consulta.mascotaId,
        mascotaNombre: consulta.mascotaNombre,
        mascotaEspecie: '', // Si lo tienes disponible
        mascotaRaza: null,
        mascotaEdadAnios: null,
        clienteNombre: consulta.clienteNombre
      }
    });
  }

  formatFechaHora(fecha: Date): string {
    return new Date(fecha).toLocaleString('es-GT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-GT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
