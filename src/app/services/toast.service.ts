import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private messageService: MessageService) {}

  success(summary: string, detail: string = 'Operación realizada correctamente'): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life: 3000,
    });
  }

  error(summary: string, detail: string = 'Ocurrió un error'): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life: 4000,
    });
  }

  warn(summary: string, detail: string = 'Revise la información ingresada'): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life: 3500,
    });
  }

  info(summary: string, detail: string = ''): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life: 3000,
    });
  }
}