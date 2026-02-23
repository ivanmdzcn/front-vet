import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { ConfiguracionService, Result } from '../../core/services/configuracion.service';
import { ConfiguracionEmpresa } from '../../core/models/configuracion.models';

interface Moneda {
  codigo: string;
  nombre: string;
  simbolo: string;
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTabsModule,
    MatDividerModule,
    MatButtonToggleModule
  ],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.scss'
})
export class ConfiguracionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private configuracionService = inject(ConfiguracionService);
  private snackBar = inject(MatSnackBar);

  configuracionForm!: FormGroup;
  loading = signal(false);
  configuracionExistente: ConfiguracionEmpresa | null = null;
  esNuevo = false;

  // Propiedades para manejo de logo
  logoPreview: string | null = null;
  uploadMethod: 'url' | 'file' = 'url';
  selectedFile: File | null = null;

  monedasISO: Moneda[] = [
    { codigo: 'GTQ', nombre: 'Quetzal Guatemalteco', simbolo: 'Q' },
    { codigo: 'USD', nombre: 'Dólar Estadounidense', simbolo: '$' },
    { codigo: 'EUR', nombre: 'Euro', simbolo: '€' },
    { codigo: 'GBP', nombre: 'Libra Esterlina', simbolo: '£' },
    { codigo: 'JPY', nombre: 'Yen Japonés', simbolo: '¥' },
    { codigo: 'CNY', nombre: 'Yuan Chino', simbolo: '¥' },
    { codigo: 'MXN', nombre: 'Peso Mexicano', simbolo: '$' },
    { codigo: 'CAD', nombre: 'Dólar Canadiense', simbolo: '$' },
    { codigo: 'AUD', nombre: 'Dólar Australiano', simbolo: '$' },
    { codigo: 'CHF', nombre: 'Franco Suizo', simbolo: 'CHF' },
    { codigo: 'BRL', nombre: 'Real Brasileño', simbolo: 'R$' },
    { codigo: 'ARS', nombre: 'Peso Argentino', simbolo: '$' },
    { codigo: 'CLP', nombre: 'Peso Chileno', simbolo: '$' },
    { codigo: 'COP', nombre: 'Peso Colombiano', simbolo: '$' },
    { codigo: 'PEN', nombre: 'Sol Peruano', simbolo: 'S/' },
    { codigo: 'HNL', nombre: 'Lempira Hondureño', simbolo: 'L' },
    { codigo: 'NIO', nombre: 'Córdoba Nicaragüense', simbolo: 'C$' },
    { codigo: 'CRC', nombre: 'Colón Costarricense', simbolo: '₡' },
    { codigo: 'PAB', nombre: 'Balboa Panameño', simbolo: 'B/.' },
    { codigo: 'DOP', nombre: 'Peso Dominicano', simbolo: 'RD$' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.cargarConfiguracion();
  }

  /**
   * Obtener URL completa de la imagen (para usar en el template)
   */
  getFullImageUrl(logoUrl: string | null): string | null {
    return this.configuracionService.getFullImageUrl(logoUrl);
  }

  initForm(): void {
    this.configuracionForm = this.fb.group({
      // Información General
      razonSocial: ['', [Validators.required, Validators.maxLength(200)]],
      nombreComercial: ['', Validators.maxLength(200)],
      numeroIdentificacionFiscal: ['', Validators.maxLength(50)],
      
      // Ubicación
      direccion: ['', Validators.required],
      ciudad: [''],
      estadoProvincia: [''],
      codigoPostal: [''],
      pais: ['Guatemala', [Validators.required, Validators.maxLength(100)]],
      
      // Contacto
      telefonoPrincipal: [''],
      telefonoSecundario: [''],
      emailPrincipal: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      emailSecundario: ['', [Validators.email, Validators.maxLength(100)]],
      sitioWeb: [''],
      
      // Configuración de Moneda
      codigoMoneda: ['GTQ', Validators.required],
      simboloMoneda: ['Q', Validators.required],
      nombreMoneda: ['Quetzal Guatemalteco'],
      posicionSimbolo: ['antes', Validators.required],
      separadorMiles: [','],
      separadorDecimales: ['.'],
      decimales: [2, [Validators.min(0), Validators.max(4)]],
      
      // Personalización
      logoUrl: [''],
      colorPrimario: ['#3B82F6', Validators.pattern(/^#[0-9A-F]{6}$/i)],
      piePaginaDocumentos: [''],
      mensajeAgradecimiento: ['']
    });

    // Escuchar cambios en el código de moneda para actualizar el símbolo automáticamente
    this.configuracionForm.get('codigoMoneda')?.valueChanges.subscribe(codigo => {
      this.actualizarSimboloMoneda(codigo);
    });
  }

  cargarConfiguracion(): void {
    this.loading.set(true);
    
    this.configuracionService.getConfiguracion().subscribe({
      next: (response: Result<ConfiguracionEmpresa>) => {
        if (response.isSuccess && response.data) {
          this.configuracionExistente = response.data;
          this.esNuevo = false;
          this.configuracionForm.patchValue(response.data);
          this.actualizarConfiguracionMoneda(response.data);
          
          // Configurar vista previa del logo si existe
          if (response.data.logoUrl) {
            this.logoPreview = this.configuracionService.getFullImageUrl(response.data.logoUrl);
          }
        } else {
          this.esNuevo = true;
        }
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error al cargar configuración:', error);
        if (error.status === 404) {
          this.esNuevo = true;
          this.showInfo('No existe configuración. Complete el formulario para crear la configuración inicial.');
        } else {
          this.showError('Error al cargar la configuración');
        }
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.configuracionForm.invalid) {
      this.configuracionForm.markAllAsTouched();
      this.showError('Por favor complete todos los campos requeridos correctamente');
      return;
    }

    this.loading.set(true);
    const formData = this.configuracionForm.value;

    // Limpieza de logoUrl
    if (this.uploadMethod === 'url' && formData.logoUrl && !formData.logoUrl.startsWith('data:')) {
      // Mantener la URL ingresada manualmente
    } else {
      formData.logoUrl = null;
    }

    if (this.esNuevo) {
      // Crear nueva configuración
      this.configuracionService.crear(formData).subscribe({
        next: (response: Result<ConfiguracionEmpresa>) => {
          if (response.isSuccess && response.data) {
            this.configuracionExistente = response.data;
            this.esNuevo = false;
            this.actualizarConfiguracionMoneda(response.data);
            
            // Si hay archivo seleccionado, subirlo después de crear
            if (this.selectedFile) {
              this.configuracionService.uploadLogo(this.selectedFile).subscribe({
                next: (uploadResponse) => {
                  // Actualizar con la URL del logo subido
                  const updateData = {
                    id: response.data!.id,
                    ...formData,
                    logoUrl: uploadResponse.logoUrl
                  };
                  this.actualizarConfiguracion(response.data!.id, updateData);
                },
                error: (error) => {
                  console.error('Error al subir logo:', error);
                  this.loading.set(false);
                  this.showError('Configuración creada, pero error al subir logo');
                }
              });
            } else {
              this.showSuccess('Configuración creada exitosamente');
              this.loading.set(false);
            }
          } else {
            this.showError(response.errorMessage || 'Error al crear la configuración');
            this.loading.set(false);
          }
        },
        error: (error: any) => {
          console.error('Error al crear configuración:', error);
          this.showError('Error al crear la configuración');
          this.loading.set(false);
        }
      });
    } else if (this.configuracionExistente) {
      // Actualizar configuración existente
      const updateData = {
        id: this.configuracionExistente.id,
        ...formData
      };

      // Si hay archivo seleccionado, primero subirlo
      if (this.selectedFile) {
        this.configuracionService.uploadLogo(this.selectedFile).subscribe({
          next: (response) => {
            // Actualizar con la URL del logo subido
            updateData.logoUrl = response.logoUrl;
            this.actualizarConfiguracion(this.configuracionExistente!.id, updateData);
          },
          error: (error) => {
            console.error('Error al subir logo:', error);
            this.loading.set(false);
            this.showError('Error al subir el logo');
          }
        });
      } else {
        // Actualizar sin subir nuevo logo
        this.actualizarConfiguracion(this.configuracionExistente.id, updateData);
      }
    }
  }

  private actualizarConfiguracion(id: number, updateData: any): void {
    this.configuracionService.actualizar(id, updateData).subscribe({
      next: (response: Result<ConfiguracionEmpresa>) => {
        if (response.isSuccess && response.data) {
          this.configuracionExistente = response.data;
          this.actualizarConfiguracionMoneda(response.data);
          this.showSuccess('Configuración actualizada exitosamente');
        } else {
          this.showError(response.errorMessage || 'Error al actualizar la configuración');
        }
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error al actualizar configuración:', error);
        this.showError('Error al actualizar la configuración');
        this.loading.set(false);
      }
    });
  }

  getVistaPrevia(): string {
    const valor = 1500.50;
    const simbolo = this.configuracionForm.get('simboloMoneda')?.value || 'Q';
    const posicion = this.configuracionForm.get('posicionSimbolo')?.value || 'antes';
    const decimales = this.configuracionForm.get('decimales')?.value || 2;
    const separadorMiles = this.configuracionForm.get('separadorMiles')?.value || ',';
    const separadorDecimales = this.configuracionForm.get('separadorDecimales')?.value || '.';

    const valorFormateado = valor.toFixed(decimales)
      .replace('.', separadorDecimales)
      .replace(/\B(?=(\d{3})+(?!\d))/g, separadorMiles);

    return posicion === 'antes'
      ? `${simbolo} ${valorFormateado}`
      : `${valorFormateado} ${simbolo}`;
  }

  // Métodos para manejo de logo
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo de archivo (incluye SVG)
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        this.showError('Por favor seleccione un archivo de imagen válido (JPG, PNG, GIF, SVG)');
        return;
      }

      // Validar tamaño (máx 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.showError('La imagen no debe superar 2MB');
        return;
      }

      // Guardar el archivo para enviarlo después
      this.selectedFile = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.logoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.logoPreview = null;
    this.selectedFile = null;
    this.configuracionForm.patchValue({ logoUrl: null });
  }

  onLogoUrlChange(url: string): void {
    if (url) {
      this.logoPreview = url;
    } else {
      this.logoPreview = null;
    }
  }

  private actualizarSimboloMoneda(codigo: string): void {
    const moneda = this.monedasISO.find(m => m.codigo === codigo);
    if (moneda) {
      this.configuracionForm.patchValue({
        simboloMoneda: moneda.simbolo,
        nombreMoneda: moneda.nombre
      }, { emitEvent: false });
    }
  }

  private actualizarConfiguracionMoneda(config: ConfiguracionEmpresa): void {
    const configMoneda = {
      simboloMoneda: config.simboloMoneda,
      posicionSimbolo: config.posicionSimbolo,
      separadorMiles: config.separadorMiles,
      separadorDecimales: config.separadorDecimales,
      decimales: config.decimales
    };
    sessionStorage.setItem('configuracion_moneda', JSON.stringify(configMoneda));
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  private showInfo(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
