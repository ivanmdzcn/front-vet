export interface Usuario {
  id: number;
  username: string;
  nombreCompleto: string;
  email: string | null;
  rol: string;
  rolId: number;
  activo: boolean;
  fechaCreacion: Date;
  ultimoAcceso: Date | null;
}

export interface CreateUsuarioDto {
  username: string;
  password: string;
  nombreCompleto: string;
  email?: string;
  rolId: number;
}

export interface UpdateUsuarioDto {
  id: number;
  username: string;
  nombreCompleto: string;
  email?: string;
  rolId: number;
  activo: boolean;
}

export interface ChangePasswordDto {
  id: number;
  passwordActual: string;
  passwordNuevo: string;
}