import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { colorPorMTTR } from '../../../../../../../../shared/chart-theme';

@Component({
  selector: 'app-mttr-ano',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mttr-ano.component.html',
  styleUrl: './mttr-ano.component.css'
})
export class MttrAnoComponent implements OnInit, OnChanges {

  @Input() data: any[] = [];

  // Para MTTR, este objetivo representa el máximo aceptable.
  // Ejemplo: 12 hrs como objetivo de reparación.
  @Input() objetivoMttr: number = 12;

  tarjetas: any[] = [];

  ngOnInit(): void {
    this.procesarDatos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['objetivoMttr']) {
      this.procesarDatos();
    }
  }

  procesarDatos(): void {
    if (!this.data || this.data.length === 0) {
      this.tarjetas = [];
      return;
    }

    this.tarjetas = this.data.map((item) => {
      const mttr = Number(item.mttr || 0);
      const mtbf = Number(item.mtbf || 0);

      const horasTotales = Number(item.horasTotales || 0);
      const horasMttoCorrectivo = Number(item.horasMttoCorrectivo || 0);
      const horasSinMttoCorrectivo = Number(item.horasSinMttoCorrectivo || 0);

      const fallas = Number(item.fallas || 0);
      const cantidadRegistros = Number(item.cantidadRegistros || 0);
      const cantidadRegistrosMttoCorrectivo = Number(
        item.cantidadRegistrosMttoCorrectivo || 0
      );

      const anio = item.anio || item.periodo || item.key || 'Año';

      // Para el gauge:
      // 0 hrs = 0%
      // objetivoMttr hrs = 100%
      // Si supera el objetivo, se queda en 100%.
      let porcentaje = this.objetivoMttr > 0
        ? (mttr / this.objetivoMttr) * 100
        : 0;

      porcentaje = Math.min(Math.max(porcentaje, 0), 100);

      return {
        titulo: `MTTR - ${anio}`,
        valor: mttr.toFixed(2),
        unidad: 'hrs',
        porcentaje: Math.round(porcentaje),
        color: colorPorMTTR(mttr),

        anio,
        periodo: item.periodo,
        key: item.key,

        mttr,
        mtbf,
        horasTotales,
        horasMttoCorrectivo,
        horasSinMttoCorrectivo,
        fallas,
        cantidadRegistros,
        cantidadRegistrosMttoCorrectivo,
      };
    });

    this.tarjetas.sort((a, b) =>
      String(a.key || a.anio).localeCompare(String(b.key || b.anio))
    );
  }

  getTooltipText(item: any): string {
    return `
      ${item.titulo}: ${item.valor} ${item.unidad}
      | Objetivo: ${this.objetivoMttr} hrs
      | Fallas: ${item.fallas}
      | MTBF: ${item.mtbf.toFixed(2)} h
      | Hrs Totales: ${item.horasTotales.toFixed(2)} h
      | Hrs Mtto Correctivo: ${item.horasMttoCorrectivo.toFixed(2)} h
      | Registros: ${item.cantidadRegistros}
    `;
  }
}