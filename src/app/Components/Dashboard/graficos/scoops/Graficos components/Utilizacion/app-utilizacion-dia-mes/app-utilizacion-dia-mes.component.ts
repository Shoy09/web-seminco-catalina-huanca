import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import {
  NgxEchartsDirective,
  provideEchartsCore
} from 'ngx-echarts';

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
  selector: 'app-utilizacion-dia-mes',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
    templateUrl: './app-utilizacion-dia-mes.component.html',
  styleUrl: './app-utilizacion-dia-mes.component.css'
})
export class UtilizacionDiaMesComponent implements OnChanges {

  // 🔥 DATA DINÁMICA (del método UtilizacionPorDia)
  @Input() data: any[] = [];

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['data']) {
      this.actualizarGrafico();
    }
  }

  actualizarGrafico(): void {

    if (!this.data?.length) return;

    // =====================================
    // LABELS
    // =====================================

    const xAxisLabels = this.data.map(item => ({

      value: `${item.mes}|${item.dia}`,

      mes: this.obtenerNombreMes(item.mes),

      dia: item.dia
    }));

    // =====================================
    // VALORES - UTILIZACIÓN
    // =====================================

    const valores = this.data.map(
      item => item.utilizacion
    );

    // =====================================
    // GRAPHICS
    // =====================================

    const graphics: any[] = [];

    const mesesPosiciones = new Map();

    let mesActual = '';

    let inicio = 0;

    for (
      let i = 0;
      i < xAxisLabels.length;
      i++
    ) {

      const item = xAxisLabels[i];

      if (item.mes !== mesActual) {

        if (mesActual !== '') {

          mesesPosiciones.set(
            mesActual,
            {
              start: inicio,
              end: i - 1
            }
          );
        }

        mesActual = item.mes;

        inicio = i;
      }
    }

    // 🔥 guardar último mes
    if (mesActual !== '') {

      mesesPosiciones.set(
        mesActual,
        {
          start: inicio,
          end: xAxisLabels.length - 1
        }
      );
    }

    // =====================================
    // DIBUJAR MESES
    // =====================================

    mesesPosiciones.forEach(
      (pos: any, mes: string) => {

        const centro =
          (pos.start + pos.end + 1) / 2;

        graphics.push({

          type: 'text',

          left:
            `${
              centro *
              (
                100 /
                xAxisLabels.length
              )
            }%`,

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
      }
    );

    // =====================================
    // CHART
    // =====================================

    this.chartOptions = {

      title: {

        text: 'UTILIZACIÓN POR DÍA Y MES',

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

          const item = this.data[data.dataIndex];
          
          // 🔥 Calcular horas netas disponibles
          const horasNetas = item.horasTotales - item.horasMtto;

          return `
            <strong>
              ${this.obtenerNombreMes(item.mes)}
              - DÍA ${item.dia}
            </strong><br/>
            <hr style="margin: 5px 0"/>
            Utilización:
            <b>${item.utilizacion}%</b><br/>
            Horas Operativas:
            ${item.horasOperativas}h<br/>
            Horas Totales:
            ${item.horasTotales}h<br/>
            Horas MTTO:
            ${item.horasMtto}h<br/>
            Horas Netas:
            ${horasNetas}h<br/>
            Registros:
            ${item.cantidadPartes}
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

        data: xAxisLabels.map(
          item => item.value
        ),

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

          name: 'Utilización',

          type: 'bar',

          barWidth: '50%',

          data: valores.map(valor => ({

            value: valor,

            itemStyle: {

              color:
                valor >= 85    // Excelente
                  ? '#2980b9'
                  : valor >= 70  // Buena
                  ? '#27ae60'
                  : valor >= 50  // Media
                  ? '#f1c40f'
                  : '#e74c3c'   // Baja
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

      // =====================================
      // GRAPHICS
      // =====================================

      graphic: graphics
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
      'DICIEMBRE'
    ];

    return meses[numeroMes - 1] || '';
  }
}