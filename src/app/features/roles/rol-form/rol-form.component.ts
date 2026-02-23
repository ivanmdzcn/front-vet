import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { RolService } from '../services/rol.service';
import { Rol, UpdateRolDto } from '../../../core/models/rol.models';

@Component({
  selector: 'app-rol-form',
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
  templateUrl: './rol-form.component.html',
  styleUrl: './rol-form.component.scss'
})
export class RolFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private rolService = inject(RolService);
  private dialogRef = inject(MatDialogRef<RolFormComponent>);
  data: Rol | null = inject(MAT_DIALOG_DATA, { optional: true });

  rolForm!: FormGroup;
  loading = false;
  isEditMode = false;

  ngOnInit(): void {
    this.isEditMode = !!this.data;
    this.initForm();

    if (this.isEditMode && this.data) {
      this.rolForm.patchValue(this.data);
    }
  }

  initForm(): void {
    this.rolForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      descripcion: ['', [Validators.maxLength(200)]]
    });
  }

  onSubmit(): void {
    if (this.rolForm.invalid) {
      this.rolForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.data) {
      const updateDto: UpdateRolDto = {
        id: this.data.id,
        nombre: this.rolForm.value.nombre,
        descripcion: this.rolForm.value.descripcion || null
      };

      this.rolService.update(this.data.id, updateDto).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error al actualizar rol:', error);
          this.loading = false;
          alert(error.error?.message || 'Error al actualizar el rol');
        }
      });
    } else {
      this.rolService.create(this.rolForm.value).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error al crear rol:', error);
          this.loading = false;
          alert(error.error?.message || 'Error al crear el rol');
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.rolForm.get(fieldName);

    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (control?.hasError('maxlength')) {
      return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres`;
    }

    return '';
  }
}