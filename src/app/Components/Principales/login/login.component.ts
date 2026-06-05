import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth-service.service';
import { UsuarioService } from '../../../services/usuario.service';
import { ToastService } from '../../../services/toast.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ButtonModule,
    InputTextModule,
    RippleModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  showPassword: boolean = false;
  codigo_dni: string = '';
  password: string = '';
  errorMessage: string = ''; // Para mostrar mensajes de error

  constructor(
    private readonly router: Router,
    private authService: AuthService,
    private toast: ToastService, // Inyecta ToastrService
    private usuarioService: UsuarioService,
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (!this.codigo_dni || !this.password) {
      this.toast.warn('Por favor, ingresa todos los campos.');
      return;
    }

    this.toast.info('Iniciando sesión...');

    this.authService.login(this.codigo_dni, this.password).subscribe(
      (response) => {
        if (response.token) {
          // 1️⃣ Guardamos token
          this.authService.setToken(response.token);

          // 2️⃣ Ahora llamamos al perfil
          this.usuarioService.obtenerPerfil().subscribe({
            next: (usuario) => {
              // 🔥 Construir nombre completo
              const nombreCompleto =
                `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim();

              // Guardar datos en localStorage
              localStorage.setItem('rol', usuario.rol || '');
              localStorage.setItem('nombre_completo', nombreCompleto);

              this.toast.success('Sesión iniciada con éxito');

              // 4️⃣ Recién ahora navegamos
              this.router.navigate(['/dashboard/grafico-horizontal']);
            },
            error: (err) => {
              console.error('Error obteniendo perfil', err);
            },
          });
        } else {
          this.toast.error('Token no recibido');
        }
      },
      () => {
        this.toast.error('Credenciales incorrectas');
      },
    );
  }
}
