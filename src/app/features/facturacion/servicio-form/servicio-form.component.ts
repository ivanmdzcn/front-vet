import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { FacturacionService } from '../services/facturacion.service';
import { Servicio } from '../../../core/models/facturacion.models';

@Component({
  selector: 'app-servicio-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule
  ],
  templateUrl: './servicio-form.component.html',
  styleUrl: './servicio-form.component.scss'
})
export class ServicioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private facturacionService = inject(FacturacionService);
  private dialogRef = inject(MatDialogRef<ServicioFormComponent>);
  data: Servicio | null = inject(MAT_DIALOG_DATA, { optional: true });

  servicioForm!: FormGroup;
  loading = false;
  isEditMode = false;
  simboloMoneda = 'Q';

  ngOnInit(): void {
    this.isEditMode = !!this.data;
    this.cargarSimboloMoneda();
    this.initForm();

    if (this.isEditMode && this.data) {
      this.servicioForm.patchValue(this.data);
    }
  }

  initForm(): void {
    this.servicioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(150)]],
      precio: [0, [Validators.required, Validators.min(0.01)]],
      categoria: ['', [Validators.maxLength(50)]],
      activo: [true]
    });

    // Solo mostrar campo activo en modo edición
    if (!this.isEditMode) {
      this.servicioForm.removeControl('activo');
    }
  }

  cargarSimboloMoneda(): void {
    const configCache = sessionStorage.getItem('configuracion_moneda');
    if (configCache) {
      const config = JSON.parse(configCache);
      this.simboloMoneda = config.simboloMoneda || 'Q';
    }
  }

  onSubmit(): void {
    if (this.servicioForm.invalid) {
      this.servicioForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.data) {
      this.facturacionService.actualizarServicio(this.data.id, this.servicioForm.value).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.dialogRef.close(true);
          } else {
            alert(response.errorMessage || 'Error al actualizar el servicio');
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error al actualizar servicio:', error);
          alert('Error al actualizar el servicio');
          this.loading = false;
        }
      });
    } else {
      this.facturacionService.crearServicio(this.servicioForm.value).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.dialogRef.close(true);
          } else {
            alert(response.errorMessage || 'Error al crear el servicio');
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error al crear servicio:', error);
          alert('Error al crear el servicio');
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.servicioForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('maxLength')) {
      return `Máximo ${control.errors?.['maxLength'].requiredLength} caracteres`;
    }
    if (control?.hasError('min')) {
      return `El valor mínimo es ${control.errors?.['min'].min}`;
    }
    return '';
  }
}
