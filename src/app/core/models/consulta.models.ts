export interface Consulta {
  id: number;
  citaId: number | null;
  esWalkIn: boolean;
  mascotaId: number;
  mascotaNombre: string;
  mascotaEspecie: string;
  clienteId: number;
  clienteNombre: string;
  veterinarioId: number;
  veterinarioNombre: string;
  fechaHora: Date;
  motivo: string;
  pesoKg: number | null;
  temperaturaCelsius: number | null;
  frecuenciaCardiaca: number | null;
  frecuenciaRespiratoria: number | null;
  diagnostico: string;
  tratamiento: string | null;
  observaciones: string | null;
  proximaVisita: Date | null;
  fechaCreacion: Date;
  recetas?: any[];
  examenes?: any[];
  examenesLaboratorio?: any[];
  recetasMedicamentos?: any[];
}

export interface CreateConsultaDto {
  citaId?: number;
  mascotaId: number;
  clienteId: number;
  veterinarioId: number;
  fechaHora: Date;
  motivo: string;
  pesoKg?: number;
  temperaturaCelsius?: number;
  frecuenciaCardiaca?: number;
  frecuenciaRespiratoria?: number;
  diagnostico: string;
  tratamiento?: string;
  observaciones?: string;
  proximaVisita?: Date;
}

export interface UpdateConsultaDto {
  id: number;
  citaId?: number;
  mascotaId: number;
  clienteId: number;
  veterinarioId: number;
  fechaHora: Date;
  motivo: string;
  pesoKg?: number;
  temperaturaCelsius?: number;
  frecuenciaCardiaca?: number;
  frecuenciaRespiratoria?: number;
  diagnostico: string;
  tratamiento?: string;
  observaciones?: string;
  proximaVisita?: Date;
}