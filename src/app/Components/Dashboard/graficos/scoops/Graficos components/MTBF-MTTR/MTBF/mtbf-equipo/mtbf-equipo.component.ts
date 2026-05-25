import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mtbf-equipo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mtbf-equipo.component.html',
  styleUrl: './mtbf-equipo.component.css'
})
export class MtbfEquipoComponent implements OnInit, OnChanges {

  @Input() data: any[] = [];

  datosMTBF: any[] = [];
  displayedData: any[] = [];
  paginatedData: any[] = [];
  
  // Paginación
  currentPage: number = 1;
  rowsPerPage: number = 5;
  totalPages: number = 1;
  pageNumbers: number[] = [];

  ngOnInit(): void {
    this.procesarDatos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.procesarDatos();
    }
  }

  procesarDatos(): void {
    if (!this.data || this.data.length === 0) {
      this.datosMTBF = [];
      this.displayedData = [];
      this.paginatedData = [];
      this.totalPages = 1;
      this.pageNumbers = [];
      return;
    }

    // Mapear los datos: usar codigo o equipo como nombre, mtbf como valor
    this.datosMTBF = this.data
      .map(item => ({
        equipo: item.codigo || item.equipo || 'Sin datos',
        mtbf: item.mtbf || 0,
        // Guardar datos adicionales para tooltip
        nombre: item.nombre || '',
        horasOperacion: item.horasOperacion || 0,
        horasMtto: item.horasMtto || 0,
        cantidadFallas: item.cantidadFallas || 0,
        cantidadOperaciones: item.cantidadOperaciones || 0
      }))
      .sort((a, b) => b.mtbf - a.mtbf); // Ordenar de mayor a menor MTBF

    this.displayedData = [...this.datosMTBF];
    this.currentPage = 1;
    this.calculateTotalPages();
    this.updatePaginatedData();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.displayedData.length / this.rowsPerPage);
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  updatePaginatedData(): void {
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    this.paginatedData = this.displayedData.slice(startIndex, endIndex);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.rowsPerPage;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.rowsPerPage, this.displayedData.length);
  }

  get totalMTBF(): number {
    return this.displayedData.reduce((sum, item) => sum + (item.mtbf || 0), 0);
  }

  get averageMTBF(): number {
    return this.displayedData.length > 0 ? this.totalMTBF / this.displayedData.length : 0;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedData();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedData();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedData();
  }

  onRowsPerPageChange(event: any): void {
    this.rowsPerPage = parseInt(event.target.value, 10);
    this.currentPage = 1;
    this.calculateTotalPages();
    this.updatePaginatedData();
  }
}