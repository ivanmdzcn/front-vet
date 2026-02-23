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
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ClienteService } from '../services/cliente.service';
import { Cliente } from '../../../core/models/cliente.models';
import { ClienteFormComponent } from '../cliente-form/cliente-form.component';

@Component({
  selector: 'app-cliente-list',
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
    MatProgressSpinnerModule
  ],
  templateUrl: './cliente-list.component.html',
  styleUrl: './cliente-list.component.scss'
})
export class ClienteListComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  clientes = signal<Cliente[]>([]);
  displayedClientes = signal<Cliente[]>([]);
  loading = signal(true);
  
  searchControl = new FormControl('');
  
  displayedColumns: string[] = ['nombreCompleto', 'telefono', 'email', 'ciudad', 'dpi', 'acciones'];
  
  // Paginación
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  ngOnInit(): void {
    this.loadClientes();
    this.setupSearch();
  }

  setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        if (query && query.trim()) {
          this.search(query.trim());
        } else {
          this.loadClientes();
        }
      });
  }

  loadClientes(): void {
    this.loading.set(true);
    this.clienteService.getAll().subscribe({
      next: (data) => {
        this.clientes.set(data);
        this.totalItems = data.length;
        this.updateDisplayedClientes();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.showMessage('Error al cargar clientes');
        this.loading.set(false);
      }
    });
  }

  search(query: string): void {
    this.loading.set(true);
    this.clienteService.search(query).subscribe({
      next: (data) => {
        this.clientes.set(data);
        this.totalItems = data.length;
        this.pageIndex = 0;
        this.updateDisplayedClientes();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al buscar clientes:', error);
        this.showMessage('Error al buscar clientes');
        this.loading.set(false);
      }
    });
  }

  updateDisplayedClientes(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedClientes.set(this.clientes().slice(startIndex, endIndex));
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updateDisplayedClientes();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ClienteFormComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadClientes();
        this.showMessage('Cliente creado exitosamente');
      }
    });
  }

  openEditDialog(cliente: Cliente): void {
    const dialogRef = this.dialog.open(ClienteFormComponent, {
      width: '600px',
      disableClose: true,
      data: cliente
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadClientes();
        this.showMessage('Cliente actualizado exitosamente');
      }
    });
  }

  deleteCliente(cliente: Cliente): void {
    if (confirm(`¿Está seguro de eliminar al cliente ${cliente.nombreCompleto}?`)) {
      this.clienteService.delete(cliente.id).subscribe({
        next: () => {
          this.loadClientes();
          this.showMessage('Cliente eliminado exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar cliente:', error);
          this.showMessage('Error al eliminar cliente');
        }
      });
    }
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}