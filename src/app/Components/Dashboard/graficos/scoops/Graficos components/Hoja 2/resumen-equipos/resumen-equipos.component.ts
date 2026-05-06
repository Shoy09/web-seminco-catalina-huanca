import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resumen-equipos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resumen-equipos.component.html',
  styleUrl: './resumen-equipos.component.css'
})
export class ResumenEquiposComponent implements OnChanges {

  @Input() data: any[] = [];

  displayedData: any[] = [];
  paginatedData: any[] = [];
  totales: any = {};

  // Variables de paginación
  currentPage: number = 1;
  rowsPerPage: number = 5;
  totalPages: number = 1;
  pageNumbers: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      console.log('Data Resumen Equipos:', this.data);
      this.currentPage = 1;
      this.processData();
    }
  }

  processData(): void {
    if (!this.data || this.data.length === 0) {
      this.displayedData = [];
      this.paginatedData = [];
      this.totales = {};
      return;
    }

    // Formatear los datos para la tabla
    this.displayedData = this.data.map(item => ({
      equipo: item.modeloEquipo || 'N/A',
      horasDiesel: Number(item.DiferenciaDiesel) || 0,
      horasOperativas: Number(item.HorasOperativo) || 0,
      nCucharas: Number(item.TotalCucharas) || 0,
      tnHr: Number(item.Tn_h_SC) || 0,
      tonelaje: Number(item.Tonelaje) || 0
    }));

    // Ordenar por equipo
    this.displayedData.sort((a, b) => {
      return a.equipo.localeCompare(b.equipo);
    });

    const sum = (campo: string) =>
      this.displayedData.reduce((acc, item) => acc + (item[campo] || 0), 0);

    // Calcular totales
    const totalHorasOperativas = sum('horasOperativas');
    const totalTonelaje = sum('tonelaje');
    
    // Tn/Hr promedio ponderado = Tonelaje Total / Horas Operativas Totales
    const promedioTnHr = totalHorasOperativas > 0 ? totalTonelaje / totalHorasOperativas : 0;

    this.totales = {
      horasDiesel: sum('horasDiesel'),
      horasOperativas: totalHorasOperativas,
      nCucharas: sum('nCucharas'),
      tnHr: promedioTnHr,  // ✅ Promedio ponderado (Tonelaje Total / Horas Operativas Totales)
      tonelaje: totalTonelaje
    };

    // Configurar paginación
    this.totalPages = Math.ceil(this.displayedData.length / this.rowsPerPage);
    this.updatePageNumbers();
    this.updatePaginatedData();
  }

  // Métodos de paginación
  updatePaginatedData(): void {
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    this.paginatedData = this.displayedData.slice(startIndex, endIndex);
  }

  updatePageNumbers(): void {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    this.pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      this.pageNumbers.push(i);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedData();
      this.updatePageNumbers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedData();
      this.updatePageNumbers();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedData();
      this.updatePageNumbers();
    }
  }

  onRowsPerPageChange(event: any): void {
    this.rowsPerPage = parseInt(event.target.value);
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.displayedData.length / this.rowsPerPage);
    this.updatePageNumbers();
    this.updatePaginatedData();
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.rowsPerPage;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.rowsPerPage, this.displayedData.length);
  }

  formatearNumero(valor: number, decimales: number = 2): string {
    if (isNaN(valor)) return '0';
    return valor.toFixed(decimales);
  }

  formatearEntero(valor: number): string {
    if (isNaN(valor)) return '0';
    return Math.round(valor).toString();
  }
}