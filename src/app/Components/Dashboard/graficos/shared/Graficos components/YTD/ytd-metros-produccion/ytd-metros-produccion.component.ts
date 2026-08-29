import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, ToolboxComponent, DataZoomComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS, CHART_SPLIT_LINE, CHART_BAR_SHADOW } from '../../../../../../../shared/chart-theme';
import { exportarImagenChart, PdfExportOptions } from 'src/app/config/config-pdf';

echarts.use([BarChart, LineChart, TitleComponent, TooltipComponent, GridComponent, ToolboxComponent, DataZoomComponent, LegendComponent, CanvasRenderer]);

@Component({
  selector: 'app-ytd-metros-produccion',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './ytd-metros-produccion.component.html',
  styleUrl: './ytd-metros-produccion.component.css',
})
export class YtdMetrosProduccionComponent implements OnChanges {
  @Input() data: any[] = [];
  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    if (!this.data || this.data.length === 0) { this.chartOptions = {}; return; }
    const datos = [...this.data].sort((a, b) => String(a.key).localeCompare(String(b.key)));
    const labels = datos.map(d => d.periodo || d.key);
    const valores = datos.map(d => Number(d.metrosPerforados || 0));
    const maxValor = Math.max(...valores, 1);
    const escalaMax = Math.ceil(maxValor / 50) * 50;
    const porcentajeVisible = datos.length > 10 ? (10 / datos.length) * 100 : 100;

    this.chartOptions = {
      tooltip: {
        trigger: 'axis', axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = datos[params[0].dataIndex];
          return `<strong>${item.periodo || item.key}</strong><br/><hr style="margin:5px 0"/>
            Metros: <b>${Number(item.metrosPerforados || 0).toFixed(2)} m</b>`;
        },
      },
      grid: { left: '8%', right: '5%', top: '18%', bottom: '22%', containLabel: true },
      xAxis: {
        type: 'category', data: labels,
        axisLabel: { interval: 0, rotate: datos.length > 8 ? 35 : 0, fontSize: 10, fontWeight: 'bold', color: CHART_COLORS.grey },
        axisLine: { lineStyle: { color: CHART_COLORS.axis } }, axisTick: { alignWithLabel: true },
      },
      yAxis: { type: 'value', min: 0, max: escalaMax, axisLabel: { formatter: `{value} m`, fontSize: 10, color: CHART_COLORS.grey }, splitLine: CHART_SPLIT_LINE },
      dataZoom: [
        { type: 'slider', show: datos.length > 10, xAxisIndex: 0, start: 0, end: porcentajeVisible, height: 18, bottom: 25 },
        { type: 'inside', xAxisIndex: 0, start: 0, end: porcentajeVisible },
      ],
      series: [{
        type: 'bar', barWidth: '55%',
        data: valores.map(v => ({ value: v, itemStyle: { color: CHART_COLORS.catalinaGreen } })),
        itemStyle: { borderRadius: [6, 6, 0, 0], ...CHART_BAR_SHADOW },
        label: { show: true, position: 'top', formatter: (p: any) => `${Number(p.value).toFixed(1)}m`, fontWeight: 'bold', fontSize: 9, color: CHART_COLORS.grey },
        emphasis: { focus: 'series' },
        showBackground: true, backgroundStyle: { color: 'rgba(180,180,180,0.1)', borderRadius: 5 },
      }],
    };
  }

  private chartInstance: any;
  onChartInit(ec: any): void { this.chartInstance = ec; }
  getChartImage(options?: PdfExportOptions): string | null { return exportarImagenChart(this.chartInstance, options); }
}
