import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ClienteService } from '../services/cliente.service';
import { Cliente } from '../../../core/models/cliente.models';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.scss'
})
export class ClienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  private dialogRef = inject(MatDialogRef<ClienteFormComponent>);
  data: Cliente | null = inject(MAT_DIALOG_DATA, { optional: true });

  clienteForm!: FormGroup;
  loading = false;
  isEditMode = false;

  ngOnInit(): void {
    this.isEditMode = !!this.data;
    this.initForm();

    if (this.isEditMode && this.data) {
      this.clienteForm.patchValue(this.data);
    }
  }

  initForm(): void {
    this.clienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      telefono: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      direccion: ['', [Validators.maxLength(300)]],
      ciudad: ['', [Validators.maxLength(100)]],
      dpi: ['', [Validators.maxLength(20)]]
    });
  }

  onSubmit(): void {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.data) {
      const updateDto = {
        id: this.data.id,
        ...this.clienteForm.value,
        activo: true
      };

      this.clienteService.update(this.data.id, updateDto).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error al actualizar cliente:', error);
          this.loading = false;
          alert('Error al actualizar el cliente');
        }
      });
    } else {
      this.clienteService.create(this.clienteForm.value).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error al crear cliente:', error);
          this.loading = false;
          alert('Error al crear el cliente');
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.clienteForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('maxlength')) {
      return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('email')) {
      return 'Email inválido';
    }
    
    return '';
  }
}