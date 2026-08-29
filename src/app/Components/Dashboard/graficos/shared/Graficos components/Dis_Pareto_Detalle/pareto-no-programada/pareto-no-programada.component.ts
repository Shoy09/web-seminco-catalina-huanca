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
import {
  CHART_AXIS_LABEL,
  CHART_BAR_SHADOW,
  CHART_COLORS,
  CHART_PARETO,
  CHART_SPLIT_LINE,
} from '../../../../../../../shared/chart-theme';
import { exportarImagenChart, PdfExportOptions } from 'src/app/config/config-pdf';

echarts.use([
  BarChart, LineChart, TitleComponent, TooltipComponent,
  GridComponent, ToolboxComponent, DataZoomComponent, LegendComponent, CanvasRenderer,
]);

@Component({
  selector: 'app-pareto-no-programadas',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './pareto-no-programada.component.html',
  styleUrl: './pareto-no-programada.component.css',
})
export class ParetoNoProgramadasComponent implements OnChanges {
  @Input() data: any[] = [];
  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    if (!this.data || this.data.length === 0) { this.chartOptions = {}; return; }

    // Ordenar descendente por horasTotales, excluir sin observación
    const datos = [...this.data]
      .filter(d => {
        const obs = String(d.observacion || '').trim().toUpperCase();
        return obs && obs !== 'SIN OBSERVACIÓN' && obs !== 'SIN OBSERVACION';
      })
      .sort((a, b) => Number(b.horasTotales || 0) - Number(a.horasTotales || 0));

    if (!datos.length) { this.chartOptions = {}; return; }

    const total = datos.reduce((s, d) => s + Number(d.horasTotales || 0), 0);

    // Calcular acumulado % (ParetoObs%)
    let acum = 0;
    const paretoObs = datos.map(d => {
      acum += Number(d.horasTotales || 0);
      return total > 0 ? Number(((acum / total) * 100).toFixed(2)) : 0;
    });

    const observaciones = datos.map(d => d.observacion || 'SIN OBSERVACIÓN');
    const horas = datos.map(d => Number(d.horasTotales || 0));
    const maxHoras = Math.max(...horas, 1);
    const escalaMax = Math.ceil(maxHoras / 5) * 5;
    const porcentajeVisible = observaciones.length > 8 ? (8 / observaciones.length) * 100 : 100;

    this.chartOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const index = params[0].dataIndex;
          const item = datos[index];
          const h = Number(item.horasTotales || 0);
          const pct = total > 0 ? ((h / total) * 100).toFixed(1) : '0.0';
          const codigos = (item.codigosRelacionados || []).join(', ');
          return `
            <strong>${item.observacion || 'SIN OBSERVACIÓN'}</strong><br/>
            <hr style="margin:5px 0"/>
            Horas: <b>${h.toFixed(2)} h</b><br/>
            % individual: ${pct}%<br/>
            Pareto acumulado: <b>${paretoObs[index].toFixed(1)}%</b><br/>
            Registros: ${item.cantidadRegistros || 0}<br/>
            ${codigos ? `Códigos: ${codigos}` : ''}
          `;
        },
      },
      grid: { left: '8%', right: '8%', top: '15%', bottom: '28%', containLabel: true },
      xAxis: {
        type: 'category',
        data: observaciones,
        axisLabel: {
          interval: 0,
          fontSize: 10,
          fontWeight: 'bold',
          color: CHART_COLORS.grey,
          width: 90,
          overflow: 'break',
        },
        axisTick: { alignWithLabel: true },
        axisLine: { lineStyle: { color: CHART_COLORS.axis } },
      },
      yAxis: [
        {
          type: 'value',
          min: 0,
          max: escalaMax,
          axisLabel: { formatter: '{value} h', ...CHART_AXIS_LABEL },
          splitLine: CHART_SPLIT_LINE,
        },
        {
          type: 'value',
          min: 0,
          max: 100,
          interval: 20,
          axisLabel: { formatter: '{value}%', ...CHART_AXIS_LABEL },
          splitLine: { show: false },
          axisLine: { lineStyle: { color: CHART_COLORS.axis } },
        },
      ],
      dataZoom: [
        { type: 'slider', show: observaciones.length > 8, xAxisIndex: 0, start: 0, end: porcentajeVisible, height: 18, bottom: 25 },
        { type: 'inside', xAxisIndex: 0, start: 0, end: porcentajeVisible },
      ],
      series: [
        {
          type: 'bar',
          yAxisIndex: 0,
          barWidth: '55%',
          data: horas.map(v => ({ value: v, itemStyle: { color: CHART_PARETO.bar } })),
          itemStyle: { borderRadius: [6, 6, 0, 0], ...CHART_BAR_SHADOW },
          label: {
            show: true,
            position: 'top',
            formatter: (p: any) => `${Number(p.value).toFixed(2)} h`,
            fontWeight: 'bold',
            fontSize: 10,
            color: CHART_COLORS.grey,
          },
          emphasis: { focus: 'series' },
        },
        {
          type: 'line',
          yAxisIndex: 1,
          data: paretoObs,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { width: 3, color: CHART_PARETO.line },
          itemStyle: { color: CHART_PARETO.symbol },
          label: {
            show: true,
            position: 'top',
            formatter: (p: any) => `${Number(p.value).toFixed(1)}%`,
            fontSize: 10,
            fontWeight: 'bold',
            color: CHART_COLORS.grey,
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
