export interface OrdenPagoReporte {
  id: number;
  numeroOrden: string;
  fechaEmision: string;  // ISO 8601 date string
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
  estado: string;
  observaciones?: string;
  cliente: ClienteReporte;
  mascota?: MascotaReporte;
  consulta?: ConsultaReporte;
  veterinario?: VeterinarioReporte;
  empresa: EmpresaReporte;
  detalles: DetalleOrdenPagoReporte[];
}

export interface ClienteReporte {
  id: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  dpi?: string;
}

export interface MascotaReporte {
  id: number;
  nombre: string;
  especie: string;
  raza?: string;
  sexo: string;
  color?: string;
  peso?: number;
}

export interface ConsultaReporte {
  id: number;
  fecha: string;  // ISO 8601 date string
  motivo?: string;
  diagnostico?: string;
}

export interface VeterinarioReporte {
  id: number;
  nombre: string;
}

export interface EmpresaReporte {
  razonSocial: string;
  nombreComercial?: string;
  numeroIdentificacionFiscal?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigoPostal?: string;
  pais?: string;
  telefono?: string;
  telefonoSecundario?: string;
  email?: string;
  sitioWeb?: string;
  logoUrl?: string;
  codigoMoneda: string;
  simboloMoneda: string;
  nombreMoneda?: string;
  posicionSimbolo: string;
  separadorMiles: string;
  separadorDecimales: string;
  decimales: number;
  piePaginaDocumentos?: string;
  mensajeAgradecimiento?: string;
}

export interface DetalleOrdenPagoReporte {
  id: number;
  ordenPagoId: number;
  nombreItem: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  tipoItem: 'producto' | 'servicio' | 'otro';
  servicioId?: number;
  servicioNombre?: string;
  servicioCategoria?: string;
  productoId?: number;
  productoNombre?: string;
  productoCodigo?: string;
}
