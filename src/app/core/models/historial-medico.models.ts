// ==================== VACUNAS ====================
export interface Vacuna {
  id: number;
  mascotaId: number;
  consultaId: number | null;
  nombreVacuna: string;
  tipoVacuna: string | null;
  fechaAplicacion: Date;
  proximaDosis: Date | null;
  veterinarioId: number;
  veterinarioNombre: string;
  lote: string | null;
  fabricante: string | null;
  observaciones: string | null;
  fechaRegistro: Date;
}

export interface CreateVacunaDto {
  mascotaId: number;
  consultaId?: number;
  nombreVacuna: string;
  tipoVacuna?: string;
  fechaAplicacion: Date;
  proximaDosis?: Date;
  veterinarioId: number;
  lote?: string;
  fabricante?: string;
  observaciones?: string;
}

export interface UpdateVacunaDto {
  id: number;
  nombreVacuna: string;
  tipoVacuna?: string;
  fechaAplicacion: Date;
  proximaDosis?: Date;
  lote?: string;
  fabricante?: string;
  observaciones?: string;
}

// ==================== DESPARASITACIONES ====================
export interface Desparasitacion {
  id: number;
  mascotaId: number;
  consultaId: number | null;
  tipo: string; // "Interna", "Externa", "Ambas"
  producto: string;
  fechaAplicacion: Date;
  proximaDosis: Date | null;
  veterinarioId: number;
  veterinarioNombre: string;
  dosis: number | null;
  unidad: string | null;
  observaciones: string | null;
  fechaRegistro: Date;
}

export interface CreateDesparasitacionDto {
  mascotaId: number;
  consultaId?: number;
  tipo: string;
  producto: string;
  fechaAplicacion: Date;
  proximaDosis?: Date;
  veterinarioId: number;
  dosis?: number;
  unidad?: string;
  observaciones?: string;
}

export interface UpdateDesparasitacionDto {
  id: number;
  tipo: string;
  producto: string;
  fechaAplicacion: Date;
  proximaDosis?: Date;
  dosis?: number;
  unidad?: string;
  observaciones?: string;
}

// ==================== EXÁMENES DE LABORATORIO ====================
export interface ExamenLaboratorio {
  id: number;
  mascotaId: number;
  consultaId: number;
  tipoExamen: string;
  descripcion: string | null;
  fechaSolicitud: Date;
  fechaResultado: Date | null;
  veterinarioId: number;
  veterinarioNombre: string;
  resultado: string | null;
  archivoUrl: string | null;
  analista: string | null;
  observaciones: string | null;
  fechaRegistro: Date;
}

export interface CreateExamenLaboratorioDto {
  mascotaId: number;
  consultaId: number;
  tipoExamen: string;
  descripcion?: string;
  fechaSolicitud: Date;
  veterinarioId: number;
  observaciones?: string;
}

export interface UpdateExamenLaboratorioDto {
  id: number;
  tipoExamen: string;
  descripcion?: string;
  fechaResultado?: Date;
  resultado?: string;
  archivoUrl?: string;
  analista?: string;
  observaciones?: string;
}

// ==================== CIRUGÍAS ====================
export interface Cirugia {
  id: number;
  mascotaId: number;
  consultaId: number | null;
  tipoCirugia: string;
  fechaCirugia: Date;
  veterinarioId: number;
  veterinarioNombre: string;
  anestesiaUtilizada: string | null;
  preDiagnostico: string | null;
  hallazgosIntraOperatorios: string | null;
  complicaciones: string | null;
  duracionMinutos: number | null;
  observaciones: string | null;
  fechaRegistro: Date;
}

export interface CreateCirugiaDto {
  mascotaId: number;
  consultaId?: number;
  tipoCirugia: string;
  fechaCirugia: Date;
  veterinarioId: number;
  anestesiaUtilizada?: string;
  preDiagnostico?: string;
  hallazgosIntraOperatorios?: string;
  complicaciones?: string;
  duracionMinutos?: number;
  observaciones?: string;
}

