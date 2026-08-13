import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface EnviarEmailDto {
  to: string;
  subject: string;
  message: string;
}

export interface EnviarEmailPdfDto {
  to: string;
  subject: string;
  message?: string;
  pdf: File;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificacionesService {
  constructor(private apiService: ApiService) {}

  enviarEmail(dto: EnviarEmailDto): Observable<EmailResponse> {
    return this.apiService.postDatos('notificaciones/email', dto);
  }

  enviarEmailConPdf(dto: EnviarEmailPdfDto): Observable<EmailResponse> {
    const formData = new FormData();
    formData.append('to', dto.to);
    formData.append('subject', dto.subject);
    if (dto.message) formData.append('message', dto.message);
    formData.append('pdf', dto.pdf);
    return this.apiService.postFormData('notificaciones/email-pdf', formData);
  }
}
