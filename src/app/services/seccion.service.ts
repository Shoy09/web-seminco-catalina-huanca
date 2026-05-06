import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Seccion } from '../models/seccion.model';

@Injectable({
  providedIn: 'root'
})
export class SeccionService {

  private baseUrl = 'secciones';
  private seccionesActualizadas = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getSecciones(): Observable<Seccion[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  getSeccionById(id: number): Observable<Seccion> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  createSeccion(seccion: Seccion): Observable<Seccion> {
    return this.apiService.postDatos(`${this.baseUrl}/`, seccion).pipe(
      tap(() => this.seccionesActualizadas.next(true))
    );
  }

  updateSeccion(id: number, seccion: Seccion): Observable<Seccion> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, seccion).pipe(
      tap(() => this.seccionesActualizadas.next(true))
    );
  }

  deleteSeccion(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.seccionesActualizadas.next(true))
    );
  }

  getSeccionesActualizadas(): Observable<boolean> {
    return this.seccionesActualizadas.asObservable();
  }

  getSeccionesByProceso(proceso: string): Observable<Seccion[]> {
  const procesoEncoded = encodeURIComponent(proceso);
  return this.apiService.getDatos(`${this.baseUrl}/proceso/${procesoEncoded}`);
}

}