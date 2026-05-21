import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mttr-ano',
  imports: [CommonModule],
  templateUrl: './mttr-ano.component.html',
  styleUrl: './mttr-ano.component.css'
})
export class MttrAnoComponent implements OnInit {

  // Datos para mtte del año
  tarjetas = [
    {
      titulo: 'mtte - Año',
      valor: '312.5',
      unidad: 'horas',
      porcentaje: 65,  // La barra sale a la mitad (65% del objetivo)
      maxObjetivo: 480,  // Objetivo anual en horas
      color: '#3498db'
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  // Método para generar texto dinámico en los tooltips
  getTooltipText(item: any): string {
    return `${item.titulo}: ${item.valor} ${item.unidad} | ${item.porcentaje}% del objetivo anual (${item.maxObjetivo} ${item.unidad})`;
  }
}