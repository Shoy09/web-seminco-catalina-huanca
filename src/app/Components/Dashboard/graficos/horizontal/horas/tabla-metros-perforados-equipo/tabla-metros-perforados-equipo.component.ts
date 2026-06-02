import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { obtenerRangosHoraPorTurno } from '../../../../../../utils/fecha-utils';

@Component({
  selector: 'app-tabla-metros-perforados-equipo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-metros-perforados-equipo.component.html',
  styleUrl: './tabla-metros-perforados-equipo.component.css'
})
export class TablaMetrosPerforadosEquipoComponent implements OnChanges {

  @Input() data: any[] = [];
  @Input() turno: string = '';

  // NUEVO: configuración reutilizable
  @Input() unidad: string = 'm';
  @Input() titulo: string = '📏 PRODUCCIÓN POR LABOR Y RANGO DE HORA';
  @Input() labelTotalLabor: string = 'TOTAL x LABOR';
  @Input() labelTotalRango: string = 'Total x Hora';
  @Input() mensajeSinDatos: string = 'No hay datos disponibles para el turno seleccionado';

  rangosHora: string[] = [];
  labores: string[] = [];

  matrizValores: { [rango: string]: { [labor: string]: number } } = {};

  totalesPorLabor: { [labor: string]: number } = {};
  totalesPorRango: { [rango: string]: number } = {};
  granTotal: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['data'] ||
      changes['turno'] ||
      changes['unidad'] ||
      changes['titulo']
    ) {
      this.procesarDatos();
    }
  }

  procesarDatos(): void {
    if (!this.data || this.data.length === 0) {
      this.limpiarTabla();
      return;
    }

    this.rangosHora = obtenerRangosHoraPorTurno(this.turno);

    this.labores = this.data
      .map(item => item.labor || 'SIN LABOR')
      .sort();

    this.matrizValores = {};
    this.totalesPorLabor = {};
    this.totalesPorRango = {};
    this.granTotal = 0;

    this.labores.forEach(labor => {
      this.totalesPorLabor[labor] = 0;
    });

    this.rangosHora.forEach(rango => {
      this.matrizValores[rango] = {};
      this.totalesPorRango[rango] = 0;

      this.labores.forEach(labor => {
        this.matrizValores[rango][labor] = 0;
      });
    });

    this.data.forEach(laborData => {
      const labor = laborData.labor || 'SIN LABOR';

      if (!laborData.rangos || !Array.isArray(laborData.rangos)) return;

      laborData.rangos.forEach((rangoData: any) => {
        const rango = rangoData.rangoHora;
        const total = Number(rangoData.total || 0);

        if (
          this.matrizValores[rango] &&
          this.matrizValores[rango][labor] !== undefined
        ) {
          this.matrizValores[rango][labor] += total;
          this.totalesPorLabor[labor] += total;
          this.totalesPorRango[rango] += total;
        }
      });
    });

    this.granTotal = Object.values(this.totalesPorLabor)
      .reduce((sum, val) => sum + val, 0);

    this.redondearValores();
  }


  limpiarTabla(): void {
    this.rangosHora = [];
    this.labores = [];
    this.matrizValores = {};
    this.totalesPorLabor = {};
    this.totalesPorRango = {};
    this.granTotal = 0;
  }

  redondearValores(): void {
    Object.keys(this.totalesPorLabor).forEach(labor => {
      this.totalesPorLabor[labor] = Number(
        this.totalesPorLabor[labor].toFixed(2)
      );
    });

    Object.keys(this.totalesPorRango).forEach(rango => {
      this.totalesPorRango[rango] = Number(
        this.totalesPorRango[rango].toFixed(2)
      );
    });

    this.rangosHora.forEach(rango => {
      this.labores.forEach(labor => {
        if (this.matrizValores[rango] && this.matrizValores[rango][labor]) {
          this.matrizValores[rango][labor] = Number(
            this.matrizValores[rango][labor].toFixed(2)
          );
        }
      });
    });

    this.granTotal = Number(this.granTotal.toFixed(2));
  }

  getColorPorValor(valor: number): string {
    if (!valor || valor === 0) return '';

    if (valor > 300) return 'bg-green-strong';
    if (valor > 200) return 'bg-green-medium';
    if (valor > 100) return 'bg-green-soft';
    if (valor > 50) return 'bg-green-light';

    return 'bg-green-min';
  }

  formatNumber(valor: number): string {
    if (!valor || valor === 0) return '-';
    return `${valor.toFixed(1)} ${this.unidad}`;
  }

  getTotalPorLabor(labor: string): number {
    return this.totalesPorLabor[labor] || 0;
  }

  getTotalPorRango(rango: string): number {
    return this.totalesPorRango[rango] || 0;
  }
}