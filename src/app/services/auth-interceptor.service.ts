import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest, HttpEvent } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth-service.service';
import { NotificacionesUiService } from './notificaciones-ui.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private redirigiendoAlLogin = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly notificaciones: NotificacionesUiService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    const request = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(request).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
          this.handleUnauthorized(req.url, error.status);
        }

        return throwError(() => error);
      })
    );
  }

  private handleUnauthorized(url: string, status: 401 | 403): void {
    const esLogin = /\/auth\/login(?:[?#]|$)/i.test(url);
    const yaEstaEnLogin = this.router.url.split('?')[0] === '/login';

    if (esLogin || yaEstaEnLogin || this.redirigiendoAlLogin) {
      return;
    }

    this.redirigiendoAlLogin = true;
    this.authService.logout();
    const mensaje = status === 403
      ? 'No tienes permisos para acceder a este recurso. Inicia sesión nuevamente.'
      : 'Tu sesión ha expirado. Inicia sesión nuevamente.';
    this.notificaciones.warning(mensaje, status === 403 ? 'Acceso denegado' : 'Sesión expirada');

    void this.router.navigate(['/login']).finally(() => {
      this.redirigiendoAlLogin = false;
    });
  }
}
