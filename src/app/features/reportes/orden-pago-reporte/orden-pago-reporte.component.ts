import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ReporteService } from '../services/reporte.service';
import { OrdenPagoReporte, DetalleOrdenPagoReporte } from '../../../core/models/orden-pago-reporte.models';

// Interfaz para detalles agrupados
export interface DetalleOrdenPagoAgrupado {
  nombreItem: string;
  tipoItem: 'producto' | 'servicio' | 'otro';
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}
import { MonedaPipe } from '../../../shared/pipes/moneda.pipe';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-orden-pago-reporte',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MonedaPipe
  ],
  templateUrl: './orden-pago-reporte.component.html',
  styleUrls: ['./orden-pago-reporte.component.scss']
})
export class OrdenPagoReporteComponent implements OnInit {
  reporte = signal<OrdenPagoReporte | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  logoUrl = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reporteService: ReporteService
  ) {}

  ngOnInit(): void {
    const ordenId = Number(this.route.snapshot.paramMap.get('id'));
    if (ordenId) {
      this.cargarReporte(ordenId);
    } else {
      this.error.set('ID de orden inválido');
    }
  }

  cargarReporte(ordenId: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.reporteService.getOrdenPagoReporte(ordenId).subscribe({
      next: (data) => {
        this.reporte.set(data);
        // Generar URL del logo con timestamp fijo para evitar caché
        if (data.empresa.logoUrl) {
          const baseUrl = this.reporteService.getLogoUrl(data.empresa.logoUrl);
          this.logoUrl.set(`${baseUrl}?t=${Date.now()}`);
        }
        this.loading.set(false);
      },
      error: (err) => {
        let errorMsg = 'Error al cargar el reporte';
        
        if (err.status === 401) {
          errorMsg = 'No autorizado. Por favor, inicie sesión nuevamente';
          this.router.navigate(['/auth/login']);
        } else if (err.status === 404) {
          errorMsg = 'Orden de pago no encontrada';
        } else if (err.error?.errorMessage) {
          errorMsg = err.error.errorMessage;
        }
        
        this.error.set(errorMsg);
        this.loading.set(false);
        console.error('Error al cargar reporte:', err);
      }
    });
  }

  imprimir(): void {
    window.print();
  }

  async descargarPDF(): Promise<void> {
    const reporte = this.reporte();
    if (!reporte) return;

    const doc = new jsPDF();
    let yPosition = 20;

    // Configuración de fuentes
    doc.setFont('helvetica');

    // INTENTAR CARGAR EL LOGO
    let logoBase64: string | null = null;
    if (reporte.empresa.logoUrl && this.logoUrl()) {
      try {
        logoBase64 = await this.cargarImagenBase64(this.logoUrl());
      } catch (error) {
        console.warn('No se pudo cargar el logo para el PDF:', error);
      }
    }

    // HEADER CON LOGO E INFORMACIÓN DE LA EMPRESA
    const inicioHeader = yPosition;
    const pageCenter = doc.internal.pageSize.getWidth() / 2;
    
    // Si hay logo, agregarlo a la izquierda
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'JPEG', 15, yPosition, 30, 30);
      } catch (error) {
        console.warn('No se pudo agregar el logo al PDF:', error);
      }
    }

    // INFORMACIÓN DE LA EMPRESA (CENTRADA)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(reporte.empresa.nombreComercial || reporte.empresa.razonSocial, pageCenter, yPosition, { align: 'center' });
    yPosition += 5;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    if (reporte.empresa.numeroIdentificacionFiscal) {
      doc.text(`NIT: ${reporte.empresa.numeroIdentificacionFiscal}`, pageCenter, yPosition, { align: 'center' });
      yPosition += 4;
    }
    if (reporte.empresa.direccion) {
      doc.text(`${reporte.empresa.direccion}, ${reporte.empresa.ciudad || ''}`, pageCenter, yPosition, { align: 'center' });
      yPosition += 4;
    }
    if (reporte.empresa.telefono) {
      doc.text(`Tel: ${reporte.empresa.telefono}`, pageCenter, yPosition, { align: 'center' });
      yPosition += 4;
    }
    if (reporte.empresa.email) {
      doc.text(reporte.empresa.email, pageCenter, yPosition, { align: 'center' });
      yPosition += 4;
    }

    // Asegurar que yPosition esté después del logo si existe
    if (logoBase64) {
      yPosition = Math.max(yPosition, inicioHeader + 35); // 35 = altura del logo + margen
    }

    yPosition += 5;
    doc.line(15, yPosition, doc.internal.pageSize.getWidth() - 15, yPosition);
    yPosition += 10;

    // TÍTULO
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDEN DE PAGO', pageCenter, yPosition, { align: 'center' });
    yPosition += 10;

    // INFORMACIÓN DE LA ORDEN
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Información de la Orden', 15, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Número: ${reporte.numeroOrden}`, 15, yPosition);
    doc.text(`Fecha: ${new Date(reporte.fechaEmision).toLocaleDateString('es-GT')}`, 100, yPosition);
    yPosition += 5;
    doc.text(`Estado: ${reporte.estado}`, 15, yPosition);
    yPosition += 10;

    // INFORMACIÓN DEL CLIENTE
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Cliente', 15, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${reporte.cliente.nombreCompleto}`, 15, yPosition);
    yPosition += 5;
    if (reporte.cliente.dpi) {
      doc.text(`DPI: ${reporte.cliente.dpi}`, 15, yPosition);
      yPosition += 5;
    }
    if (reporte.cliente.telefono) {
      doc.text(`Teléfono: ${reporte.cliente.telefono}`, 15, yPosition);
      yPosition += 5;
    }
    if (reporte.cliente.direccion) {
      doc.text(`Dirección: ${reporte.cliente.direccion}`, 15, yPosition);
      yPosition += 5;
    }
    yPosition += 5;

    // INFORMACIÓN DE LA MASCOTA (si existe)
    if (reporte.mascota) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Mascota', 15, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nombre: ${reporte.mascota.nombre}`, 15, yPosition);
      doc.text(`Especie: ${reporte.mascota.especie}`, 100, yPosition);
      yPosition += 5;
      if (reporte.mascota.raza) {
        doc.text(`Raza: ${reporte.mascota.raza}`, 15, yPosition);
        yPosition += 5;
      }
      yPosition += 5;
    }

    // INFORMACIÓN DE LA CONSULTA (si existe)
    if (reporte.consulta) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Consulta Veterinaria', 15, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${new Date(reporte.consulta.fecha).toLocaleDateString('es-GT')}`, 15, yPosition);
      yPosition += 5;
      if (reporte.veterinario) {
        doc.text(`Veterinario: ${reporte.veterinario.nombre}`, 15, yPosition);
        yPosition += 5;
      }
      if (reporte.consulta.motivo) {
        doc.text(`Motivo: ${reporte.consulta.motivo}`, 15, yPosition);
        yPosition += 5;
      }
      yPosition += 5;
    }

    // TABLA DE ITEMS (agrupados)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle de Items', 15, yPosition);
    yPosition += 7;

    const itemsAgrupados = this.agruparDetalles();
    const tableData = itemsAgrupados.map(item => [
      item.nombreItem,
      item.tipoItem,
      item.cantidad.toString(),
      this.formatearMoneda(item.precioUnitario, reporte.empresa),
      this.formatearMoneda(item.subtotal, reporte.empresa)
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Ítem', 'Tipo', 'Cant.', 'Precio Unit.', 'Subtotal']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [33, 150, 243], textColor: 255 },
      styles: { fontSize: 9 },
      columnStyles: {
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right' }
      }
    });

    // Obtener la posición Y después de la tabla
    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // TOTALES
    const pageWidth = doc.internal.pageSize.getWidth();
    const rightMargin = 15;
    const labelX = pageWidth - 70;
    const valueX = pageWidth - rightMargin;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.text('Subtotal:', labelX, yPosition);
    doc.text(this.formatearMoneda(reporte.subtotal, reporte.empresa), valueX, yPosition, { align: 'right' });
    yPosition += 6;

    if (reporte.descuento > 0) {
      doc.text('Descuento:', labelX, yPosition);
      doc.text(`-${this.formatearMoneda(reporte.descuento, reporte.empresa)}`, valueX, yPosition, { align: 'right' });
      yPosition += 6;
    }

    if (reporte.impuesto > 0) {
      doc.text('IVA:', labelX, yPosition);
      doc.text(this.formatearMoneda(reporte.impuesto, reporte.empresa), valueX, yPosition, { align: 'right' });
      yPosition += 6;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.line(labelX, yPosition, pageWidth - rightMargin, yPosition);
    yPosition += 7;
    doc.text('TOTAL:', labelX, yPosition);
    doc.text(this.formatearMoneda(reporte.total, reporte.empresa), valueX, yPosition, { align: 'right' });
    yPosition += 10;

    // OBSERVACIONES
    if (reporte.observaciones) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Observaciones:', 15, yPosition);
      yPosition += 5;
      doc.setFont('helvetica', 'normal');
      const splitObservaciones = doc.splitTextToSize(reporte.observaciones, pageWidth - 30);
      doc.text(splitObservaciones, 15, yPosition);
      yPosition += splitObservaciones.length * 5 + 5;
    }

    // FOOTER
    if (yPosition > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100);
    
    if (reporte.empresa.piePaginaDocumentos) {
      doc.text(reporte.empresa.piePaginaDocumentos, doc.internal.pageSize.getWidth() / 2, yPosition, { align: 'center' });
      yPosition += 5;
    }
    
    if (reporte.empresa.mensajeAgradecimiento) {
      doc.text(reporte.empresa.mensajeAgradecimiento, doc.internal.pageSize.getWidth() / 2, yPosition, { align: 'center' });
    }

    // Descargar el PDF
    doc.save(`orden-pago-${reporte.numeroOrden}.pdf`);
  }

  volver(): void {
    this.router.navigate(['/ordenes-pago']);
  }

  getLogoUrl(): string {
    return this.logoUrl();
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }

  getEstadoClase(estado: string): string {
    return `estado-${estado.toLowerCase()}`;
  }

  getTipoItemClase(tipo: string): string {
    return `badge-${tipo.toLowerCase()}`;
  }

  /**
   * Agrupa los detalles por nombreItem y suma las cantidades
   * Mantiene el precio unitario y calcula el subtotal total
   */
  agruparDetalles(): DetalleOrdenPagoAgrupado[] {
    const reporte = this.reporte();
    if (!reporte) return [];

    const agrupados = new Map<string, DetalleOrdenPagoAgrupado>();

    reporte.detalles.forEach(detalle => {
      const nombre = detalle.nombreItem || detalle.servicioNombre || detalle.productoNombre || 'Sin nombre';
      
      if (agrupados.has(nombre)) {
        const existente = agrupados.get(nombre)!;
        existente.cantidad += detalle.cantidad;
        existente.subtotal += detalle.subtotal;
      } else {
        agrupados.set(nombre, {
          nombreItem: nombre,
          tipoItem: detalle.tipoItem,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario,
          subtotal: detalle.subtotal
        });
      }
    });

    return Array.from(agrupados.values());
  }

  /**
   * Carga una imagen desde una URL y la convierte a base64
   */
  private async cargarImagenBase64(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      return new Promise<string | null>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error al cargar imagen:', error);
      return null;
    }
  }

  /**
   * Formatea un valor numérico con la configuración de moneda de la empresa
   */
  private formatearMoneda(valor: number, empresa: any): string {
    const { simboloMoneda, posicionSimbolo, separadorMiles, separadorDecimales, decimales } = empresa;
    
    // Formatear el número con decimales
    const valorFormateado = valor.toFixed(decimales)
      .replace('.', separadorDecimales);
    
    // Agregar separador de miles
    const partes = valorFormateado.split(separadorDecimales);
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, separadorMiles);
    const numeroFinal = partes.join(separadorDecimales);
    
    // Agregar símbolo según posición
    return posicionSimbolo === 'antes' 
      ? `${simboloMoneda} ${numeroFinal}`
      : `${numeroFinal} ${simboloMoneda}`;
  }
}
