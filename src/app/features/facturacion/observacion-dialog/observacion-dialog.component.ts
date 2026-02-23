import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

export interface ObservacionDialogData {
  titulo: string;
  mensaje: string;
  accion: 'confirmar' | 'anular';
}

@Component({
  selector: 'app-observacion-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <div class="observacion-dialog">
      <h2 mat-dialog-title>
        <mat-icon [class]="data.accion === 'confirmar' ? 'icon-confirm' : 'icon-cancel'">
          {{ data.accion === 'confirmar' ? 'check_circle' : 'cancel' }}
        </mat-icon>
        {{ data.titulo }}
      </h2>

      <mat-dialog-content>
        <p class="mensaje">{{ data.mensaje }}</p>
        
        <form [formGroup]="form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Observación</mat-label>
            <textarea 
              matInput 
              formControlName="observacion"
              rows="4"
              placeholder="Ingrese el motivo de esta acción..."></textarea>
            <mat-error *ngIf="form.get('observacion')?.hasError('required')">
              La observación es requerida
            </mat-error>
            <mat-error *ngIf="form.get('observacion')?.hasError('minlength')">
              Mínimo 10 caracteres
            </mat-error>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          Cancelar
        </button>
        <button 
          mat-raised-button 
          [color]="data.accion === 'confirmar' ? 'primary' : 'warn'"
          (click)="onSubmit()"
          [disabled]="form.invalid">
          <mat-icon>{{ data.accion === 'confirmar' ? 'check' : 'block' }}</mat-icon>
          {{ data.accion === 'confirmar' ? 'Confirmar' : 'Anular' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .observacion-dialog {
      min-width: 400px;

      h2 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        padding: 0;

        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;

          &.icon-confirm {
            color: #2e7d32;
          }

          &.icon-cancel {
            color: #c62828;
          }
        }
      }
    }

    mat-dialog-content {
      padding: 24px !important;
      
      .mensaje {
        margin: 0 0 20px 0;
        color: #424242;
        font-size: 14px;
      }

      .full-width {
        width: 100%;
      }
    }

    mat-dialog-actions {
      padding: 16px 24px !important;
      gap: 12px;

      button {
        mat-icon {
          margin-right: 4px;
        }
      }
    }
  `]
})
export class ObservacionDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ObservacionDialogComponent>);
  data: ObservacionDialogData = inject(MAT_DIALOG_DATA);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      observacion: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.get('observacion')?.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
