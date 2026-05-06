import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth-service.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-login',
  standalone: true, // Marca el componente como standalone
  imports: [FormsModule, CommonModule], // Importa los módulos necesarios
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  showPassword: boolean = false;
  codigo_dni: string = ''; 
  password: string = ''; 
  errorMessage: string = ''; // Para mostrar mensajes de error

  constructor(
    private readonly router: Router,
    private authService: AuthService,
    private _toastr: ToastrService, // Inyecta ToastrService
    private usuarioService: UsuarioService
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
  if (!this.codigo_dni || !this.password) {
    this._toastr.warning('Por favor, ingresa todos los campos.', 'Advertencia');
    return;
  }

  this._toastr.info('Iniciando sesión...', 'Por favor espera');

  this.authService.login(this.codigo_dni, this.password).subscribe(
    (response) => {

      if (response.token) {

        // 1️⃣ Guardamos token
        this.authService.setToken(response.token);

        // 2️⃣ Ahora llamamos al perfil
        this.usuarioService.obtenerPerfil().subscribe({
          next: (usuario) => {

            // 🔥 Construir nombre completo
const nombreCompleto = `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim();

// Guardar datos en localStorage
localStorage.setItem('rol', usuario.rol || '');
localStorage.setItem('nombre_completo', nombreCompleto);

            this._toastr.success('Sesión iniciada con éxito', 'Bienvenido');

            // 4️⃣ Recién ahora navegamos
            this.router.navigate(['/Dashboard/grafico-horizontal']);
          },
          error: (err) => {
            console.error('Error obteniendo perfil', err);
          }
        });

      } else {
        this._toastr.error('Token no recibido', 'Error');
      }
    },
    () => {
      this._toastr.error('Credenciales incorrectas', 'Error');
    }
  );
}
}
