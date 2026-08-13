import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import {
  NotificacionesService,
  EnviarEmailDto,
} from '../../../services/notificaciones.service';
import { Router } from '@angular/router';

interface DestinatarioControl {
  email: string;
}

@Component({
  selector: 'app-notificaciones-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileSizePipe],
  templateUrl: './notificaciones-email.component.html',
  styleUrl: './notificaciones-email.component.css',
})
export class NotificacionesEmailComponent implements OnInit {
  form!: FormGroup;
  archivoPdf: File | null = null;
  nombreArchivo: string = '';
  enviando = false;
  errorArchivo: string = '';

  constructor(
    private fb: FormBuilder,
    private notificacionesService: NotificacionesService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      destinatarios: this.fb.array([this.crearDestinatario()]),
      subject: ['', [Validators.required, Validators.minLength(3)]],
      message: [''],
      tienePdf: [false],
    });
  }

  get destinatarios(): FormArray {
    return this.form.get('destinatarios') as FormArray;
  }

  crearDestinatario(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  agregarDestinatario(): void {
    this.destinatarios.push(this.crearDestinatario());
  }

  eliminarDestinatario(index: number): void {
    if (this.destinatarios.length > 1) {
      this.destinatarios.removeAt(index);
    }
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.errorArchivo = '';
    this.archivoPdf = null;
    this.nombreArchivo = '';

    if (!input.files?.length) return;

    const archivo = input.files[0];

    if (archivo.type !== 'application/pdf') {
      this.errorArchivo = 'Solo se permiten archivos PDF.';
      input.value = '';
      return;
    }

    if (archivo.size > 10 * 1024 * 1024) {
      this.errorArchivo = 'El archivo no debe superar los 10 MB.';
      input.value = '';
      return;
    }

    this.archivoPdf = archivo;
    this.nombreArchivo = archivo.name;
  }

  quitarArchivo(): void {
    this.archivoPdf = null;
    this.nombreArchivo = '';
    this.errorArchivo = '';
    const input = document.getElementById('pdfInput') as HTMLInputElement;
    if (input) input.value = '';
  }

  get tienePdf(): boolean {
    return this.form.get('tienePdf')?.value === true;
  }

  get hayDestinatarioInvalido(): boolean {
    return this.destinatarios.controls.some(
      (c) => c.get('email')?.invalid && c.get('email')?.touched
    );
  }

  togglePdf(): void {
    const actual = this.form.get('tienePdf')?.value;
    this.form.get('tienePdf')?.setValue(!actual);
    if (actual) {
      this.quitarArchivo();
    }
  }

  esFormularioValido(): boolean {
    const destinatariosValidos = this.destinatarios.controls.every(
      (ctrl) => ctrl.valid
    );
    const subjectValido = this.form.get('subject')?.valid ?? false;
    const mensajeValido = !this.tienePdf
      ? (this.form.get('message')?.value?.trim()?.length ?? 0) > 0
      : true;
    const pdfValido = this.tienePdf ? this.archivoPdf !== null : true;
    return destinatariosValidos && subjectValido && mensajeValido && pdfValido;
  }

  private construirEnvios(): Observable<any>[] {
    const subject: string = this.form.get('subject')?.value?.trim();
    const message: string = this.form.get('message')?.value?.trim() ?? '';
    const emails: string[] = this.destinatarios.controls.map(
      (c) => c.get('email')?.value?.trim()
    );

    if (this.tienePdf && this.archivoPdf) {
      return emails.map((to) =>
        this.notificacionesService.enviarEmailConPdf({
          to,
          subject,
          message: message || undefined,
          pdf: this.archivoPdf!,
        })
      );
    } else {
      return emails.map((to) =>
        this.notificacionesService.enviarEmail({ to, subject, message })
      );
    }
  }

  enviar(): void {
    if (!this.esFormularioValido() || this.enviando) return;

    this.enviando = true;
    const envios = this.construirEnvios();
    let completados = 0;
    let errores = 0;
    const total = envios.length;

    envios.forEach((obs, idx) => {
      obs.subscribe({
        next: (res) => {
          completados++;
          this.verificarFin(completados, errores, total);
        },
        error: (err) => {
          errores++;
          const msg = err?.error?.error ?? 'Error desconocido';
          if (err.status === 401) {
            this.toastr.error('Sesión expirada. Redirigiendo al login...', 'Sin autorización');
            this.enviando = false;
            localStorage.clear();
            this.router.navigate(['/login']);
            return;
          }
          this.toastr.error(
            `Destinatario ${idx + 1}: ${msg}`,
            'Error al enviar'
          );
          this.verificarFin(completados, errores, total);
        },
      });
    });
  }

  private verificarFin(completados: number, errores: number, total: number): void {
    if (completados + errores === total) {
      this.enviando = false;
      if (completados > 0 && errores === 0) {
        this.toastr.success(
          `${completados} correo${completados > 1 ? 's' : ''} enviado${completados > 1 ? 's' : ''} correctamente.`,
          'Éxito'
        );
        this.resetForm();
      } else if (completados > 0 && errores > 0) {
        this.toastr.warning(
          `${completados} enviado${completados > 1 ? 's' : ''}, ${errores} falló.`,
          'Parcialmente enviado'
        );
      }
    }
  }

  private resetForm(): void {
    while (this.destinatarios.length > 1) {
      this.destinatarios.removeAt(1);
    }
    this.destinatarios.at(0).reset({ email: '' });
    this.form.get('subject')?.reset('');
    this.form.get('message')?.reset('');
    this.form.get('tienePdf')?.setValue(false);
    this.quitarArchivo();
  }
}

// Needed for the Observable type used inside the component
import { Observable } from 'rxjs';import { FileSizePipe } from '../file-size.pipe';

