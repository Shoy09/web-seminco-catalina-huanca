import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, ToolboxComponent, DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_BACKGROUND_BAR, CHART_BAR_SHADOW, CHART_COLORS, CHART_SPLIT_LINE, colorPorMTTR } from '../../../../../../../../shared/chart-theme';
import { exportarImagenChart, PdfExportOptions } from 'src/app/config/config-pdf';

echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, ToolboxComponent, DataZoomComponent, CanvasRenderer]);

@Component({
  selector: 'app-mttr-semana',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './mttr-semana.component.html',
  styleUrl: './mttr-semana.component.css',
})
export class MttrSemanaComponent implements OnChanges {
  @Input() data: any[] = [];
  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    if (!this.data || this.data.length === 0) { this.chartOptions = {}; return; }

    const datos = [...this.data].sort((a, b) => String(a.key).localeCompare(String(b.key)));
    const labels = datos.map(d => d.periodo);
    const valores = datos.map(d => Number(d.mttr || 0));
    const maxValor = Math.max(...valores, 1);
    const escalaMax = Math.ceil(maxValor / 10) * 10;
    const porcentajeVisible = datos.length > 8 ? (8 / datos.length) * 100 : 100;

    this.chartOptions = {
      tooltip: {
        trigger: 'axis', axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = datos[params[0].dataIndex];
          return `<strong>${item.periodo} ${item.anio || ''}</strong><br/><hr style="margin:5px 0"/>
            MTTR: <b>${Number(item.mttr || 0).toFixed(2)} h</b><br/>
            MTBF: ${Number(item.mtbf || 0).toFixed(2)} h<br/>
            Horas totales: ${Number(item.horasTotales || 0).toFixed(2)} h<br/>
            Hrs. Mtto.: ${Number(item.horasMttoCorrectivo || 0).toFixed(2)} h<br/>
            Fallas: ${item.fallas || 0}`;
        },
      },
      grid: { left: '8%', right: '8%', top: '18%', bottom: '22%', containLabel: true },
      xAxis: {
        type: 'category', data: labels,
        axisLabel: { interval: 0, rotate: datos.length > 8 ? 35 : 0, fontSize: 10, fontWeight: 'bold', color: CHART_COLORS.grey },
        axisLine: { lineStyle: { color: CHART_COLORS.axis } }, axisTick: { alignWithLabel: true },
      },
      yAxis: { type: 'value', min: 0, max: escalaMax, axisLabel: { formatter: '{value} h', fontSize: 10, color: CHART_COLORS.grey }, splitLine: CHART_SPLIT_LINE },
      dataZoom: [
        { type: 'slider', show: datos.length > 8, xAxisIndex: 0, start: 0, end: porcentajeVisible, height: 18, bottom: 25 },
        { type: 'inside', xAxisIndex: 0, start: 0, end: porcentajeVisible },
      ],
      series: [{
        type: 'bar', barWidth: '55%',
        data: valores.map(v => ({ value: v, itemStyle: { color: colorPorMTTR(v) } })),
        itemStyle: { borderRadius: [6, 6, 0, 0], ...CHART_BAR_SHADOW },
        label: { show: true, position: 'top', formatter: (p: any) => `${Number(p.value).toFixed(2)} h`, fontWeight: 'bold', fontSize: 10, color: CHART_COLORS.grey },
        emphasis: { focus: 'series' },
        showBackground: true, backgroundStyle: CHART_BACKGROUND_BAR,
      }],
    };
  }

  private chartInstance: any;
  onChartInit(ec: any): void { this.chartInstance = ec; }
  getChartImage(options?: PdfExportOptions): string | null { return exportarImagenChart(this.chartInstance, options); }
}
