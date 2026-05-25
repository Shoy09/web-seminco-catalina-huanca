import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-mtbf-ano',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mtbf-ano.component.html',
  styleUrl: './mtbf-ano.component.css'
})
export class MtbfAnoComponent implements OnInit, OnChanges {

  @Input() data: any[] = [];

  tarjetas: any[] = [];

  // Objetivo de MTBF (puedes ajustarlo según tus necesidades)
  objetivoMtbf: number = 480;

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
      const mtbf = item.mtbf || 0;
      
      // Calcular porcentaje respecto al objetivo
      let porcentaje = this.objetivoMtbf > 0 ? (mtbf / this.objetivoMtbf) * 100 : 0;
      porcentaje = Math.min(porcentaje, 100); // Limitar a 100%
      
      // Determinar color según el MTBF (mayor es mejor)
      let color = '#e74c3c'; // Rojo - Crítico (MTBF bajo)
      if (mtbf === 0) {
        color = '#95a5a6'; // Gris - Sin datos/Sin fallas
      } else if (mtbf >= 330) {
        color = '#2ecc71'; // Verde - Excelente
      } else if (mtbf >= 300) {
        color = '#3498db'; // Azul - Bueno
      } else if (mtbf >= 270) {
        color = '#f39c12'; // Naranja - Regular
      }
      
      // Formatear el título
      const titulo = `MTBF - ${item.año || 'Año'}`;
      
      return {
        titulo: titulo,
        valor: mtbf.toFixed(1),
        unidad: 'hrs',
        porcentaje: Math.round(porcentaje), // ← AGREGADO: necesario para la barra
        color: color,
        año: item.año,
        cantidadEquipos: item.cantidadEquipos || 0,
        cantidadFallas: item.cantidadFallas || 0,
        cantidadOperaciones: item.cantidadOperaciones || 0,
        horasOperacion: item.horasOperacion || 0,
        horasMtto: item.horasMtto || 0
      };
    });

    // Ordenar por año de forma ascendente
    this.tarjetas.sort((a, b) => (a.año || 0) - (b.año || 0));
  }

  // Método para generar texto dinámico en los tooltips
  getTooltipText(item: any): string {
    return `${item.titulo}: ${item.valor} ${item.unidad} (${item.porcentaje}% del objetivo) | Equipos: ${item.cantidadEquipos} | Fallas: ${item.cantidadFallas} | Operaciones: ${item.cantidadOperaciones} | Horas Operación: ${item.horasOperacion}`;
  }
}