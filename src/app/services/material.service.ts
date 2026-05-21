import { Injectable } from '@angular/core';
import { ApiService } from './api.service'; // Importamos ApiService
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Material } from '../models/material.model';

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private baseUrl = 'materiales'; // Ruta del backend
  private materialesActualizados = new BehaviorSubject<boolean>(false); // Para notificar cambios

  constructor(private apiService: ApiService) {}

  // Obtener todos los materiales
  getMateriales(): Observable<Material[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  // Obtener un material por ID
  getMaterialById(id: number): Observable<Material> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  // Crear un nuevo material
  createMaterial(material: Material): Observable<Material> {
    return this.apiService.postDatos(`${this.baseUrl}/`, material).pipe(
      tap(() => {
        this.materialesActualizados.next(true); // Notificar actualización
      })
    );
  }

  // Actualizar un material
  updateMaterial(id: number, material: Material): Observable<Material> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, material);
  }

  // Eliminar un material
  deleteMaterial(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`);
  }

  // Notificar cuando se actualizan los materiales
  getMaterialesActualizados(): Observable<boolean> {
    return this.materialesActualizados.asObservable();
  }
}