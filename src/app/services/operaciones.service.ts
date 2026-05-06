import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { OperacionBase } from '../models/OperacionBase.models';

@Injectable({
  providedIn: 'root'
})
export class OperacionesService {

  private baseUrl = 'operaciones';
  private actualizados = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  // ✅ Obtener por jefe_guardia
getPorJefe(  tipo: string,
  jefe_guardia: string,
  limit: number = 50,
  offset: number = 0): Observable<{ ok: boolean; data: OperacionBase[] }> {
  return this.apiService.getDatos(
    `${this.baseUrl}/${tipo}/jefe?jefe_guardia=${encodeURIComponent(jefe_guardia)}&limit=${limit}&offset=${offset}`
  );
}

getById(
  tipo: string,
  id: number
): Observable<{ ok: boolean; data: OperacionBase }> {
  return this.apiService.getDatos(
    `${this.baseUrl}/${tipo}/id/${id}`
  );
}

  // 🔥 opcional: notificar cambios (por si luego usas aprobar/editar)
  notificarActualizacion() {
    this.actualizados.next(true);
  }

  actualizar(
  tipo: string,
  id: number,
  data: Partial<OperacionBase>
): Observable<{ ok: boolean; data: OperacionBase }> {
  return this.apiService.putDatos(
    `${this.baseUrl}/update/${tipo}/${id}`,
    data
  ).pipe(
    tap(() => this.notificarActualizacion())
  );
}

getAll(
  tipo: string
): Observable<{ ok: boolean; data: OperacionBase[] }> {
  return this.apiService.getDatos(
    `${this.baseUrl}/${tipo}`
  );
}

getAllAprobados(
  tipo: string
): Observable<{ ok: boolean; data: OperacionBase[] }> {
  return this.apiService.getDatos(
    `${this.baseUrl}/aprobacion/${tipo}`
  );
}

  getActualizados(): Observable<boolean> {
    return this.actualizados.asObservable();
  }
}