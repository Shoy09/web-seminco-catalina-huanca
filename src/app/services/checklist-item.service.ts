import { Injectable } from '@angular/core';
import { ApiService } from './api.service'; // Importa tu ApiService general
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CheckListItem } from '../models/checklist-item.model';

@Injectable({
  providedIn: 'root'
})
export class CheckListItemService {
  private baseUrl = 'check-list'; // Asegúrate que coincide con tu backend route
  private itemsActualizados = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getCheckListItems(filtros: { proceso?: string; categoria?: string; equipo_id?: number } = {}): Observable<CheckListItem[]> {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value));
    });
    return this.apiService.getDatos(`${this.baseUrl}${params.size ? '?' + params.toString() : ''}`);
  }

  getCheckListItemsByEquipo(equipoId: number): Observable<CheckListItem[]> {
    return this.apiService.getDatos(`${this.baseUrl}/equipo/${equipoId}`);
  }

  getCheckListItemById(id: number): Observable<CheckListItem> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  createCheckListItem(item: CheckListItem, notificar = true): Observable<CheckListItem> {
    return this.apiService.postDatos(`${this.baseUrl}/`, item).pipe(
      tap(() => {
        if (notificar) this.notificarActualizacion();
      })
    );
  }

  updateCheckListItem(id: number, item: CheckListItem): Observable<CheckListItem> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, item).pipe(
      tap(() => {
        this.itemsActualizados.next(true); // Notificar que se actualizó un item
      })
    );
  }

  deleteCheckListItem(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.itemsActualizados.next(true); // Notificar que se eliminó un item
      })
    );
  }

  getItemsActualizados(): Observable<boolean> {
    return this.itemsActualizados.asObservable();
  }

  notificarActualizacion(): void {
    this.itemsActualizados.next(true);
  }
}
