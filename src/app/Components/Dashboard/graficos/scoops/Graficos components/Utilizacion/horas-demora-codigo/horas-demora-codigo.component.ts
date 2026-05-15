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
  selector: 'app-horas-demora-codigo',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './horas-demora-codigo.component.html',
  styleUrl: './horas-demora-codigo.component.css'
})
export class HorasDemoraCodigoComponent implements OnChanges {

  // 🔥 DATA DINÁMICA (del método HorasDemoraPorCodigo)
  @Input() data: any[] = [];

  chartOptions: any = {};

  readonly colorBarras = '#e74c3c';  // Rojo para demoras

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.actualizarGrafico();
    }
  }

  actualizarGrafico(): void {
    if (!this.data?.length) return;

    // 🔥 ordenar datos de mayor a menor por horas
    const datosOrdenados = [...this.data].sort((a, b) => b.horasDemora - a.horasDemora);
    
    // 🔥 solo el código (sin descripción)
    const codigos = datosOrdenados.map(item => item.codigo);

    // 🔥 horas de demora
    const valores = datosOrdenados.map(item => item.horasDemora);

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
          const dataIndex = params[0].dataIndex;
          const item = datosOrdenados[dataIndex];
          
          return `
            <strong>Código: ${item.codigo}</strong><br/>
            <strong>${item.descripcion || item.tipoDemora || 'DEMORA'}</strong><br/>
            <hr style="margin: 5px 0"/>
            Horas de Demora: <b>${item.horasDemora}h</b><br/>
            Registros: ${item.cantidadRegistros}<br/>
            Operaciones: ${item.cantidadOperaciones || item.cantidadRegistros}
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
        data: codigos,
        axisLabel: {
          interval: 0,
          rotate: 0,
          fontSize: 12,
          fontWeight: 'bold'
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
          name: 'Horas de Demora',
          type: 'bar',
          barWidth: '55%',
          data: valores,
          itemStyle: {
            color: this.colorBarras,
            borderRadius: [5, 5, 0, 0],
            shadowColor: 'rgba(0,0,0,0.2)',
            shadowBlur: 6,
            shadowOffsetY: 2
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}h',
            fontWeight: 'bold',
            fontSize: 11,
            color: '#333'
          },
          emphasis: {
            focus: 'series'
          },
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(180,180,180,0.1)',
            borderRadius: 5
          }
        }
      ]
    };
  }
}