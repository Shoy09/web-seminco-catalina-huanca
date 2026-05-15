import { Component, OnInit } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent,
  CanvasRenderer
]);

@Component({
  selector: 'app-rendimiento-dia-mes',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './rendimiento-dia-mes.component.html',
  styleUrl: './rendimiento-dia-mes.component.css'
})
export class RendimientoDiaMesComponent implements OnInit {

  chartOptions: any = {};

  // Datos organizados por mes y día
  readonly datosDisponibilidad = [
    { mes: 'ABRIL', dia: 27, cantidad: 47 },
    { mes: 'ABRIL', dia: 28, cantidad: 53 },

    { mes: 'MAYO', dia: 3, cantidad: 48 },
    { mes: 'MAYO', dia: 4, cantidad: 51 },
    { mes: 'MAYO', dia: 5, cantidad: 49 }
  ];

  ngOnInit(): void {
    this.actualizarGrafico();
  }

  actualizarGrafico(): void {

    // Etiquetas internas
    const xAxisLabels = this.datosDisponibilidad.map(item => ({
      value: `${item.mes}|${item.dia}`,
      mes: item.mes,
      dia: item.dia
    }));

    // Valores
    const valores = this.datosDisponibilidad.map(item => item.cantidad);

    // =========================
    // GRAPHICS
    // =========================
    const graphics: any[] = [];

    // =========================
    // MESES CENTRADOS ABAJO
    // =========================
    const mesesPosiciones = new Map();

    let mesActual = '';
    let inicio = 0;

    for (let i = 0; i < this.datosDisponibilidad.length; i++) {

      const item = this.datosDisponibilidad[i];

      if (item.mes !== mesActual) {

        if (mesActual !== '') {

          mesesPosiciones.set(mesActual, {
            start: inicio,
            end: i - 1
          });
        }

        mesActual = item.mes;
        inicio = i;
      }
    }

    // Guardar último mes
    if (mesActual !== '') {

      mesesPosiciones.set(mesActual, {
        start: inicio,
        end: this.datosDisponibilidad.length - 1
      });
    }

    // Dibujar meses centrados
    mesesPosiciones.forEach((pos: any, mes: string) => {

      const centro = (pos.start + pos.end + 1) / 2;

      graphics.push({

        type: 'text',

        left: `${centro * (100 / this.datosDisponibilidad.length)}%`,

        bottom: 8,

        style: {
          text: mes,
          fill: '#333',
          fontSize: 12,
          fontWeight: 'bold',
          fontFamily: 'Arial'
        },

        z: 100
      });

    });

    this.chartOptions = {

      title: {

        text: 'RENDIMIENTO (t/h) - DIA',

        left: 'center',

        top: 10,

        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333',
          fontFamily: 'Arial'
        }
      },

      tooltip: {

        trigger: 'axis',

        axisPointer: {
          type: 'shadow'
        },

        formatter: (params: any) => {

          const data = params[0];

          const partes = data.name.split('|');

          const mes = partes[0];
          const dia = partes[1];

          return `
            <strong>${mes} - DÍA ${dia}</strong><br/>
            Disponibilidad: ${data.value}%<br/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            Nivel: ${data.value}%
          `;
        }
      },

      grid: {
        left: '8%',
        right: '5%',
        top: '22%',
        bottom: '18%',
        containLabel: true
      },

      xAxis: {

        type: 'category',

        data: xAxisLabels.map(item => item.value),

        axisLabel: {

          show: true,

          interval: 0,

          margin: 18,

          fontSize: 11,

          fontWeight: 'bold',

          color: '#333',

          formatter: (value: string) => {

            return value.split('|')[1];
          }
        },

        axisLine: {
          lineStyle: {
            color: '#666'
          }
        },

        axisTick: {
          alignWithLabel: true
        }
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
          formatter: '{value}%'
        },

        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#ccc'
          }
        }
      },

      series: [
        {

          name: 'Disponibilidad',

          type: 'bar',

          barWidth: '50%',

          data: valores.map(valor => ({
            value: valor,

            itemStyle: {
              color: '#3498db'
            }
          })),

          itemStyle: {

            borderRadius: [5, 5, 0, 0],

            shadowColor: 'rgba(0, 0, 0, 0.2)',

            shadowBlur: 6,

            shadowOffsetY: 2
          },

          label: {

            show: true,

            position: 'top',

            fontWeight: 'bold',

            fontSize: 11,

            formatter: '{c}%',

            color: '#333'
          },

          emphasis: {

            focus: 'series',

            itemStyle: {

              shadowBlur: 10,

              shadowOffsetX: 0,

              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          },

          showBackground: true,

          backgroundStyle: {

            color: 'rgba(180, 180, 180, 0.1)',

            borderRadius: 5
          }
        }
      ],

      // =========================
      // GRAPHICS
      // =========================
      graphic: graphics
    };
  }
}