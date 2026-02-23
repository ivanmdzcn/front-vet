import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Observable, startWith, map } from 'rxjs';

import { FacturacionService } from '../services/facturacion.service';
import { ClienteService } from '../../clientes/services/cliente.service';
import { CitaService } from '../../citas/services/cita.service';
import { ConsultaService } from '../../consultas/services/consulta.service';
import { Cliente } from '../../../core/models/cliente.models';
import { Producto, Servicio } from '../../../core/models/facturacion.models';
import { Cita } from '../../../core/models/cita.models';
import { Consulta } from '../../../core/models/consulta.models';
import { MonedaPipe } from '../../../shared/pipes/moneda.pipe';

@Component({
  selector: 'app-orden-pago-form',
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
    MatAutocompleteModule,
    MatTableModule,
    MatDividerModule,
    MatCheckboxModule,
    MonedaPipe
  ],
  templateUrl: './orden-pago-form.component.html',
  styleUrl: './orden-pago-form.component.scss'
})
export class OrdenPagoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private facturacionService = inject(FacturacionService);
  private clienteService = inject(ClienteService);
  private citaService = inject(CitaService);
  private consultaService = inject(ConsultaService);
  private dialogRef = inject(MatDialogRef<OrdenPagoFormComponent>);

  ordenForm!: FormGroup;
  loading = false;
  simboloMoneda = 'Q';

  clientes = signal<Cliente[]>([]);
  productos = signal<Producto[]>([]);
  servicios = signal<Servicio[]>([]);
  citas = signal<Cita[]>([]);
  consultas = signal<Consulta[]>([]);
  detallesDataSource = signal<FormGroup[]>([]);

  mostrarCitas = signal(false);
  mostrarConsultas = signal(false);

  filteredClientes$!: Observable<Cliente[]>;

  displayedColumns: string[] = ['tipo', 'nombre', 'cantidad', 'precio', 'subtotal', 'acciones'];

  ngOnInit(): void {
    this.cargarSimboloMoneda();
    this.initForm();
    this.loadData();
    this.setupClienteAutocomplete();
    
    // Actualizar total cuando cambien impuesto o descuento
    this.ordenForm.get('impuesto')?.valueChanges.subscribe(() => {
      // Trigger change detection for total calculation
    });
    this.ordenForm.get('descuento')?.valueChanges.subscribe(() => {
      // Trigger change detection for total calculation
    });
  }

  cargarSimboloMoneda(): void {
    const configCache = sessionStorage.getItem('configuracion_moneda');
    if (configCache) {
      const config = JSON.parse(configCache);
      this.simboloMoneda = config.simboloMoneda || 'Q';
    }
  }

  initForm(): void {
    this.ordenForm = this.fb.group({
      clienteId: [null, Validators.required],
      clienteNombre: ['', Validators.required],
      mascotaId: [null],
      citaId: [null],
      consultaId: [null],
      impuesto: [0, [Validators.min(0)]],
      descuento: [0, [Validators.min(0)]],
      observaciones: [''],
      detalles: this.fb.array([])
    });
  }

  loadData(): void {
    // Cargar clientes
    this.clienteService.getAll().subscribe({
      next: (clientes) => {
        this.clientes.set(clientes);
      },
      error: (error) => console.error('Error al cargar clientes:', error)
    });

    // Cargar productos activos
    this.facturacionService.getProductosActivos().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.productos.set(response.data);
        }
      },
      error: (error) => console.error('Error al cargar productos:', error)
    });

    // Cargar servicios activos
    this.facturacionService.getServiciosActivos().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.servicios.set(response.data);
        }
      },
      error: (error) => console.error('Error al cargar servicios:', error)
    });
  }

  setupClienteAutocomplete(): void {
    this.filteredClientes$ = this.ordenForm.get('clienteNombre')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const filterValue = typeof value === 'string' ? value : (value?.nombreCompleto || '');
        return this._filterClientes(filterValue);
      })
    );
  }

  private _filterClientes(value: string): Cliente[] {
    if (!value) return this.clientes();
    const filterValue = value.toLowerCase();
    return this.clientes().filter(c => 
      c.nombreCompleto.toLowerCase().includes(filterValue)
    );
  }

  onClienteSelected(cliente: Cliente): void {
    this.ordenForm.patchValue({
      clienteId: cliente.id,
      clienteNombre: cliente.nombreCompleto
    });
    
    // Cargar citas y consultas del cliente
    this.cargarCitasCliente(cliente.id);
    this.cargarConsultasCliente(cliente.id);
  }

  cargarCitasCliente(clienteId: number): void {
    this.citaService.getByCliente(clienteId).subscribe({
      next: (citas) => {
        // Filtrar solo citas confirmadas o pendientes
        const citasDisponibles = citas.filter(c => 
          c.estado === 'Confirmada' || c.estado === 'Pendiente'
        );
        this.citas.set(citasDisponibles);
      },
      error: (error) => console.error('Error al cargar citas:', error)
    });
  }

  cargarConsultasCliente(clienteId: number): void {
    this.consultaService.getByClienteId(clienteId).subscribe({
      next: (consultas) => {
        this.consultas.set(consultas);
      },
      error: (error) => console.error('Error al cargar consultas:', error)
    });
  }

  onCitaCheckChange(checked: boolean): void {
    this.mostrarCitas.set(checked);
    if (checked) {
      // Si se marca citas, desmarcar consultas
      this.mostrarConsultas.set(false);
      this.ordenForm.patchValue({ consultaId: null });
    } else {
      // Si se desmarca, limpiar citaId
      this.ordenForm.patchValue({ citaId: null });
    }
  }

  onConsultaCheckChange(checked: boolean): void {
    this.mostrarConsultas.set(checked);
    if (checked) {
      // Si se marca consultas, desmarcar citas
      this.mostrarCitas.set(false);
      this.ordenForm.patchValue({ citaId: null });
    } else {
      // Si se desmarca, limpiar consultaId
      this.ordenForm.patchValue({ consultaId: null });
    }
  }

  displayCliente = (cliente: Cliente | string): string => {
    if (!cliente) return '';
    return typeof cliente === 'string' ? cliente : cliente.nombreCompleto;
  }

  get detalles(): FormArray {
    return this.ordenForm.get('detalles') as FormArray;
  }

  agregarProducto(): void {
    if (this.productos().length === 0) {
      alert('No hay productos disponibles');
      return;
    }

    const detalle = this.fb.group({
      id: [Date.now() + Math.random()], // ID único para trackBy
      tipo: ['producto'],
      productoId: [this.productos()[0].id, Validators.required],
      servicioId: [null],
      nombre: [this.productos()[0].nombre],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [this.productos()[0].precioVenta],
      subtotal: [this.productos()[0].precioVenta]
    });

    this.subscribeToDetalle(detalle);
    this.detalles.push(detalle);
    this.updateDetallesDataSource();
  }

  agregarServicio(): void {
    if (this.servicios().length === 0) {
      alert('No hay servicios disponibles');
      return;
    }

    const detalle = this.fb.group({
      id: [Date.now() + Math.random()], // ID único para trackBy
      tipo: ['servicio'],
      productoId: [null],
      servicioId: [this.servicios()[0].id, Validators.required],
      nombre: [this.servicios()[0].nombre],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [this.servicios()[0].precio],
      subtotal: [this.servicios()[0].precio]
    });

    this.subscribeToDetalle(detalle);
    this.detalles.push(detalle);
    this.updateDetallesDataSource();
  }

  subscribeToDetalle(detalle: FormGroup): void {
    // Actualizar al cambiar producto
    detalle.get('productoId')?.valueChanges.subscribe(id => {
      if (id) {
        const producto = this.productos().find(p => p.id === id);
        if (producto) {
          detalle.patchValue({
            nombre: producto.nombre,
            precioUnitario: producto.precioVenta,
            subtotal: producto.precioVenta * detalle.get('cantidad')?.value
          }, { emitEvent: false });
        }
      }
    });

    // Actualizar al cambiar servicio
    detalle.get('servicioId')?.valueChanges.subscribe(id => {
      if (id) {
        const servicio = this.servicios().find(s => s.id === id);
        if (servicio) {
          detalle.patchValue({
            nombre: servicio.nombre,
            precioUnitario: servicio.precio,
            subtotal: servicio.precio * detalle.get('cantidad')?.value
          }, { emitEvent: false });
        }
      }
    });

    // Actualizar al cambiar cantidad
    detalle.get('cantidad')?.valueChanges.subscribe(cantidad => {
      const precio = detalle.get('precioUnitario')?.value || 0;
      detalle.patchValue({
        subtotal: precio * cantidad
      }, { emitEvent: false });
    });
  }

  eliminarDetalle(index: number): void {
    this.detalles.removeAt(index);
    this.updateDetallesDataSource();
  }

  updateDetallesDataSource(): void {
    this.detallesDataSource.set([...this.detalles.controls as FormGroup[]]);
  }

  getTotal(): number {
    const subtotal = this.detalles.controls.reduce((sum, detalle) => {
      return sum + (detalle.get('subtotal')?.value || 0);
    }, 0);
    const impuesto = this.ordenForm.get('impuesto')?.value || 0;
    const descuento = this.ordenForm.get('descuento')?.value || 0;
    return subtotal + impuesto - descuento;
  }

  getSubtotal(): number {
    return this.detalles.controls.reduce((sum, detalle) => {
      return sum + (detalle.get('subtotal')?.value || 0);
    }, 0);
  }

  onSubmit(): void {
    if (this.ordenForm.invalid) {
      this.ordenForm.markAllAsTouched();
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (this.detalles.length === 0) {
      alert('Debe agregar al menos un producto o servicio');
      return;
    }

    this.loading = true;

    const createDto = {
      clienteId: this.ordenForm.get('clienteId')?.value,
      mascotaId: this.ordenForm.get('mascotaId')?.value || null,
      citaId: this.ordenForm.get('citaId')?.value || null,
      consultaId: this.ordenForm.get('consultaId')?.value || null,
      impuesto: this.ordenForm.get('impuesto')?.value || 0,
      descuento: this.ordenForm.get('descuento')?.value || 0,
      observaciones: this.ordenForm.get('observaciones')?.value || '',
      detalles: this.detalles.controls.map(d => ({
        productoId: d.get('productoId')?.value,
        servicioId: d.get('servicioId')?.value,
        cantidad: d.get('cantidad')?.value
      }))
    };

    this.facturacionService.crearOrdenPago(createDto).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.dialogRef.close(true);
        } else {
            alert(response.errorMessage || 'Error al crear la orden');
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error al crear orden:', error);
        alert('Error al crear la orden');
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  trackByDetalle(index: number, detalle: AbstractControl): any {
    return detalle.get('id')?.value || index;
  }
}
