export interface Rol {
  id: number;
  nombre: string;
  descripcion: string | null;
  cantidadPermisos: number;
}

export interface RolConPermisos {
  rolId: number;
  rolNombre: string;
  permisos: PermisoAsignado[];
}

export interface PermisoAsignado {
  permisoId: number;
  codigo: string;
  modulo: string;
  accion: string;
  asignado: boolean;
}

export interface CreateRolDto {
  nombre: string;
  descripcion?: string;
}

export interface UpdateRolDto {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface AsignarPermisosDto {
  permisosIds: number[];
}