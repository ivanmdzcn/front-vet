import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.models';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storageService = inject(StorageService);

  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(
    this.storageService.getUser()
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/login`,
      credentials
    ).pipe(
      tap(response => {
        this.storageService.saveToken(response.token);
        this.storageService.saveUser(response);
        this.currentUserSubject.next(response);
      })
    );
  }

  logout(): void {
    this.storageService.clear();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.storageService.isLoggedIn();
  }

  getToken(): string | null {
    return this.storageService.getToken();
  }

  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  hasPermission(permission: string): boolean {
    return this.storageService.hasPermission(permission);
  }

  getPermissions(): string[] {
    return this.storageService.getPermissions();
  }

  getRole(): string | null {
    return this.storageService.getRole();
  }
}