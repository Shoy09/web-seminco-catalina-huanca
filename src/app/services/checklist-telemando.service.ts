import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ChecklistTelemando } from '../models/checklist-telemando.model';

@Injectable({
  providedIn: 'root'
})
export class ChecklistTelemandoService {
  private baseUrl = 'checklists-telemando'; // Nota: coincide con la ruta en el backend
  private checklistsActualizados = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  /**
   * Obtiene todos los checklists de telemando
   */
  getChecklists(): Observable<ChecklistTelemando[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  /**
   * Obtiene un checklist por su ID
   */
  getChecklistById(id: number): Observable<ChecklistTelemando> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea un nuevo checklist
   */
  createChecklist(checklist: ChecklistTelemando): Observable<ChecklistTelemando> {
    return this.apiService.postDatos(`${this.baseUrl}/`, checklist).pipe(
      tap(() => this.checklistsActualizados.next(true))
    );
  }

  /**
   * Actualiza un checklist existente
   */
  updateChecklist(id: number, checklist: ChecklistTelemando): Observable<ChecklistTelemando> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, checklist).pipe(
      tap(() => this.checklistsActualizados.next(true))
    );
  }

  /**
   * Elimina un checklist
   */
  deleteChecklist(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.checklistsActualizados.next(true))
    );
  }

  /**
   * Observable para notificar cambios en los checklists
   */
  getChecklistsActualizados(): Observable<boolean> {
    return this.checklistsActualizados.asObservable();
  }

  /**
   * Método auxiliar para resetear el estado de actualización
   */
  resetActualizados(): void {
    this.checklistsActualizados.next(false);
  }
}