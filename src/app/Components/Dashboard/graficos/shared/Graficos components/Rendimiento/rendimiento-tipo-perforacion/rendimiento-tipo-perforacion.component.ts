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

import { exportarImagenChart, PdfExportOptions } from 'src/app/config/config-pdf';

@Component({
  selector: 'app-rendimiento-tipo-perforacion',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './rendimiento-tipo-perforacion.component.html',
  styleUrl: './rendimiento-tipo-perforacion.component.css',
})
export class RendimientoTipoPerforacionComponent implements OnChanges {
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

    const datosOrdenados = [...this.data]
      .filter((item) => Number(item.rendimiento || 0) > 0)
      .sort((a, b) => Number(b.rendimiento || 0) - Number(a.rendimiento || 0));

    if (!datosOrdenados.length) {
      this.chartOptions = {};
      return;
    }

    const tipos = datosOrdenados.map((item) => item.tipo || 'SIN TIPO');
    const valores = datosOrdenados.map((item) => Number(item.rendimiento || 0));

    const maxValor = Math.max(...valores, 1);
    const escalaMax = Math.ceil(maxValor / 20) * 20;

    this.chartOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = datosOrdenados[params[0].dataIndex];
          return `
            <strong>${item.tipo || 'SIN TIPO'}</strong><br/>
            <hr style="margin: 5px 0"/>
            Rendimiento: <b>${Number(item.rendimiento || 0).toFixed(2)} m/h</b><br/>
            Metros perforados: ${Number(item.metrosPerforados || 0).toFixed(2)} m<br/>
            Horas operativas: ${Number(item.horasOperativas || 0).toFixed(2)} h<br/>
            Registros: ${item.cantidadRegistros || 0}
          `;
        },
      },

      grid: {
        left: '5%',
        right: '15%',
        top: '10%',
        bottom: '10%',
        containLabel: true,
      },

      xAxis: {
        type: 'value',
        min: 0,
        max: escalaMax,
        axisLabel: {
          formatter: (val: number) => `${val}`,
          fontSize: 10,
          color: CHART_COLORS.grey,
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#e0e0e0',
          },
        },
      },

      yAxis: {
        type: 'category',
        data: tipos,
        axisLabel: {
          fontSize: 11,
          fontWeight: 'bold',
          color: CHART_COLORS.grey,
        },
        axisTick: { show: false },
        axisLine: {
          lineStyle: { color: '#ccc' },
        },
      },

      series: [
        {
          type: 'bar',
          barMaxWidth: 48,
          data: valores.map((valor) => {
            const pct = valor / escalaMax;
            const inside = pct > 0.45;
            return {
              value: valor,
              itemStyle: {
                color: colorPorRendimiento(valor),
                borderRadius: [0, 6, 6, 0],
              },
              label: {
                show: true,
                position: inside ? 'insideRight' : 'right',
                distance: inside ? 8 : 6,
                formatter: `${valor.toFixed(2)} m/h`,
                fontWeight: 'bold',
                fontSize: 11,
                color: inside ? '#fff' : CHART_COLORS.grey,
              },
            };
          }),
          label: { show: false },
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.3)',
            },
          },
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(180,180,180,0.08)',
            borderRadius: 5,
          },
        },
      ],
    };
  }

  private chartInstance: any;
  onChartInit(ec: any): void { this.chartInstance = ec; }
  getChartImage(options?: PdfExportOptions): string | null {
    return exportarImagenChart(this.chartInstance, options);
  }
}
