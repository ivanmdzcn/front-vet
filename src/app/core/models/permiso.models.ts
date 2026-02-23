export interface Permiso {
  id: number;
  codigo: string;
  modulo: string;
  accion: string;
  descripcion: string | null;
}

export interface PermisoAgrupado {
  modulo: string;
  permisos: Permiso[];
}