import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Result,
  Producto,
  CreateProductoDto,
  UpdateProductoDto,
  Servicio,
  CreateServicioDto,
  UpdateServicioDto,
  OrdenPago,
  CreateOrdenPagoDto,
  UpdateOrdenPagoDto
} from '../../../core/models/facturacion.models';

@Injectable({
  providedIn: 'root'
})
export class FacturacionService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // ==================== PRODUCTOS ====================

  getProductos(): Observable<Result<Producto[]>> {
    return this.http.get<Result<Producto[]>>(`${this.apiUrl}/Productos`);
  }

  getProductosActivos(): Observable<Result<Producto[]>> {
    return this.http.get<Result<Producto[]>>(`${this.apiUrl}/Productos/activos`);
  }

  getProductosBajoStock(): Observable<Result<Producto[]>> {
    return this.http.get<Result<Producto[]>>(`${this.apiUrl}/Productos/bajo-stock`);
  }

  getProductoById(id: number): Observable<Result<Producto>> {
    return this.http.get<Result<Producto>>(`${this.apiUrl}/Productos/${id}`);
  }

  getProductoPorCodigoBarras(codigo: string): Observable<Result<Producto>> {
    return this.http.get<Result<Producto>>(`${this.apiUrl}/Productos/codigo/${codigo}`);
  }

  crearProducto(dto: CreateProductoDto): Observable<Result<Producto>> {
    return this.http.post<Result<Producto>>(`${this.apiUrl}/Productos`, dto);
  }

  actualizarProducto(id: number, dto: UpdateProductoDto): Observable<Result<Producto>> {
    return this.http.put<Result<Producto>>(`${this.apiUrl}/Productos/${id}`, dto);
  }

  eliminarProducto(id: number): Observable<Result<boolean>> {
    return this.http.delete<Result<boolean>>(`${this.apiUrl}/Productos/${id}`);
  }

  // ==================== SERVICIOS ====================

  getServicios(): Observable<Result<Servicio[]>> {
    return this.http.get<Result<Servicio[]>>(`${this.apiUrl}/Servicios`);
  }

  getServiciosActivos(): Observable<Result<Servicio[]>> {
    return this.http.get<Result<Servicio[]>>(`${this.apiUrl}/Servicios/activos`);
  }

  getServiciosPorCategoria(categoria: string): Observable<Result<Servicio[]>> {
    return this.http.get<Result<Servicio[]>>(`${this.apiUrl}/Servicios/categoria/${categoria}`);
  }

  getServicioById(id: number): Observable<Result<Servicio>> {
    return this.http.get<Result<Servicio>>(`${this.apiUrl}/Servicios/${id}`);
  }

  crearServicio(dto: CreateServicioDto): Observable<Result<Servicio>> {
    return this.http.post<Result<Servicio>>(`${this.apiUrl}/Servicios`, dto);
  }

  actualizarServicio(id: number, dto: UpdateServicioDto): Observable<Result<Servicio>> {
    return this.http.put<Result<Servicio>>(`${this.apiUrl}/Servicios/${id}`, dto);
  }

  eliminarServicio(id: number): Observable<Result<boolean>> {
    return this.http.delete<Result<boolean>>(`${this.apiUrl}/Servicios/${id}`);
  }

  // ==================== ÓRDENES DE PAGO ====================

  getOrdenesPago(): Observable<Result<OrdenPago[]>> {
    return this.http.get<Result<OrdenPago[]>>(`${this.apiUrl}/OrdenesPago`);
  }

  getOrdenesPorCliente(clienteId: number): Observable<Result<OrdenPago[]>> {
    return this.http.get<Result<OrdenPago[]>>(`${this.apiUrl}/OrdenesPago/cliente/${clienteId}`);
  }

  getOrdenesPorEstado(estado: number): Observable<Result<OrdenPago[]>> {
    return this.http.get<Result<OrdenPago[]>>(`${this.apiUrl}/OrdenesPago/estado/${estado}`);
  }

  getOrdenPagoById(id: number): Observable<Result<OrdenPago>> {
    return this.http.get<Result<OrdenPago>>(`${this.apiUrl}/OrdenesPago/${id}`);
  }

  crearOrdenPago(dto: CreateOrdenPagoDto): Observable<Result<OrdenPago>> {
    return this.http.post<Result<OrdenPago>>(`${this.apiUrl}/OrdenesPago`, dto);
  }

  actualizarOrdenPago(id: number, dto: UpdateOrdenPagoDto): Observable<Result<OrdenPago>> {
    return this.http.put<Result<OrdenPago>>(`${this.apiUrl}/OrdenesPago/${id}`, dto);
  }

  confirmarOrden(id: number, observacion?: string): Observable<Result<boolean>> {
    return this.http.post<Result<boolean>>(`${this.apiUrl}/OrdenesPago/${id}/confirmar`, {
      observaciones: observacion || ''
    });
  }

  anularOrden(id: number, observacion?: string): Observable<Result<boolean>> {
    return this.http.post<Result<boolean>>(`${this.apiUrl}/OrdenesPago/${id}/anular`, {
      observaciones: observacion || ''
    });
  }

  eliminarOrden(id: number): Observable<Result<boolean>> {
    return this.http.delete<Result<boolean>>(`${this.apiUrl}/OrdenesPago/${id}`);
  }
}
