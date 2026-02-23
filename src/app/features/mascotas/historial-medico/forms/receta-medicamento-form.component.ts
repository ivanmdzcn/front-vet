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
import { RecetaMedicamento } from '../../../../core/models/historial-medico.models';
import { Consulta } from '../../../../core/models/consulta.models';

export interface RecetaMedicamentoFormData {
  mascotaId: number;
  veterinarioId?: number;
  receta?: RecetaMedicamento;
}

@Component({
  selector: 'app-receta-medicamento-form',
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
    <h2 mat-dialog-title>{{ isEditMode ? 'Editar' : 'Nueva' }} Receta de Medicamento</h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Medicamento</mat-label>
          <input matInput formControlName="medicamento" placeholder="Ej: Amoxicilina, Tramadol">
          <mat-error *ngIf="form.get('medicamento')?.hasError('required')">
            El medicamento es requerido
          </mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="third-width">
            <mat-label>Dosis</mat-label>
            <input matInput type="number" formControlName="dosis" placeholder="10">
            <mat-error *ngIf="form.get('dosis')?.hasError('required')">
              Requerido
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="third-width">
            <mat-label>Unidad</mat-label>
            <input matInput formControlName="unidad" placeholder="mg, ml">
            <mat-error *ngIf="form.get('unidad')?.hasError('required')">
              Requerido
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="third-width">
            <mat-label>Duración (días)</mat-label>
            <input matInput type="number" formControlName="duracionDias" placeholder="7">
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Frecuencia</mat-label>
            <input matInput formControlName="frecuencia" placeholder="Cada 8 horas">
            <mat-error *ngIf="form.get('frecuencia')?.hasError('required')">
              La frecuencia es requerida
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Vía de Administración</mat-label>
            <input matInput formControlName="viaAdministracion" placeholder="Oral, IV">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Indicaciones</mat-label>
          <textarea matInput formControlName="indicaciones" rows="2" 
                    placeholder="Administrar con alimento..."></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Contraindicaciones</mat-label>
          <textarea matInput formControlName="contraindicaciones" rows="2" 
                    placeholder="No combinar con..."></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Fecha de Prescripción</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="fechaPrescripcion">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error *ngIf="form.get('fechaPrescripcion')?.hasError('required')">
            La fecha es requerida
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Consulta Asociada</mat-label>
          <mat-select formControlName="consultaId" [disabled]="isEditMode || cargandoConsultas || !!data.receta?.consultaId">
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
          <mat-hint *ngIf="!isEditMode && !cargandoConsultas && !data.receta?.consultaId">
            Seleccione la consulta donde se prescribe este medicamento
          </mat-hint>
          <mat-hint *ngIf="data.receta?.consultaId && !isEditMode">
            Pre-seleccionado desde la consulta actual
          </mat-hint>
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
    .third-width { flex: 1; }
    mat-dialog-content { max-height: 70vh; overflow-y: auto; }
  `]
})
export class RecetaMedicamentoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private historialService = inject(HistorialMedicoService);
  private consultaService = inject(ConsultaService);
  private dialogRef = inject(MatDialogRef<RecetaMedicamentoFormComponent>);
  private snackBar = inject(MatSnackBar);

  form!: FormGroup;
  isEditMode = false;
  guardando = false;
  cargandoConsultas = false;
  consultas: Consulta[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: RecetaMedicamentoFormData) {}

  ngOnInit(): void {
    this.isEditMode = !!(this.data.receta && this.data.receta.id);
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
      medicamento: [this.data.receta?.medicamento || '', Validators.required],
      consultaId: [this.data.receta?.consultaId || null, Validators.required],
      dosis: [this.data.receta?.dosis || null, Validators.required],
      unidad: [this.data.receta?.unidad || '', Validators.required],
      frecuencia: [this.data.receta?.frecuencia || '', Validators.required],
      duracionDias: [this.data.receta?.duracionDias || null],
      viaAdministracion: [this.data.receta?.viaAdministracion || ''],
      indicaciones: [this.data.receta?.indicaciones || ''],
      contraindicaciones: [this.data.receta?.contraindicaciones || ''],
      fechaPrescripcion: [this.data.receta?.fechaPrescripcion || new Date(), Validators.required]
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.guardando = true;

    if (this.isEditMode && this.data.receta) {
      const { consultaId, ...updateData } = this.form.value;
      this.historialService.updateReceta(this.data.receta.id, {
        id: this.data.receta.id,
        ...updateData
      }).subscribe({
        next: () => {
          this.snackBar.open('Receta actualizada', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 });
          this.guardando = false;
        }
      });
    } else {
      this.historialService.createReceta({
        mascotaId: this.data.mascotaId,
        veterinarioId: this.data.veterinarioId || 1,
        ...this.form.value
      }).subscribe({
        next: () => {
          this.snackBar.open('Receta registrada', 'Cerrar', { duration: 3000 });
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
