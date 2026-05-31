import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';

import * as echarts from 'echarts/core';

import { BarChart } from 'echarts/charts';

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent,
  DataZoomComponent,
} from 'echarts/components';

import { CanvasRenderer } from 'echarts/renderers';
import {
  CHART_COLORS,
  colorPorDisponibilidad,
} from '../../../../../../../shared/chart-theme';

echarts.use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent,
  DataZoomComponent,
  CanvasRenderer,
]);

@Component({
  selector: 'app-disponibilidad-dia',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './disponibilidad-dia.component.html',
  styleUrl: './disponibilidad-dia.component.css',
})
export class DisponibilidadDiaComponent implements OnChanges {
  // 🔥 DATA DINÁMICA
  @Input() data: any[] = [];
  @Input() showZoom: boolean = false;

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showZoom'] || changes['data']) {
      this.actualizarGrafico();
    }
  }

  actualizarGrafico(): void {
    if (!this.data || this.data.length === 0) {
      this.chartOptions = {};
      return;
    }

    const datosOrdenados = [...this.data].sort((a, b) =>
      String(a.key).localeCompare(String(b.key)),
    );

    const xAxisLabels = datosOrdenados.map((item) => {
      const partes = String(item.key || '').split('-');

      const anio = partes[0];
      const mes = partes[1];
      const dia = partes[2];

      return {
        value: item.key,
        periodo: item.periodo,
        dia,
        mes,
        anio,
        nombreMes: this.obtenerNombreMes(Number(mes)),
      };
    });

    const valores = datosOrdenados.map((item) =>
      Number(item.disponibilidad || 0),
    );

    const graphics: any[] = [];

    const mesesPosiciones = new Map<string, any>();

    let mesActual = '';
    let inicio = 0;

    for (let i = 0; i < xAxisLabels.length; i++) {
      const item = xAxisLabels[i];

      if (item.nombreMes !== mesActual) {
        if (mesActual !== '') {
          mesesPosiciones.set(mesActual, {
            start: inicio,
            end: i - 1,
          });
        }

        mesActual = item.nombreMes;
        inicio = i;
      }
    }

    if (mesActual !== '') {
      mesesPosiciones.set(mesActual, {
        start: inicio,
        end: xAxisLabels.length - 1,
      });
    }

    mesesPosiciones.forEach((pos: any, mes: string) => {
      const centro = (pos.start + pos.end + 1) / 2;

      graphics.push({
        type: 'text',
        left: `${centro * (100 / xAxisLabels.length)}%`,
        bottom: 8,
        style: {
          text: mes,
          fill: '#333',
          fontSize: 12,
          fontWeight: 'bold',
          fontFamily: 'Arial',
        },
        z: 100,
      });
    });

    this.chartOptions = {
      title: {
        text: 'DISPONIBILIDAD POR DÍA',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: CHART_COLORS.grey,
          //fontFamily: 'Arial',
        },
      },

      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const data = params[0];
          const item = datosOrdenados[data.dataIndex];

          const disponibilidad = Number(item.disponibilidad || 0);
          const horasTotales = Number(item.horasTotales || 0);
          const horasMtto = Number(item.horasMtto || 0);
          const horasDisponibles = Number(item.horasDisponibles || 0);

          return `
          <strong>${item.periodo}</strong><br/>
          Disponibilidad: <b>${disponibilidad.toFixed(2)}%</b><br/>
          Horas totales: ${horasTotales.toFixed(2)} h<br/>
          Horas mantenimiento: ${horasMtto.toFixed(2)} h<br/>
          Horas disponibles: ${horasDisponibles.toFixed(2)} h<br/>
          Operaciones: ${item.cantidadOperaciones || 0}<br/>
          Registros: ${item.cantidadRegistros || 0}<br/>
          Registros MTTO: ${item.cantidadRegistrosMtto || 0}
        `;
        },
      },

      grid: {
        left: '8%',
        right: '5%',
        top: '22%',
        bottom: '25%',
        containLabel: true,
      },

      xAxis: {
        type: 'category',
        data: xAxisLabels.map((item) => item.value),

        axisLabel: {
          show: true,
          interval: 0,
          margin: 18,
          fontSize: 11,
          fontWeight: 'bold',
          color: '#333',
          formatter: (value: string) => {
            const partes = String(value).split('-');
            return partes[2] || value;
          },
        },

        axisLine: {
          lineStyle: {
            color: '#666',
          },
        },

        axisTick: {
          alignWithLabel: true,
        },
      },

      yAxis: {
        type: 'value',
        name: 'Porcentaje (%)',
        nameLocation: 'middle',
        nameGap: 45,
        min: 0,
        max: 100,
        interval: 20,
        axisLabel: {
          fontSize: 9,
          formatter: '{value}%',
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#ccc',
          },
        },
      },

      dataZoom: this.showZoom
        ? [
            {
              type: 'slider',
              show: true,
              xAxisIndex: 0,
              start: 0,
              end: xAxisLabels.length > 10 ? 35 : 100,
              height: 18,
              bottom: 25,
            },
            {
              type: 'inside',
              xAxisIndex: 0,
              start: 0,
              end: xAxisLabels.length > 10 ? 35 : 100,
            },
          ]
        : [],

      series: [
        {
          name: 'Disponibilidad',
          type: 'bar',
          barWidth: '50%',

          data: valores.map((valor) => ({
            value: valor,
            itemStyle: {
              color: colorPorDisponibilidad(valor),
            },
          })),

          itemStyle: {
            borderRadius: [5, 5, 0, 0],
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 6,
            shadowOffsetY: 2,
          },

          label: {
            show: true,
            position: 'top',
            fontWeight: 'bold',
            fontSize: 11,
            formatter: (params: any) => {
              return `${Number(params.value).toFixed(2)}%`;
            },
            color: '#333',
          },

          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
            },
          },

          showBackground: true,

          backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.1)',
            borderRadius: 5,
          },
        },
      ],

      graphic: graphics,
    };
  }

  // =====================================
  // MES
  // =====================================

  obtenerNombreMes(numeroMes: number): string {
    const meses = [
      'ENERO',
      'FEBRERO',
      'MARZO',
      'ABRIL',
      'MAYO',
      'JUNIO',
      'JULIO',
      'AGOSTO',
      'SEPTIEMBRE',
      'OCTUBRE',
      'NOVIEMBRE',
      'DICIEMBRE',
    ];

    return meses[numeroMes - 1] || '';
  }
}
