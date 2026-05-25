import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-mttr-ano',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mttr-ano.component.html',
  styleUrl: './mttr-ano.component.css'
})
export class MttrAnoComponent implements OnInit, OnChanges {

  @Input() data: any[] = [];

  tarjetas: any[] = [];

  constructor() {}

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
      this.tarjetas = [];
      return;
    }

    // Procesar cada año y crear una tarjeta
    this.tarjetas = this.data.map(item => {
      const mttr = item.mttr || 0;
      
      // Determinar color según el MTTR (menor es mejor)
      let color = '#2ecc71'; // Verde - Bueno (MTTR bajo)
      if (mttr > 48) {
        color = '#e74c3c'; // Rojo - Malo (MTTR alto)
      } else if (mttr > 24) {
        color = '#f39c12'; // Naranja - Regular
      } else if (mttr > 12) {
        color = '#3498db'; // Azul - Aceptable
      } else if (mttr === 0) {
        color = '#2ecc71'; // Verde - Sin fallas
      }
      
      // Formatear el título
      const titulo = `MTTR - ${item.año || 'Año'}`;
      
      return {
        titulo: titulo,
        valor: mttr.toFixed(1),
        unidad: 'hrs',
        color: color,
        año: item.año,
        cantidadEquipos: item.cantidadEquipos || 0,
        cantidadFallas: item.cantidadFallas || 0,
        cantidadOperaciones: item.cantidadOperaciones || 0,
        horasMtto: item.horasMtto || 0
      };
    });

    // Ordenar por año de forma ascendente
    this.tarjetas.sort((a, b) => (a.año || 0) - (b.año || 0));
  }

  // Método para generar texto dinámico en los tooltips
  getTooltipText(item: any): string {
    return `${item.titulo}: ${item.valor} ${item.unidad} | Equipos: ${item.cantidadEquipos} | Fallas: ${item.cantidadFallas} | Operaciones: ${item.cantidadOperaciones} | Horas Mtto: ${item.horasMtto}`;
  }
}