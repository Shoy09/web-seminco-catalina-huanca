import { HttpErrorResponse, HttpHandler, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { AuthService } from './auth-service.service';
import { AuthInterceptor } from './auth-interceptor.service';
import { NotificacionesUiService } from './notificaciones-ui.service';

describe('AuthInterceptor', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let notificaciones: jasmine.SpyObj<NotificacionesUiService>;
  let interceptor: AuthInterceptor;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['getToken', 'logout']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate'], { url: '/dashboard' });
    router.navigate.and.returnValue(Promise.resolve(true));
    notificaciones = jasmine.createSpyObj<NotificacionesUiService>('NotificacionesUiService', ['warning']);
    interceptor = new AuthInterceptor(authService, router, notificaciones);
  });

  it('notifica, limpia la sesión y redirige al login ante un 401', () => {
    authService.getToken.and.returnValue('token-vencido');
    const request = new HttpRequest('GET', '/api/datos');
    const next: HttpHandler = {
      handle: () => throwError(() => new HttpErrorResponse({ status: 401 }))
    };
    let receivedError: unknown;

    interceptor.intercept(request, next).subscribe({ error: error => receivedError = error });

    expect(receivedError).toEqual(jasmine.any(HttpErrorResponse));
    expect(authService.logout).toHaveBeenCalled();
    expect(notificaciones.warning).toHaveBeenCalledWith(
      'Tu sesión ha expirado. Inicia sesión nuevamente.',
      'Sesión expirada'
    );
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('no redirige por un 401 en la petición de inicio de sesión', () => {
    authService.getToken.and.returnValue(null);
    const request = new HttpRequest('POST', '/api/auth/login', null);
    const next: HttpHandler = {
      handle: () => throwError(() => new HttpErrorResponse({ status: 401 }))
    };

    interceptor.intercept(request, next).subscribe({ error: () => undefined });

    expect(authService.logout).not.toHaveBeenCalled();
    expect(notificaciones.warning).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('notifica y redirige al login ante una respuesta 403', () => {
    authService.getToken.and.returnValue('token-sin-permisos');
    const request = new HttpRequest('GET', '/api/operaciones/aprobacion');
    const next: HttpHandler = {
      handle: () => throwError(() => new HttpErrorResponse({ status: 403 }))
    };

    interceptor.intercept(request, next).subscribe({ error: () => undefined });

    expect(authService.logout).toHaveBeenCalled();
    expect(notificaciones.warning).toHaveBeenCalledWith(
      'No tienes permisos para acceder a este recurso. Inicia sesión nuevamente.',
      'Acceso denegado'
    );
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
