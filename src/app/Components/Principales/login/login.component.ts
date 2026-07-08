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
    this.cargandoSSO = true;
    this._toastr.info('Redirigiendo a Microsoft...', 'SSO');
    // Pequeña pausa para que el toastr se muestre antes del redirect
    setTimeout(() => {
      this.authService.loginConMicrosoft();
    }, 800);
  }

  // ── Login clásico (mantener durante transición) ───────────────────────────
  login(): void {
    if (!this.codigo_dni || !this.password) {
      this._toastr.warning('Por favor, ingresa todos los campos.', 'Advertencia');
      return;
    }

    this._toastr.info('Iniciando sesión...', 'Por favor espera');

    this.authService.login(this.codigo_dni, this.password).subscribe(
      (response) => {
        if (response.token) {
          this.authService.setToken(response.token);
          this.cargarPerfilYNavegar();
        } else {
          this._toastr.error('Token no recibido', 'Error');
        }
      },
      () => {
        this._toastr.error('Credenciales incorrectas', 'Error');
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
        this.router.navigate(['/Dashboard/grafico-horizontal']);
      },
      error: (err) => {
        console.error('Error obteniendo perfil', err);
        this._toastr.error('Error al cargar perfil de usuario', 'Error');
      }
    });
  }
}