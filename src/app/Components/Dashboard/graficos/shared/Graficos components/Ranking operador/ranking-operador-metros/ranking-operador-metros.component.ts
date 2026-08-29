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
  selector: 'app-ranking-operador-metros',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './ranking-operador-metros.component.html',
  styleUrl: './ranking-operador-metros.component.css',
})
export class RankingOperadorMetrosComponent implements OnChanges {
  @Input() data: any[] = [];
  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    if (!this.data || this.data.length === 0) { this.chartOptions = {}; return; }

    const datos = [...this.data]
      .filter(d => Number(d.metrosPerforados || 0) > 0)
      .sort((a, b) => Number(b.metrosPerforados) - Number(a.metrosPerforados));

    if (!datos.length) { this.chartOptions = {}; return; }

    const maxValor = Math.max(...datos.map(d => Number(d.metrosPerforados)), 1);
    const escalaMax = Math.ceil(maxValor / 50) * 50;
    const porcentajeVisible = datos.length > 10 ? (10 / datos.length) * 100 : 100;

    const labels = datos.map(d => {
      const eq = d.equipo || '';
      return eq ? `${d.operador} (${eq})` : d.operador;
    });
    const valores = datos.map(d => Number(d.metrosPerforados || 0));

    this.chartOptions = {
      tooltip: {
        trigger: 'axis', axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = datos[params[0].dataIndex];
          const puesto = params[0].dataIndex + 1;
          const medalla = puesto === 1 ? '🥇 ' : puesto === 2 ? '🥈 ' : puesto === 3 ? '🥉 ' : `#${puesto} `;
          return `<strong>${medalla}${item.operador}</strong><br/>
            <hr style="margin:5px 0"/>
            Equipo: ${item.equipo || '-'}<br/>
            Metros perforados: <b>${Number(item.metrosPerforados || 0).toFixed(2)} m</b><br/>
            Operaciones: ${item.cantidadOperaciones || 0}`;
        },
      },
      grid: { left: '3%', right: '12%', top: '10%', bottom: '10%', containLabel: true },
      xAxis: { type: 'value', min: 0, max: escalaMax, axisLabel: { formatter: '{value} m', ...CHART_AXIS_LABEL }, splitLine: CHART_SPLIT_LINE },
      yAxis: {
        type: 'category', data: labels, inverse: true,
        axisLabel: { interval: 0, fontSize: 10, fontWeight: 'bold', color: CHART_COLORS.grey,
          formatter: (val: string, idx: number) => idx === 0 ? `🥇 ${val}` : idx === 1 ? `🥈 ${val}` : idx === 2 ? `🥉 ${val}` : `${idx+1}. ${val}` },
        axisTick: { show: false },
      },
      dataZoom: [
        { type: 'slider', show: datos.length > 10, yAxisIndex: 0, start: 0, end: porcentajeVisible, width: 14, right: 8 },
        { type: 'inside', yAxisIndex: 0, start: 0, end: porcentajeVisible },
      ],
      series: [{
        type: 'bar', barMaxWidth: 36,
        data: valores.map((v, i) => {
          const color = i === 0 ? '#f39c12' : i === 1 ? '#bdc3c7' : i === 2 ? '#cd7f32' : CHART_COLORS.catalinaGreen;
          const pct = v / escalaMax;
          const inside = pct > 0.45;
          return {
            value: v,
            itemStyle: { color, borderRadius: [0, 6, 6, 0], ...CHART_BAR_SHADOW },
            label: { show: true, position: inside ? 'insideRight' : 'right', distance: inside ? 8 : 6,
              formatter: `${v.toFixed(1)} m`, fontWeight: 'bold', fontSize: 10, color: inside ? '#fff' : CHART_COLORS.grey },
          };
        }),
        label: { show: false },
        emphasis: { focus: 'series' },
        showBackground: true, backgroundStyle: { color: 'rgba(180,180,180,0.08)', borderRadius: 5 },
      }],
    };
  }

  private chartInstance: any;
  onChartInit(ec: any): void { this.chartInstance = ec; }
  getChartImage(options?: PdfExportOptions): string | null { return exportarImagenChart(this.chartInstance, options); }
}
