import { Injectable } from '@angular/core';
import { OperacionBase } from '../models/OperacionBase.models';

export interface TalHorizontalOperacionesListState {
  operacionesOriginal: OperacionBase[];
  operacionesFiltradas: OperacionBase[];
  fechaInicio: string;
  fechaFin: string;
  turnoSeleccionado: string;
  turnoAplicado: string;
  mostrarFiltros: boolean;
  paginaActual: number;
  registrosPorPagina: number;
}

@Injectable({
  providedIn: 'root',
})
export class TalHorizontalOperacionesListStateService {
  private state: TalHorizontalOperacionesListState | null = null;

  guardar(state: TalHorizontalOperacionesListState): void {
    this.state = {
      ...state,
      operacionesOriginal: [...state.operacionesOriginal],
      operacionesFiltradas: [...state.operacionesFiltradas],
    };
  }

  consumir(): TalHorizontalOperacionesListState | null {
    const state = this.state;
    this.state = null;
    return state;
  }

  actualizarValidacion(id: number, aprobacion: number, revisado: number): void {
    if (!this.state) return;

    const actualizar = (operaciones: OperacionBase[]): OperacionBase[] =>
      operaciones.map((operacion) =>
        operacion.id === id
          ? { ...operacion, aprobacion, revisado }
          : operacion,
      );

    this.state = {
      ...this.state,
      operacionesOriginal: actualizar(this.state.operacionesOriginal),
      operacionesFiltradas: actualizar(this.state.operacionesFiltradas),
    };
  }
}
