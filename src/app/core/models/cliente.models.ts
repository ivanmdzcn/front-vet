export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  ciudad: string | null;
  dpi: string | null;
  fechaRegistro: Date;
  activo: boolean;
}

export interface CreateClienteDto {
  nombre: string;
  apellido: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  dpi?: string;
}

export interface UpdateClienteDto {
  id: number;
  nombre: string;
  apellido: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  dpi?: string;
  activo: boolean;
}