import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ToneladasScoop } from '../models/ToneladasScoop';

@Injectable({
  providedIn: 'root'
})
export class ToneladasScoopService {
  private baseUrl = 'toneladas-scoops';
  private toneladasScoopsActualizados = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  // Obtener todos los registros
  getToneladasScoops(): Observable<ToneladasScoop[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  // Obtener un registro por ID
  getToneladasScoopById(id: number): Observable<ToneladasScoop> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  // Crear un registro
  createToneladasScoop(registro: ToneladasScoop): Observable<ToneladasScoop> {
    return this.apiService.postDatos(`${this.baseUrl}/`, registro).pipe(
      tap(() => {
        this.toneladasScoopsActualizados.next(true);
      })
    );
  }

  // Actualizar un registro
  updateToneladasScoop(id: number, registro: ToneladasScoop): Observable<ToneladasScoop> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, registro).pipe(
      tap(() => {
        this.toneladasScoopsActualizados.next(true);
      })
    );
  }

  // Eliminar un registro
  deleteToneladasScoop(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.toneladasScoopsActualizados.next(true);
      })
    );
  }

  // Escuchar cambios
  getToneladasScoopsActualizados(): Observable<boolean> {
    return this.toneladasScoopsActualizados.asObservable();
  }
}