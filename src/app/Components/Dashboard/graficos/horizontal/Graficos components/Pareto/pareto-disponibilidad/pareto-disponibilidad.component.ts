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
import { CHART_AXIS_LABEL, CHART_BAR_SHADOW, CHART_COLORS, CHART_PARETO, CHART_SPLIT_LINE, CHART_TITLE_STYLE } from '../../../../../../../shared/chart-theme';

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
        textStyle: CHART_TITLE_STYLE,
      },

      legend: {
        top: 40,
        left: 'center',
        data: [
          {
            name: 'Horas general',
            itemStyle: {
              color: CHART_PARETO.bar,
            }
          },
          {
            name: 'Pareto disponibilidad'
          }
        ],
        textStyle: {
          color: CHART_COLORS.grey,
        },
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
        top: '22%',
        bottom: '28%',
        containLabel: true,
      },

      xAxis: {
        type: 'category',
        data: observaciones,
        axisLabel: {
          interval: 0,
          rotate: 0, // Ajustado a horizontal
          fontSize: 10,
          fontWeight: 'bold',
          color: CHART_COLORS.grey,
          width: 80,
          overflow: 'break', // Divide los textos largos en líneas para que entren en horizontal
        },
        axisTick: {
          alignWithLabel: true,
        },
        axisLine: {
          lineStyle: {
            color: CHART_COLORS.axis,
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
            ...CHART_AXIS_LABEL,
          },
          splitLine: CHART_SPLIT_LINE,
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
            ...CHART_AXIS_LABEL,
          },
          splitLine: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: CHART_COLORS.axis,
            },
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
              color: CHART_PARETO.bar,
            },
          })),
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            ...CHART_BAR_SHADOW,
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => {
              return `${Number(params.value).toFixed(2)} h`;
            },
            fontWeight: 'bold',
            fontSize: 10,
            color: CHART_COLORS.grey,
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
            color: CHART_PARETO.line,
          },
          itemStyle: {
            color: CHART_PARETO.symbol,
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => {
              return `${Number(params.value).toFixed(1)}%`;
            },
            fontSize: 10,
            fontWeight: 'bold',
            color: CHART_COLORS.grey,
          },
        },
      ],
    };
  }
}