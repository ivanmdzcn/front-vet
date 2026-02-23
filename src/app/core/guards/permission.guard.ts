import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredPermission = route.data['permission'] as string;

  if (!requiredPermission) {
    return true; // No se requiere permiso específico
  }

  if (authService.hasPermission(requiredPermission)) {
    return true;
  }

  // No tiene permiso
  router.navigate(['/dashboard']);
  return false;
};
