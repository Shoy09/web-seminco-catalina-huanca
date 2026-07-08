// services/auth-service.service.ts
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private apiService: ApiService) {}

  // ── Login clásico (mantener por compatibilidad durante transición) ─────────
  login(codigo_dni: string, password: string): Observable<any> {
    return this.apiService.login(codigo_dni, password).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token);
        }
      })
    );
  }

  // ── Login SSO con Microsoft EntraID ──────────────────────────────────────
  // No es Observable — redirige el navegador directamente a tu backend
  // que a su vez redirige a Microsoft login
  loginConMicrosoft(): void {
    const apiUrl = 'https://api-seminco-catalina-huanca.vercel.app/api';
    // Esta URL inicia el flujo OIDC en tu backend
    window.location.href = `${apiUrl}/auth/oidc/login`;
  }

  // ── Procesar el token que el backend devuelve después del callback ─────────
  // El backend redirige al frontend con ?token=xxx en la URL
  // Este método lee ese token de la URL y lo guarda
  procesarTokenDeUrl(): boolean {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');

    if (token) {
      this.setToken(token);
      // Limpiar el token de la URL (no queremos que quede visible)
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    }
    return false;
  }

  // ── Logout con cierre de sesión en Microsoft también ─────────────────────
  logoutMicrosoft(): void {
    const apiUrl = 'https://api-seminco-catalina-huanca.vercel.app/api';
    this.logout(); // limpia localStorage
    // Llama al backend que devuelve la URL de logout de Microsoft
    fetch(`${apiUrl}/auth/logout`, { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        if (data.logoutUrl) {
          window.location.href = data.logoutUrl;
        }
      })
      .catch(() => window.location.href = '/login');
  }

  // ── Métodos existentes sin cambios ────────────────────────────────────────
  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  getNombreCompleto(): string | null {
    return localStorage.getItem('nombre_completo');
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('rol');
    localStorage.removeItem('nombre_completo');
  }
}