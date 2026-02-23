import { Pipe, PipeTransform, inject } from '@angular/core';
import { ConfiguracionService } from '../../core/services/configuracion.service';
import { Observable, map, shareReplay, of } from 'rxjs';

@Pipe({
  name: 'moneda',
  standalone: true
})
export class MonedaPipe implements PipeTransform {
  private configuracionService = inject(ConfiguracionService);
  private configuracion$: Observable<any> | null = null;

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }

    // Intentar obtener configuración desde sessionStorage (cache)
    const configCache = sessionStorage.getItem('configuracion_moneda');
    if (configCache) {
      const config = JSON.parse(configCache);
      return this.formatearMoneda(value, config);
    }

    // Si no hay cache, usar valores por defecto
    return this.formatearMoneda(value, {
      simboloMoneda: 'Q',
      posicionSimbolo: 'antes',
      separadorMiles: ',',
      separadorDecimales: '.',
      decimales: 2
    });
  }

  private formatearMoneda(value: number, config: any): string {
    const valorFormateado = this.formatearNumero(
      value, 
      config.separadorMiles, 
      config.separadorDecimales, 
      config.decimales
    );

    if (config.posicionSimbolo === 'antes') {
      return `${config.simboloMoneda} ${valorFormateado}`;
    } else {
      return `${valorFormateado} ${config.simboloMoneda}`;
    }
  }

  private formatearNumero(
    valor: number, 
    separadorMiles: string, 
    separadorDecimales: string, 
    decimales: number
  ): string {
    const partes = valor.toFixed(decimales).split('.');
    const parteEntera = partes[0];
    const parteDecimal = partes[1];

    // Agregar separador de miles
    const enteroConSeparador = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, separadorMiles);

    return `${enteroConSeparador}${separadorDecimales}${parteDecimal}`;
  }
}
