import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HistorialMedicoService } from '../../services/historial-medico.service';
import { ConsultaService } from '../../../../features/consultas/services/consulta.service';
import { ExamenLaboratorio } from '../../../../core/models/historial-medico.models';
import { Consulta } from '../../../../core/models/consulta.models';

export interface ExamenLaboratorioFormData {
  mascotaId: number;
  veterinarioId?: number;
  examen?: ExamenLaboratorio;
}

@Component({
  selector: 'app-examen-laboratorio-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Editar' : 'Nuevo' }} Examen de Laboratorio</h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tipo de Examen</mat-label>
          <input matInput formControlName="tipoExamen" placeholder="Ej: Hemograma, Bioquímica">
          <mat-error *ngIf="form.get('tipoExamen')?.hasError('required')">
            El tipo de examen es requerido
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="descripcion" rows="2" 
                    placeholder="Análisis solicitados..."></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Consulta Asociada</mat-label>
          <mat-select formControlName="consultaId" [disabled]="isEditMode || cargandoConsultas || !!data.examen?.consultaId">
            <mat-option *ngIf="cargandoConsultas" disabled>
              <mat-spinner diameter="20"></mat-spinner> Cargando consultas...
            </mat-option>
            <mat-option *ngIf="!cargandoConsultas && consultas.length === 0" disabled>
              No hay consultas registradas para esta mascota
            </mat-option>
            <mat-option *ngFor="let consulta of consultas" [value]="consulta.id">
              {{ formatConsultaOption(consulta) }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('consultaId')?.hasError('required')">
            Debe seleccionar una consulta
          </mat-error>
          <mat-hint *ngIf="isEditMode">No se puede modificar la consulta</mat-hint>
          <mat-hint *ngIf="!isEditMode && !cargandoConsultas && !data.examen?.consultaId">
            Seleccione la consulta donde se solicitó este examen
          </mat-hint>
          <mat-hint *ngIf="data.examen?.consultaId && !isEditMode">
            Pre-seleccionado desde la consulta actual
          </mat-hint>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Fecha de Solicitud</mat-label>
            <input matInput [matDatepicker]="pickerSolicitud" formControlName="fechaSolicitud">
            <mat-datepicker-toggle matSuffix [for]="pickerSolicitud"></mat-datepicker-toggle>
            <mat-datepicker #pickerSolicitud></mat-datepicker>
            <mat-error *ngIf="form.get('fechaSolicitud')?.hasError('required')">
              La fecha es requerida
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Fecha de Resultado</mat-label>
            <input matInput [matDatepicker]="pickerResultado" formControlName="fechaResultado">
            <mat-datepicker-toggle matSuffix [for]="pickerResultado"></mat-datepicker-toggle>
            <mat-datepicker #pickerResultado></mat-datepicker>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Analista</mat-label>
          <input matInput formControlName="analista" placeholder="Laboratorio o profesional">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Resultado</mat-label>
          <textarea matInput formControlName="resultado" rows="4" 
                    placeholder="Resultados del examen..."></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observaciones" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
      <button mat-raised-button color="primary" 
              [disabled]="!form.valid || guardando"
              (click)="guardar()">
        {{ guardando ? 'Guardando...' : 'Guardar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
      min-width: 550px;
    }
    .full-width { width: 100%; }
    .form-row { display: flex; gap: 16px; }
    .half-width { flex: 1; }
    mat-dialog-content { max-height: 70vh; overflow-y: auto; }
  `]
})
export class ExamenLaboratorioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private historialService = inject(HistorialMedicoService);
  private consultaService = inject(ConsultaService);
  private dialogRef = inject(MatDialogRef<ExamenLaboratorioFormComponent>);
  private snackBar = inject(MatSnackBar);

  form!: FormGroup;
  isEditMode = false;
  guardando = false;
  cargandoConsultas = false;
  consultas: Consulta[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: ExamenLaboratorioFormData) {}

  ngOnInit(): void {
    this.isEditMode = !!(this.data.examen && this.data.examen.id);
    this.initForm();
    this.cargarConsultas();
  }

  cargarConsultas(): void {
    this.cargandoConsultas = true;
    this.consultaService.getByMascotaId(this.data.mascotaId).subscribe({
      next: (consultas) => {
        this.consultas = consultas.sort((a, b) => 
          new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
        );
        this.cargandoConsultas = false;
      },
      error: (err) => {
        console.error('Error al cargar consultas:', err);
        this.snackBar.open('Error al cargar consultas', 'Cerrar', { duration: 3000 });
        this.cargandoConsultas = false;
      }
    });
  }

  formatConsultaOption(consulta: Consulta): string {
    const fecha = new Date(consulta.fechaHora).toLocaleDateString('es-GT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const diagnostico = consulta.diagnostico?.substring(0, 40) || 'Sin diagnóstico';
    return `#${consulta.id} - ${fecha} - ${diagnostico} - Dr. ${consulta.veterinarioNombre}`;
  }

  initForm(): void {
    this.form = this.fb.group({
      tipoExamen: [this.data.examen?.tipoExamen || '', Validators.required],
      consultaId: [this.data.examen?.consultaId || null, Validators.required],
      descripcion: [this.data.examen?.descripcion || ''],
      fechaSolicitud: [this.data.examen?.fechaSolicitud || new Date(), Validators.required],
      fechaResultado: [this.data.examen?.fechaResultado || null],
      analista: [this.data.examen?.analista || ''],
      resultado: [this.data.examen?.resultado || ''],
      observaciones: [this.data.examen?.observaciones || '']
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.guardando = true;

    if (this.isEditMode && this.data.examen) {
      const { consultaId, ...updateData } = this.form.value;
      this.historialService.updateExamen(this.data.examen.id, {
        id: this.data.examen.id,
        ...updateData
      }).subscribe({
        next: () => {
          this.snackBar.open('Examen actualizado', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 });
          this.guardando = false;
        }
      });
    } else {
      this.historialService.createExamen({
        mascotaId: this.data.mascotaId,
        veterinarioId: this.data.veterinarioId || 1,
        ...this.form.value
      }).subscribe({
        next: () => {
          this.snackBar.open('Examen registrado', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Error al registrar', 'Cerrar', { duration: 3000 });
          this.guardando = false;
        }
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
