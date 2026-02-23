export enum EstadoCita {
  Pendiente = 'Pendiente',
  Confirmada = 'Confirmada',
  Cancelada = 'Cancelada',
  Completada = 'Completada',
  NoAsistio = 'NoAsistio'
}

export interface Cita {
  id: number;
  mascotaId: number;
  mascotaNombre: string;
  clienteId: number;
  clienteNombre: string;
  clienteTelefono: string;
  veterinarioId: number;
  veterinarioNombre: string;
  fechaHora: Date;
  motivo: string;
  estado: EstadoCita;
  estadoTexto: string;
  observaciones: string | null;
  fechaCreacion: Date;
  creadoPorNombre: string;
}

export interface CreateCitaDto {
  mascotaId: number;
  clienteId: number;
  veterinarioId: number;
  fechaHora: Date;
  motivo: string;
  observaciones?: string;
}

export interface UpdateCitaDto {
  id: number;
  mascotaId: number;
  clienteId: number;
  veterinarioId: number;
  fechaHora: Date;
  motivo: string;
  estado: EstadoCita;
  observaciones?: string;
}

export interface CambiarEstadoCitaDto {
  id: number;
  nuevoEstado: EstadoCita;
}