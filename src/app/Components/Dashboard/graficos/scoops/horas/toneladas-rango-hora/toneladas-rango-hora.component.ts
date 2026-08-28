import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';

import * as echarts from 'echarts/core';

import { BarChart, LineChart } from 'echarts/charts';

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent,
  LegendComponent,
  DataZoomComponent,
} from 'echarts/components';

import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer,
]);

import { exportarImagenChart, PdfExportOptions } from 'src/app/config/config-pdf';

@Component({
  selector: 'app-toneladas-rango-hora',
  standalone: true,
  imports: [NgxEchartsDirective, CommonModule],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './toneladas-rango-hora.component.html',
  styleUrl: './toneladas-rango-hora.component.css',
})
export class ToneladasRangoHoraComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() turno: string = '';

  @Input() titulo: string = 'TONELADAS POR RANGO DE HORA';

  chartOptions: any = {};

  materiales: string[] = [];
  materialesFiltrados: string[] = [];

  totalesMateriales: { [material: string]: number } = {};
  totalGeneral: number = 0;
  totalCucharas: number = 0;
  totalesPorEquipo: { [equipo: string]: number } = {};
  equiposFiltrados: string[] = [];

  private readonly materialesBase = [
    'MINERAL',
    'DESMONTE',
    'RELLENO',
    'RELAVE',
    'OTROS',
  ];

  private readonly keysExcluidas = [
    'rangoHora',
    'total',
    'cantidadRegistros',
    'totalCucharasDistribuidas',
    'equipos',
    'labores',
    'materiales',
    'destinos',
  ];

  private readonly rangosPorTurno: { [key: string]: string[] } = {
    DÍA: [
      '06:00 - 07:00',
      '07:00 - 08:00',
      '08:00 - 09:00',
      '09:00 - 10:00',
      '10:00 - 11:00',
      '11:00 - 12:00',
      '12:00 - 13:00',
      '13:00 - 14:00',
      '14:00 - 15:00',
      '15:00 - 16:00',
      '16:00 - 17:00',
      '17:00 - 18:00',
    ],
    NOCHE: [
      '18:00 - 19:00',
      '19:00 - 20:00',
      '20:00 - 21:00',
      '21:00 - 22:00',
      '22:00 - 23:00',
      '23:00 - 00:00',
      '00:00 - 01:00',
      '01:00 - 02:00',
      '02:00 - 03:00',
      '03:00 - 04:00',
      '04:00 - 05:00',
      '05:00 - 06:00',
    ],
    '': [
      '06:00 - 07:00',
      '07:00 - 08:00',
      '08:00 - 09:00',
      '09:00 - 10:00',
      '10:00 - 11:00',
      '11:00 - 12:00',
      '12:00 - 13:00',
      '13:00 - 14:00',
      '14:00 - 15:00',
      '15:00 - 16:00',
      '16:00 - 17:00',
      '17:00 - 18:00',
      '18:00 - 19:00',
      '19:00 - 20:00',
      '20:00 - 21:00',
      '21:00 - 22:00',
      '22:00 - 23:00',
      '23:00 - 00:00',
      '00:00 - 01:00',
      '01:00 - 02:00',
      '02:00 - 03:00',
      '03:00 - 04:00',
      '04:00 - 05:00',
      '05:00 - 06:00',
    ],
  };

  private readonly coloresMateriales: { [material: string]: string } = {
    MINERAL: '#00A064',
    DESMONTE: '#40B88B',
    RELLENO: '#80D0B2',
    RELAVE: '#BFE7D8',
    OTROS: '#145A52',
  };

  ngOnInit(): void {
    this.procesarDatos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['turno'] || changes['materialFiltro']) {
      this.procesarDatos();
    }
  }

  procesarDatos(): void {
    const rangosCompletos =
      this.rangosPorTurno[this.turno] || this.rangosPorTurno[''];

    if (!this.data || this.data.length === 0) {
      this.materiales = [...this.materialesBase];
      this.materialesFiltrados = [];
      this.totalesMateriales = {};
      this.totalesPorEquipo = {};
      this.equiposFiltrados = [];
      this.totalGeneral = 0;
      this.totalCucharas = 0;

      this.actualizarGraficoConRangosCompletos(rangosCompletos, []);
      return;
    }
    this.extraerMateriales();
    this.calcularTotalesMateriales();
    this.calcularTotalesPorEquipo();

    this.actualizarGraficoConRangosCompletos(rangosCompletos, this.data);
  }

  private extraerMateriales(): void {
    const materialesSet = new Set<string>();

    this.materialesBase.forEach((material) => {
      materialesSet.add(material);
    });

    this.data.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (this.keysExcluidas.includes(key)) return;

        const valor = Number(item[key] || 0);

        if (!isNaN(valor)) {
          materialesSet.add(key.toUpperCase());
        }
      });
    });

    this.materiales = Array.from(materialesSet);

    this.materialesFiltrados = this.materiales.filter((material) => {
      const total = this.data.reduce((sum, item) => {
        return sum + this.obtenerValorMaterial(item, material);
      }, 0);

      return total > 0;
    });
  }

  private calcularTotalesMateriales(): void {
    this.totalesMateriales = {};
    this.totalGeneral = 0;
    this.totalCucharas = 0;

    this.materiales.forEach((material) => {
      const total = this.data.reduce((sum, item) => {
        return sum + this.obtenerValorMaterial(item, material);
      }, 0);

      this.totalesMateriales[material] = Number(total.toFixed(2));
      this.totalGeneral += total;
    });

    this.totalCucharas = this.data.reduce((sum, item) => {
      return sum + Number(item.totalCucharasDistribuidas || 0);
    }, 0);

    this.totalGeneral = Number(this.totalGeneral.toFixed(2));
    this.totalCucharas = Number(this.totalCucharas.toFixed(2));
  }
  private calcularTotalesPorEquipo(): void {
    this.totalesPorEquipo = {};
    this.equiposFiltrados = [];

    if (!this.data || this.data.length === 0) return;

    this.data.forEach((item) => {
      const equipos = item.equipos || {};

      Object.keys(equipos).forEach((equipo) => {
        if (!this.totalesPorEquipo[equipo]) {
          this.totalesPorEquipo[equipo] = 0;
        }

        this.totalesPorEquipo[equipo] += Number(equipos[equipo].total || 0);
      });
    });

    Object.keys(this.totalesPorEquipo).forEach((equipo) => {
      this.totalesPorEquipo[equipo] = Number(
        this.totalesPorEquipo[equipo].toFixed(2),
      );
    });

    this.equiposFiltrados = Object.keys(this.totalesPorEquipo)
      .filter((equipo) => this.totalesPorEquipo[equipo] > 0)
      .sort((a, b) => this.totalesPorEquipo[b] - this.totalesPorEquipo[a]);
  }

  obtenerTooltipEquipo(equipo: string): string {
    const resumenLabores: { [labor: string]: number } = {};
    const resumenMateriales: { [material: string]: number } = {};

    this.data.forEach((item) => {
      const equipoData = item.equipos?.[equipo];

      if (!equipoData) return;

      const labores = equipoData.labores || {};
      const materiales = equipoData.materiales || {};

      Object.keys(labores).forEach((labor) => {
        if (!resumenLabores[labor]) {
          resumenLabores[labor] = 0;
        }

        resumenLabores[labor] += Number(labores[labor] || 0);
      });

      Object.keys(materiales).forEach((material) => {
        if (!resumenMateriales[material]) {
          resumenMateriales[material] = 0;
        }

        resumenMateriales[material] += Number(materiales[material] || 0);
      });
    });

    const textoLabores = Object.entries(resumenLabores)
      .map(([labor, total]) => `${labor}: ${total.toFixed(2)} t`)
      .join('\n');

    const textoMateriales = Object.entries(resumenMateriales)
      .map(([material, total]) => `${material}: ${total.toFixed(2)} t`)
      .join('\n');

    return `
Equipo: ${equipo}

Por material:
${textoMateriales || 'Sin material'}

Por labor:
${textoLabores || 'Sin labor'}
  `;
  }

  private obtenerValorMaterial(item: any, material: string): number {
    const keyMayus = material.toUpperCase();
    const keyMinus = material.toLowerCase();

    return Number(item[keyMayus] ?? item[keyMinus] ?? 0);
  }

  actualizarGraficoConRangosCompletos(
    rangosCompletos: string[],
    datosOriginales: any[],
  ): void {
    const datosPorRango = new Map<string, any>();

    datosOriginales.forEach((item) => {
      datosPorRango.set(item.rangoHora, item);
    });

    const rangos: string[] = [];
    const seriesData: { [material: string]: number[] } = {};

    this.materialesFiltrados.forEach((material) => {
      seriesData[material] = [];
    });

    const totales: number[] = [];
    const cucharas: number[] = [];

    rangosCompletos.forEach((rango) => {
      rangos.push(rango);

      const item = datosPorRango.get(rango);

      this.materialesFiltrados.forEach((material) => {
        const valor = item ? this.obtenerValorMaterial(item, material) : 0;
        seriesData[material].push(Number(valor || 0));
      });

      totales.push(Number(item?.total || 0));
      cucharas.push(Number(item?.totalCucharasDistribuidas || 0));
    });

    const acumulativo: number[] = [];
    let sumaAcumulada = 0;

    for (let i = 0; i < totales.length; i++) {
      sumaAcumulada += Number(totales[i] || 0);
      acumulativo.push(Number(sumaAcumulada.toFixed(2)));
    }

    const maxTotal = Math.max(...totales, 0);
    const maxAcumulado = Math.max(...acumulativo, 0);
    const maxToneladas = Math.max(maxTotal, maxAcumulado);

    const escalaMaxToneladas =
      maxToneladas > 0 ? Math.ceil(maxToneladas / 100) * 100 : 100;

    const maxCucharas = Math.max(...cucharas, 0);

    const escalaMaxCucharas =
      maxCucharas > 0 ? Math.ceil(maxCucharas / 5) * 5 : 5;

    //const mostrarLineaCucharas = cucharas.some((valor) => valor > 0);

    const porcentajeVisible =
      rangos.length > 12 ? (12 / rangos.length) * 100 : 100;

    const series: any[] = [];

    this.materialesFiltrados.forEach((material, index) => {
      series.push({
        name: material,
        type: 'bar',
        stack: 'total',
        barWidth: '58%',
        data: seriesData[material],
        itemStyle: {
          color:
            this.coloresMateriales[material] ||
            this.obtenerColorFallback(index),
          borderRadius: [0, 0, 0, 0],
        },
        label: {
          show: false,
        },
        emphasis: {
          focus: 'series',
        },
        z: 2,
      });
    });

    series.push({
      type: 'bar',
      yAxisIndex: 0,
      data: totales,

      // 🔥 Se superpone sobre las barras apiladas
      barWidth: '58%',
      barGap: '-100%',

      // 🔥 Barra invisible
      itemStyle: {
        color: 'rgba(0, 0, 0, 0)',
      },

      // 🔥 No aparece en tooltip ni interacción
      silent: true,
      tooltip: {
        show: false,
      },

      label: {
        show: true,
        position: 'top',
        formatter: (params: any) => {
          const value = Number(params.value || 0);
          return value > 0 ? `${value.toFixed(1)} t` : '';
        },
        fontSize: 11,
        fontWeight: 'bold',
        color: '#333',
        backgroundColor: 'rgba(255,255,255,0.85)',
        padding: [2, 6, 2, 6],
        borderRadius: 4,
      },

      z: 10,
    });

    series.push({
      type: 'line',
      yAxisIndex: 0,
      data: acumulativo,
      symbol: 'circle',
      symbolSize: 6,
      smooth: true,
      lineStyle: {
        color: '#145A52',
        width: 3,
      },
      itemStyle: {
        color: '#145A52',
        borderColor: '#ffffff',
        borderWidth: 2,
      },
      label: {
        show: false,
      },
      emphasis: {
        focus: 'series',
        scale: true,
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => {
            return `${Number(params.value || 0).toFixed(0)} t`;
          },
          fontSize: 10,
          fontWeight: 'bold',
          color: '#145A52',
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: [2, 6, 2, 6],
          borderRadius: 4,
        },
      },
      z: 1,
    });

    /* if (mostrarLineaCucharas) {
      series.push({
        type: 'line',
        yAxisIndex: 1,
        data: cucharas,
        symbol: 'diamond',
        symbolSize: 7,
        smooth: false,
        lineStyle: {
          color: '#FF9132',
          width: 3,
          type: 'dashed',
        },
        itemStyle: {
          color: '#FF9132',
          borderColor: '#ffffff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          focus: 'series',
          scale: true,
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => {
              return `${Number(params.value || 0).toFixed(1)} cuch.`;
            },
            fontSize: 10,
            fontWeight: 'bold',
            color: '#FF9132',
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: [2, 6, 2, 6],
            borderRadius: 4,
          },
        },
        z: 3,
      });
    } */

    this.chartOptions = {

      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const index = params[0].dataIndex;
          const rango = rangos[index];

          const total = Number(totales[index] || 0);
          const acumulado = Number(acumulativo[index] || 0);
          const totalCucharas = Number(cucharas[index] || 0);

          if (total === 0 && acumulado === 0 && totalCucharas === 0) {
            return `
              <strong>📊 ${rango}</strong><br/>
              <hr style="margin: 5px 0;"/>
              <strong>Sin producción</strong>
            `;
          }

          let tooltipText = `
            <strong>📊 ${rango}</strong><br/>
            <hr style="margin: 5px 0;"/>
            Total hora: <b>${total.toFixed(2)} t</b><br/>
            Acumulado: <b>${acumulado.toFixed(2)} t</b><br/>
          `;

          /* if (mostrarLineaCucharas) {
            tooltipText += `Cucharas: <b>${totalCucharas.toFixed(2)}</b><br/>`;
          } */

          tooltipText += `<br/>`;

          params.forEach((param: any) => {
            const value = Number(param.value || 0);

            if (value <= 0) return;

            if (param.seriesName === 'ACUMULADO') {
              return;
            }

            if (param.seriesName === 'CUCHARAS') {
              tooltipText += `
                ${param.marker}
                <strong>${param.seriesName}:</strong>
                ${value.toFixed(2)} cuch.<br/>
              `;
              return;
            }

            const porcentaje =
              total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

            tooltipText += `
              ${param.marker}
              <strong>${param.seriesName}:</strong>
              ${value.toFixed(2)} t (${porcentaje}%)<br/>
            `;
          });

          return tooltipText;
        },
      },

      legend: {
        data: [...this.materialesFiltrados, 'ACUMULADO'],
        top: 42,
        left: 'center',
        type: 'scroll',
        itemWidth: 25,
        itemHeight: 14,
        textStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
      },

      grid: {
        left: '8%',
        right: '5%',
        top: '20%',
        bottom: rangos.length > 12 ? '18%' : '10%',
        containLabel: true,
      },

      xAxis: {
        type: 'category',
        data: rangos,
        axisLabel: {
          fontSize: 10,
          fontWeight: 'normal',
          color: '#2c3e50',
          fontFamily: 'Arial',
          rotate: 0,
          interval: 0,
          margin: 10,
        },
        axisLine: {
          lineStyle: {
            color: '#666',
          },
        },
        axisTick: {
          show: false,
        },
      },

      yAxis: [
        {
          type: 'value',
          min: 0,
          max: escalaMaxToneladas,
          axisLabel: {
            fontSize: 10,
            formatter: '{value} t',
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#ccc',
            },
          },
        },
        /* {
          type: 'value',
          min: 0,
          max: escalaMaxCucharas,
          show: mostrarLineaCucharas,
          axisLabel: {
            fontSize: 10,
            formatter: '{value}',
          },
          splitLine: {
            show: false,
          },
        }, */
      ],

      /* dataZoom: [
        {
          type: 'slider',
          show: rangos.length > 12,
          xAxisIndex: 0,
          start: 0,
          end: porcentajeVisible,
          height: 18,
          bottom: 20,
        },
        {
          type: 'inside',
          xAxisIndex: 0,
          start: 0,
          end: porcentajeVisible,
        },
      ], */

      series,
    };
  }

  private obtenerColorFallback(index: number): string {
    const colores = [
      '#00A064',
      '#40B88B',
      '#80D0B2',
      '#BFE7D8',
      '#145A52',
      '#78C67B',
    ];

    return colores[index % colores.length];
  }

  private chartInstance: any;
  onChartInit(ec: any): void { this.chartInstance = ec; }
  getChartImage(options?: PdfExportOptions): string | null {
    return exportarImagenChart(this.chartInstance, options);
  }
}
