import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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

import { MascotaService } from '../services/mascota.service';
import { Mascota } from '../../../core/models/mascota.models';
import { MascotaFormComponent } from '../mascota-form/mascota-form.component';
import { HistorialMedicoComponent } from '../historial-medico/historial-medico.component';

@Component({
  selector: 'app-mascota-list',
  standalone: true,
  imports: [
    CommonModule,
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
    MatTooltipModule
  ],
  templateUrl: './mascota-list.component.html',
  styleUrl: './mascota-list.component.scss'
})
export class MascotaListComponent implements OnInit {
  private mascotaService = inject(MascotaService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  mascotas = signal<Mascota[]>([]);
  displayedMascotas = signal<Mascota[]>([]);
  loading = signal(true);
  
  searchControl = new FormControl('');
  
  displayedColumns: string[] = ['nombre', 'especie', 'raza', 'sexo', 'cliente', 'edad', 'peso', 'acciones'];
  
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  /**
   * Obtener URL completa de la imagen (para usar en el template)
   */
  getFullImageUrl(fotoUrl: string | null): string | null {
    return this.mascotaService.getFullImageUrl(fotoUrl);
  }

  ngOnInit(): void {
    this.loadMascotas();
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
          this.loadMascotas();
        }
      });
  }

  loadMascotas(): void {
    this.loading.set(true);
    this.mascotaService.getAll().subscribe({
      next: (data) => {
        this.mascotas.set(data);
        this.totalItems = data.length;
        this.updateDisplayedMascotas();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar mascotas:', error);
        this.showMessage('Error al cargar mascotas');
        this.loading.set(false);
      }
    });
  }

  search(query: string): void {
    this.loading.set(true);
    this.mascotaService.search(query).subscribe({
      next: (data) => {
        this.mascotas.set(data);
        this.totalItems = data.length;
        this.pageIndex = 0;
        this.updateDisplayedMascotas();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al buscar mascotas:', error);
        this.showMessage('Error al buscar mascotas');
        this.loading.set(false);
      }
    });
  }

  updateDisplayedMascotas(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedMascotas.set(this.mascotas().slice(startIndex, endIndex));
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updateDisplayedMascotas();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(MascotaFormComponent, {
      width: '700px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMascotas();
        this.showMessage('Mascota registrada exitosamente');
      }
    });
  }

  openEditDialog(mascota: Mascota): void {
    const dialogRef = this.dialog.open(MascotaFormComponent, {
      width: '700px',
      disableClose: true,
      data: mascota
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMascotas();
        this.showMessage('Mascota actualizada exitosamente');
      }
    });
  }

  openHistorialMedico(mascota: Mascota): void {
    this.dialog.open(HistorialMedicoComponent, {
      width: '95vw',
      maxWidth: '1400px',
      height: '90vh',
      data: {
        mascotaId: mascota.id,
        mascotaNombre: mascota.nombre,
        mascotaEspecie: mascota.especie,
        mascotaRaza: mascota.raza,
        mascotaEdadAnios: mascota.edadAnios,
        clienteNombre: mascota.clienteNombre
      }
    });
  }

  deleteMascota(mascota: Mascota): void {
    if (confirm(`¿Está seguro de eliminar a ${mascota.nombre}?`)) {
      this.mascotaService.delete(mascota.id).subscribe({
        next: () => {
          this.loadMascotas();
          this.showMessage('Mascota eliminada exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar mascota:', error);
          this.showMessage('Error al eliminar mascota');
        }
      });
    }
  }

  getEspecieIcon(especie: string): string {
    const especieLower = especie.toLowerCase();
    if (especieLower.includes('perro')) return 'pets';
    if (especieLower.includes('gato')) return 'pets';
    if (especieLower.includes('ave') || especieLower.includes('loro')) return 'flutter_dash';
    if (especieLower.includes('conejo')) return 'cruelty_free';
    return 'pets';
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}