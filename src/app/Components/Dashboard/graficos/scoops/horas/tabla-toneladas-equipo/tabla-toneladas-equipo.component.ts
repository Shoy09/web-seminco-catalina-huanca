import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { obtenerRangosHoraPorTurno } from '../../../../../../utils/fecha-utils';

@Component({
  selector: 'app-tabla-toneladas-equipo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-toneladas-equipo.component.html',
  styleUrl: './tabla-toneladas-equipo.component.css',
})
export class TablaToneladasEquipoComponent implements OnChanges {
  @Input() data: any[] = [];
  @Input() turno: string = '';

  // Configurable para reutilizar
  @Input() titulo: string = '🚜 TONELADAS POR LABOR Y RANGO DE HORA';
  @Input() unidad: string = 't';

  // TOTAL = usa rangoData.total
  // MINERAL = usa solo rangoData.MINERAL
  // DESMONTE = usa solo rangoData.DESMONTE, etc.
  @Input() materialFiltro: string = 'TOTAL';

  @Input() mostrarCucharas: boolean = true;

  rangosHora: string[] = [];
  laborInicios: string[] = [];

  matrizToneladas: { [rango: string]: { [labor: string]: number } } = {};
  matrizDetalles: { [rango: string]: { [labor: string]: any } } = {};

  totalesPorLabor: { [labor: string]: number } = {};
  totalesPorRango: { [rango: string]: number } = {};

  granTotal: number = 0;
  totalCucharas: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['data'] ||
      changes['turno'] ||
      changes['materialFiltro']
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

    this.laborInicios = Array.from(
      new Set(
        this.data.map((item) =>
          String(item.labor || 'SIN LABOR').trim() || 'SIN LABOR'
        )
      )
    ).sort((a, b) => a.localeCompare(b));

    this.matrizToneladas = {};
    this.matrizDetalles = {};
    this.totalesPorLabor = {};
    this.totalesPorRango = {};
    this.granTotal = 0;
    this.totalCucharas = 0;

    this.laborInicios.forEach((labor) => {
      this.totalesPorLabor[labor] = 0;
    });

    this.rangosHora.forEach((rango) => {
      this.matrizToneladas[rango] = {};
      this.matrizDetalles[rango] = {};
      this.totalesPorRango[rango] = 0;

      this.laborInicios.forEach((labor) => {
        this.matrizToneladas[rango][labor] = 0;
        this.matrizDetalles[rango][labor] = {
          total: 0,
          cucharas: 0,
          registros: 0,
          materiales: {},
          equipos: {},
          destinos: {},
        };
      });
    });

    this.data.forEach((laborData) => {
      const labor = String(laborData.labor || 'SIN LABOR').trim() || 'SIN LABOR';

      if (!Array.isArray(laborData.rangos)) return;

      laborData.rangos.forEach((rangoData: any) => {
        const rango = rangoData.rangoHora;

        if (!this.matrizToneladas[rango]) return;
        if (this.matrizToneladas[rango][labor] === undefined) return;

        const valor = this.obtenerValorRango(rangoData);

        this.matrizToneladas[rango][labor] += valor;
        this.totalesPorLabor[labor] += valor;
        this.totalesPorRango[rango] += valor;

        const detalle = this.matrizDetalles[rango][labor];

        detalle.total += valor;
        detalle.cucharas += Number(rangoData.totalCucharasDistribuidas || 0);
        detalle.registros += Number(rangoData.cantidadRegistros || 0);

        this.acumularObjeto(detalle.materiales, this.obtenerMateriales(rangoData));
        this.acumularObjeto(detalle.equipos, rangoData.equipos || {});
        this.acumularObjeto(detalle.destinos, rangoData.destinos || {});
      });
    });

    this.granTotal = Object.values(this.totalesPorLabor).reduce(
      (sum, val) => sum + Number(val || 0),
      0
    );

    this.totalCucharas = this.data.reduce((sum, laborData) => {
      if (!Array.isArray(laborData.rangos)) return sum;

      return (
        sum +
        laborData.rangos.reduce((acc: number, rango: any) => {
          return acc + Number(rango.totalCucharasDistribuidas || 0);
        }, 0)
      );
    }, 0);

