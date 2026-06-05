import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../../models/Usuario';
import { UsuarioService } from '../../../services/usuario.service';
import { EditarPerfilDialogComponent } from '../editar-perfil-dialog/editar-perfil-dialog.component';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-usuario',
  standalone: true,
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css'],
  imports: [CommonModule, ReactiveFormsModule, EditarPerfilDialogComponent],
})
export class UsuarioComponent implements OnInit {
  usuario: Usuario | null = null;
  mostrarFirmaGrande: boolean = false;
  editando = false;
  mostrarContrasena = false;
  mensajeExito = false;
  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  Edicion() {
    this.editando = true;
  }

  guardarEdicionUsuario(data: any): void {
    const payload = {
      ...data,

      // Si tu backend espera autorizado_equipo en vez de equipoAutorizado
      autorizado_equipo: data.equipoAutorizado,
    };

    delete payload.equipoAutorizado;

    /* this.usuarioService.actualizarPerfil(payload).subscribe({
      next: () => {
        this.usuario = {
          ...this.usuario,
          ...data,
        };

        this.editando = false;

        this.toastService.success(
          'Perfil actualizado',
          'Los datos del perfil se actualizaron correctamente.',
        );
      },
      error: () => {
        this.toastService.error(
          'Error al actualizar',
          'No se pudo actualizar el perfil.',
        );
      },
    }); */
  }

  toggleContrasena() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  cambiarFirma() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (event: any) => {
      const file = event.target.files[0];

      if (file) {
        // **Enviar la imagen al servidor**
        const formData = new FormData();
        formData.append('firma', file);

        this.usuarioService
          .actualizarFirma(this.usuario?.id ?? 0, formData)
          .subscribe({
            next: (response) => {
              // **Volver a cargar los datos del usuario para obtener la firma actualizada**
              this.cargarPerfil();
            },
            error: (err) => {
              console.error('Error al actualizar la firma:', err);
            },
          });
      }
    };

    input.click();
  }

  eliminarFirma() {
    // Lógica para eliminar la firma

    const imgFirma = document.querySelector('.firma') as HTMLImageElement;
    if (imgFirma) {
      imgFirma.src = ''; // Elimina la imagen
    }
  }
  cargarPerfil(): void {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (data: Usuario) => {
        this.usuario = {
          id: data.id,
          codigo_dni: data.codigo_dni,
          //fotoPerfil: data.firma ? data.firma : 'assets/usuario.png', // Si tiene firma, se usa como foto
          nombres: data.nombres || '',
          apellidos: data.apellidos || '',
          cargo: data.cargo || '',
          empresa: data.empresa || '',
          guardia: data.guardia || '',
          //equipoAutorizado: data.autorizado_equipo || '',
          correo: data.correo || '',
          firma: data.firma || '',
          password: data.password || '',
        };
      },
      error: (err) => {
        console.error('Error al obtener perfil:', err);
      },
    });
  }
}
