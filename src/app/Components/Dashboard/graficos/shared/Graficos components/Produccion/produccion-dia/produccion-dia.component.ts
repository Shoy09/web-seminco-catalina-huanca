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
  selector: 'app-produccion-dia',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './produccion-dia.component.html',
  styleUrl: './produccion-dia.component.css',
})
export class ProduccionDiaComponent implements OnChanges {
  @Input() data: any[] = [];
  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    if (!this.data || this.data.length === 0) { this.chartOptions = {}; return; }

    const datos = [...this.data].sort((a, b) => String(a.key).localeCompare(String(b.key)));
    const valores = datos.map(d => Number(d.metrosPerforados || 0));
    const maxValor = Math.max(...valores, 1);
    const escalaMax = Math.ceil(maxValor / 50) * 50;
    const porcentajeVisible = datos.length > 10 ? 35 : 100;

    // Agrupar labels por mes para el gráfico
    const graphics: any[] = [];
    const mesesPos = new Map<string, { start: number; end: number }>();
    const MESES = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
    let mesActual = ''; let inicio = 0;
    datos.forEach((d, i) => {
      const partes = String(d.key || '').split('-');
      const nombreMes = MESES[Number(partes[1]) - 1] || '';
      if (nombreMes !== mesActual) {
        if (mesActual) mesesPos.set(mesActual, { start: inicio, end: i - 1 });
        mesActual = nombreMes; inicio = i;
      }
    });
    if (mesActual) mesesPos.set(mesActual, { start: inicio, end: datos.length - 1 });

    mesesPos.forEach((pos, mes) => {
      const centro = (pos.start + pos.end + 1) / 2;
      graphics.push({ type: 'text', left: `${centro * (100 / datos.length)}%`, bottom: 8,
        style: { text: mes, fill: '#333', fontSize: 12, fontWeight: 'bold', fontFamily: 'Arial' }, z: 100 });
    });

    this.chartOptions = {
      tooltip: {
        trigger: 'axis', axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = datos[params[0].dataIndex];
          return `<strong>${item.periodo}</strong><br/><hr style="margin:5px 0"/>
            Metros perforados: <b>${Number(item.metrosPerforados || 0).toFixed(2)} m</b><br/>
            Horas operativas: ${Number(item.horasOperativas || 0).toFixed(2)} h<br/>
            Operaciones: ${item.cantidadOperaciones || 0}`;
        },
      },
      grid: { left: '8%', right: '5%', top: '18%', bottom: '25%', containLabel: true },
      xAxis: {
        type: 'category',
        data: datos.map(d => d.key),
        axisLabel: { interval: 0, margin: 18, fontSize: 11, fontWeight: 'bold', color: CHART_COLORS.grey,
          formatter: (v: string) => v.split('-')[2] || v },
        axisLine: { lineStyle: { color: CHART_COLORS.axis } },
        axisTick: { alignWithLabel: true },
      },
      yAxis: { type: 'value', min: 0, max: escalaMax, axisLabel: { formatter: '{value} m', ...CHART_AXIS_LABEL }, splitLine: CHART_SPLIT_LINE },
      dataZoom: [
        { type: 'slider', show: datos.length > 10, xAxisIndex: 0, start: 0, end: porcentajeVisible, height: 18, bottom: 25 },
        { type: 'inside', xAxisIndex: 0, start: 0, end: porcentajeVisible },
      ],
      series: [{
        type: 'bar', barWidth: '50%',
        data: valores.map(v => ({ value: v, itemStyle: { color: CHART_COLORS.catalinaGreen } })),
        itemStyle: { borderRadius: [6, 6, 0, 0], ...CHART_BAR_SHADOW },
        label: { show: true, position: 'top', formatter: (p: any) => `${Number(p.value).toFixed(1)}`, fontWeight: 'bold', fontSize: 10, color: CHART_COLORS.grey },
        emphasis: { focus: 'series' },
        showBackground: true, backgroundStyle: { color: 'rgba(180,180,180,0.1)', borderRadius: 5 },
      }],
      graphic: graphics,
    };
  }

  private chartInstance: any;
  onChartInit(ec: any): void { this.chartInstance = ec; }
  getChartImage(options?: PdfExportOptions): string | null { return exportarImagenChart(this.chartInstance, options); }
}


