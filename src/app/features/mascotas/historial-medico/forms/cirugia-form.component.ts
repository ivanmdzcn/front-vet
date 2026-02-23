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
import { Cirugia } from '../../../../core/models/historial-medico.models';

export interface CirugiaFormData {
  mascotaId: number;
  cirugia?: Cirugia;
}

@Component({
  selector: 'app-cirugia-form',
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
    <h2 mat-dialog-title>{{ isEditMode ? 'Editar' : 'Nueva' }} Cirugía</h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="form-container">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tipo de Cirugía</mat-label>
          <input matInput formControlName="tipoCirugia" placeholder="Ej: Esterilización, Extracción">
          <mat-error *ngIf="form.get('tipoCirugia')?.hasError('required')">
            El tipo es requerido
          </mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Fecha de Cirugía</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="fechaCircugia">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            <mat-error *ngIf="form.get('fechaCircugia')?.hasError('required')">
              La fecha es requerida
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Duración (minutos)</mat-label>
            <input matInput type="number" formControlName="duracionMinutos" placeholder="45">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Anestesia Utilizada</mat-label>
          <input matInput formControlName="anestesiaUtilizada" placeholder="Ej: Propofol + Isoflurano">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Pre-Diagnóstico</mat-label>
          <textarea matInput formControlName="preDiagnostico" rows="2"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Hallazgos Intraoperatorios</mat-label>
          <textarea matInput formControlName="hallazgosIntraOperatorios" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Complicaciones</mat-label>
          <textarea matInput formControlName="complicaciones" rows="2" 
                    placeholder="Ninguna o describir..."></textarea>
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
export class CirugiaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private historialService = inject(HistorialMedicoService);
  private dialogRef = inject(MatDialogRef<CirugiaFormComponent>);
  private snackBar = inject(MatSnackBar);

  form!: FormGroup;
  isEditMode = false;
  guardando = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: CirugiaFormData) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data.cirugia;
    this.initForm();
  }

  initForm(): void {
    this.form = this.fb.group({
      tipoCirugia: [this.data.cirugia?.tipoCirugia || '', Validators.required],
      fechaCirugia: [this.data.cirugia?.fechaCirugia || new Date(), Validators.required],
      duracionMinutos: [this.data.cirugia?.duracionMinutos || null],
      anestesiaUtilizada: [this.data.cirugia?.anestesiaUtilizada || ''],
      preDiagnostico: [this.data.cirugia?.preDiagnostico || ''],
      hallazgosIntraOperatorios: [this.data.cirugia?.hallazgosIntraOperatorios || ''],
      complicaciones: [this.data.cirugia?.complicaciones || ''],
      observaciones: [this.data.cirugia?.observaciones || '']
    });
  }

  guardar(): void {
    if (this.form.invalid) return;
    this.guardando = true;

    if (this.isEditMode && this.data.cirugia) {
      this.historialService.updateCirugia(this.data.cirugia.id, {
        id: this.data.cirugia.id,
        ...this.form.value
      }).subscribe({
        next: () => {
          this.snackBar.open('Cirugía actualizada', 'Cerrar', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 });
          this.guardando = false;
        }
      });
    } else {
      this.historialService.createCirugia({
        mascotaId: this.data.mascotaId,
        veterinarioId: 1,
        ...this.form.value
      }).subscribe({
        next: () => {
          this.snackBar.open('Cirugía registrada', 'Cerrar', { duration: 3000 });
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
