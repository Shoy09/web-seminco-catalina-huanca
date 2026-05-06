import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LongitudBarras } from '../models/longitud-barras.model';

@Injectable({
  providedIn: 'root'
})
export class LongitudBarrasService {

  private baseUrl = 'longitud-barras';
  private actualizados = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getAll(): Observable<LongitudBarras[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  getById(id: number): Observable<LongitudBarras> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  create(data: LongitudBarras): Observable<LongitudBarras> {
    return this.apiService.postDatos(`${this.baseUrl}/`, data).pipe(
      tap(() => this.actualizados.next(true))
    );
  }

  update(id: number, data: LongitudBarras): Observable<LongitudBarras> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, data).pipe(
      tap(() => this.actualizados.next(true))
    );
  }

  delete(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.actualizados.next(true))
    );
  }

  getActualizados(): Observable<boolean> {
    return this.actualizados.asObservable();
  }
}