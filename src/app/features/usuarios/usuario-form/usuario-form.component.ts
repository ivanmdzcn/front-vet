import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

import { UsuarioService } from '../services/usuario.service';
import { RolService } from '../../roles/services/rol.service';
import { Usuario } from '../../../core/models/usuario.models';
import { Rol } from '../../../core/models/rol.models';

@Component({
  selector: 'app-usuario-form',
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
    MatSelectModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  templateUrl: './usuario-form.component.html',
  styleUrls: ['./usuario-form.component.scss']
})
export class UsuarioFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private rolService = inject(RolService);
  private dialogRef = inject(MatDialogRef<UsuarioFormComponent>);
  data: Usuario | null = inject(MAT_DIALOG_DATA, { optional: true });

  usuarioForm!: FormGroup;
  loading = false;
  isEditMode = false;
  hidePassword = signal(true);
  hidePasswordConfirm = signal(true);

  roles = signal<Rol[]>([]);

  ngOnInit(): void {
    this.isEditMode = !!this.data;
    this.loadRoles();
    this.initForm();

    if (this.isEditMode && this.data) {
      this.usuarioForm.patchValue(this.data);
      // En modo edición, la contraseña es opcional
      this.usuarioForm.get('password')?.clearValidators();
      this.usuarioForm.get('passwordConfirm')?.clearValidators();
    }
  }

  initForm(): void {
    this.usuarioForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      passwordConfirm: ['', this.isEditMode ? [] : [Validators.required]],
      nombreCompleto: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      rolId: [null, [Validators.required]],
      activo: [true]
    }, { validators: this.passwordMatchValidator });
  }

  loadRoles(): void {
    this.rolService.getAll().subscribe({
      next: (data) => {
        this.roles.set(data);
        //this.roles.set(data.filter(r => r.activo));
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const passwordConfirm = form.get('passwordConfirm');

    if (!password?.value && !passwordConfirm?.value) {
      return null; // Válido si ambos están vacíos (modo edición)
    }

    return password?.value === passwordConfirm?.value 
      ? null 
      : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = { ...this.usuarioForm.value };

    // Remover confirmación de password
    delete formValue.passwordConfirm;

    // Si es edición y no hay password, removerlo del DTO
    if (this.isEditMode && !formValue.password) {
      delete formValue.password;
    }

    if (this.isEditMode && this.data) {
      const updateDto = {
        id: this.data.id,
        ...formValue
      };

      this.usuarioService.update(this.data.id, updateDto).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error al actualizar usuario:', error);
          this.loading = false;
          alert(error.error?.message || 'Error al actualizar el usuario');
        }
      });
    } else {
      this.usuarioService.create(formValue).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error al crear usuario:', error);
          this.loading = false;
          alert(error.error?.message || 'Error al crear el usuario');
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.usuarioForm.get(fieldName);

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

    if (fieldName === 'passwordConfirm' && this.usuarioForm.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }

    return '';
  }
}