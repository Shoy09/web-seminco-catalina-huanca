import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalle-perforacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-perforacion.component.html',
  styleUrl: './detalle-perforacion.component.css'
})
export class DetallePerforacionComponent implements OnChanges {

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
      this.currentPage = 1; // Resetear a primera página cuando cambian los datos
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

    // Procesar cada fila
    this.displayedData = this.data.map(item => ({
      equipo: item.modelo_equipo || 'N/A',
      horas_percutadas: item.horas_percutadas || item.percusion || 0,
      tal_prod: item.tal_prod || item.prod || 0,
      tal_rimados: item.tal_rimados || item.rim || 0,
      tal_repaso: item.tal_repaso || item.repaso || 0,
      tal_alivio: item.tal_alivio || item.alivio || 0,
      long_barras: item.long_barras || 0,
      fr_mhr_hp: item.fr_mhr_hp || item.fr_mhr_hp || 0,
      metros_perforados: item.metros_perforados || 0
    }));

    // Calcular totales
    this.totales = {
      horas_percutadas: this.displayedData.reduce((sum, item) => sum + item.horas_percutadas, 0),
      tal_prod: this.displayedData.reduce((sum, item) => sum + item.tal_prod, 0),
      tal_rimados: this.displayedData.reduce((sum, item) => sum + item.tal_rimados, 0),
      tal_repaso: this.displayedData.reduce((sum, item) => sum + item.tal_repaso, 0),
      tal_alivio: this.displayedData.reduce((sum, item) => sum + item.tal_alivio, 0),
      long_barras: this.displayedData.reduce((sum, item) => sum + item.long_barras, 0) / this.displayedData.length,
      fr_mhr_hp: this.displayedData.reduce((sum, item) => sum + item.fr_mhr_hp, 0) / this.displayedData.length,
      metros_perforados: this.displayedData.reduce((sum, item) => sum + item.metros_perforados, 0)
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
    return (this.currentPage - 1) * this.rowsPerPage + 1;
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

  formatear1Decimal(valor: number): string {
    if (isNaN(valor)) return '0.0';
    return valor.toFixed(1);
  }
}