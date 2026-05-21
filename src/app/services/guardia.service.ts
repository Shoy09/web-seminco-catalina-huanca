import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Guardia } from '../models/guardia.model';

@Injectable({
  providedIn: 'root'
})
export class GuardiaService {

  private baseUrl = 'guardias';
  private guardiasActualizadas = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  // Obtener todas las guardias
  getGuardias(): Observable<Guardia[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  // Obtener una guardia por ID
  getGuardiaById(id: number): Observable<Guardia> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  // Crear una nueva guardia
  createGuardia(guardia: Guardia): Observable<Guardia> {
    return this.apiService.postDatos(`${this.baseUrl}/`, guardia).pipe(
      tap(() => {
        this.guardiasActualizadas.next(true);
      })
    );
  }

  // Actualizar una guardia
  updateGuardia(id: number, guardia: Guardia): Observable<Guardia> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, guardia);
  }

  // Eliminar una guardia
  deleteGuardia(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`);
  }

  // Observable para detectar cambios
  getGuardiasActualizadas(): Observable<boolean> {
    return this.guardiasActualizadas.asObservable();
  }
}