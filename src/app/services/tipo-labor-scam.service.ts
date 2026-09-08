import { Injectable } from '@angular/core';
import { ApiService } from './api.service'; // Importamos ApiService
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { TipoLabor } from 'app/models/tipo-labor.model';

@Injectable({
  providedIn: 'root'
})
export class TipoLaborService {
  private baseUrl = 'tipo-Labor'; // Debe coincidir con la ruta del backend
  private tiposActualizados = new BehaviorSubject<boolean>(false); // Para notificar cambios

  constructor(private apiService: ApiService) {}

  // Obtener todos los tipos de labor
  getTiposLabor(): Observable<TipoLabor[]> {
    return this.apiService.getDatos(this.baseUrl + '/');
  }

  // Obtener un tipo de labor por ID
  getTipoLaborById(id: number): Observable<TipoLabor> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  // Crear un nuevo tipo de labor
  createTipoLabor(tipo: TipoLabor): Observable<TipoLabor> {
    return this.apiService.postDatos(`${this.baseUrl}/`, tipo).pipe(
      tap(() => {
        this.tiposActualizados.next(true); // Notificar actualización
      })
    );
  }

  // Actualizar un tipo de labor
  updateTipoLabor(id: number, tipo: TipoLabor): Observable<TipoLabor> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, tipo);
  }

  // Eliminar un tipo de labor
  deleteTipoLabor(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`);
  }

  // Notificar cuando se actualizan los tipos de labor
  getTiposLaborActualizados(): Observable<boolean> {
    return this.tiposActualizados.asObservable();
  }
}