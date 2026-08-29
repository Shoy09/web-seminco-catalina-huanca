import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, ToolboxComponent, DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS, CHART_SPLIT_LINE, CHART_BAR_SHADOW, CHART_AXIS_LABEL } from '../../../../../../../shared/chart-theme';
import { exportarImagenChart, PdfExportOptions } from 'src/app/config/config-pdf';

echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, ToolboxComponent, DataZoomComponent, CanvasRenderer]);

@Component({
  selector: 'app-produccion-promedio-dia',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './produccion-promedio-dia.component.html',
  styleUrl: './produccion-promedio-dia.component.css',
})
export class ProduccionPromedioDiaComponent implements OnChanges {
  @Input() data: any[] = [];
  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) this.actualizarGrafico();
  }

  // Promedio Metros x Día = SUM(METROS PERFORADOS) / DISTINCTCOUNT(FECHA) por equipo
  actualizarGrafico(): void {
    if (!this.data || this.data.length === 0) { this.chartOptions = {}; return; }

    const datos = [...this.data]
      .filter(d => Number(d.promedioMetrosDia || 0) > 0)
      .sort((a, b) => Number(b.promedioMetrosDia) - Number(a.promedioMetrosDia));

    if (!datos.length) { this.chartOptions = {}; return; }

    const equipos = datos.map(d => d.n_equipo || d.modeloEquipo || 'SIN EQUIPO');
    const valores = datos.map(d => Number(d.promedioMetrosDia || 0));
    const maxValor = Math.max(...valores, 1);
    const escalaMax = Math.ceil(maxValor / 20) * 20;
    const porcentajeVisible = equipos.length > 8 ? (8 / equipos.length) * 100 : 100;

    this.chartOptions = {
      tooltip: {
        trigger: 'axis', axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = datos[params[0].dataIndex];
          return `<strong>${item.n_equipo || item.modeloEquipo || 'SIN EQUIPO'}</strong><br/><hr style="margin:5px 0"/>
            Promedio m/día: <b>${Number(item.promedioMetrosDia || 0).toFixed(2)} m</b><br/>
            Total metros: ${Number(item.metrosPerforados || 0).toFixed(2)} m<br/>
            Días con datos: ${item.diasConDatos || 0}`;
        },
      },
      grid: { left: '8%', right: '5%', top: '18%', bottom: '25%', containLabel: true },
      xAxis: {
        type: 'category', data: equipos,
        axisLabel: { interval: 0, rotate: equipos.length > 6 ? 35 : 0, fontSize: 10, fontWeight: 'bold', color: CHART_COLORS.grey },
        axisLine: { lineStyle: { color: CHART_COLORS.axis } }, axisTick: { alignWithLabel: true },
      },
      yAxis: { type: 'value', min: 0, max: escalaMax, axisLabel: { formatter: '{value} m', ...CHART_AXIS_LABEL }, splitLine: CHART_SPLIT_LINE },
      dataZoom: [
        { type: 'slider', show: equipos.length > 8, xAxisIndex: 0, start: 0, end: porcentajeVisible, height: 18, bottom: 25 },
        { type: 'inside', xAxisIndex: 0, start: 0, end: porcentajeVisible },
      ],
      series: [{
        type: 'bar', barWidth: '50%',
        data: valores.map(v => ({ value: v, itemStyle: { color: CHART_COLORS.dustyGreen } })),
        itemStyle: { borderRadius: [6, 6, 0, 0], ...CHART_BAR_SHADOW },
        label: { show: true, position: 'top', formatter: (p: any) => `${Number(p.value).toFixed(1)} m`, fontWeight: 'bold', fontSize: 10, color: CHART_COLORS.grey },
        emphasis: { focus: 'series' },
        showBackground: true, backgroundStyle: { color: 'rgba(180,180,180,0.1)', borderRadius: 5 },
      }],
    };
  }

  private chartInstance: any;
  onChartInit(ec: any): void { this.chartInstance = ec; }
  getChartImage(options?: PdfExportOptions): string | null { return exportarImagenChart(this.chartInstance, options); }
}


