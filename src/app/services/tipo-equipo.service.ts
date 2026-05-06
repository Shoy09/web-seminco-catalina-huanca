import { Injectable } from '@angular/core';
import { ApiService } from './api.service'; // Importa tu ApiService general
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { TipoEquipo } from '../models/tipo-equipo.model';

@Injectable({
  providedIn: 'root'
})
export class TipoEquipoService {
  private baseUrl = 'tipo-equipos'; // Debe coincidir con la ruta en tu backend
  private tiposActualizados = new BehaviorSubject<boolean>(false); // Para notificar cambios

  constructor(private apiService: ApiService) {}

  // Obtener todos los tipos de equipo
  getTipos(): Observable<TipoEquipo[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  // Obtener un tipo de equipo por ID
  getTipoById(id: number): Observable<TipoEquipo> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  // Crear un nuevo tipo de equipo
  createTipo(tipo: TipoEquipo): Observable<TipoEquipo> {
    return this.apiService.postDatos(`${this.baseUrl}/`, tipo).pipe(
      tap(() => this.tiposActualizados.next(true)) // Notificar que se creó un nuevo tipo
    );
  }

  // Actualizar un tipo de equipo existente
  updateTipo(id: number, tipo: TipoEquipo): Observable<TipoEquipo> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, tipo).pipe(
      tap(() => this.tiposActualizados.next(true)) // Notificar que se actualizó
    );
  }

  // Eliminar un tipo de equipo
  deleteTipo(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.tiposActualizados.next(true)) // Notificar que se eliminó
    );
  }

  // Observable para suscribirse a cambios en la lista de tipos de equipo
  getTiposActualizados(): Observable<boolean> {
    return this.tiposActualizados.asObservable();
  }
}