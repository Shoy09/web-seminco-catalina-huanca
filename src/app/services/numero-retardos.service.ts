import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { NumeroRetardos } from '../models/numero-retardos.model';

@Injectable({
  providedIn: 'root'
})
export class NumeroRetardosService {

  private baseUrl = 'n-retardos';
  private registrosActualizados = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getAll(): Observable<NumeroRetardos[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  getLast(): Observable<NumeroRetardos> {
    return this.apiService.getDatos(`${this.baseUrl}/ultimo`);
  }

  getByAnio(anio: number): Observable<NumeroRetardos[]> {
    return this.apiService.getDatos(`${this.baseUrl}/anio/${anio}`);
  }

  create(data: NumeroRetardos): Observable<NumeroRetardos> {
    return this.apiService.postDatos(`${this.baseUrl}/`, data).pipe(
      tap(() => this.registrosActualizados.next(true))
    );
  }

  update(id: number, data: NumeroRetardos): Observable<NumeroRetardos> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, data).pipe(
      tap(() => this.registrosActualizados.next(true))
    );
  }

  delete(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.registrosActualizados.next(true))
    );
  }

  getActualizados(): Observable<boolean> {
    return this.registrosActualizados.asObservable();
  }
}