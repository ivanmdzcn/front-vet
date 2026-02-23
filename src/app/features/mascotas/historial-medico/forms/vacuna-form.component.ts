import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HistorialMedicoService } from '../../services/historial-medico.service';
import { Vacuna } from '../../../../core/models/historial-medico.models';

export interface VacunaFormData {
  mascotaId: number;
  vacuna?: Vacuna;
}

@Component({
  selector: 'app-vacuna-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Editar' : 'Nueva' }} Vacuna</h2>
    
    <mat-dialog-content>
      <form [formGroup]="vacunaForm" class="form-container">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre de la Vacuna</mat-label>
          <input matInput formControlName="nombreVacuna" placeholder="Ej: Tetravalente, Antirrábica">
          <mat-error *ngIf="vacunaForm.get('nombreVacuna')?.hasError('required')">
            El nombre es requerido
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tipo de Vacuna</mat-label>
          <input matInput formControlName="tipoVacuna" placeholder="Ej: Virus modificado, Inactivada">
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Fecha de Aplicación</mat-label>
            <input matInput [matDatepicker]="picker1" formControlName="fechaAplicacion">
            <mat-datepicker-toggle matSuffix [for]="picker1"></mat-datepicker-toggle>
            <mat-datepicker #picker1></mat-datepicker>
            <mat-error *ngIf="vacunaForm.get('fechaAplicacion')?.hasError('required')">
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
            <mat-label>Lote</mat-label>
            <input matInput formControlName="lote" placeholder="Ej: LOT-2026-02-001">
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Fabricante</mat-label>
            <input matInput formControlName="fabricante" placeholder="Ej: Laboratorio Zoetis">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observaciones" rows="3" 
                    placeholder="Observaciones adicionales..."></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
      <button mat-raised-button color="primary" 
              [disabled]="!vacunaForm.valid || guardando"
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

    .full-width {
      width: 100%;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .half-width {
      flex: 1;
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }
  `]
})
export class VacunaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private historialService = inject(HistorialMedicoService);
  private dialogRef = inject(MatDialogRef<VacunaFormComponent>);
  private snackBar = inject(MatSnackBar);

  vacunaForm!: FormGroup;
  isEditMode = false;
  guardando = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: VacunaFormData) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data.vacuna;
    this.initForm();
  }

  initForm(): void {
    this.vacunaForm = this.fb.group({
      nombreVacuna: [this.data.vacuna?.nombreVacuna || '', Validators.required],
      tipoVacuna: [this.data.vacuna?.tipoVacuna || ''],
      fechaAplicacion: [this.data.vacuna?.fechaAplicacion || new Date(), Validators.required],
      proximaDosis: [this.data.vacuna?.proximaDosis || null],
      lote: [this.data.vacuna?.lote || ''],
      fabricante: [this.data.vacuna?.fabricante || ''],
      observaciones: [this.data.vacuna?.observaciones || '']
    });
  }

  guardar(): void {
    if (this.vacunaForm.invalid) return;

    this.guardando = true;
    const formValue = this.vacunaForm.value;

    if (this.isEditMode && this.data.vacuna) {
      const updateDto = {
        id: this.data.vacuna.id,
        ...formValue
      };
      
      this.historialService.updateVacuna(this.data.vacuna.id, updateDto).subscribe({
        next: () => {
          this.snackBar.open('Vacuna actualizada exitosamente', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error al actualizar vacuna:', error);
          this.snackBar.open('Error al actualizar la vacuna', 'Cerrar', { duration: 3000 });
          this.guardando = false;
        }
      });
    } else {
      const createDto = {
        mascotaId: this.data.mascotaId,
        veterinarioId: 1, // TODO: Obtener del usuario actual
        ...formValue
      };

      this.historialService.createVacuna(createDto).subscribe({
        next: () => {
          this.snackBar.open('Vacuna registrada exitosamente', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error al crear vacuna:', error);
          this.snackBar.open('Error al registrar la vacuna', 'Cerrar', { duration: 3000 });
          this.guardando = false;
        }
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
