import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalle-sostenimiento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-sostenimiento.component.html',
  styleUrl: './detalle-sostenimiento.component.css'
})
export class DetalleSostenimientoComponent implements OnChanges {

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
      console.log('🔥 DETALLE SOSTENIMIENTO RECIBIDO:', this.data);
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

    // Procesar cada fila con los campos solicitados
    this.displayedData = this.data.map(item => ({
      registros: Number(item.registros) || 1,  // Por defecto 1 si no viene
      modelo_equipo: item.modelo_equipo || 'N/A',
      labor_sos: item.labor_sos || 'N/A',
      seccion_labor: item.seccion_labor || 'N/A',
      tipo_pernos: item.tipo_pernos || 'N/A',
      n_pernos: Number(item.n_pernos) || 0,
      log_pernos: Number(item.log_pernos) || 0,
      mt52_malla: Number(item.mt52_malla) || 0,
      metros_perforados: Number(item.metros_perforados) || 0
    }));

    // Calcular totales / promedios
    const count = this.displayedData.length;
    
    this.totales = {
      registros: this.displayedData.reduce((sum, item) => sum + item.registros, 0),
      n_pernos: this.displayedData.reduce((sum, item) => sum + item.n_pernos, 0),
      log_pernos: this.displayedData.length > 0 
    ? this.displayedData.reduce((sum, item) => sum + item.log_pernos, 0) / count
    : 0,
      mt52_malla: this.displayedData.reduce((sum, item) => sum + Number(item.mt52_malla), 0),
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

  formatear1Decimal(valor: number): string {
    if (isNaN(valor)) return '0.0';
    return valor.toFixed(1);
  }
}