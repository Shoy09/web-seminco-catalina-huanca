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
  selector: 'app-pareto-disponibilidad',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './pareto-disponibilidad.component.html',
  styleUrl: './pareto-disponibilidad.component.css',
})
export class ParetoDisponibilidadComponent implements OnChanges {

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
      if (Number(b.horasGeneral || 0) !== Number(a.horasGeneral || 0)) {
        return Number(b.horasGeneral || 0) - Number(a.horasGeneral || 0);
      }

      return String(a.observacion || '').localeCompare(String(b.observacion || ''));
    });

    const observaciones = datosOrdenados.map((item) =>
      item.observacion || 'SIN OBSERVACIÓN'
    );

    const horasGeneral = datosOrdenados.map((item) =>
      Number(item.horasGeneral || 0)
    );

    const paretoDispObs = datosOrdenados.map((item) =>
      Number(item.paretoDispObs || 0)
    );

    const maxHoras = Math.max(...horasGeneral, 1);
    const escalaMaxHoras = Math.ceil(maxHoras / 5) * 5;

    const porcentajeVisible = observaciones.length > 8
      ? (8 / observaciones.length) * 100
      : 100;

    this.chartOptions = {
      title: {
        text: 'PARETO DE DISPONIBILIDAD',
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
        data: ['Horas general', 'Pareto disponibilidad'],
      },

      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const index = params[0].dataIndex;
          const item = datosOrdenados[index];

          const horas = Number(item.horasGeneral || 0);
          const pareto = Number(item.paretoDispObs || 0);
          const porcentajeHoras = Number(item.porcentajeHoras || 0);
          const totalHorasGeneral = Number(item.totalHorasGeneral || 0);

          return `
            <strong>${item.observacion || 'SIN OBSERVACIÓN'}</strong><br/>
            <hr style="margin: 5px 0"/>
            Horas general: <b>${horas.toFixed(2)} h</b><br/>
            % de horas: ${porcentajeHoras.toFixed(2)}%<br/>
            Pareto Disp% Obs: <b>${pareto.toFixed(2)}%</b><br/>
            Total horas general: ${totalHorasGeneral.toFixed(2)} h<br/>
            Registros: ${item.cantidadRegistros || 0}<br/>
            Códigos: ${(item.codigos || []).join(', ')}
          `;
        },
      },

      grid: {
        left: '8%',
        right: '8%',
        top: '24%',
        bottom: '30%',
        containLabel: true,
      },

      xAxis: {
        type: 'category',
        data: observaciones,
        axisLabel: {
          interval: 0,
          rotate: 35,
          fontSize: 10,
          fontWeight: 'bold',
          color: '#333',
          width: 120,
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
          name: 'Horas general',
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
          show: observaciones.length > 8,
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
          name: 'Horas general',
          type: 'bar',
          yAxisIndex: 0,
          barWidth: '55%',
          data: horasGeneral.map((valor) => ({
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
          name: 'Pareto disponibilidad',
          type: 'line',
          yAxisIndex: 1,
          data: paretoDispObs,
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