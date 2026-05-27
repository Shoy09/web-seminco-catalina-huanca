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
  selector: 'app-ranking-operador-rendimiento',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './ranking-operador-rendimiento.component.html',
  styleUrl: './ranking-operador-rendimiento.component.css',
})
export class RankingOperadorRendimientoComponent implements OnChanges {
  @Input() data: any[] = [];

  // m/h para Jumbo, ton/h para Scoop
  @Input() unidad: string = 'm/h';

  @Input() titulo: string = 'RANKING RENDIMIENTO POR OPERADOR';

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['unidad'] || changes['titulo']) {
      this.actualizarGrafico();
    }
  }

  actualizarGrafico(): void {
    if (!this.data || this.data.length === 0) {
      this.chartOptions = {};
      return;
    }

    const datosOrdenados = [...this.data].sort(
      (a, b) => Number(b.rendimiento || 0) - Number(a.rendimiento || 0),
    );

    const operadores = datosOrdenados.map((item) => {
      const operador = item.operador || 'SIN OPERADOR';
      const equipo = item.equiposLabel || item.modelo_equipo || 'SIN MODELO';

      return `${operador}\n${equipo}`;
    });

    const valores = datosOrdenados.map((item) => Number(item.rendimiento || 0));

    const maxValor = Math.max(...valores, 1);
    const escalaMax = Math.ceil(maxValor / 10) * 10;

    const porcentajeVisible =
      operadores.length > 8 ? (8 / operadores.length) * 100 : 100;

    this.chartOptions = {
      title: {
        text: this.titulo,
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold',
          color: '#333',
          fontFamily: 'Arial',
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

          const rendimiento = Number(item.rendimiento || 0);
          const horasOperativas = Number(item.horasOperativas || 0);

          const equipo =
            item.equiposLabel || item.modelo_equipo || 'SIN MODELO';

          let detalleProduccion = '';

          // Para Jumbo
          if (item.metrosPerforados !== undefined) {
            detalleProduccion = `
            Metros perforados: ${Number(item.metrosPerforados || 0).toFixed(2)} m<br/>
            Tal. producción: ${item.talProd || 0}<br/>
            Tal. rimados: ${item.talRimados || 0}<br/>
            Tal. alivio: ${item.talAlivio || 0}<br/>
            Tal. repaso: ${item.talRepaso || 0}<br/>
            Total taladros: ${item.totalTaladros || 0}<br/>
          `;
          }

          // Para Scoop
          if (item.tnTotalAjustado !== undefined) {
            detalleProduccion = `
            Tn total ajustado: ${Number(item.tnTotalAjustado || 0).toFixed(2)} Tn<br/>
          `;
          }

          return `
          <strong>${item.operador || 'SIN OPERADOR'}</strong><br/>
          Equipo / modelo: <b>${equipo}</b><br/>
          <hr style="margin: 5px 0"/>
          Rendimiento: <b>${rendimiento.toFixed(2)} ${this.unidad}</b><br/>
          ${detalleProduccion}
          Horas operativas: ${horasOperativas.toFixed(2)} h<br/>
          Operaciones: ${item.cantidadOperaciones || 0}<br/>
          Registros operativos: ${item.cantidadRegistrosOperativos || 0}
        `;
        },
      },

      grid: {
        left: '30%',
        right: '12%',
        top: '18%',
        bottom: '22%',
        containLabel: true,
      },

      xAxis: {
        type: 'value',
        name: `Rendimiento (${this.unidad})`,
        nameLocation: 'middle',
        nameGap: 45,
        min: 0,
        max: escalaMax,
        axisLabel: {
          show: true,
          formatter: `{value} ${this.unidad}`,
          fontSize: 10,
          color: '#333',
          margin: 10,
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#666',
          },
        },
        axisTick: {
          show: true,
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#ccc',
          },
        },
      },

      yAxis: {
        type: 'category',
        data: operadores,
        inverse: true,
        axisLabel: {
          interval: 0,
          fontSize: 10,
          fontWeight: 'bold',
          color: '#333',
          lineHeight: 16,
          width: 190,
          overflow: 'truncate',
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

      dataZoom: [
        {
          type: 'slider',
          show: operadores.length > 8,
          yAxisIndex: 0,
          start: 0,
          end: porcentajeVisible,
          width: 16,
          right: 5,
          top: 80,
          bottom: 40,
        },
        {
          type: 'inside',
          yAxisIndex: 0,
          start: 0,
          end: porcentajeVisible,
        },
      ],

      series: [
        {
          name: 'Rendimiento',
          type: 'bar',
          barWidth: '45%',

          data: valores.map((valor) => ({
            value: valor,
            itemStyle: {
              color: '#27ae60',
            },
          })),

          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            shadowColor: 'rgba(0,0,0,0.2)',
            shadowBlur: 6,
            shadowOffsetY: 2,
          },

          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => {
              return `${Number(params.value).toFixed(2)} ${this.unidad}`;
            },
            fontWeight: 'bold',
            fontSize: 11,
            color: '#333',
          },

          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.3)',
            },
          },

          showBackground: true,

          backgroundStyle: {
            color: 'rgba(180,180,180,0.1)',
            borderRadius: 5,
          },
        },
      ],
    };
  }
}
