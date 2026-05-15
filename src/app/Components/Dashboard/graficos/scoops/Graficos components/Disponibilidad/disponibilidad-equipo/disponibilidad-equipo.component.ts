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
  selector: 'app-disponibilidad-equipo',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './disponibilidad-equipo.component.html',
  styleUrl: './disponibilidad-equipo.component.css'
})
export class DisponibilidadEquipoComponent implements OnChanges {

  // 🔥 DATA DINÁMICA
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

    // 🔥 valores %
    const valores = this.data.map(item =>
      item.disponibilidad
    );

    this.chartOptions = {
      title: {
        text: 'DISPONIBILIDAD POR EQUIPO',
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

          return `
            <strong>${item.modeloEquipo}</strong><br/>

            Disponibilidad:
            <b>${item.disponibilidad}%</b><br/>

            Horas Totales:
            ${item.horasTotales}h<br/>

            Horas MTTO:
            ${item.horasMtto}h
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
          name: 'Disponibilidad',

          type: 'bar',

          barWidth: '55%',

          data: valores.map(valor => ({
            value: valor,

            // 🔥 color automático
            itemStyle: {
              color:
                valor >= 90
                  ? '#27ae60'
                  : valor >= 75
                  ? '#f1c40f'
                  : '#e74c3c'
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