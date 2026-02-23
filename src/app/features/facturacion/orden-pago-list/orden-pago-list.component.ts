import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { FacturacionService } from '../services/facturacion.service';
import { OrdenPago, EstadoOrden } from '../../../core/models/facturacion.models';
import { OrdenPagoFormComponent } from '../orden-pago-form/orden-pago-form.component';
import { OrdenPagoDetalleComponent } from '../orden-pago-detalle/orden-pago-detalle.component';
import { ObservacionDialogComponent } from '../observacion-dialog/observacion-dialog.component';
import { MonedaPipe } from '../../../shared/pipes/moneda.pipe';

@Component({
  selector: 'app-orden-pago-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MonedaPipe
  ],
  templateUrl: './orden-pago-list.component.html',
  styleUrl: './orden-pago-list.component.scss'
})
export class OrdenPagoListComponent implements OnInit {
  private facturacionService = inject(FacturacionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  ordenes = signal<OrdenPago[]>([]);
  displayedOrdenes = signal<OrdenPago[]>([]);
  loading = signal(true);
  
  searchControl = new FormControl('');
  
  displayedColumns: string[] = ['id', 'fecha', 'clienteNombre', 'total', 'estado', 'acciones'];
  
  // Paginación
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  EstadoOrden = EstadoOrden;

  ngOnInit(): void {
    this.loadOrdenes();
    this.setupSearch();
  }

  setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        this.filterOrdenes(query || '');
      });
  }

  loadOrdenes(): void {
    this.loading.set(true);
    this.facturacionService.getOrdenesPago().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.ordenes.set(response.data);
          this.totalItems = response.data.length;
          this.updateDisplayedOrdenes();
        } else {
          this.showError(response.errorMessage || 'Error al cargar órdenes');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar órdenes:', error);
        this.showError('Error al cargar las órdenes');
        this.loading.set(false);
      }
    });
  }

  filterOrdenes(query: string): void {
    const filtered = this.ordenes().filter(o => 
      o.clienteNombre.toLowerCase().includes(query.toLowerCase()) ||
      o.id.toString().includes(query)
    );
    this.totalItems = filtered.length;
    this.pageIndex = 0;
    this.updateDisplayedOrdenes(filtered);
  }

  updateDisplayedOrdenes(source?: OrdenPago[]): void {
    const data = source || this.ordenes();
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedOrdenes.set(data.slice(startIndex, endIndex));
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    
    const query = this.searchControl.value || '';
    if (query) {
      this.filterOrdenes(query);
    } else {
      this.updateDisplayedOrdenes();
    }
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(OrdenPagoFormComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showSuccess('Orden creada exitosamente');
        this.loadOrdenes();
      }
    });
  }

  verDetalle(orden: OrdenPago): void {
    // Cargar la orden completa con sus detalles
    this.facturacionService.getOrdenPagoById(orden.id).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.dialog.open(OrdenPagoDetalleComponent, {
            width: '800px',
            maxHeight: '90vh',
            data: response.data
          });
        } else {
          this.showError(response.errorMessage || 'Error al cargar el detalle de la orden');
        }
      },
      error: (error) => {
        console.error('Error al cargar orden:', error);
        this.showError('Error al cargar el detalle de la orden');
      }
    });
  }
verReporte(orden: OrdenPago): void {
    // Navegar a la vista del reporte
    this.router.navigate(['/reportes/orden-pago', orden.id]);
  }

  
  confirmarOrden(orden: OrdenPago): void {
    const dialogRef = this.dialog.open(ObservacionDialogComponent, {
      width: '500px',
      data: {
        titulo: 'Confirmar Orden',
        mensaje: `¿Está seguro de confirmar la orden ${orden.numeroOrden}? Esta acción descuenta el stock de productos.`,
        accion: 'confirmar'
      }
    });

    dialogRef.afterClosed().subscribe(observacion => {
      if (observacion) {
        this.facturacionService.confirmarOrden(orden.id, observacion).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.showSuccess('Orden confirmada exitosamente');
              this.loadOrdenes();
            } else {
              this.showError(response.errorMessage || 'Error al confirmar orden');
            }
          },
          error: (error) => {
            console.error('Error al confirmar orden:', error);
            this.showError('Error al confirmar la orden');
          }
        });
      }
    });
  }

  anularOrden(orden: OrdenPago): void {
    const dialogRef = this.dialog.open(ObservacionDialogComponent, {
      width: '500px',
      data: {
        titulo: 'Anular Orden',
        mensaje: `¿Está seguro de anular la orden ${orden.numeroOrden}? Esta acción devuelve el stock de productos.`,
        accion: 'anular'
      }
    });

    dialogRef.afterClosed().subscribe(observacion => {
      if (observacion) {
        this.facturacionService.anularOrden(orden.id, observacion).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.showSuccess('Orden anulada exitosamente');
              this.loadOrdenes();
            } else {
              this.showError(response.errorMessage || 'Error al anular orden');
            }
          },
          error: (error) => {
            console.error('Error al anular orden:', error);
            this.showError('Error al anular la orden');
          }
        });
      }
    });
  }

  getEstadoClass(estado: number): string {
    switch (estado) {
      case EstadoOrden.Pendiente:
        return 'chip-pendiente';
      case EstadoOrden.Confirmada:
        return 'chip-confirmada';
      case EstadoOrden.Anulada:
        return 'chip-anulada';
      default:
        return '';
    }
  }

  getEstadoNombre(estado: number): string {
    switch (estado) {
      case EstadoOrden.Pendiente:
        return 'Pendiente';
      case EstadoOrden.Confirmada:
        return 'Confirmada';
      case EstadoOrden.Anulada:
        return 'Anulada';
      default:
        return 'Desconocido';
    }
  }

  canConfirmar(orden: OrdenPago): boolean {
    return orden.estado === EstadoOrden.Pendiente;
  }

  canAnular(orden: OrdenPago): boolean {
    return orden.estado !== EstadoOrden.Anulada;
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}
