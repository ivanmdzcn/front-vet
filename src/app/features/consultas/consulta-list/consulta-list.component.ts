import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';

import { ConsultaService } from '../services/consulta.service';
import { Consulta } from '../../../core/models/consulta.models';
import { ConsultaFormComponent } from '../consulta-form/consulta-form.component';
import { ConsultaDetalleComponent } from '../consulta-detalle/consulta-detalle.component';

@Component({
  selector: 'app-consulta-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatExpansionModule
  ],
  templateUrl: './consulta-list.component.html',
  styleUrl: './consulta-list.component.scss'
})
export class ConsultaListComponent implements OnInit {
  private consultaService = inject(ConsultaService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  consultas = signal<Consulta[]>([]);
  displayedConsultas = signal<Consulta[]>([]);
  loading = signal(true);
  
  displayedColumns: string[] = ['fechaHora', 'mascota', 'cliente', 'veterinario', 'diagnostico', 'tipo', 'acciones'];
  
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  ngOnInit(): void {
    this.loadConsultas();
  }

  loadConsultas(): void {
    this.loading.set(true);
    this.consultaService.getAll().subscribe({
      next: (data) => {
        this.consultas.set(data);
        this.totalItems = data.length;
        this.updateDisplayedConsultas();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar consultas:', error);
        this.showMessage('Error al cargar consultas');
        this.loading.set(false);
      }
    });
  }

  updateDisplayedConsultas(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedConsultas.set(this.consultas().slice(startIndex, endIndex));
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updateDisplayedConsultas();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ConsultaFormComponent, {
      width: '800px',
      maxHeight: '90vh',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadConsultas();
        this.showMessage('Consulta registrada exitosamente');
      }
    });
  }

  openEditDialog(consulta: Consulta): void {
    const dialogRef = this.dialog.open(ConsultaFormComponent, {
      width: '800px',
      maxHeight: '90vh',
      disableClose: true,
      data: consulta
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadConsultas();
        this.showMessage('Consulta actualizada exitosamente');
      }
    });
  }

  openDetalleDialog(consulta: Consulta): void {
    this.dialog.open(ConsultaDetalleComponent, {
      width: '900px',
      maxHeight: '90vh',
      data: { consultaId: consulta.id }
    });
  }

  deleteConsulta(consulta: Consulta): void {
    if (confirm(`¿Está seguro de eliminar esta consulta?`)) {
      this.consultaService.delete(consulta.id).subscribe({
        next: () => {
          this.loadConsultas();
          this.showMessage('Consulta eliminada exitosamente');
        },
        error: (error) => {
          console.error('Error al eliminar consulta:', error);
          this.showMessage('Error al eliminar consulta');
        }
      });
    }
  }

  formatFechaHora(fecha: Date): string {
    const date = new Date(fecha);
    return date.toLocaleString('es-GT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatProximaVisita(fecha: Date | null): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-GT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}