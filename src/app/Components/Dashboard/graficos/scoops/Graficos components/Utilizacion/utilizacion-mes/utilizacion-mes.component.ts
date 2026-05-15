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
  selector: 'app-utilizacion-mes',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './utilizacion-mes.component.html',
  styleUrl: './utilizacion-mes.component.css'
})
export class UtilizacionMesComponent implements OnChanges {

  // 🔥 DATA DINÁMICA (del método UtilizacionPorMes)
  @Input() data: any[] = [];

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['data']) {
      this.actualizarGrafico();
    }
  }

  actualizarGrafico(): void {

    if (!this.data?.length) return;

    // 🔥 convertir número -> nombre mes
    const meses = this.data.map(item =>
      this.obtenerNombreMes(item.mes)
    );

    // 🔥 utilización
    const valores = this.data.map(item =>
      item.utilizacion
    );

    this.chartOptions = {

      title: {
        text: 'UTILIZACIÓN POR MES',
        left: 'center',
        top: 10,

        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333'
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
              ${item.año}
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
        left: '5%',
        right: '5%',
        top: '18%',
        bottom: '15%',
        containLabel: true
      },

      xAxis: {

        type: 'category',

        data: meses,

        axisLabel: {
          interval: 0,
          rotate: 35,
          fontSize: 10,
          fontWeight: 'bold'
        }
      },

      yAxis: {

        type: 'value',

        min: 0,
        max: 100,

        axisLabel: {
          formatter: '{value}%'
        },

        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },

      series: [
        {

          name: 'Utilización',

          type: 'bar',

          barWidth: '60%',

          data: valores.map(valor => ({

            value: valor,

            itemStyle: {

              color:
                valor >= 85   // Excelente
                  ? '#2980b9'
                  : valor >= 70   // Buena
                  ? '#27ae60'
                  : valor >= 50   // Media
                  ? '#f1c40f'
                  : '#e74c3c'    // Baja
            }
          })),

          itemStyle: {
            borderRadius: [6, 6, 0, 0]
          },

          label: {
            show: true,
            position: 'top',
            formatter: '{c}%',
            fontWeight: 'bold'
          },

          emphasis: {
            focus: 'series'
          }
        }
      ]
    };
  }

  // 🔥 convertir número a nombre mes
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

    return meses[numeroMes - 1] || 'SIN MES';
  }
}