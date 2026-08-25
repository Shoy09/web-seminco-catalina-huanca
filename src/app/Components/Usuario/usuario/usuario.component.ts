import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Usuario } from '../../../models/Usuario';
import { UsuarioService } from '../../../services/usuario.service';
import { PerfilEditarDialogComponent } from '../perfil-editar-dialog/perfil-editar-dialog.component';

@Component({
  selector: 'app-usuario',
  standalone: true,
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
})
export class UsuarioComponent implements OnInit {
  datosUsuario = {
    id:               undefined as number | undefined,
    fotoPerfil:       'assets/usuario.png',
    nombre:           '',
    apellidos:        '',
    cargo:            '',
    empresa:          '',
    guardia:          '',
    equipoAutorizado: '',
    correo:           '',
    firma:            '',
  };

  mostrarFirmaGrande = false;
  mensajeExito       = false;

  constructor(
    private usuarioService: UsuarioService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (data: Usuario) => {
        this.datosUsuario = {
          id:               data.id,
          fotoPerfil:       data.firma || 'assets/usuario.png',
          nombre:           data.nombres        || '',
          apellidos:        data.apellidos      || '',
          cargo:            data.cargo          || '',
          empresa:          data.empresa        || '',
          guardia:          data.guardia        || '',
          equipoAutorizado: data.autorizado_equipo || '',
          correo:           data.correo         || '',
          firma:            data.firma          || '',
        };
      },
      error: (err) => console.error('Error al obtener perfil:', err),
    });
  }

  abrirEdicion(): void {
    const ref = this.dialog.open(PerfilEditarDialogComponent, {
      width: '680px',
      maxWidth: '95vw',
      autoFocus: false,
      data: { ...this.datosUsuario },
    });

    ref.afterClosed().subscribe((valores) => {
      if (!valores) return;
      // Actualizar vista local inmediatamente
      Object.assign(this.datosUsuario, valores);
      // TODO: llamar al servicio de actualizar cuando el endpoint esté disponible
      this.mostrarExito();
    });
  }

  cambiarFirma(): void {
    this.mostrarFirmaGrande = false;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('firma', file);
      this.usuarioService.actualizarFirma(this.datosUsuario.id ?? 0, formData).subscribe({
        next: () => { this.cargarPerfil(); this.mostrarExito(); },
        error: (err) => console.error('Error al actualizar firma:', err),
      });
    };
    input.click();
  }

  eliminarFirma(): void {
    this.datosUsuario.firma = '';
    this.mostrarFirmaGrande = false;
  }

  private mostrarExito(): void {
    this.mensajeExito = true;
    setTimeout(() => (this.mensajeExito = false), 3000);
  }
}
