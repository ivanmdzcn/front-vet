import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { MascotaService } from '../services/mascota.service';
import { ClienteService } from '../../clientes/services/cliente.service';
import { Mascota, Sexo, CreateMascotaDto, UpdateMascotaDto } from '../../../core/models/mascota.models';
import { Cliente } from '../../../core/models/cliente.models';

@Component({
  selector: 'app-mascota-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
    MatCheckboxModule,
    MatCardModule,
    MatDividerModule,
    MatButtonToggleModule
  ],
  templateUrl: './mascota-form.component.html',
  styleUrls: ['./mascota-form.component.scss']
})
export class MascotaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private mascotaService = inject(MascotaService);
  private clienteService = inject(ClienteService);
  private dialogRef = inject(MatDialogRef<MascotaFormComponent>);
  data: Mascota | null = inject(MAT_DIALOG_DATA, { optional: true });

  mascotaForm!: FormGroup;
  loading = false;
  isEditMode = false;

  clientes = signal<Cliente[]>([]);
  filteredClientes!: Observable<Cliente[]>;

  // Propiedades para manejo de foto
  photoPreview: string | null = null;
  uploadMethod: 'url' | 'file' = 'url';
  selectedFile: File | null = null; // Guardar el archivo seleccionado

  sexoOptions = [
    { value: Sexo.Macho, label: 'Macho' },
    { value: Sexo.Hembra, label: 'Hembra' }
  ];

  especiesComunes = [
    'Perro', 'Gato', 'Ave', 'Conejo', 'Hámster', 'Cobayo', 'Hurón', 'Tortuga', 'Pez'
  ];

  /**
   * Obtener URL completa de la imagen (para usar en el template)
   */
  getFullImageUrl(fotoUrl: string | null): string | null {
    return this.mascotaService.getFullImageUrl(fotoUrl);
  }

  ngOnInit(): void {
    this.isEditMode = !!this.data;
    this.initForm();
    this.setupClienteFilter(); // Configura el filtro antes de cargar los datos
    this.loadClientes();       // loadClientes ahora se encarga de setear el valor al terminar

    if (this.isEditMode && this.data) {
      // Configurar foto previa con URL completa
      if (this.data.fotoUrl) {
        this.photoPreview = this.mascotaService.getFullImageUrl(this.data.fotoUrl);
      }

      // Parcheamos todo excepto el clienteId (que se hará en loadClientes)
      this.mascotaForm.patchValue({
        ...this.data,
        fechaNacimiento: this.data.fechaNacimiento ? new Date(this.data.fechaNacimiento) : null,
        fechaEsterilizacion: this.data.fechaEsterilizacion ? new Date(this.data.fechaEsterilizacion) : null,
      });
    }
  }

  initForm(): void {
    this.mascotaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      especie: ['', [Validators.required, Validators.maxLength(50)]],
      raza: ['', [Validators.maxLength(100)]],
      sexo: [Sexo.Macho, [Validators.required]],
      color: ['', [Validators.maxLength(100)]],
      fechaNacimiento: [null],
      pesoKg: [null, [Validators.min(0.01), Validators.max(999)]],
      clienteId: [null, [Validators.required]],
      observaciones: ['', [Validators.maxLength(1000)]],
      fotoUrl: [null],
      // Nuevos campos
      microchip: ['', [Validators.maxLength(50)]],
      tienePedigree: [false],
      numeroPedigree: ['', [Validators.maxLength(100)]],
      esterilizado: [false],
      fechaEsterilizacion: [null],
      senasParticulares: ['', [Validators.maxLength(500)]]
    });
  }

  loadClientes(): void {
    this.clienteService.getAll().subscribe({
      next: (data) => {
        this.clientes.set(data);

        // SI estamos en modo edición, volvemos a aplicar el valor del cliente
        // esto asegura que el autocomplete encuentre al cliente en la lista ya cargada
        if (this.isEditMode && this.data) {
          this.mascotaForm.get('clienteId')?.setValue(this.data.clienteId);
        }
      },
      error: (err) => console.error('Error al cargar clientes:', err)
    });
  }

  setupClienteFilter(): void {
    const clienteControl = this.mascotaForm.get('clienteId');
    if (clienteControl) {
      this.filteredClientes = clienteControl.valueChanges.pipe(
        startWith(''),
        map(value => {
          // Si es un objeto (seleccionado), usamos su nombre para filtrar, si no, el string escrito
          const name = typeof value === 'object' && value ? value.nombreCompleto : value;
          const searchValue = typeof name === 'string' ? name : '';
          return searchValue ? this._filterClientes(searchValue) : this.clientes().slice();
        })
      );
    }
  }

  private _filterClientes(value: string): Cliente[] {
    const filterValue = value.toLowerCase();
    return this.clientes().filter(cliente =>
      cliente.nombreCompleto.toLowerCase().includes(filterValue) ||
      (cliente.telefono && cliente.telefono.includes(filterValue))
    );
  }

  displayClienteFn(clienteId: any): string {
    if (clienteId === null || clienteId === undefined) return '';

    // Si por alguna razón recibimos el objeto completo
    if (typeof clienteId === 'object' && clienteId.nombreCompleto) {
      return clienteId.nombreCompleto;
    }

    // Buscamos en la señal de clientes
    const listaActual = this.clientes();
    if (listaActual.length > 0) {
      const cliente = listaActual.find(c => c.id === clienteId);
      return cliente ? cliente.nombreCompleto : '';
    }

    // Si no hay lista aún pero tenemos el dato inicial de la mascota, 
    // podríamos usar data.clienteNombre como fallback temporal
    return this.data?.clienteNombre || '';
  }

  onSubmit(): void {
    if (this.mascotaForm.invalid) {
      this.mascotaForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = { ...this.mascotaForm.value };

    // Limpieza de clienteId: Si el usuario seleccionó del autocomplete, 
    // el valor podría ser el objeto completo o solo el ID.
    if (typeof formValue.clienteId === 'object' && formValue.clienteId !== null) {
      formValue.clienteId = formValue.clienteId.id;
    }

    // Limpieza de fotoUrl
    if (this.uploadMethod === 'url' && formValue.fotoUrl && !formValue.fotoUrl.startsWith('data:')) {
      // Mantener la URL ingresada manualmente
    } else {
      formValue.fotoUrl = null;
    }

    if (this.isEditMode && this.data) {
      // MODO EDICIÓN
      const updateDto: UpdateMascotaDto = {
        ...formValue,
        id: this.data.id,
        activo: true
      };

      // Si hay archivo seleccionado, primero subirlo
      if (this.selectedFile) {
        this.mascotaService.uploadPhoto(this.data.id, this.selectedFile).subscribe({
          next: (response) => {
            // Actualizar con la URL de la foto subida
            updateDto.fotoUrl = response.fotoUrl;
            this.updateMascota(this.data!.id, updateDto);
          },
          error: (error) => {
            console.error('Error al subir foto:', error);
            this.loading = false;
            alert('Error al subir la foto.');
          }
        });
      } else {
        // Actualizar sin subir nueva foto
        this.updateMascota(this.data.id, updateDto);
      }
    } else {
      // MODO CREACIÓN
      const createDto: CreateMascotaDto = { ...formValue };

      // Si hay archivo seleccionado, primero crear la mascota y luego subir foto
      if (this.selectedFile) {
        this.mascotaService.create(createDto).subscribe({
          next: (mascotaCreada) => {
            // Ahora subir la foto
            this.mascotaService.uploadPhoto(mascotaCreada.id, this.selectedFile!).subscribe({
              next: (response) => {
                // Actualizar la mascota con la URL de la foto
                const updateDto: UpdateMascotaDto = {
                  ...createDto,
                  id: mascotaCreada.id,
                  fotoUrl: response.fotoUrl,
                  activo: true
                };
                this.mascotaService.update(mascotaCreada.id, updateDto).subscribe({
                  next: () => {
                    this.loading = false;
                    this.dialogRef.close(true);
                  },
                  error: (error) => {
                    console.error('Error al actualizar con foto:', error);
                    this.loading = false;
                    // La mascota se creó, pero falló actualizar la foto
                    this.dialogRef.close(true);
                  }
                });
              },
              error: (error) => {
                console.error('Error al subir foto:', error);
                this.loading = false;
                // La mascota se creó, pero falló subir la foto
                this.dialogRef.close(true);
              }
            });
          },
          error: (error) => {
            console.error('Error al crear:', error);
            this.loading = false;
            alert('Error al crear la mascota. El servidor rechazó la solicitud.');
          }
        });
      } else {
        // Crear sin foto
        this.mascotaService.create(createDto).subscribe({
          next: () => this.dialogRef.close(true),
          error: (error) => {
            console.error('Error al crear:', error);
            this.loading = false;
            alert('Error al crear la mascota. El servidor rechazó la solicitud.');
          }
        });
      }
    }
  }

  private updateMascota(id: number, updateDto: UpdateMascotaDto): void {
    this.mascotaService.update(id, updateDto).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
        this.loading = false;
        alert('Error al actualizar la mascota. Verifique los datos.');
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  // Métodos para manejo de foto
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor seleccione un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar 5MB');
        return;
      }

      // Guardar el archivo para enviarlo después
      this.selectedFile = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.photoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.photoPreview = null;
    this.selectedFile = null;
    this.mascotaForm.patchValue({ fotoUrl: null });
  }

  onPhotoUrlChange(url: string): void {
    if (url) {
      this.photoPreview = url;
    } else {
      this.photoPreview = null;
    }
  }

  getErrorMessage(fieldName: string): string {
    const control = this.mascotaForm.get(fieldName);
    if (control?.hasError('required')) return 'Este campo es requerido';
    if (control?.hasError('minlength')) return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    if (control?.hasError('maxlength')) return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres`;
    if (control?.hasError('min')) return `Valor mínimo: ${control.errors?.['min'].min}`;
    return '';
  }
}