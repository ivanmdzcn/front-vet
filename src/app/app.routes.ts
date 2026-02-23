import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./features/clientes/cliente-list/cliente-list.component').then(m => m.ClienteListComponent),
        data: { permission: 'Clientes.Ver' },
        canActivate: [permissionGuard]
      },
      {
        path: 'mascotas',
        loadComponent: () => import('./features/mascotas/mascota-list/mascota-list.component').then(m => m.MascotaListComponent),
        data: { permission: 'Mascotas.Ver' },
        canActivate: [permissionGuard]
      },
      {
        path: 'citas',
        loadComponent: () => import('./features/citas/cita-list/cita-list.component').then(m => m.CitaListComponent),
        data: { permission: 'Citas.Ver' },
        canActivate: [permissionGuard]
      },
      {
        path: 'consultas',
        loadComponent: () => import('./features/consultas/consulta-list/consulta-list.component').then(m => m.ConsultaListComponent),
        data: { permission: 'Consultas.Ver' },
        canActivate: [permissionGuard]
      },
       // ✅ NUEVAS RUTAS DE SEGURIDAD
      {
        path: 'usuarios',
        loadComponent: () => import('./features/usuarios/usuario-list/usuario-list.component').then(m => m.UsuarioListComponent),
        data: { permission: 'Usuarios.Ver' },
        canActivate: [permissionGuard]
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/roles/rol-list/rol-list.component').then(m => m.RolListComponent),
        data: { permission: 'Usuarios.Ver' },
        canActivate: [permissionGuard]
      },
      // ✅ RUTAS DE FACTURACIÓN
      {
        path: 'productos',
        loadComponent: () => import('./features/facturacion/producto-list/producto-list.component').then(m => m.ProductoListComponent),
        data: { permission: 'Facturacion.Ver' },
        canActivate: [permissionGuard]
      },
      {
        path: 'servicios',
        loadComponent: () => import('./features/facturacion/servicio-list/servicio-list.component').then(m => m.ServicioListComponent),
        data: { permission: 'Facturacion.Ver' },
        canActivate: [permissionGuard]
      },
      {
        path: 'ordenes-pago',
        loadComponent: () => import('./features/facturacion/orden-pago-list/orden-pago-list.component').then(m => m.OrdenPagoListComponent),
        data: { permission: 'Facturacion.Ver' },
        canActivate: [permissionGuard]
      },
      // ✅ RUTA DE CONFIGURACIÓN
      {
        path: 'configuracion',
        loadComponent: () => import('./features/configuracion/configuracion.component').then(m => m.ConfiguracionComponent),
        data: { permission: 'Configuracion.Ver' },
        canActivate: [permissionGuard]
      },
      // ✅ RUTAS DE REPORTES
      {
        path: 'reportes',
        loadComponent: () => import('./features/reportes/reportes-list/reportes-list.component').then(m => m.ReportesListComponent),
        data: { permission: 'Reportes.Ver' },
        canActivate: [permissionGuard]
      },
      {
        path: 'reportes/orden-pago/:id',
        loadComponent: () => import('./features/reportes/orden-pago-reporte/orden-pago-reporte.component').then(m => m.OrdenPagoReporteComponent),
        data: { permission: 'Reportes.Ver' },
        canActivate: [permissionGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];