    this.redondearValores();
  }

  private obtenerValorRango(rangoData: any): number {
    const filtro = String(this.materialFiltro || 'TOTAL')
      .trim()
      .toUpperCase();

    if (filtro === 'TOTAL') {
      return Number(rangoData.total || 0);
    }

    return Number(
      rangoData[filtro] ??
      rangoData[filtro.toLowerCase()] ??
      0
    );
  }

  private obtenerMateriales(rangoData: any): { [key: string]: number } {
    if (rangoData.materiales && typeof rangoData.materiales === 'object') {
      return rangoData.materiales;
    }

    const materiales: { [key: string]: number } = {};

    ['MINERAL', 'DESMONTE', 'RELLENO', 'RELAVE', 'OTROS'].forEach((mat) => {
      const valor = Number(
        rangoData[mat] ??
        rangoData[mat.toLowerCase()] ??
        0
      );

      if (valor > 0) {
        materiales[mat] = valor;
      }
    });

    return materiales;
  }

  private acumularObjeto(destino: any, fuente: any): void {
    if (!fuente || typeof fuente !== 'object') return;

    Object.keys(fuente).forEach((key) => {
      if (!destino[key]) {
        destino[key] = 0;
      }

      destino[key] += Number(fuente[key] || 0);
    });
  }


  limpiarTabla(): void {
    this.rangosHora = [];
    this.laborInicios = [];
    this.matrizToneladas = {};
    this.matrizDetalles = {};
    this.totalesPorLabor = {};
    this.totalesPorRango = {};
    this.granTotal = 0;
    this.totalCucharas = 0;
  }

  redondearValores(): void {
    Object.keys(this.totalesPorLabor).forEach((labor) => {
      this.totalesPorLabor[labor] = Number(
        this.totalesPorLabor[labor].toFixed(2)
      );
    });

    Object.keys(this.totalesPorRango).forEach((rango) => {
      this.totalesPorRango[rango] = Number(
        this.totalesPorRango[rango].toFixed(2)
      );
    });

    this.rangosHora.forEach((rango) => {
      this.laborInicios.forEach((labor) => {
        this.matrizToneladas[rango][labor] = Number(
          this.matrizToneladas[rango][labor].toFixed(2)
        );
      });
    });

    this.granTotal = Number(this.granTotal.toFixed(2));
    this.totalCucharas = Number(this.totalCucharas.toFixed(2));
  }

  getColorPorValor(valor: number): string {
    if (!valor || valor <= 0) return '';

    if (valor >= 500) return 'bg-green-strong';
    if (valor >= 300) return 'bg-green-medium';
    if (valor >= 150) return 'bg-green-soft';
    if (valor >= 50) return 'bg-green-light';

    return 'bg-green-min';
  }

  formatNumber(valor: number): string {
    if (!valor || valor === 0) return '-';
    return `${Number(valor).toFixed(1)} ${this.unidad}`;
  }

  getTooltipCelda(rango: string, labor: string): string {
    const detalle = this.matrizDetalles?.[rango]?.[labor];

    if (!detalle || !detalle.total) {
      return 'Sin producción';
    }

    return `
Labor: ${labor}
Rango: ${rango}
Total: ${detalle.total.toFixed(2)} ${this.unidad}
Cucharas: ${detalle.cucharas.toFixed(2)}
Registros: ${detalle.registros}

Materiales:
${this.formatearObjeto(detalle.materiales)}

Equipos:
${this.formatearObjeto(detalle.equipos)}

Destinos:
${this.formatearObjeto(detalle.destinos)}
    `.trim();
  }

  private formatearObjeto(obj: any): string {
    if (!obj || Object.keys(obj).length === 0) return 'Sin detalle';

    return Object.entries(obj)
      .map(([key, value]) => `${key}: ${Number(value).toFixed(2)} ${this.unidad}`)
      .join('\n');
  }
}