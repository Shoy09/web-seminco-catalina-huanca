import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mejores-operadores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mejores-operadores.component.html',
  styleUrl: './mejores-operadores.component.css'
})
export class MejoresOperadoresComponent implements OnChanges {

  @Input() data: any[] = [];

  displayedData: any[] = [];
  paginatedData: any[] = [];

  // Variables de paginación
  currentPage: number = 1;
  rowsPerPage: number = 5;
  totalPages: number = 1;
  pageNumbers: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      console.log('Data Mejores Operadores:', this.data);
      this.currentPage = 1;
      this.processData();
    }
  }

  processData(): void {
    if (!this.data || this.data.length === 0) {
      this.displayedData = [];
      this.paginatedData = [];
      return;
    }

    // Formatear los datos para la tabla
    this.displayedData = this.data.map(item => ({
      operador: item.operador || 'N/A',
      turno: item.turno || 'N/A',
      tonelaje: Number(item.Tonelaje) || 0,
      tnHr: Number(item.Tn_h_SC) || 0
    }));

    // Ordenar por Tonelaje (mayor a menor) o por Tn/Hr
    this.displayedData.sort((a, b) => {
      // Primero por tonelaje descendente
      if (b.tonelaje !== a.tonelaje) {
        return b.tonelaje - a.tonelaje;
      }
      // Si hay empate, por Tn/Hr descendente
      return b.tnHr - a.tnHr;
    });

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
}