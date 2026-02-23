export interface ConfiguracionEmpresa {
  id: number;
  razonSocial: string;
  nombreComercial?: string;
  numeroIdentificacionFiscal?: string;
  direccion: string;
  ciudad?: string;
  estadoProvincia?: string;
  codigoPostal?: string;
  pais: string;
  telefonoPrincipal?: string;
  telefonoSecundario?: string;
  emailPrincipal: string;
  emailSecundario?: string;
  sitioWeb?: string;
  codigoMoneda: string;
  simboloMoneda: string;
  nombreMoneda?: string;
  posicionSimbolo: 'antes' | 'despues';
  separadorMiles: string;
  separadorDecimales: string;
  decimales: number;
  logoUrl?: string;
  colorPrimario: string;
  piePaginaDocumentos?: string;
  mensajeAgradecimiento?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  actualizadoPor?: number;
}

export interface CreateConfiguracionDto {
  razonSocial: string;
  nombreComercial?: string;
  numeroIdentificacionFiscal?: string;
  direccion: string;
  ciudad?: string;
  estadoProvincia?: string;
  codigoPostal?: string;
  pais: string;
  telefonoPrincipal?: string;
  telefonoSecundario?: string;
  emailPrincipal: string;
  emailSecundario?: string;
  sitioWeb?: string;
  codigoMoneda: string;
  simboloMoneda: string;
  nombreMoneda?: string;
  posicionSimbolo: 'antes' | 'despues';
  separadorMiles: string;
  separadorDecimales: string;
  decimales: number;
  logoUrl?: string;
  colorPrimario: string;
  piePaginaDocumentos?: string;
  mensajeAgradecimiento?: string;
}

export interface UpdateConfiguracionDto extends CreateConfiguracionDto {
  id: number;
}
