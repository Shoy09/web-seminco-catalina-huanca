import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { OrigenDestino } from '../models/origen-destino.model';

@Injectable({
  providedIn: 'root'
})
export class OrigenDestinoService {

  private baseUrl = 'origen-destino';
  private origenDestinoActualizado = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  // 🔹 Obtener todos
  getAll(): Observable<OrigenDestino[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  // 🔹 Obtener por ID
  getById(id: number): Observable<OrigenDestino> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  // 🔹 Crear
  create(data: OrigenDestino): Observable<OrigenDestino> {
    return this.apiService.postDatos(`${this.baseUrl}/`, data).pipe(
      tap(() => this.origenDestinoActualizado.next(true))
    );
  }

  // 🔹 Actualizar
  update(id: number, data: OrigenDestino): Observable<OrigenDestino> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, data).pipe(
      tap(() => this.origenDestinoActualizado.next(true))
    );
  }

  // 🔹 Eliminar
  delete(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.origenDestinoActualizado.next(true))
    );
  }

  // 🔹 Observable para refrescar
  getActualizados(): Observable<boolean> {
    return this.origenDestinoActualizado.asObservable();
  }
}