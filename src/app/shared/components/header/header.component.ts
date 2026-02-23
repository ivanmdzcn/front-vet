import { Component, OnInit, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';
import { ConfiguracionService } from '../../../core/services/configuracion.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule  // ✅ AGREGAR AQUÍ TAMBIÉN
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private configuracionService = inject(ConfiguracionService);
  
  toggleSidebar = output<void>();
  currentUser = this.authService.getCurrentUser();
  nombreEmpresa = signal<string>('Veterinaria');

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  cargarConfiguracion(): void {
    this.configuracionService.getConfiguracion().subscribe({
      next: (result) => {
        if (result.isSuccess && result.data) {
          this.nombreEmpresa.set(result.data.nombreComercial || result.data.razonSocial);
          
          // Guardar configuración de moneda en sessionStorage para el pipe
          const configMoneda = {
            simboloMoneda: result.data.simboloMoneda,
            posicionSimbolo: result.data.posicionSimbolo,
            separadorMiles: result.data.separadorMiles,
            separadorDecimales: result.data.separadorDecimales,
            decimales: result.data.decimales
          };
          sessionStorage.setItem('configuracion_moneda', JSON.stringify(configMoneda));
        }
      },
      error: () => {
        // Mantener el valor por defecto si hay error
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}