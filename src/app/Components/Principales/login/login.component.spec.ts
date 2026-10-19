import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, Subject } from 'rxjs';
import { AuthService } from '../../../services/auth-service.service';
import { UsuarioService } from '../../../services/usuario.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let auth: jasmine.SpyObj<AuthService>;
  let perfil: Subject<any>;
  beforeEach(async () => {
    auth = jasmine.createSpyObj('AuthService', ['procesarTokenDeUrl', 'login', 'setToken', 'loginConMicrosoft']);
    auth.procesarTokenDeUrl.and.returnValue(false);
    perfil = new Subject();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
        { provide: ToastrService, useValue: jasmine.createSpyObj('ToastrService', ['info', 'success', 'error', 'warning']) },
        { provide: UsuarioService, useValue: { obtenerPerfil: () => perfil } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('valida campos y usuario numérico sin enviar solicitudes', () => {
    component.login();
    expect(component.errorLogin).toContain('usuario y contraseña');
    component.codigo_dni = 'usuario';
    component.password = 'clave';
    component.login();
    expect(component.errorLogin).toContain('solo números');
    expect(auth.login).not.toHaveBeenCalled();
  });
  it('evita solicitudes duplicadas y permite reintentar después de un error', () => {
    const respuesta = new Subject<any>();
    auth.login.and.returnValue(respuesta);
    component.codigo_dni = '12345678';
    component.password = 'clave';
    component.login();
    component.login();
    fixture.detectChanges();
    expect(auth.login).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBeTrue();
    respuesta.error({ status: 401 });
    fixture.detectChanges();
    expect(component.cargando).toBeFalse();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('incorrectos');
  });
  it('mantiene la carga hasta obtener el perfil y recupera el formulario si falla', () => {
    auth.login.and.returnValue(of({ token: 'token-prueba' }));
    component.codigo_dni = '12345678';
    component.password = 'clave';
    component.login();
    expect(component.cargando).toBeTrue();
    perfil.error(new Error('Perfil no disponible'));
    expect(component.cargando).toBeFalse();
    expect(component.errorLogin).toContain('perfil');
  });
  it('permite mostrar y ocultar la contraseña con un nombre accesible', () => {
    component.togglePassword();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#password').type).toBe('text');
    expect(fixture.nativeElement.querySelector('.password-toggle').getAttribute('aria-label')).toBe('Ocultar contraseña');
  });
});
