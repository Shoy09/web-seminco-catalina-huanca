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
  selector: 'app-ranking-operador-utilizacion',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './ranking-operador-utilizacion.component.html',
  styleUrl: './ranking-operador-utilizacion.component.css'
})
export class RankingOperadorUtilizacionComponent implements OnChanges {

  @Input() data: any[] = [];

  @Input() titulo: string = 'RANKING UTILIZACIÓN POR OPERADOR';

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['titulo']) {
      this.actualizarGrafico();
    }
  }

  actualizarGrafico(): void {
    if (!this.data || this.data.length === 0) {
      this.chartOptions = {};
      return;
    }

    const datosOrdenados = [...this.data].sort(
      (a, b) => Number(b.utilizacion || 0) - Number(a.utilizacion || 0)
    );

    const operadores = datosOrdenados.map((item) =>
      item.operador || 'SIN OPERADOR'
    );

    const valores = datosOrdenados.map((item) =>
      Number(item.utilizacion || 0)
    );

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

          const utilizacion = Number(item.utilizacion || 0);
          const horasTotales = Number(item.horasTotales || 0);
          const horasMtto = Number(item.horasMtto || 0);
          const horasDisponibles = Number(item.horasDisponibles || 0);
          const horasOperativas = Number(item.horasOperativas || 0);

          return `
            <strong>${item.operador || 'SIN OPERADOR'}</strong><br/>
            <hr style="margin: 5px 0"/>
            Utilización: <b>${utilizacion.toFixed(2)}%</b><br/>
            Horas totales: ${horasTotales.toFixed(2)} h<br/>
            Horas mantenimiento: ${horasMtto.toFixed(2)} h<br/>
            Horas disponibles: ${horasDisponibles.toFixed(2)} h<br/>
            Horas operativas: ${horasOperativas.toFixed(2)} h<br/>
            Operaciones: ${item.cantidadOperaciones || 0}<br/>
            Registros: ${item.cantidadRegistros || 0}<br/>
            Registros operativos: ${item.cantidadRegistrosOperativos || 0}<br/>
            Registros MTTO: ${item.cantidadRegistrosMtto || 0}
          `;
        },
      },

      grid: {
        left: '28%',
        right: '12%',
        top: '18%',
        bottom: '12%',
        containLabel: true,
      },

      xAxis: {
        type: 'value',
        name: 'Utilización (%)',
        nameLocation: 'middle',
        nameGap: 35,
        min: 0,
        max: 100,
        interval: 20,
        axisLabel: {
          formatter: '{value}%',
          fontSize: 10,
          color: '#333',
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
          width: 180,
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
          name: 'Utilización',
          type: 'bar',
          barWidth: '45%',

          data: valores.map((valor) => ({
            value: valor,
            itemStyle: {
              color:
                valor >= 85
                  ? '#2980b9'
                  : valor >= 70
                  ? '#27ae60'
                  : valor >= 50
                  ? '#f1c40f'
                  : '#e74c3c',
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
              return `${Number(params.value).toFixed(2)}%`;
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