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

  @Input() data: any; // 🔥 viene del padre

  resumenData = {
    equiposFrontoneros: 0,
    metrosPerforadosDisparo: 0,
    totalDisparosDia: 0,
    totalPerforado: 0
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {

      this.resumenData = {
        equiposFrontoneros: this.data.conteoEquipos || 0,
        metrosPerforadosDisparo: this.data.metrosPorDisparo || 0,
        totalDisparosDia: this.data.nDisparosTL || 0,
        totalPerforado: this.data.totalMetros || 0
      };
    }
  }
}