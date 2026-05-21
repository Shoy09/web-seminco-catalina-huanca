import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mttr-equipo',
  imports: [CommonModule],
  templateUrl: './mttr-equipo.component.html',
  styleUrl: './mttr-equipo.component.css'
})
export class MttrEquipoComponent {

  // Datos de equipos con mtte (Mean Time Between Failures - Tiempo Medio Entre Fallas)
  readonly datosmtte = [
    { equipo: 'ST22', mtte: 245.5 },
    { equipo: 'ST23', mtte: 189.3 },
    { equipo: 'ST24', mtte: 312.8 },
    { equipo: 'ST25', mtte: 156.2 },
    { equipo: 'ST26', mtte: 278.4 },
    { equipo: 'ST27', mtte: 198.7 },
    { equipo: 'ST28', mtte: 334.1 },
    { equipo: 'ST29', mtte: 167.9 },
    { equipo: 'ST30', mtte: 223.6 },
    { equipo: 'ST31', mtte: 145.3 }
  ];

  displayedData: any[] = [];
  paginatedData: any[] = [];
  
  // Paginación
  currentPage: number = 1;
  rowsPerPage: number = 5;
  totalPages: number = 1;
  pageNumbers: number[] = [];

  ngOnInit(): void {
    // Ordenar datos por mtte de mayor a menor
    this.displayedData = [...this.datosmtte].sort((a, b) => b.mtte - a.mtte);
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

  get totalmtte(): number {
    return this.displayedData.reduce((sum, item) => sum + item.mtte, 0);
  }

  get averagemtte(): number {
    return this.totalmtte / this.displayedData.length;
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