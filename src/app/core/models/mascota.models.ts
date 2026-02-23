export enum Sexo {
  Macho = 'Macho',
  Hembra = 'Hembra'
}

export interface Mascota {
  id: number;
  nombre: string;
  especie: string;
  raza: string | null;
  sexo: Sexo;
  sexoTexto: string;
  color: string | null;
  fechaNacimiento: Date | null;
  edadAnios: number | null;
  pesoKg: number | null;
  clienteId: number;
  clienteNombre: string;
  observaciones: string | null;
  fotoUrl: string | null;
  microchip: string | null;
  tienePedigree: boolean;
  numeroPedigree: string | null;
  esterilizado: boolean;
  fechaEsterilizacion: Date | null;
  senasParticulares: string | null;
  fechaRegistro: Date;
  activo: boolean;
}

export interface CreateMascotaDto {
  nombre: string;
  especie: string;
  raza?: string;
  sexo: Sexo;
  color?: string;
  fechaNacimiento?: Date;
  pesoKg?: number;
  clienteId: number;
  observaciones?: string;
  fotoUrl?: string;
  microchip?: string;
  tienePedigree?: boolean;
  numeroPedigree?: string;
  esterilizado?: boolean;
  fechaEsterilizacion?: Date;
  senasParticulares?: string;
}

export interface UpdateMascotaDto {
  id: number;
  nombre: string;
  especie: string;
  raza?: string;
  sexo: Sexo;
  color?: string;
  fechaNacimiento?: Date;
  pesoKg?: number;
  clienteId: number;
  observaciones?: string;
  fotoUrl?: string;
  microchip?: string;
  tienePedigree?: boolean;
  numeroPedigree?: string;
  esterilizado?: boolean;
  fechaEsterilizacion?: Date;
  senasParticulares?: string;
  activo: boolean;
}