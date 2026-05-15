import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-rendimiento-general',
  standalone: true,
  imports: [NgFor],
  templateUrl: './rendimiento-general.component.html',
  styleUrls: ['./rendimiento-general.component.css']
})
export class RendimientoGeneralComponent implements OnInit {

  tarjetas = [
    {
      titulo: 'Rendimiento',
      valor: 111.96,
      tipo: 'principal'
    },
    {
      titulo: 'REND (t/h) - 10.9 yd',
      valor: 162,
      porcentaje: 82,
      color: '#0f6b61'
    },
    {
      titulo: 'REND (t/h) - 8.6 yd',
      valor: 137,
      porcentaje: 76,
      color: '#0f6b61'
    },
    {
      titulo: 'REND (t/h) - 6.2 yd',
      valor: 92,
      porcentaje: 68,
      color: '#0f6b61'
    },
    {
      titulo: 'REND (t/h) - 4.2 yd',
      valor: 50,
      porcentaje: 28,
      color: '#8a8a8a'
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  // Método para generar texto dinámico en los tooltips
  getTooltipText(item: any): string {
    return `${item.titulo}: ${item.valor} t/h | ${item.porcentaje}% del máximo`;
  }
}