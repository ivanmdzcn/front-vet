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
import { Desparasitacion } from '../../../../core/models/historial-medico.models';

export interface DesparasitacionFormData {
  mascotaId: number;
  desparasitacion?: Desparasitacion;
}

@Component({
  selector: 'app-desparasitacion-form',
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
    <h2 mat-dialog-title>{{ isEditMode ? 'Editar' : 'Nueva' }} Desparasitación</h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tipo</mat-label>
          <mat-select formControlName="tipo">
            <mat-option value="Interna">Interna</mat-option>
            <mat-option value="Externa">Externa</mat-option>
            <mat-option value="Ambas">Ambas</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('tipo')?.hasError('required')">
            El tipo es requerido
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Producto</mat-label>
          <input matInput formControlName="producto" placeholder="Ej: Milbemax, NexGard">
          <mat-error *ngIf="form.get('producto')?.hasError('required')">
            El producto es requerido
          </mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Fecha de Aplicación</mat-label>
            <input matInput [matDatepicker]="picker1" formControlName="fechaAplicacion">
            <mat-datepicker-toggle matSuffix [for]="picker1"></mat-datepicker-toggle>
            <mat-datepicker #picker1></mat-datepicker>
            <mat-error *ngIf="form.get('fechaAplicacion')?.hasError('required')">
              La fecha es requerida
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Próxima Dosis</mat-label>
            <input matInput [matDatepicker]="picker2" formControlName="proximaDosis">
            <mat-datepicker-toggle matSuffix [for]="picker2"></mat-datepicker-toggle>
            <mat-datepicker #picker2></mat-datepicker>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Dosis</mat-label>
            <input matInput type="number" formControlName="dosis" placeholder="1">
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Unidad</mat-label>
            <input matInput formControlName="unidad" placeholder="Ej: comprimido, pipeta">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observaciones" rows="3"></textarea>
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
      min-width: 500px;
    }
    .full-width { width: 100%; }
    .form-row { display: flex; gap: 16px; }
    .half-width { flex: 1; }
  `]
})
export class DesparasitacionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private historialService = inject(HistorialMedicoService);
  private dialogRef = inject(MatDialogRef<DesparasitacionFormComponent>);
  private snackBar = inject(MatSnackBar);

  form!: FormGroup;
  isEditMode = false;
  guardando = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DesparasitacionFormData) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data.desparasitacion;
    this.initForm();
  }

  initForm(): void {
    this.form = this.fb.group({
      tipo: [this.data.desparasitacion?.tipo || 'Interna', Validators.required],
      producto: [this.data.desparasitacion?.producto || '', Validators.required],
      fechaAplicacion: [this.data.desparasitacion?.fechaAplicacion || new Date(), Validators.required],
      proximaDosis: [this.data.desparasitacion?.proximaDosis || null],
      dosis: [this.data.desparasitacion?.dosis || null],
      unidad: [this.data.desparasitacion?.unidad || ''],
      observaciones: [this.data.desparasitacion?.observaciones || '']
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.guardando = true;

    if (this.isEditMode && this.data.desparasitacion) {
      this.historialService.updateDesparasitacion(this.data.desparasitacion.id, {
        id: this.data.desparasitacion.id,
        ...this.form.value
      }).subscribe({
        next: () => {
          this.snackBar.open('Desparasitación actualizada', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 });
          this.guardando = false;
        }
      });
    } else {
      this.historialService.createDesparasitacion({
        mascotaId: this.data.mascotaId,
        veterinarioId: 1,
        ...this.form.value
      }).subscribe({
        next: () => {
          this.snackBar.open('Desparasitación registrada', 'Cerrar', { duration: 3000 });
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
