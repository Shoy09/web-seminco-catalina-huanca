// login.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth-service.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  showPassword  = false;
  codigo_dni    = '';
  password      = '';
  cargandoSSO   = false;  // spinner mientras redirige a Microsoft
  cargando = false;
  errorLogin = '';

  constructor(
    private readonly router: Router,
    private authService: AuthService,
    private _toastr: ToastrService,
    private usuarioService: UsuarioService
  ) {}

  // ── Al cargar el componente: verificar si venimos del callback de Microsoft
  ngOnInit(): void {
    const tokenEnUrl = this.authService.procesarTokenDeUrl();

    if (tokenEnUrl) {
      this.cargando = true;
      // Venimos del callback OIDC — el token ya está guardado
      this._toastr.info('Verificando sesión...', 'Microsoft SSO');
      this.cargarPerfilYNavegar();
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // ── Login Microsoft (OIDC) ────────────────────────────────────────────────
  loginMicrosoft(): void {
    if (this.cargando || this.cargandoSSO) return;
    this.errorLogin = '';
    this.cargandoSSO = true;
    this._toastr.info('Redirigiendo a Microsoft...', 'SSO');
    // Pequeña pausa para que el toastr se muestre antes del redirect
    setTimeout(() => {
      this.authService.loginConMicrosoft();
    }, 800);
  }

  // ── Login clásico (mantener durante transición) ───────────────────────────
  login(): void {
    if (this.cargando || this.cargandoSSO) return;
    this.errorLogin = '';
    this.codigo_dni = this.codigo_dni.trim();
    if (!this.codigo_dni || !this.password) {
      this.errorLogin = 'Ingresa tu usuario y contraseña para continuar.';
      return;
    }
    if (!/^\d+$/.test(this.codigo_dni)) {
      this.errorLogin = 'El usuario debe contener solo números.';
      return;
    }

    this.cargando = true;

    this.authService.login(this.codigo_dni, this.password).subscribe(
      (response) => {
        if (response.token) {
          this.authService.setToken(response.token);
          this.cargarPerfilYNavegar();
        } else {
          this.cargando = false;
          this.errorLogin = 'No se pudo completar el acceso. Inténtalo nuevamente.';
        }
      },
      (error) => {
        this.cargando = false;
        this.errorLogin = error.status === 400 || error.status === 401 || error.status === 403
          ? 'El usuario o la contraseña son incorrectos. Revisa tus datos.'
          : 'No pudimos conectar con el servicio. Inténtalo nuevamente.';
      }
    );
  }

  // ── Carga perfil y navega — compartido entre ambos flujos ────────────────
  private cargarPerfilYNavegar(): void {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (usuario) => {
        const nombreCompleto = `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim();
        localStorage.setItem('rol', usuario.rol || '');
        localStorage.setItem('nombre_completo', nombreCompleto);

        this._toastr.success('Sesión iniciada con éxito', 'Bienvenido');
        this.router.navigate(['/Dashboard/grafico-horizontal']).then((navegado) => {
          this.cargando = false;
          if (!navegado) this.errorLogin = 'No se pudo abrir el sistema. Inténtalo nuevamente.';
        }).catch(() => {
          this.cargando = false;
          this.errorLogin = 'No se pudo abrir el sistema. Inténtalo nuevamente.';
        });
      },
      error: (err) => {
        this.cargando = false;
        this.errorLogin = 'No se pudo cargar tu perfil. Inténtalo nuevamente.';
        console.error('Error obteniendo perfil', err);
        this._toastr.error('Error al cargar perfil de usuario', 'Error');
      }
    });
  }
}
