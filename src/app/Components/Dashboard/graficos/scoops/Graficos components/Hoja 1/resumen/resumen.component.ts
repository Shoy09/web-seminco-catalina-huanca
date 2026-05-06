import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resumen.component.html',
  styleUrl: './resumen.component.css'
})
export class ResumenComponent implements OnChanges {

  @Input() data: any;

  resumenData = {
    conteoEquipos: 0,
    totalCucharas: 0,
    viajesPorEquipo: 0,
    N_labores_limpiadas: 0
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {

      this.resumenData = {
        conteoEquipos: this.data.SC_Conteo_Equipos || 0,
        totalCucharas: this.data.totalCucharas || 0,
        viajesPorEquipo: this.data.ViajesPorEquipo || 0,
        N_labores_limpiadas: this.data.N_labores_limpiadas || 0
      };

      //console.log('📥 Datos recibidos en resumen:', this.resumenData);
    }
  }
}