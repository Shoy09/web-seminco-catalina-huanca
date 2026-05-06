import { Injectable } from '@angular/core';
import { ApiService } from './api.service'; // Importamos ApiService
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private apiService: ApiService) {}

  // Método para loguearse, utilizando ApiService
  login(codigo_dni: string, password: string): Observable<any> {
    return this.apiService.login(codigo_dni, password).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token); // Guarda el token en localStorage
        }
      })
    );
  }

  // Método para guardar el token
  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }
  
// Método para obtener el token
getToken(): string | null {
  return localStorage.getItem('authToken'); // Ahora usa la clave correcta
}

getRol(): string | null {
  return localStorage.getItem('rol');
}

// 🔥 Obtener nombre completo
getNombreCompleto(): string | null {
  return localStorage.getItem('nombre_completo');
}

  
  // Método para verificar si el usuario está logueado
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  // Método para eliminar el token (logout)
  logout(): void {
    localStorage.removeItem('authToken');
  }
}
