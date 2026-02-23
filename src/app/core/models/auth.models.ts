export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuarioId: number;
  username: string;
  nombreCompleto: string;
  rol: string;
  permisos: string[];
}

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