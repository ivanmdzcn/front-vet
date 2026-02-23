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
import { Producto } from '../../../core/models/facturacion.models';

@Component({
  selector: 'app-producto-form',
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
  templateUrl: './producto-form.component.html',
  styleUrl: './producto-form.component.scss'
})
export class ProductoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private facturacionService = inject(FacturacionService);
  private dialogRef = inject(MatDialogRef<ProductoFormComponent>);
  data: Producto | null = inject(MAT_DIALOG_DATA, { optional: true });

  productoForm!: FormGroup;
  loading = false;
  isEditMode = false;
  simboloMoneda = 'Q';

  ngOnInit(): void {
    this.isEditMode = !!this.data;
    this.cargarSimboloMoneda();
    this.initForm();

    if (this.isEditMode && this.data) {
      this.productoForm.patchValue(this.data);
    }
  }

  initForm(): void {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(150)]],
      codigoBarras: ['', [Validators.maxLength(50)]],
      precioVenta: [0, [Validators.required, Validators.min(0.01)]],
      stockActual: [0, [Validators.required, Validators.min(0)]],
      stockMinimo: [0, [Validators.required, Validators.min(0)]],
      activo: [true]
    });

    // Solo mostrar campo activo en modo edición
    if (!this.isEditMode) {
      this.productoForm.removeControl('activo');
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
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.data) {
      this.facturacionService.actualizarProducto(this.data.id, this.productoForm.value).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.dialogRef.close(true);
          } else {
            alert(response.errorMessage || 'Error al actualizar el producto');
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error al actualizar producto:', error);
          alert('Error al actualizar el producto');
          this.loading = false;
        }
      });
    } else {
      this.facturacionService.crearProducto(this.productoForm.value).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.dialogRef.close(true);
          } else {
            alert(response.errorMessage || 'Error al crear el producto');
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error al crear producto:', error);
          alert('Error al crear el producto');
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.productoForm.get(fieldName);
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
