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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { CitaService } from '../services/cita.service';
import { MascotaService } from '../../mascotas/services/mascota.service';
import { ClienteService } from '../../clientes/services/cliente.service';
import { AuthService } from '../../../core/services/auth.service';
import { Cita, EstadoCita } from '../../../core/models/cita.models';
import { Mascota } from '../../../core/models/mascota.models';
import { Cliente } from '../../../core/models/cliente.models';

@Component({
  selector: 'app-cita-form',
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
    MatAutocompleteModule
  ],
  templateUrl: './cita-form.component.html',
  styleUrl: './cita-form.component.scss'
})
export class CitaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private citaService = inject(CitaService);
  private mascotaService = inject(MascotaService);
  private clienteService = inject(ClienteService);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<CitaFormComponent>);
  data: Cita | null = inject(MAT_DIALOG_DATA, { optional: true });

  citaForm!: FormGroup;
  loading = false;
  isEditMode = false;

  clientes = signal<Cliente[]>([]);
  mascotas = signal<Mascota[]>([]);
  filteredClientes!: Observable<Cliente[]>;
  filteredMascotas!: Observable<Mascota[]>;

  estadoOptions = [
    { value: EstadoCita.Pendiente, label: 'Pendiente' },
    { value: EstadoCita.Confirmada, label: 'Confirmada' },
    { value: EstadoCita.Completada, label: 'Completada' },
    { value: EstadoCita.Cancelada, label: 'Cancelada' },
    { value: EstadoCita.NoAsistio, label: 'No Asistió' }
  ];

  currentUser = this.authService.getCurrentUser();

  ngOnInit(): void {
    this.isEditMode = !!this.data;
    this.initForm();
    this.loadClientes();
    this.loadMascotas();
    this.setupFilters();
    this.setupClienteChange();

    if (this.isEditMode && this.data) {
      this.citaForm.patchValue({
        ...this.data,
        fechaHora: this.formatDateForInput(this.data.fechaHora),
        veterinarioId: this.data.veterinarioId
      });
    }
  }

  initForm(): void {
    this.citaForm = this.fb.group({
      mascotaId: [null, [Validators.required]],
      clienteId: [null, [Validators.required]],
      veterinarioId: [this.currentUser?.usuarioId || 1, [Validators.required]],
      fechaHora: [null, [Validators.required]],
      motivo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]],
      estado: [EstadoCita.Pendiente],
      observaciones: ['', [Validators.maxLength(1000)]]
    });
  }

  // Formatea la fecha para que el input datetime-local la reconozca
  private formatDateForInput(dateInput: string | Date): string {
    const date = new Date(dateInput);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  loadClientes(): void {
    this.clienteService.getAll().subscribe({
      next: (data) => {
        this.clientes.set(data);
        if (this.isEditMode && this.data) {
          this.citaForm.get('clienteId')?.setValue(this.data.clienteId);
        }
      }
    });
  }

  loadMascotas(): void {
    this.mascotaService.getAll().subscribe({
      next: (data) => {
        this.mascotas.set(data);
        if (this.isEditMode && this.data) {
          this.citaForm.get('mascotaId')?.setValue(this.data.mascotaId);
        }
      }
    });
  }

  setupFilters(): void {
    this.filteredClientes = this.citaForm.get('clienteId')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterClientes(typeof value === 'string' ? value : ''))
    );

    this.filteredMascotas = this.citaForm.get('mascotaId')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const searchValue = typeof value === 'string' ? value : '';
        const clienteId = this.citaForm.get('clienteId')?.value;
        return this._filterMascotas(searchValue, clienteId);
      })
    );
  }

  setupClienteChange(): void {
    this.citaForm.get('clienteId')?.valueChanges.subscribe(clienteId => {
      if (typeof clienteId === 'number') {
        const mascotaActual = this.citaForm.get('mascotaId')?.value;
        if (mascotaActual) {
          const mascota = this.mascotas().find(m => m.id === mascotaActual);
          if (mascota && mascota.clienteId !== clienteId) {
            this.citaForm.patchValue({ mascotaId: null });
          }
        }
      }
    });
  }

  private _filterClientes(value: string): Cliente[] {
    const filterValue = value.toLowerCase();
    return this.clientes().filter(c => c.nombreCompleto.toLowerCase().includes(filterValue));
  }

  private _filterMascotas(value: string, clienteId: number | null): Mascota[] {
    let list = this.mascotas();
    if (clienteId) list = list.filter(m => m.clienteId === clienteId);
    return list.filter(m => m.nombre.toLowerCase().includes(value.toLowerCase()));
  }

  displayClienteFn(id: number): string {
    return this.clientes().find(c => c.id === id)?.nombreCompleto || '';
  }

  displayMascotaFn(id: number): string {
    const m = this.mascotas().find(m => m.id === id);
    return m ? `${m.nombre} (${m.especie})` : '';
  }

  onSubmit(): void {
    if (this.citaForm.invalid) return;
    this.loading = true;

    const formValue = { 
      ...this.citaForm.value,
      fechaHora: new Date(this.citaForm.value.fechaHora).toISOString() 
    };

    const action = this.isEditMode 
      ? this.citaService.update(this.data!.id, formValue)
      : this.citaService.create(formValue);

    action.subscribe({
      next: () => this.dialogRef.close(true),
      error: () => this.loading = false
    });
  }

  onCancel(): void { this.dialogRef.close(false); }

  getErrorMessage(field: string): string {
    const control = this.citaForm.get(field);
    if (control?.hasError('required')) return 'Requerido';
    if (control?.hasError('minlength')) return 'Muy corto';
    return '';
  }
}