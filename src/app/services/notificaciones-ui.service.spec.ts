import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ToastrService } from 'ngx-toastr';
import { NotificacionesUiService } from './notificaciones-ui.service';

describe('Notificaciones de la interfaz', () => {
  let servicio: NotificacionesUiService;
  let dialog: MatDialog;
  let toastr: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    toastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);
    TestBed.configureTestingModule({ providers: [
      provideNoopAnimations(),
      { provide: ToastrService, useValue: toastr },
    ] });
    servicio = TestBed.inject(NotificacionesUiService);
    dialog = TestBed.inject(MatDialog);
  });

  afterEach(() => dialog.closeAll());

  it('envía los avisos al sistema de notificaciones común', () => {
    servicio.success('Operación actualizada');
    servicio.warning('Máximo de revisiones alcanzado');
    servicio.error('No se pudo guardar');
    expect(toastr.success).toHaveBeenCalledWith('Operación actualizada', 'Operación completada');
    expect(toastr.warning).toHaveBeenCalledWith('Máximo de revisiones alcanzado', 'Revisa la información');
    expect(toastr.error).toHaveBeenCalledWith('No se pudo guardar', 'No se pudo completar la operación', undefined);
  });

  it('conserva los detalles extensos hasta que el usuario los cierre', () => {
    servicio.error('Fila 1: falta DNI\nFila 2: falta nombre', 'Errores de importación', { disableTimeOut: true });
    expect(toastr.error).toHaveBeenCalledWith('Fila 1: falta DNI\nFila 2: falta nombre', 'Errores de importación', { disableTimeOut: true });
  });

  it('solo autoriza la acción cuando se confirma explícitamente', async () => {
    const resultado = servicio.confirmar('¿Eliminar usuario?');
    const referencia = dialog.openDialogs[0];
    referencia.componentRef!.changeDetectorRef.detectChanges();
    const botones = document.querySelectorAll<HTMLButtonElement>('app-confirmacion button');
    expect(botones[0].textContent).toContain('Cancelar');
    expect(botones[1].textContent).toContain('Confirmar');
    botones[1].click();
    expect(await resultado).toBeTrue();
  });

  it('cancela la acción al pulsar Cancelar', async () => {
    const resultado = servicio.confirmar('¿Eliminar usuario?');
    dialog.openDialogs[0].componentRef!.changeDetectorRef.detectChanges();
    document.querySelector<HTMLButtonElement>('app-confirmacion .cancelar')!.click();
    expect(await resultado).toBeFalse();
  });

  it('no autoriza la acción si el diálogo se cierra sin respuesta', async () => {
    const resultado = servicio.confirmar('¿Eliminar usuario?');
    dialog.openDialogs[0].close();
    expect(await resultado).toBeFalse();
  });
});
