import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';

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
  selector: 'app-utilizacion-equipo',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './utilizacion-equipo.component.html',
  styleUrl: './utilizacion-equipo.component.css'
})
export class UtilizacionEquipoComponent implements OnChanges {

  // 🔥 DATA DINÁMICA (debe venir del método UtilizacionPorEquipo)
  @Input() data: any[] = [];

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['data']) {
      this.actualizarGrafico();
    }
  }

  actualizarGrafico(): void {

    if (!this.data?.length) return;

    // 🔥 labels
    const equipos = this.data.map(item =>
      item.modeloEquipo
    );

    // 🔥 valores % de utilización
    const valores = this.data.map(item =>
      item.utilizacion
    );

    this.chartOptions = {
      title: {
        text: 'UTILIZACIÓN POR EQUIPO',
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
            <strong>${item.modeloEquipo}</strong><br/>

            Utilización:
            <b>${item.utilizacion}%</b><br/>
            <hr style="margin: 5px 0"/>
            Horas Operativas:
            ${item.horasOperativas}h<br/>

            Horas Totales:
            ${item.horasTotales}h<br/>

            Horas MTTO:
            ${item.horasMtto}h<br/>

            Horas Netas Disponibles:
            ${horasNetas}h
          `;
        }
      },

      grid: {
        left: '5%',
        right: '5%',
        top: '18%',
        bottom: '10%',
        containLabel: true
      },

      xAxis: {
        type: 'category',
        data: equipos,

        axisLabel: {
          interval: 0,
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

          barWidth: '55%',

          data: valores.map(valor => ({
            value: valor,

            // 🔥 color según rango de utilización
            itemStyle: {
              color:
                valor >= 85    // Excelente utilización
                  ? '#2980b9'
                  : valor >= 70  // Buena utilización
                  ? '#27ae60'
                  : valor >= 50  // Utilización media
                  ? '#f1c40f'
                  : '#e74c3c'    // Baja utilización
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
}