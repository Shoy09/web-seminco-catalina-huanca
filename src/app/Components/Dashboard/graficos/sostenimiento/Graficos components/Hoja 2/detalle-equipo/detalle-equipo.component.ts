import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalle-equipo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-equipo.component.html',
  styleUrl: './detalle-equipo.component.css'
})
export class DetalleEquipoComponent implements OnChanges {

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

    this.displayedData = this.data.map(item => ({
      equipo: item.modelo_equipo || 'N/A',
      diferencia_percusion: Number(item.diferencia_percusion) || 0,
      log_pernos: Number(item.log_pernos) || 0,
      metros_perforados: Number(item.metros_perforados) || 0,
      n_labores_sostenidas: Number(item.n_labores_sostenidas) || 0,
      n_pernos: Number(item.n_pernos) || 0,
      n_pernos_por_labor: Number(item.n_pernos_por_labor) || 0,
      sos_m_hr_hp: Number(item.sos_m_hr_hp) || 0
    }));

    const count = this.displayedData.length || 1;

    const sum = (campo: string) =>
      this.displayedData.reduce((acc, item) => acc + (item[campo] || 0), 0);

    this.totales = {
      // Estos son PROMEDIOS
      diferencia_percusion: sum('diferencia_percusion'),
      log_pernos: sum('log_pernos') / count,
      metros_perforados: sum('metros_perforados'),
      n_labores_sostenidas: sum('n_labores_sostenidas'),
      n_pernos: sum('n_pernos'),
      // Estos son PROMEDIOS también
      n_pernos_por_labor: sum('n_pernos_por_labor') / count,
      sos_m_hr_hp: sum('sos_m_hr_hp') / count
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