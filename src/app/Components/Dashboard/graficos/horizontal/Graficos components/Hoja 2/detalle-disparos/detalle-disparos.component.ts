import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalle-disparos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-disparos.component.html',
  styleUrl: './detalle-disparos.component.css'
})
export class DetalleDisparosComponent implements OnChanges {

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
      equipo: item.modelo_equipo || item.equipo || 'N/A',
      disparo: item.disparo || item.tipo_perforacion || item.tipo || 'N/A',
      labor: item.labor || item.labor_fr || item.seccion_labor || 'N/A',
      tal_prod: item.tal_prod || item.prod || 0,
      tal_rim: item.tal_rim || item.tal_rimados || item.rim || 0,
      tal_repaso: item.tal_repaso || item.repaso || 0,
      tal_alivio: item.tal_alivio || item.alivio || 0,
      pies: item.pies || item.long_barras || 0,
      metros_perforados: item.metros_perforados || 0
    }));

    // Calcular totales
    const totalTalProd = this.displayedData.reduce((sum, item) => sum + item.tal_prod, 0);
    const totalTalRim = this.displayedData.reduce((sum, item) => sum + item.tal_rim, 0);
    const totalTalRepaso = this.displayedData.reduce((sum, item) => sum + item.tal_repaso, 0);
    const totalTalAlivio = this.displayedData.reduce((sum, item) => sum + item.tal_alivio, 0);
    const totalPies = this.displayedData.reduce((sum, item) => sum + item.pies, 0);
    const totalMetros = this.displayedData.reduce((sum, item) => sum + item.metros_perforados, 0);

    this.totales = {
      tal_prod: totalTalProd,
      tal_rim: totalTalRim,
      tal_repaso: totalTalRepaso,
      tal_alivio: totalTalAlivio,
      pies: this.displayedData.length > 0 ? totalPies / this.displayedData.length : 0,
      metros_perforados: totalMetros
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

  formatear1Decimal(valor: number): string {
    if (isNaN(valor)) return '0.0';
    return valor.toFixed(1);
  }
}