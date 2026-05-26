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
  selector: 'app-utilizacion-semana',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './utilizacion-semana.component.html',
  styleUrl: './utilizacion-semana.component.css',
})
export class UtilizacionSemanaComponent implements OnChanges {
  // 🔥 DATA DINÁMICA (del método UtilizacionPorSemana)
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

    const datosOrdenados = [...this.data].sort((a, b) =>
      String(a.key).localeCompare(String(b.key)),
    );

    const semanas = datosOrdenados.map((item) => item.periodo);

    const valores = datosOrdenados.map((item) => Number(item.utilizacion || 0));

    const porcentajeVisible =
      semanas.length > 7 ? (7 / semanas.length) * 100 : 100;

    this.chartOptions = {
      title: {
        text: 'UTILIZACIÓN POR SEMANA',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
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
          const horasOperativas = Number(item.horasOperativas || 0);
          const horasTotales = Number(item.horasTotales || 0);
          const horasMtto = Number(item.horasMtto || 0);
          const horasDisponibles = Number(item.horasDisponibles || 0);

          return `
          <strong>Semana ${item.periodo}</strong><br/>
          Rango: ${item.fechaInicio || '-'} al ${item.fechaFin || '-'}<br/>
          <hr style="margin: 5px 0"/>
          Utilización promedio: <b>${utilizacion.toFixed(2)}%</b><br/>
          Horas operativas: ${horasOperativas.toFixed(2)} h<br/>
          Horas totales: ${horasTotales.toFixed(2)} h<br/>
          Horas mantenimiento: ${horasMtto.toFixed(2)} h<br/>
          Horas disponibles: ${horasDisponibles.toFixed(2)} h<br/>
          Días con datos: ${item.cantidadDiasConDatos || 0}<br/>
          Operaciones: ${item.cantidadOperaciones || 0}<br/>
          Registros: ${item.cantidadRegistros || 0}<br/>
          Registros operativos: ${item.cantidadRegistrosOperativos || 0}<br/>
          Registros MTTO: ${item.cantidadRegistrosMtto || 0}
        `;
        },
      },

      grid: {
        left: '8%',
        right: '5%',
        top: '20%',
        bottom: '25%',
        containLabel: true,
      },

      xAxis: {
        type: 'category',
        data: semanas,
        axisLabel: {
          interval: 0,
          fontSize: 10,
          fontWeight: 'bold',
          color: '#333',
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

      yAxis: {
        type: 'value',
        name: 'Utilización (%)',
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
          lineStyle: {
            type: 'dashed',
            color: '#ccc',
          },
        },
      },

      dataZoom: [
        {
          type: 'slider',
          show: true,
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
          name: 'Utilización',
          type: 'bar',
          barWidth: '55%',

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
            borderRadius: [6, 6, 0, 0],
            shadowColor: 'rgba(0,0,0,0.2)',
            shadowBlur: 6,
            shadowOffsetY: 2,
          },

          label: {
            show: true,
            position: 'top',
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
