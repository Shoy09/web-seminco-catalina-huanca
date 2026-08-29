import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-kpi-largo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-largo.component.html',
  styleUrl: './kpi-largo.component.css',
})
export class KpiLargoComponent implements OnChanges {
  // Rendimiento general (todos los equipos, REMOVEFILTERS FECHA)
  @Input() rendimientoAll: number = 0;

  // Total metros perforados del período
  @Input() totalMetros: number = 0;

  // Promedio metros x día (YTD)
  @Input() promedioMetrosDia: number = 0;

  // Promedio horas operativas x día
  @Input() promedioHrsOperativas: number = 0;

  // Unidades para mostrar
  rendimientoFmt: string = '0.00';
  totalMetrosFmt: string = '0';
  promedioMetrosFmt: string = '0.00';
  promedioHrsFmt: string = '0.00';

  ngOnChanges(changes: SimpleChanges): void {
    this.rendimientoFmt    = Number(this.rendimientoAll || 0).toFixed(2);
    this.totalMetrosFmt    = Number(this.totalMetros || 0).toFixed(2);
    this.promedioMetrosFmt = Number(this.promedioMetrosDia || 0).toFixed(2);
    this.promedioHrsFmt    = Number(this.promedioHrsOperativas || 0).toFixed(2);
  }
}
