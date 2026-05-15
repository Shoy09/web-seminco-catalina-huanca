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
  selector: 'app-disponibilidad-estado',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './disponibilidad-estado.component.html',
  styleUrl: './disponibilidad-estado.component.css'
})
export class DisponibilidadEstadoComponent
implements OnChanges {

  // 🔥 DATA DINÁMICA
  @Input() data: any[] = [];

  chartOptions: any = {};

  readonly colorUnico = '#3498db';

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['data']) {
      this.actualizarGrafico();
    }
  }

  // 🔥 truncar texto
  truncarTexto(
    texto: string,
    maxLongitud: number = 13
  ): string {

    if (texto.length <= maxLongitud) {
      return texto;
    }

    return texto.substring(0, maxLongitud) + '...';
  }

  actualizarGrafico(): void {

    if (!this.data?.length) return;

    // 🔥 códigos
    const codigosOriginales =
      this.data.map(item => item.codigo);

    const codigosTruncados =
      this.data.map(item =>
        this.truncarTexto(item.codigo, 13)
      );

    // 🔥 horas
    const valores =
      this.data.map(item => item.horas);

    this.chartOptions = {

      title: {
        text: 'DIAGRAMA DE PARETO',
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

          const index =
            codigosTruncados.findIndex(
              truncado =>
                truncado === data.name
            );

          const item = this.data[index];

          return `
            <strong>
              Código: ${item.codigo}
            </strong><br/>

            Horas MTTO:
            <b>${item.horas}h</b><br/>

            Registros:
            ${item.cantidadRegistros}
          `;
        }
      },

      grid: {
        left: '10%',
        right: '5%',
        top: '18%',
        bottom: '15%',
        containLabel: true
      },

      xAxis: {

        type: 'category',

        data: codigosTruncados,

        axisLabel: {
          interval: 0,
          rotate: 45,
          fontSize: 10,
          fontWeight: 'bold',

          formatter: (value: string) => {
            return value.replace(
              /\s/g,
              '\u00A0'
            );
          }
        }
      },

      yAxis: {

        type: 'value',

        name: 'Horas',

        nameLocation: 'middle',

        nameGap: 40,

        axisLabel: {
          formatter: '{value}h'
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

          name: 'Horas MTTO',

          type: 'bar',

          barWidth: '60%',

          data: valores,

          itemStyle: {

            color: this.colorUnico,

            borderRadius: [5, 5, 0, 0],

            shadowColor:
              'rgba(0,0,0,0.2)',

            shadowBlur: 6,

            shadowOffsetY: 2
          },

          label: {
            show: true,
            position: 'top',
            formatter: '{c}h',
            fontWeight: 'bold',
            fontSize: 10
          },

          emphasis: {
            focus: 'series'
          },

          showBackground: true,

          backgroundStyle: {
            color:
              'rgba(180,180,180,0.1)',

            borderRadius: 5
          }
        }
      ]
    };
  }
}