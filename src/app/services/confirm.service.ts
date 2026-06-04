import { Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  constructor(private confirmationService: ConfirmationService) {}

  confirmDelete(
    message: string = '¿Estás seguro de que deseas eliminar este registro?',
    accept: () => void
  ): void {
    this.confirmationService.confirm({
      header: 'Confirmar eliminación',
      message,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept,
    });
  }

  confirmAction(
    options: {
      header?: string;
      message: string;
      icon?: string;
      acceptLabel?: string;
      rejectLabel?: string;
      accept: () => void;
      reject?: () => void;
    }
  ): void {
    this.confirmationService.confirm({
      header: options.header || 'Confirmar acción',
      message: options.message,
      icon: options.icon || 'pi pi-question-circle',
      acceptLabel: options.acceptLabel || 'Aceptar',
      rejectLabel: options.rejectLabel || 'Cancelar',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: options.accept,
      reject: options.reject,
    });
  }
}