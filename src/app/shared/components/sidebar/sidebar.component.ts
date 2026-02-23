import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  permission?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private authService = inject(AuthService);

  isOpen = input<boolean>(true);

  menuItems: MenuItem[] = [
    { label: 'Clientes', icon: 'people', route: '/clientes', permission: 'Clientes.Ver' },
    { label: 'Mascotas', icon: 'pets', route: '/mascotas', permission: 'Mascotas.Ver' },
    { label: 'Citas', icon: 'event', route: '/citas', permission: 'Citas.Ver' },
    { label: 'Consultas', icon: 'medical_services', route: '/consultas', permission: 'Consultas.Ver' },
    // ✅ SECCIÓN DE FACTURACIÓN
    { label: 'Productos', icon: 'inventory_2', route: '/productos', permission: 'Facturacion.Ver' },
    { label: 'Servicios', icon: 'room_service', route: '/servicios', permission: 'Facturacion.Ver' },
    { label: 'Órdenes de Pago', icon: 'receipt_long', route: '/ordenes-pago', permission: 'Facturacion.Ver' },
    // ✅ SECCIÓN DE SEGURIDAD
    { label: 'Usuarios', icon: 'person', route: '/usuarios', permission: 'Usuarios.Ver' },
    { label: 'Roles', icon: 'admin_panel_settings', route: '/roles', permission: 'Usuarios.Ver' },
    // ✅ CONFIGURACIÓN
    { label: 'Configuración', icon: 'settings', route: '/configuracion', permission: 'Configuracion.Ver' },
    // ✅ REPORTES
    { label: 'Reportes', icon: 'assessment', route: '/reportes', permission: 'Reportes.Ver' }
  ];

  hasPermission(permission?: string): boolean {
    if (!permission) return true;
    return this.authService.hasPermission(permission);
  }
}