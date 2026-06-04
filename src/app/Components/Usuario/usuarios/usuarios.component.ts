import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UsuarioDialogComponent } from '../usuario-dialog/usuario-dialog.component';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import * as XLSX from 'xlsx';
import { Usuario } from '../../../models/Usuario';
import { UsuarioService } from '../../../services/usuario.service';
import { LoadingDialogComponent } from '../../Reutilizables/loading-dialog/loading-dialog.component';
import { OperacionesDialogComponent } from '../operaciones-dialog.component';
import { EditarOperacionesDialogComponent } from '../editar-operaciones-dialog/editar-operaciones-dialog.component';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastService } from '../../../services/toast.service';
import { ConfirmService } from '../../../services/confirm.service';
@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    FileUploadModule,
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  constructor(
    private usuarioService: UsuarioService,
    public dialog: MatDialog,
    private toastService: ToastService,
    private confirmService: ConfirmService,
  ) {}

  ngOnInit() {
    this.obtenerUsuarios();
  }

  obtenerUsuarios() {
    this.usuarioService.obtenerUsuarios().subscribe((data) => {
      this.usuarios = data;
    });
  }

  abrirDialogoCrear() {
    const dialogRef = this.dialog.open(UsuarioDialogComponent, {
      width: '400px',
      data: null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.obtenerUsuarios();
      }
    });
  }

  obtenerPrimerasOperaciones(operaciones: {
    [clave: string]: boolean;
  }): string[] {
    return Object.keys(operaciones)
      .filter((k) => operaciones[k])
      .slice(0, 2);
  }

  abrirDialogoOperaciones(operaciones: { [clave: string]: boolean }) {
    this.dialog.open(OperacionesDialogComponent, {
      width: '400px',
      data: Object.keys(operaciones).filter((k) => operaciones[k]),
    });
  }

  abrirDialogoEditar(usuario: Usuario) {
    const dialogRef = this.dialog.open(UsuarioDialogComponent, {
      width: '400px',
      data: usuario,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.obtenerUsuarios();
      }
    });
  }

  eliminarUsuario(id: number): void {
    this.confirmService.confirmDelete(
      '¿Estás seguro de que deseas eliminar este usuario?',
      () => {
        this.usuarioService.eliminarUsuario(id).subscribe({
          next: () => {
            this.toastService.success(
              'Usuario eliminado',
              'El usuario fue eliminado correctamente.',
            );

            this.obtenerUsuarios();
          },
          error: () => {
            this.toastService.error(
              'Error al eliminar',
              'No se pudo eliminar el usuario.',
            );
          },
        });
      },
    );
  }

  cargarArchivo(event: any): void {
    const archivo: File | undefined = event.files?.[0];
    if (!archivo) {
      this.toastService.warn(
        'Archivo no seleccionado',
        'Debe seleccionar un archivo Excel para continuar.',
      );
      return;
    }

    this.procesarArchivoExcel(archivo);
  }

  private procesarArchivoExcel(archivo: File): void {
    const reader = new FileReader();

    reader.readAsArrayBuffer(archivo);

    reader.onload = () => {
      const data = new Uint8Array(reader.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = 'Usuarios';
      const sheet = workbook.Sheets[sheetName];

      if (!sheet) {
        alert("No se encontró la hoja 'Usuarios' en el archivo.");
        return;
      }

      const datosExcel: any[] = XLSX.utils.sheet_to_json(sheet);

      const usuariosValidos: Usuario[] = [];
      const usuariosInvalidos: { nombre: string; dni: string }[] = [];

      datosExcel.forEach((row) => {
        const apellidos = row['APELLIDOS'];
        const nombres = row['NOMBRES'];
        const codigo_dni = row['DNI'];
        const cargo = row['PUESTO ACTUAL QUE DESEMPEÑA'];
        const rol = row['ROL'] || 'Trabajador';
        const area = row['ÁREA'];
        const clasificacion = row['CLASIFICACIÓN'];
        const empresa = row['EMPRESA'];
        const guardia = row['GUARDIA'];
        const autorizado_equipo = row['AUTORIZADO EQUIPO'];
        const correo = row['CORREO'];
        const password = row['password'];
        const firma = row['FIRMA'];
        const operacionesString = row['OPERACIONES AUTORIZADAS'] || '';

        if (
          !apellidos ||
          !nombres ||
          !codigo_dni ||
          !cargo ||
          !area ||
          !rol ||
          !password
        ) {
          usuariosInvalidos.push({
            nombre: nombres || 'Desconocido',
            dni: codigo_dni || 'Sin DNI',
          });
          return;
        }

        const operacionesArray = operacionesString
          .split(/[,;]+/)
          .map((op: string) => op.trim())
          .filter((op: string) => op.length > 0);

        const operaciones_autorizadas: { [clave: string]: boolean } = {};

        operacionesArray.forEach((op: string) => {
          operaciones_autorizadas[op] = true;
        });

        const usuario: Usuario = {
          apellidos,
          nombres,
          codigo_dni,
          cargo,
          rol,
          area,
          clasificacion,
          password,
          operaciones_autorizadas,
        };

        if (empresa) usuario.empresa = empresa;
        if (guardia) usuario.guardia = guardia;
        if (autorizado_equipo) usuario.autorizado_equipo = autorizado_equipo;
        if (correo) usuario.correo = correo;
        if (firma) usuario.firma = firma;

        usuariosValidos.push(usuario);
      });

      if (usuariosValidos.length > 0) {
        this.enviarUsuariosBulk(usuariosValidos, usuariosInvalidos);
      } else {
        alert('No hay usuarios válidos para enviar.');
      }
    };

    reader.onerror = () => {
      alert('No se pudo leer el archivo Excel.');
    };
  }

  mostrarPantallaCarga() {
    this.dialog.open(LoadingDialogComponent, {
      disableClose: true,
    });
  }

  enviarUsuariosBulk(
    usuarios: Usuario[],
    usuariosInvalidos: { nombre: string; dni: string }[],
  ) {
    const dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: true,
    });

    this.usuarioService.crearUsuariosBulk(usuarios).subscribe({
      next: (res) => {
        dialogRef.close();

        if (usuariosInvalidos.length > 0) {
          this.mostrarErrores(usuariosInvalidos);
        }

        alert(`✅ ${usuarios.length} usuarios procesados correctamente`);
        this.obtenerUsuarios();
      },
      error: (error) => {
        dialogRef.close();
        console.error(error);
        alert('❌ Error en carga masiva');
      },
    });
  }

  private verificarCompletado(
    procesados: number,
    total: number,
    dialogRef: MatDialogRef<LoadingDialogComponent>,
    usuariosInvalidos: { nombre: string; dni: string }[],
    errores: { nombre: string; dni: string; motivo?: string }[],
  ) {
    if (procesados === total) {
      dialogRef.close();
      // Combina usuarios inválidos del Excel con errores de la API
      const todosErrores = [...usuariosInvalidos, ...errores];
      if (todosErrores.length > 0) {
        this.mostrarErrores(todosErrores);
      }
      // Actualiza la lista de usuarios
      this.obtenerUsuarios();
    }
  }

  mostrarErrores(
    usuariosInvalidos: { nombre: string; dni: string; motivo?: string }[],
  ) {
    if (usuariosInvalidos.length > 0) {
      let mensaje = 'Errores en el registro:\n\n';
      usuariosInvalidos.forEach((usuario) => {
        mensaje += `• ${usuario.nombre} (DNI: ${usuario.dni}): ${
          usuario.motivo || 'Datos incompletos'
        }\n`;
      });
      alert(mensaje);
    }
  }

  abrirDialogoEdicion(
    usuarioId: number,
    operacionesAutorizadas: { [key: string]: boolean },
  ) {
    const dialogRef = this.dialog.open(EditarOperacionesDialogComponent, {
      width: '400px',
      data: {
        id: usuarioId,
        operacionesAutorizadas: operacionesAutorizadas,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'actualizado') {
        // ✅ Aquí llamas a la función que actualiza la tabla
        this.obtenerUsuarios(); // o como se llame tu función de recarga
      }
    });
  }
}
