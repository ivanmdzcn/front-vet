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
import { HistorialMedicoService } from '../../services/historial-medico.service';
import { AntecedentePatologico } from '../../../../core/models/historial-medico.models';

export interface AntecedentePatologicoFormData {
  mascotaId: number;
  antecedente?: AntecedentePatologico;
}

@Component({
  selector: 'app-antecedente-patologico-form',
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
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Editar' : 'Nuevo' }} Antecedente Patológico</h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Enfermedad</mat-label>
          <input matInput formControlName="enfermedad" placeholder="Ej: Diabetes, Epilepsia">
          <mat-error *ngIf="form.get('enfermedad')?.hasError('required')">
            La enfermedad es requerida
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Estado</mat-label>
          <mat-select formControlName="estado">
            <mat-option value="Crónica">Cronica</mat-option>
            <mat-option value="Controlada">Controlada</mat-option>
            <mat-option value="Curada">Curada</mat-option>
            <mat-option value="Activa">Activa</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('estado')?.hasError('required')">
            El estado es requerido
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="descripcion" rows="3" 
                    placeholder="Detalles de la enfermedad..."></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Medicamentos Actuales</mat-label>
          <textarea matInput formControlName="medicamentosActuales" rows="2" 
                    placeholder="Tratamientos en curso..."></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Frecuencia de Visitas Recomendada</mat-label>
          <input matInput formControlName="frecuenciaVisitasRecomendada" 
                 placeholder="Ej: Cada 3 meses, Anual">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Fecha de Diagnóstico</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="fechaDiagnostico">
          <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          <mat-error *ngIf="form.get('fechaDiagnostico')?.hasError('required')">
            La fecha es requerida
          </mat-error>
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
    mat-dialog-content { max-height: 70vh; overflow-y: auto; }
  `]
})
export class AntecedentePatologicoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private historialService = inject(HistorialMedicoService);
  private dialogRef = inject(MatDialogRef<AntecedentePatologicoFormComponent>);
  private snackBar = inject(MatSnackBar);

  form!: FormGroup;
  isEditMode = false;
  guardando = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: AntecedentePatologicoFormData) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data.antecedente;
    this.initForm();
  }

  initForm(): void {
    this.form = this.fb.group({
      enfermedad: [this.data.antecedente?.enfermedad || '', Validators.required],
      estado: [this.data.antecedente?.estado || 'Crónica', Validators.required],
      descripcion: [this.data.antecedente?.descripcion || ''],
      medicamentosActuales: [this.data.antecedente?.medicamentosActuales || ''],
      frecuenciaVisitasRecomendada: [this.data.antecedente?.frecuenciaVisitasRecomendada || ''],
      fechaDiagnostico: [this.data.antecedente?.fechaDiagnostico || new Date(), Validators.required],
      observaciones: [this.data.antecedente?.observaciones || '']
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.guardando = true;

    if (this.isEditMode && this.data.antecedente) {
      this.historialService.updateAntecedente(this.data.antecedente.id, {
        id: this.data.antecedente.id,
        ...this.form.value
      }).subscribe({
        next: () => {
          this.snackBar.open('Antecedente actualizado', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 });
          this.guardando = false;
        }
      });
    } else {
      this.historialService.createAntecedente({
        mascotaId: this.data.mascotaId,
        veterinarioId: 1,
        ...this.form.value
      }).subscribe({
        next: () => {
          this.snackBar.open('Antecedente registrado', 'Cerrar', { duration: 3000 });
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
