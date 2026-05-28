import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CHART_TINTS, colorPorMTBF } from '../../../../../../../../shared/chart-theme';

@Component({
  selector: 'app-mtbf-ano',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mtbf-ano.component.html',
  styleUrl: './mtbf-ano.component.css'
})
export class MtbfAnoComponent implements OnInit, OnChanges {

  @Input() data: any[] = [];

  // Puedes cambiarlo desde el padre si deseas
  @Input() objetivoMtbf: number = 480;

  tarjetas: any[] = [];

  ngOnInit(): void {
    this.procesarDatos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['objetivoMtbf']) {
      this.procesarDatos();
    }
  }

  procesarDatos(): void {
    if (!this.data || this.data.length === 0) {
      this.tarjetas = [];
      return;
    }

    this.tarjetas = this.data.map((item) => {
      const mtbf = Number(item.mtbf || 0);
      const mttr = Number(item.mttr || 0);

      const horasTotales = Number(item.horasTotales || 0);
      const horasMttoCorrectivo = Number(item.horasMttoCorrectivo || 0);
      const horasSinMttoCorrectivo = Number(item.horasSinMttoCorrectivo || 0);

      const fallas = Number(item.fallas || 0);
      const cantidadRegistros = Number(item.cantidadRegistros || 0);
      const cantidadRegistrosMttoCorrectivo = Number(
        item.cantidadRegistrosMttoCorrectivo || 0
      );

      const anio = item.anio || item.periodo || item.key || 'Año';

      let porcentaje = this.objetivoMtbf > 0
        ? (mtbf / this.objetivoMtbf) * 100
        : 0;

      porcentaje = Math.min(Math.max(porcentaje, 0), 100);

      return {
        titulo: `MTBF - ${anio}`,
        valor: mtbf.toFixed(2),
        unidad: 'hrs',
        porcentaje: Math.round(porcentaje),
        color: colorPorMTBF(mtbf),

        anio,
        periodo: item.periodo,
        key: item.key,

        mtbf,
        mttr,
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
      (${item.porcentaje}% del objetivo)
      | Fallas: ${item.fallas}
      | MTTR: ${item.mttr.toFixed(2)} h
      | Hrs Totales: ${item.horasTotales.toFixed(2)} h
      | Hrs Mtto Correctivo: ${item.horasMttoCorrectivo.toFixed(2)} h
      | Registros: ${item.cantidadRegistros}
    `;
  }
}