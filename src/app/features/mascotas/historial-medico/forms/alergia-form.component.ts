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
import { Alergia } from '../../../../core/models/historial-medico.models';

export interface AlergiaFormData {
  mascotaId: number;
  alergia?: Alergia;
}

@Component({
  selector: 'app-alergia-form',
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
    <h2 mat-dialog-title>{{ isEditMode ? 'Editar' : 'Nueva' }} Alergia</h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Alergia</mat-label>
          <input matInput formControlName="alergia" placeholder="Ej: Pollo, Lácteos">
          <mat-error *ngIf="form.get('alergia')?.hasError('required')">
            La alergia es requerida
          </mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Tipo</mat-label>
            <mat-select formControlName="tipo">
              <mat-option value="Alimentaria">Alimentaria</mat-option>
              <mat-option value="Medicamento">Medicamento</mat-option>
              <mat-option value="Ambiental">Ambiental</mat-option>
              <mat-option value="Contacto">Contacto</mat-option>
              <mat-option value="Otra">Otra</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Severidad</mat-label>
            <mat-select formControlName="severidad">
              <mat-option value="Baja">Baja</mat-option>
              <mat-option value="Media">Media</mat-option>
              <mat-option value="Alta">Alta</mat-option>
              <mat-option value="Muy Alta">Muy Alta</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Reacción</mat-label>
          <textarea matInput formControlName="reaccion" rows="2" 
                    placeholder="Ej: Urticaria, picazón severa"></textarea>
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
export class AlergiaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private historialService = inject(HistorialMedicoService);
  private dialogRef = inject(MatDialogRef<AlergiaFormComponent>);
  private snackBar = inject(MatSnackBar);

  form!: FormGroup;
  isEditMode = false;
  guardando = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: AlergiaFormData) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data.alergia;
    this.initForm();
  }

  initForm(): void {
    this.form = this.fb.group({
      alergia: [this.data.alergia?.alergia || '', Validators.required],
      tipo: [this.data.alergia?.tipo || 'Alimentaria'],
      severidad: [this.data.alergia?.severidad || 'Media'],
      reaccion: [this.data.alergia?.reaccion || ''],
      fechaDiagnostico: [this.data.alergia?.fechaDiagnostico || new Date(), Validators.required],
      observaciones: [this.data.alergia?.observaciones || '']
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.guardando = true;

    if (this.isEditMode && this.data.alergia) {
      this.historialService.updateAlergia(this.data.alergia.id, {
        id: this.data.alergia.id,
        ...this.form.value
      }).subscribe({
        next: () => {
          this.snackBar.open('Alergia actualizada', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 });
          this.guardando = false;
        }
      });
    } else {
      this.historialService.createAlergia({
        mascotaId: this.data.mascotaId,
        veterinarioId: 1,
        ...this.form.value
      }).subscribe({
        next: () => {
          this.snackBar.open('Alergia registrada', 'Cerrar', { duration: 3000 });
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
