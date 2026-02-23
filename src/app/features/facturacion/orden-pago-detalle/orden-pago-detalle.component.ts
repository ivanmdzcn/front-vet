import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { OrdenPago, EstadoOrden } from '../../../core/models/facturacion.models';
import { MonedaPipe } from '../../../shared/pipes/moneda.pipe';

@Component({
  selector: 'app-orden-pago-detalle',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MonedaPipe
  ],
  templateUrl: './orden-pago-detalle.component.html',
  styleUrl: './orden-pago-detalle.component.scss'
})
export class OrdenPagoDetalleComponent {
  private dialogRef = inject(MatDialogRef<OrdenPagoDetalleComponent>);
  orden: OrdenPago = inject(MAT_DIALOG_DATA);

  displayedColumns: string[] = ['tipo', 'nombre', 'cantidad', 'precioUnitario', 'subtotal'];

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

  getTipoIcon(detalle: any): string {
    return detalle.productoId ? 'inventory_2' : 'medical_services';
  }

  getNombre(detalle: any): string {
    return detalle.nombreItem || '-';
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
