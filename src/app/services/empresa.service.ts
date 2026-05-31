import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Empresa } from '../models/empresa.model';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private baseUrl = 'empresas';
  private empresasActualizadas = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ApiService) {}

  getEmpresas(): Observable<Empresa[]> {
    return this.apiService.getDatos(`${this.baseUrl}/`);
  }

  getEmpresaById(id: number): Observable<Empresa> {
    return this.apiService.getDatos(`${this.baseUrl}/${id}`);
  }

  createEmpresa(empresa: Empresa): Observable<Empresa> {
    return this.apiService.postDatos(`${this.baseUrl}/`, empresa).pipe(
      tap(() => this.empresasActualizadas.next(true))
    );
  }

  updateEmpresa(id: number, empresa: Empresa): Observable<Empresa> {
    return this.apiService.putDatos(`${this.baseUrl}/${id}`, empresa).pipe(
      tap(() => this.empresasActualizadas.next(true))
    );
  }

  deleteEmpresa(id: number): Observable<any> {
    return this.apiService.deleteDatos(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.empresasActualizadas.next(true))
    );
  }

  getEmpresasActualizadas(): Observable<boolean> {
    return this.empresasActualizadas.asObservable();
  }
}