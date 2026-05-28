import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';

import * as echarts from 'echarts/core';

import { BarChart, LineChart } from 'echarts/charts';

import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent,
  DataZoomComponent,
  LegendComponent,
} from 'echarts/components';

import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent,
  DataZoomComponent,
  LegendComponent,
  CanvasRenderer,
]);

@Component({
  selector: 'app-pareto-utilizacion',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './pareto-utilizacion.component.html',
  styleUrl: './pareto-utilizacion.component.css',
})
export class ParetoUtilizacionComponent implements OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.actualizarGrafico();
    }
  }

  actualizarGrafico(): void {
    if (!this.data || this.data.length === 0) {
      this.chartOptions = {};
      return;
    }

    const datosOrdenados = [...this.data].sort((a, b) => {
      if (Number(b.horasDemora || 0) !== Number(a.horasDemora || 0)) {
        return Number(b.horasDemora || 0) - Number(a.horasDemora || 0);
      }

      return String(a.actividad || '').localeCompare(String(b.actividad || ''));
    });

    const actividades = datosOrdenados.map((item) => item.actividad || 'SIN ACTIVIDAD');

    const horasDemora = datosOrdenados.map((item) =>
      Number(item.horasDemora || 0)
    );

    const paretoAct = datosOrdenados.map((item) =>
      Number(item.paretoAct || 0)
    );

    const maxHoras = Math.max(...horasDemora, 1);
    const escalaMaxHoras = Math.ceil(maxHoras / 5) * 5;

    const porcentajeVisible = actividades.length > 8
      ? (8 / actividades.length) * 100
      : 100;

    this.chartOptions = {
      title: {
        text: 'PARETO DE UTILIZACIÓN',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333',
          fontFamily: 'Arial',
        },
      },

      legend: {
        top: 40,
        left: 'center',
        data: ['Horas demora', 'Pareto acumulado'],
      },

      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const index = params[0].dataIndex;
          const item = datosOrdenados[index];

          const horas = Number(item.horasDemora || 0);
          const pareto = Number(item.paretoAct || 0);
          const porcentajeHoras = Number(item.porcentajeHoras || 0);
          const totalHorasDemora = Number(item.totalHorasDemora || 0);

          return `
            <strong>${item.actividad || 'SIN ACTIVIDAD'}</strong><br/>
            <hr style="margin: 5px 0"/>
            Horas demora: <b>${horas.toFixed(2)} h</b><br/>
            % de horas: ${porcentajeHoras.toFixed(2)}%<br/>
            Pareto acumulado: <b>${pareto.toFixed(2)}%</b><br/>
            Total horas demora: ${totalHorasDemora.toFixed(2)} h<br/>
            Registros: ${item.cantidadRegistros || 0}<br/>
            Códigos: ${(item.codigos || []).join(', ')}
          `;
        },
      },

      grid: {
        left: '8%',
        right: '8%',
        top: '22%',
        bottom: '28%',
        containLabel: true,
      },

      xAxis: {
        type: 'category',
        data: actividades,
        axisLabel: {
          interval: 0,
          rotate: 35,
          fontSize: 10,
          fontWeight: 'bold',
          color: '#333',
          width: 100,
          overflow: 'truncate',
        },
        axisTick: {
          alignWithLabel: true,
        },
        axisLine: {
          lineStyle: {
            color: '#666',
          },
        },
      },

      yAxis: [
        {
          type: 'value',
          name: 'Horas demora',
          nameLocation: 'middle',
          nameGap: 45,
          min: 0,
          max: escalaMaxHoras,
          axisLabel: {
            formatter: '{value} h',
            fontSize: 10,
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#ccc',
            },
          },
        },
        {
          type: 'value',
          name: 'Pareto (%)',
          nameLocation: 'middle',
          nameGap: 45,
          min: 0,
          max: 100,
          interval: 20,
          axisLabel: {
            formatter: '{value}%',
            fontSize: 10,
          },
          splitLine: {
            show: false,
          },
        },
      ],

      dataZoom: [
        {
          type: 'slider',
          show: actividades.length > 8,
          xAxisIndex: 0,
          start: 0,
          end: porcentajeVisible,
          height: 18,
          bottom: 25,
        },
        {
          type: 'inside',
          xAxisIndex: 0,
          start: 0,
          end: porcentajeVisible,
        },
      ],

      series: [
        {
          name: 'Horas demora',
          type: 'bar',
          yAxisIndex: 0,
          barWidth: '55%',
          data: horasDemora.map((valor) => ({
            value: valor,
            itemStyle: {
              color: '#27ae60',
            },
          })),
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            shadowColor: 'rgba(0,0,0,0.2)',
            shadowBlur: 6,
            shadowOffsetY: 2,
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => {
              return `${Number(params.value).toFixed(2)} h`;
            },
            fontWeight: 'bold',
            fontSize: 10,
            color: '#333',
          },
          emphasis: {
            focus: 'series',
          },
        },
        {
          name: 'Pareto acumulado',
          type: 'line',
          yAxisIndex: 1,
          data: paretoAct,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: '#e67e22',
          },
          itemStyle: {
            color: '#e67e22',
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => {
              return `${Number(params.value).toFixed(1)}%`;
            },
            fontSize: 10,
            fontWeight: 'bold',
            color: '#333',
          },
        },
      ],
    };
  }
}