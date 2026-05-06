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
    totalMetros: 0,
    totalLaboresSostenidas: 0,
    nPernoDia: 0
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {

      this.resumenData = {
        conteoEquipos: this.data.conteoEquipos || 0,
        totalMetros: this.data.totalMetros || 0,
        totalLaboresSostenidas: this.data.totalLaboresSostenidas || 0,
        nPernoDia: this.data.nPernoDia || 0
      };

      //console.log('📥 Datos recibidos en resumen:', this.resumenData);
    }
  }
}