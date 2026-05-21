import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mtbf-equipo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mtbf-equipo.component.html',
  styleUrl: './mtbf-equipo.component.css'
})
export class MtbfEquipoComponent implements OnInit {

  // Datos de equipos con MTBF (Mean Time Between Failures - Tiempo Medio Entre Fallas)
  readonly datosMTBF = [
    { equipo: 'ST22', mtbf: 245.5 },
    { equipo: 'ST23', mtbf: 189.3 },
    { equipo: 'ST24', mtbf: 312.8 },
    { equipo: 'ST25', mtbf: 156.2 },
    { equipo: 'ST26', mtbf: 278.4 },
    { equipo: 'ST27', mtbf: 198.7 },
    { equipo: 'ST28', mtbf: 334.1 },
    { equipo: 'ST29', mtbf: 167.9 },
    { equipo: 'ST30', mtbf: 223.6 },
    { equipo: 'ST31', mtbf: 145.3 }
  ];

  displayedData: any[] = [];
  paginatedData: any[] = [];
  
  // Paginación
  currentPage: number = 1;
  rowsPerPage: number = 5;
  totalPages: number = 1;
  pageNumbers: number[] = [];

  ngOnInit(): void {
    // Ordenar datos por MTBF de mayor a menor
    this.displayedData = [...this.datosMTBF].sort((a, b) => b.mtbf - a.mtbf);
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
    return this.displayedData.reduce((sum, item) => sum + item.mtbf, 0);
  }

  get averageMTBF(): number {
    return this.totalMTBF / this.displayedData.length;
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