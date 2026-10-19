import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { IndividualConfig, ToastrService } from 'ngx-toastr';
import { ConfirmacionComponent } from '../Components/shared/confirmacion/confirmacion.component';

@Injectable({ providedIn: 'root' })
export class NotificacionesUiService {
  private readonly toastr = inject(ToastrService);
  private readonly dialog = inject(MatDialog);

  success(mensaje: string, titulo = 'Operación completada'): void {
    this.toastr.success(mensaje, titulo);
  }

  error(mensaje: string, titulo = 'No se pudo completar la operación', opciones?: Partial<IndividualConfig>): void {
    this.toastr.error(mensaje, titulo, opciones);
  }

  warning(mensaje: string, titulo = 'Revisa la información'): void {
    this.toastr.warning(mensaje, titulo);
  }

  async confirmar(mensaje: string): Promise<boolean> {
    const resultado = await firstValueFrom(this.dialog.open(ConfirmacionComponent, {
      data: mensaje,
      width: '420px',
      maxWidth: 'calc(100vw - 32px)',
      autoFocus: 'first-tabbable',
      restoreFocus: true,
    }).afterClosed());
    return resultado === true;
  }
}
