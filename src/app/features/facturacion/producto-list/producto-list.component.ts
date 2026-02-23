import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { FacturacionService } from '../services/facturacion.service';
import { Producto } from '../../../core/models/facturacion.models';
import { ProductoFormComponent } from '../producto-form/producto-form.component';
import { MonedaPipe } from '../../../shared/pipes/moneda.pipe';

@Component({
  selector: 'app-producto-list',
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
    MonedaPipe
  ],
  templateUrl: './producto-list.component.html',
  styleUrl: './producto-list.component.scss'
})
export class ProductoListComponent implements OnInit {
  private facturacionService = inject(FacturacionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  productos = signal<Producto[]>([]);
  displayedProductos = signal<Producto[]>([]);
  loading = signal(true);
  
  searchControl = new FormControl('');
  
  displayedColumns: string[] = ['nombre', 'codigoBarras', 'precioVenta', 'stockActual', 'stockMinimo', 'estado', 'acciones'];
  
  // Paginación
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  ngOnInit(): void {
    this.loadProductos();
    this.setupSearch();
  }

  setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        this.filterProductos(query || '');
      });
  }

  loadProductos(): void {
    this.loading.set(true);
    this.facturacionService.getProductos().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.productos.set(response.data);
          this.totalItems = response.data.length;
          this.updateDisplayedProductos();
        } else {
          this.showError(response.errorMessage || 'Error al cargar productos');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.showError('Error al cargar los productos');
        this.loading.set(false);
      }
    });
  }

  filterProductos(query: string): void {
    const filtered = this.productos().filter(p => 
      p.nombre.toLowerCase().includes(query.toLowerCase()) ||
      (p.codigoBarras && p.codigoBarras.toLowerCase().includes(query.toLowerCase()))
    );
    this.totalItems = filtered.length;
    this.pageIndex = 0;
    this.updateDisplayedProductos(filtered);
  }

  updateDisplayedProductos(source?: Producto[]): void {
    const data = source || this.productos();
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedProductos.set(data.slice(startIndex, endIndex));
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    
    const query = this.searchControl.value || '';
    if (query) {
      this.filterProductos(query);
    } else {
      this.updateDisplayedProductos();
    }
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProductoFormComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showSuccess('Producto creado exitosamente');
        this.loadProductos();
      }
    });
  }

  openEditDialog(producto: Producto): void {
    const dialogRef = this.dialog.open(ProductoFormComponent, {
      width: '600px',
      data: producto,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showSuccess('Producto actualizado exitosamente');
        this.loadProductos();
      }
    });
  }

  deleteProducto(producto: Producto): void {
    if (confirm(`¿Está seguro de eliminar el producto "${producto.nombre}"?`)) {
      this.facturacionService.eliminarProducto(producto.id).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.showSuccess('Producto eliminado exitosamente');
            this.loadProductos();
          } else {
            this.showError(response.errorMessage || 'Error al eliminar producto');
          }
        },
        error: (error) => {
          console.error('Error al eliminar producto:', error);
          this.showError('Error al eliminar el producto');
        }
      });
    }
  }

  isBajoStock(producto: Producto): boolean {
    return producto.stockActual <= producto.stockMinimo;
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
