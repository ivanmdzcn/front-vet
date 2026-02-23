import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  Vacuna,
  CreateVacunaDto,
  UpdateVacunaDto,
  Desparasitacion,
  CreateDesparasitacionDto,
  UpdateDesparasitacionDto,
  ExamenLaboratorio,
  CreateExamenLaboratorioDto,
  UpdateExamenLaboratorioDto,
  Cirugia,
  CreateCirugiaDto,
  UpdateCirugiaDto,
  Alergia,
  CreateAlergiaDto,
  UpdateAlergiaDto,
  AntecedentePatologico,
  CreateAntecedentePatologicoDto,
  UpdateAntecedentePatologicoDto,
  RecetaMedicamento,
  CreateRecetaMedicamentoDto,
  UpdateRecetaMedicamentoDto,
  HistorialMedicoCompleto
} from '../../../core/models/historial-medico.models';

@Injectable({
  providedIn: 'root'
})
export class HistorialMedicoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // ==================== VACUNAS ====================
  getVacunasByMascotaId(mascotaId: number): Observable<Vacuna[]> {
    return this.http.get<Vacuna[]>(`${this.apiUrl}/vacunas/mascota/${mascotaId}`);
  }

  createVacuna(vacuna: CreateVacunaDto): Observable<Vacuna> {
    return this.http.post<Vacuna>(`${this.apiUrl}/vacunas`, vacuna);
  }

  updateVacuna(id: number, vacuna: UpdateVacunaDto): Observable<Vacuna> {
    return this.http.put<Vacuna>(`${this.apiUrl}/vacunas/${id}`, vacuna);
  }

  deleteVacuna(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/vacunas/${id}`);
  }

  getVacunasPendientes(): Observable<Vacuna[]> {
    return this.http.get<Vacuna[]>(`${this.apiUrl}/vacunas/pendientes/refuerzo`);
  }

  // ==================== DESPARASITACIONES ====================
  getDesparasitacionesByMascotaId(mascotaId: number): Observable<Desparasitacion[]> {
    return this.http.get<Desparasitacion[]>(`${this.apiUrl}/desparasitaciones/mascota/${mascotaId}`);
  }

  createDesparasitacion(desparasitacion: CreateDesparasitacionDto): Observable<Desparasitacion> {
    return this.http.post<Desparasitacion>(`${this.apiUrl}/desparasitaciones`, desparasitacion);
  }

  updateDesparasitacion(id: number, desparasitacion: UpdateDesparasitacionDto): Observable<Desparasitacion> {
    return this.http.put<Desparasitacion>(`${this.apiUrl}/desparasitaciones/${id}`, desparasitacion);
  }

  deleteDesparasitacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/desparasitaciones/${id}`);
  }

  getDesparasitacionesPendientes(): Observable<Desparasitacion[]> {
    return this.http.get<Desparasitacion[]>(`${this.apiUrl}/desparasitaciones/pendientes/refuerzo`);
  }

  // ==================== EXÁMENES DE LABORATORIO ====================
  getExamenesByMascotaId(mascotaId: number): Observable<ExamenLaboratorio[]> {
    return this.http.get<ExamenLaboratorio[]>(`${this.apiUrl}/exameneslaboratorio/mascota/${mascotaId}`);
  }

  getExamenesByConsultaId(consultaId: number): Observable<ExamenLaboratorio[]> {
    const url = `${this.apiUrl}/exameneslaboratorio/consulta/${consultaId}`;
    console.log('🌐 Llamando a API - Exámenes por Consulta:', url);
    return this.http.get<ExamenLaboratorio[]>(url);
  }

  createExamen(examen: CreateExamenLaboratorioDto): Observable<ExamenLaboratorio> {
    return this.http.post<ExamenLaboratorio>(`${this.apiUrl}/exameneslaboratorio`, examen);
  }

  updateExamen(id: number, examen: UpdateExamenLaboratorioDto): Observable<ExamenLaboratorio> {
    return this.http.put<ExamenLaboratorio>(`${this.apiUrl}/exameneslaboratorio/${id}`, examen);
  }

  deleteExamen(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/exameneslaboratorio/${id}`);
  }

  getExamenesPendientes(): Observable<ExamenLaboratorio[]> {
    return this.http.get<ExamenLaboratorio[]>(`${this.apiUrl}/exameneslaboratorio/pendientes/resultado`);
  }

  uploadExamenArchivo(id: number, file: File): Observable<{ archivoUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ archivoUrl: string }>(`${this.apiUrl}/exameneslaboratorio/${id}/archivo`, formData);
  }

  // ==================== CIRUGÍAS ====================
  getCirugiasByMascotaId(mascotaId: number): Observable<Cirugia[]> {
    return this.http.get<Cirugia[]>(`${this.apiUrl}/cirugias/mascota/${mascotaId}`);
  }

  createCirugia(cirugia: CreateCirugiaDto): Observable<Cirugia> {
    return this.http.post<Cirugia>(`${this.apiUrl}/cirugias`, cirugia);
  }

  updateCirugia(id: number, cirugia: UpdateCirugiaDto): Observable<Cirugia> {
    return this.http.put<Cirugia>(`${this.apiUrl}/cirugias/${id}`, cirugia);
  }

  deleteCirugia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cirugias/${id}`);
  }

  // ==================== ALERGIAS ====================
  getAlergiasByMascotaId(mascotaId: number): Observable<Alergia[]> {
    return this.http.get<Alergia[]>(`${this.apiUrl}/alergias/mascota/${mascotaId}`);
  }

  createAlergia(alergia: CreateAlergiaDto): Observable<Alergia> {
    return this.http.post<Alergia>(`${this.apiUrl}/alergias`, alergia);
  }

  updateAlergia(id: number, alergia: UpdateAlergiaDto): Observable<Alergia> {
    return this.http.put<Alergia>(`${this.apiUrl}/alergias/${id}`, alergia);
  }

  deleteAlergia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/alergias/${id}`);
  }

  // ==================== ANTECEDENTES PATOLÓGICOS ====================
  getAntecedentesByMascotaId(mascotaId: number): Observable<AntecedentePatologico[]> {
    return this.http.get<AntecedentePatologico[]>(`${this.apiUrl}/antecedentespatologicos/mascota/${mascotaId}`);
  }

  getAntecedentesActivosByMascotaId(mascotaId: number): Observable<AntecedentePatologico[]> {
    return this.http.get<AntecedentePatologico[]>(`${this.apiUrl}/antecedentespatologicos/mascota/${mascotaId}/activos`);
  }

  createAntecedente(antecedente: CreateAntecedentePatologicoDto): Observable<AntecedentePatologico> {
    return this.http.post<AntecedentePatologico>(`${this.apiUrl}/antecedentespatologicos`, antecedente);
  }

  updateAntecedente(id: number, antecedente: UpdateAntecedentePatologicoDto): Observable<AntecedentePatologico> {
    return this.http.put<AntecedentePatologico>(`${this.apiUrl}/antecedentespatologicos/${id}`, antecedente);
  }

  deleteAntecedente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/antecedentespatologicos/${id}`);
  }

  // ==================== RECETAS/MEDICAMENTOS ====================
  getRecetasByMascotaId(mascotaId: number): Observable<RecetaMedicamento[]> {
    return this.http.get<RecetaMedicamento[]>(`${this.apiUrl}/recetas/mascota/${mascotaId}`);
  }

  getRecetasByConsultaId(consultaId: number): Observable<RecetaMedicamento[]> {
    const url = `${this.apiUrl}/recetas/consulta/${consultaId}`;
    console.log('🌐 Llamando a API - Recetas por Consulta:', url);
    return this.http.get<RecetaMedicamento[]>(url);
  }

  createReceta(receta: CreateRecetaMedicamentoDto): Observable<RecetaMedicamento> {
    return this.http.post<RecetaMedicamento>(`${this.apiUrl}/recetas`, receta);
  }

  updateReceta(id: number, receta: UpdateRecetaMedicamentoDto): Observable<RecetaMedicamento> {
    return this.http.put<RecetaMedicamento>(`${this.apiUrl}/recetas/${id}`, receta);
  }

  deleteReceta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/recetas/${id}`);
  }

  // ==================== HISTORIAL COMPLETO ====================
  getHistorialCompleto(mascotaId: number): Observable<HistorialMedicoCompleto> {
    // Como no hay un endpoint único para obtener todo el historial,
    // hacemos múltiples llamadas en paralelo y combinamos los resultados
    return forkJoin({
      vacunas: this.getVacunasByMascotaId(mascotaId),
      desparasitaciones: this.getDesparasitacionesByMascotaId(mascotaId),
      examenesLaboratorio: this.getExamenesByMascotaId(mascotaId),
      cirugias: this.getCirugiasByMascotaId(mascotaId),
      alergias: this.getAlergiasByMascotaId(mascotaId),
      antecedentesPatologicos: this.getAntecedentesByMascotaId(mascotaId),
      recetasMedicamentos: this.getRecetasByMascotaId(mascotaId)
    }).pipe(
      map(results => ({
        mascota: {
          id: mascotaId,
          nombre: '',
          especie: '',
          raza: null,
          sexoTexto: '',
          edadAnios: null,
          clienteNombre: ''
        },
        ...results
      }))
    );
  }

  /**
   * Convierte una URL relativa de archivo en una URL absoluta
   * @param archivoUrl URL relativa del archivo (ej: /uploads/examenes/archivo.pdf)
   * @returns URL completa (ej: http://localhost:5292/uploads/examenes/archivo.pdf)
   */
  getFullFileUrl(archivoUrl: string | null): string | null {
    if (!archivoUrl) return null;
    
    // Si ya es una URL completa (http:// o https://), devolverla tal cual
    if (archivoUrl.startsWith('http://') || archivoUrl.startsWith('https://')) {
      return archivoUrl;
    }
    
    // Si es una URL relativa, agregar la base del API
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}${archivoUrl.startsWith('/') ? archivoUrl : '/' + archivoUrl}`;
  }
}
