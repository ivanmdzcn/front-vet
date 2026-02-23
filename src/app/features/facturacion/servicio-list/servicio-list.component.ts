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
import { Servicio } from '../../../core/models/facturacion.models';
import { ServicioFormComponent } from '../servicio-form/servicio-form.component';
import { MonedaPipe } from '../../../shared/pipes/moneda.pipe';

@Component({
  selector: 'app-servicio-list',
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
  templateUrl: './servicio-list.component.html',
  styleUrl: './servicio-list.component.scss'
})
export class ServicioListComponent implements OnInit {
  private facturacionService = inject(FacturacionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  servicios = signal<Servicio[]>([]);
  displayedServicios = signal<Servicio[]>([]);
  loading = signal(true);
  
  searchControl = new FormControl('');
  
  displayedColumns: string[] = ['nombre', 'categoria', 'precio', 'estado', 'acciones'];
  
  // Paginación
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  ngOnInit(): void {
    this.loadServicios();
    this.setupSearch();
  }

  setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        this.filterServicios(query || '');
      });
  }

  loadServicios(): void {
    this.loading.set(true);
    this.facturacionService.getServicios().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.servicios.set(response.data);
          this.totalItems = response.data.length;
          this.updateDisplayedServicios();
        } else {
          this.showError(response.errorMessage || 'Error al cargar servicios');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
        this.showError('Error al cargar los servicios');
        this.loading.set(false);
      }
    });
  }

  filterServicios(query: string): void {
    const filtered = this.servicios().filter(s => 
      s.nombre.toLowerCase().includes(query.toLowerCase()) ||
      (s.categoria && s.categoria.toLowerCase().includes(query.toLowerCase()))
    );
    this.totalItems = filtered.length;
    this.pageIndex = 0;
    this.updateDisplayedServicios(filtered);
  }

  updateDisplayedServicios(source?: Servicio[]): void {
    const data = source || this.servicios();
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedServicios.set(data.slice(startIndex, endIndex));
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    
    const query = this.searchControl.value || '';
    if (query) {
      this.filterServicios(query);
    } else {
      this.updateDisplayedServicios();
    }
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ServicioFormComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showSuccess('Servicio creado exitosamente');
        this.loadServicios();
      }
    });
  }

  openEditDialog(servicio: Servicio): void {
    const dialogRef = this.dialog.open(ServicioFormComponent, {
      width: '600px',
      data: servicio,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.showSuccess('Servicio actualizado exitosamente');
        this.loadServicios();
      }
    });
  }

  deleteServicio(servicio: Servicio): void {
    if (confirm(`¿Está seguro de eliminar el servicio "${servicio.nombre}"?`)) {
      this.facturacionService.eliminarServicio(servicio.id).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.showSuccess('Servicio eliminado exitosamente');
            this.loadServicios();
          } else {
            this.showError(response.errorMessage || 'Error al eliminar servicio');
          }
        },
        error: (error) => {
          console.error('Error al eliminar servicio:', error);
          this.showError('Error al eliminar el servicio');
        }
      });
    }
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
