import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

import { ConsultaService } from '../services/consulta.service';
import { MascotaService } from '../../mascotas/services/mascota.service';
import { ClienteService } from '../../clientes/services/cliente.service';
import { CitaService } from '../../citas/services/cita.service';
import { AuthService } from '../../../core/services/auth.service';
import { Cliente } from '../../../core/models/cliente.models';
import { Mascota } from '../../../core/models/mascota.models';
import { Cita } from '../../../core/models/cita.models';
import { ConsultaDetalleComponent } from '../consulta-detalle/consulta-detalle.component';

@Component({
  selector: 'app-consulta-form',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './consulta-form.component.html',
  styleUrl: './consulta-form.component.scss'
})
export class ConsultaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private consultaService = inject(ConsultaService);
  private mascotaService = inject(MascotaService);
  private clienteService = inject(ClienteService);
  private citaService = inject(CitaService);
  private authService = inject(AuthService);
  private dialogRef = inject(MatDialogRef<ConsultaFormComponent>);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  data: any = inject(MAT_DIALOG_DATA, { optional: true });

  consultaForm!: FormGroup;
  loading = false;
  isEditMode = false;
  isViewMode = false;

  clientes = signal<Cliente[]>([]);
  mascotas = signal<Mascota[]>([]);
  citasDisponibles = signal<Cita[]>([]);
  citasDisponibles$ = toObservable(this.citasDisponibles);
  
  filteredClientes!: Observable<Cliente[]>;
  filteredMascotas!: Observable<Mascota[]>;
  filteredCitas!: Observable<Cita[]>;
  
  citaIdControl = new FormControl<number | string>('');
  mostrarBuscarCita = signal(true);

  currentUser = this.authService.getCurrentUser();

  ngOnInit(): void {
    this.isEditMode = !!this.data && !!this.data.id;
    this.isViewMode = !!this.data && !!this.data.id;
    this.initForm();
    this.loadClientes();
    this.loadMascotas();
    this.loadCitasDisponibles();

    if (this.data) {
      this.patchValues();
    }

    this.setupFilters();
    this.setupClienteChange();
  }

  initForm(): void {
    this.consultaForm = this.fb.group({
      citaId: [null],
      mascotaId: [null, [Validators.required]],
      clienteId: [null, [Validators.required]],
      veterinarioId: [this.currentUser?.usuarioId || 1, [Validators.required]],
      fechaHora: [null, [Validators.required]],
      motivo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]],
      pesoKg: [null, [Validators.min(0.01), Validators.max(999)]],
      temperaturaCelsius: [null, [Validators.min(30), Validators.max(45)]],
      frecuenciaCardiaca: [null, [Validators.min(1), Validators.max(500)]],
      frecuenciaRespiratoria: [null, [Validators.min(1), Validators.max(200)]],
      diagnostico: ['', [Validators.required, Validators.minLength(10)]],
      tratamiento: ['', [Validators.maxLength(2000)]],
      observaciones: ['', [Validators.maxLength(2000)]],
      proximaVisita: [null]
    });
  }

  private patchValues(): void {
    const fechaFormateada = this.formatDateForInput(this.data.fechaHora || new Date());
    
    this.consultaForm.patchValue({
      ...this.data,
      fechaHora: fechaFormateada,
      proximaVisita: this.data.proximaVisita ? new Date(this.data.proximaVisita) : null
    });

    if (this.data.citaId) {
      this.mostrarBuscarCita.set(false);
      this.citaIdControl.setValue(this.data.citaId);
    }

    if (this.isViewMode) {
      this.consultaForm.disable();
    }
  }

  private formatDateForInput(dateInput: string | Date): string {
    const date = new Date(dateInput);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  loadClientes(): void {
    this.clienteService.getAll().subscribe({
      next: (data) => {
        this.clientes.set(data);
        if (this.data?.clienteId) this.consultaForm.get('clienteId')?.setValue(this.data.clienteId);
      }
    });
  }

  loadMascotas(): void {
    this.mascotaService.getAll().subscribe({
      next: (data) => {
        this.mascotas.set(data);
        if (this.data?.mascotaId) this.consultaForm.get('mascotaId')?.setValue(this.data.mascotaId);
      }
    });
  }

  loadCitasDisponibles(): void {
    this.citaService.getAll().subscribe({
      next: (data) => {
        const citas = data.filter(c => 
          c.estado === 'Confirmada' || c.estado === 'Pendiente' || c.id === this.data?.citaId
        );
        this.citasDisponibles.set(citas);
      }
    });
  }

  setupFilters(): void {
    this.filteredClientes = this.consultaForm.get('clienteId')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterClientes(typeof value === 'string' ? value : ''))
    );

    this.filteredMascotas = this.consultaForm.get('mascotaId')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterMascotas(typeof value === 'string' ? value : '', this.consultaForm.get('clienteId')?.value))
    );

    this.filteredCitas = combineLatest([
      this.citaIdControl.valueChanges.pipe(startWith('')),
      this.citasDisponibles$
    ]).pipe(
      map(([val, citas]) => this._filterCitas(typeof val === 'string' ? val : '', citas))
    );
  }

  private _filterCitas(value: string, citas: Cita[]): Cita[] {
    const filterValue = value.toLowerCase();
    return citas.filter(c => 
      c.mascotaNombre?.toLowerCase().includes(filterValue) || 
      c.clienteNombre?.toLowerCase().includes(filterValue) ||
      c.motivo?.toLowerCase().includes(filterValue)
    ).slice(0, 10);
  }

  private _filterClientes(value: string): Cliente[] {
    const filterValue = value.toLowerCase();
    return this.clientes().filter(c => c.nombreCompleto.toLowerCase().includes(filterValue));
  }

  private _filterMascotas(value: string, clienteId: number | null): Mascota[] {
    let list = this.mascotas();
    if (typeof clienteId === 'number') list = list.filter(m => m.clienteId === clienteId);
    return list.filter(m => m.nombre.toLowerCase().includes(value.toLowerCase()));
  }

  setupClienteChange(): void {
    this.consultaForm.get('clienteId')?.valueChanges.subscribe(clienteId => {
      if (typeof clienteId === 'number') {
        const mascotaActual = this.consultaForm.get('mascotaId')?.value;
        if (mascotaActual && this.mascotas().find(m => m.id === mascotaActual)?.clienteId !== clienteId) {
          this.consultaForm.patchValue({ mascotaId: null });
        }
      }
    });
  }

  displayClienteFn(id: number): string { return this.clientes().find(c => c.id === id)?.nombreCompleto || ''; }
  displayMascotaFn(id: number): string { 
    const m = this.mascotas().find(m => m.id === id);
    return m ? `${m.nombre} (${m.especie})` : ''; 
  }
  displayCitaFn(id: number): string {
    const c = this.citasDisponibles().find(c => c.id === id);
    return c ? `${c.mascotaNombre} - ${c.clienteNombre}` : '';
  }

  formatCitaFecha(fecha: any): string {
    return new Date(fecha).toLocaleString('es-GT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  onCitaSelected(event: any): void {
    const cita = this.citasDisponibles().find(c => c.id === event.option.value);
    if (cita) {
      this.consultaForm.patchValue({
        citaId: cita.id,
        mascotaId: cita.mascotaId,
        clienteId: cita.clienteId,
        veterinarioId: cita.veterinarioId,
        fechaHora: this.formatDateForInput(new Date()),
        motivo: cita.motivo
      });
      this.mostrarBuscarCita.set(false);
    }
  }

  limpiarCita(): void {
    this.consultaForm.patchValue({ citaId: null });
    this.citaIdControl.setValue('');
    this.mostrarBuscarCita.set(true);
  }

  enableEdit(): void {
    this.isViewMode = false;
    this.consultaForm.enable();
  }

  onSubmit(): void {
    if (this.consultaForm.invalid) return;
    this.loading = true;
    const formValue = { 
      ...this.consultaForm.value,
      fechaHora: new Date(this.consultaForm.value.fechaHora).toISOString()
    };

    const action = (this.isEditMode && this.data?.id)
      ? this.consultaService.update(this.data.id, formValue)
      : this.consultaService.create(formValue);

    action.subscribe({
      next: (consulta: any) => {
        this.dialogRef.close(true);
        
        // Mostrar snackbar con opciones
        const snackBarRef = this.snackBar.open(
          this.isEditMode ? 'Consulta actualizada exitosamente' : 'Consulta registrada exitosamente',
          'Ver Detalle',
          {
            duration: 6000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          }
        );

        snackBarRef.onAction().subscribe(() => {
          this.dialog.open(ConsultaDetalleComponent, {
            width: '900px',
            maxHeight: '90vh',
            data: { consultaId: consulta.id || this.data?.id }
          });
        });
      },
      error: () => this.loading = false
    });
  }

  onCancel(): void { this.dialogRef.close(false); }

  getErrorMessage(field: string): string {
    const control = this.consultaForm.get(field);
    if (control?.hasError('required')) return 'Este campo es requerido';
    if (control?.hasError('min')) return `Mínimo: ${control.errors?.['min'].min}`;
    return '';
  }
}