export interface UpdateCirugiaDto {
  id: number;
  tipoCircugia: string;
  fechaCircugia: Date;
  anestesiaUtilizada?: string;
  preDiagnostico?: string;
  hallazgosIntraOperatorios?: string;
  complicaciones?: string;
  duracionMinutos?: number;
  observaciones?: string;
}

// ==================== ALERGIAS ====================
export interface Alergia {
  id: number;
  mascotaId: number;
  alergia: string;
  tipo: string | null;
  severidad: string | null;
  reaccion: string | null;
  fechaDiagnostico: Date;
  veterinarioId: number;
  veterinarioNombre: string;
  observaciones: string | null;
  fechaRegistro: Date;
}

export interface CreateAlergiaDto {
  mascotaId: number;
  alergia: string;
  tipo?: string;
  severidad?: string;
  reaccion?: string;
  fechaDiagnostico: Date;
  veterinarioId: number;
  observaciones?: string;
}

export interface UpdateAlergiaDto {
  id: number;
  alergia: string;
  tipo?: string;
  severidad?: string;
  reaccion?: string;
  fechaDiagnostico: Date;
  observaciones?: string;
}

// ==================== ANTECEDENTES PATOLÓGICOS ====================
export interface AntecedentePatologico {
  id: number;
  mascotaId: number;
  enfermedad: string;
  fechaDiagnostico: Date;
  estado: string; // "activo", "controlado", "resuelto"
  descripcion: string;
  medicamentosActuales: string | null;
  frecuenciaVisitasRecomendada: string | null;
  veterinarioAsignado: number;
  veterinarioNombre: string;
  observaciones: string | null;
  fechaRegistro: Date;
}

export interface CreateAntecedentePatologicoDto {
  mascotaId: number;
  enfermedad: string;
  fechaDiagnostico: Date;
  estado: string;
  descripcion: string;
  medicamentosActuales?: string;
  frecuenciaVisitasRecomendada?: string;
  veterinarioAsignado: number;
  observaciones?: string;
}

export interface UpdateAntecedentePatologicoDto {
  id: number;
  enfermedad: string;
  fechaDiagnostico: Date;
  estado: string;
  descripcion: string;
  medicamentosActuales?: string;
  frecuenciaVisitasRecomendada?: string;
  observaciones?: string;
}

// ==================== RECETAS/MEDICAMENTOS ====================
export interface RecetaMedicamento {
  id: number;
  consultaId: number;
  mascotaId: number;
  veterinarioId: number;
  veterinarioNombre: string;
  medicamento: string;
  dosis: number;
  unidad: string;
  frecuencia: string;
  duracionDias: number;
  viaAdministracion: string;
  indicaciones: string | null;
  contraindicaciones: string | null;
  fechaPrescripcion: Date;
  fechaRegistro: Date;
}

export interface CreateRecetaMedicamentoDto {
  consultaId: number;
  mascotaId: number;
  veterinarioId: number;
  medicamento: string;
  dosis: number;
  unidad: string;
  frecuencia: string;
  duracionDias: number;
  viaAdministracion: string;
  indicaciones?: string;
  contraindicaciones?: string;
  fechaPrescripcion: Date;
}

export interface UpdateRecetaMedicamentoDto {
  id: number;
  medicamento: string;
  dosis: number;
  unidad: string;
  frecuencia: string;
  duracionDias: number;
  viaAdministracion: string;
  indicaciones?: string;
  contraindicaciones?: string;
}

// ==================== HISTORIAL COMPLETO ====================
export interface HistorialMedicoCompleto {
  mascota: {
    id: number;
    nombre: string;
    especie: string;
    raza: string | null;
    sexoTexto: string;
    edadAnios: number | null;
    clienteNombre: string;
  };
  vacunas: Vacuna[];
  desparasitaciones: Desparasitacion[];
  examenesLaboratorio: ExamenLaboratorio[];
  cirugias: Cirugia[];
  alergias: Alergia[];
  antecedentesPatologicos: AntecedentePatologico[];
  recetasMedicamentos: RecetaMedicamento[];
}
