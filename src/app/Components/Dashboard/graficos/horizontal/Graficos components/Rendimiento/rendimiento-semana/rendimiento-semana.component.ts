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
import { CHART_COLORS, colorPorRendimiento } from '../../../../../../../shared/chart-theme';

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
  selector: 'app-rendimiento-semana',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './rendimiento-semana.component.html',
  styleUrl: './rendimiento-semana.component.css',
})
export class RendimientoSemanaComponent implements OnChanges {
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
      String(a.key).localeCompare(String(b.key))
    );

    const semanas = datosOrdenados.map((item) => item.periodo);

    const valores = datosOrdenados.map((item) =>
      Number(item.rendimiento || 0)
    );

    const maxValor = Math.max(...valores, 1);
    const escalaMax = Math.ceil(maxValor / 20) * 20;

    const porcentajeVisible = semanas.length > 7
      ? (7 / semanas.length) * 100
      : 100;

    this.chartOptions = {
      title: {
        text: 'RENDIMIENTO POR SEMANA',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: CHART_COLORS.grey,
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
          const metrosPerforados = Number(item.metrosPerforados || 0);
          const horasOperativas = Number(item.horasOperativas || 0);

          return `
            <strong>Semana ${item.periodo}</strong><br/>
            Rango: ${item.fechaInicio || '-'} al ${item.fechaFin || '-'}<br/>
            <hr style="margin: 5px 0"/>
            Rendimiento: <b>${rendimiento.toFixed(2)} m/h</b><br/>
            Metros perforados: ${metrosPerforados.toFixed(2)} m<br/>
            Horas operativas: ${horasOperativas.toFixed(2)} h<br/>
            Días rango: ${item.cantidadDiasRango || 0}<br/>
            Días con datos: ${item.cantidadDiasConDatos || 0}<br/>
            Operaciones: ${item.cantidadOperaciones || 0}<br/>
            Registros operativos: ${item.cantidadRegistrosOperativos || 0}<br/>
            Tal. producción: ${item.talProd || 0}<br/>
            Tal. rimados: ${item.talRimados || 0}<br/>
            Tal. alivio: ${item.talAlivio || 0}<br/>
            Tal. repaso: ${item.talRepaso || 0}<br/>
            Total taladros: ${item.totalTaladros || 0}
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
        name: 'Rendimiento (m/h)',
        nameLocation: 'middle',
        nameGap: 55,
        min: 0,
        max: escalaMax,
        axisLabel: {
          formatter: '{value} m/h',
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
          show: semanas.length > 7,
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
          name: 'Rendimiento',
          type: 'bar',
          barWidth: '55%',
          data: valores.map((valor) => ({
            value: valor,
            itemStyle: {
              color: colorPorRendimiento(valor),
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
              return `${Number(params.value).toFixed(2)} m/h`;
            },
            fontWeight: 'bold',
            fontSize: 11,
            color: '#333',
          },
          emphasis: {
            focus: 'series',
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