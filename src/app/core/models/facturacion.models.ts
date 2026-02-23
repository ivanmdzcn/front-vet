export interface Result<T> {
  isSuccess: boolean;
  data?: T;
  errorMessage?: string;
}

// ==================== PRODUCTOS ====================

export interface Producto {
  id: number;
  nombre: string;
  codigoBarras?: string;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductoDto {
  nombre: string;
  codigoBarras?: string;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
}

export interface UpdateProductoDto {
  id: number;
  nombre: string;
  codigoBarras?: string;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  activo: boolean;
}

// ==================== SERVICIOS ====================

export interface Servicio {
  id: number;
  nombre: string;
  precio: number;
  categoria?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServicioDto {
  nombre: string;
  precio: number;
  categoria?: string;
}

export interface UpdateServicioDto {
  id: number;
  nombre: string;
  precio: number;
  categoria?: string;
  activo: boolean;
}

// ==================== ÓRDENES DE PAGO ====================

export interface OrdenPago {
  id: number;
  numeroOrden: string;
  clienteId: number;
  clienteNombre: string;
  mascotaId?: number;
  mascotaNombre?: string;
  consultaId?: number;
  citaId?: number;
  subtotal: number;
  impuesto: number;
  descuento: number;
  total: number;
  estado: number;
  estadoTexto: string;
  observaciones?: string;
  fechaEmision: Date;
  detalles: OrdenPagoDetalle[];
}

export interface OrdenPagoDetalle {
  id: number;
  productoId?: number;
  servicioId?: number;
  nombreItem: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  tipoItem: string; // "Producto" | "Servicio"
}

export interface CreateOrdenPagoDto {
  clienteId: number;
  mascotaId?: number;
  consultaId?: number;
  citaId?: number;
  impuesto: number;
  descuento: number;
  observaciones?: string;
  detalles: CreateOrdenPagoDetalleDto[];
}

export interface CreateOrdenPagoDetalleDto {
  productoId?: number;
  servicioId?: number;
  cantidad: number;
}

export interface UpdateOrdenPagoDto {
  id: number;
  clienteId: number;
  mascotaId?: number;
  consultaId?: number;
  citaId?: number;
  impuesto: number;
  descuento: number;
  observaciones?: string;
  detalles: CreateOrdenPagoDetalleDto[];
}

// ==================== ENUMS ====================

export enum EstadoOrden {
  Pendiente = 1,
  Confirmada = 2,
  Anulada = 3
}

export const EstadoOrdenLabels: Record<EstadoOrden, string> = {
  [EstadoOrden.Pendiente]: 'Pendiente',
  [EstadoOrden.Confirmada]: 'Confirmada',
  [EstadoOrden.Anulada]: 'Anulada'
};
