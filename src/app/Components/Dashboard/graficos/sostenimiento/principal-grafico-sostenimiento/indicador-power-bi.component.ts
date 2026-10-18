import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, GaugeChart, LineChart } from 'echarts/charts';
import { PieChart, ScatterChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { LabelLayout } from 'echarts/features';
import { ECharts } from 'echarts/core';
import { exportarImagenChart, PdfExportOptions } from 'src/app/config/config-pdf';
import { IndicadorGrafico } from './sostenimiento-indicadores.model';
import { SOSTENIMIENTO_CHART_COLORS } from 'src/app/config/sostenimiento-chart-colors';

echarts.use([
  LabelLayout,
  BarChart,
  GaugeChart,
  GridComponent,
  LegendComponent,
  LineChart,
  PieChart,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  CanvasRenderer,
]);

@Component({
  selector: 'app-indicador-power-bi',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './indicador-power-bi.component.html',
  styleUrl: './indicador-power-bi.component.css',
})
export class IndicadorPowerBiComponent implements OnChanges {
  @Input() grafico!: IndicadorGrafico;
  opciones: any = {};
  private chartInstance?: ECharts;

  get esRanking(): boolean {
    return Boolean(this.grafico && (this.grafico.horizontal || /operador|ranking/i.test(this.grafico.titulo)) &&
      this.grafico.tipo === 'bar' && !this.grafico.unidadSecundaria);
  }

  get altoGrafico(): number {
    return this.esRanking
      ? Math.max(275, (this.grafico.categorias?.length || 0) * Math.max(1, this.grafico.series?.length || 0) * 28 + 80)
      : 275;
  }

  private horaTexto(decimal: number): string {
    const minutos = Math.round(decimal * 60) % 1440;
    return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['grafico'] && this.grafico) this.actualizarOpciones();
  }

  formatear(valor: string | number): string {
    if (typeof valor !== 'number') return valor;
    return new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 }).format(valor);
  }

  onChartInit(chart: ECharts): void {
    this.chartInstance = chart;
  }

  getChartImage(options?: PdfExportOptions): string | null {
    return exportarImagenChart(this.chartInstance, options);
  }

  private actualizarOpciones(): void {
    const grafico = this.grafico;
    if (grafico.tipo === 'gauge') {
      const maximo = Math.max(grafico.maximo || 0, grafico.valor || 0, 1);
      this.opciones = {
        series: [{
          type: 'gauge',
          min: 0,
          max: maximo,
          progress: { show: true, width: 14, itemStyle: { color: SOSTENIMIENTO_CHART_COLORS[1] } },
          axisLine: { lineStyle: { width: 14, color: [[1, '#E8EEF3']] } },
          pointer: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            valueAnimation: true,
            formatter: (value: number) => this.formatear(value),
            fontSize: 22,
            fontWeight: 'bold',
            color: '#23384D',
            offsetCenter: [0, '10%'],
          },
          data: [{ value: grafico.valor || 0 }],
        }],
      };
      return;
    }

    const categorias = grafico.categorias || [];
    const series = grafico.series || [];
    const pareto = grafico.tipo === 'pareto';
    const rankingOperadores = /operador/i.test(grafico.titulo);
    const tieneEjeSecundario = pareto || Boolean(grafico.unidadSecundaria);
    if (grafico.tipo === 'pie') {
      this.opciones = {
        color: SOSTENIMIENTO_CHART_COLORS,
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { bottom: 0, textStyle: { color: '#526477', fontSize: 10 } },
        series: [{
          type: 'pie',
          radius: ['32%', '68%'],
          data: categorias.map((nombre, index) => ({
            name: nombre,
            value: series[0]?.valores[index] || 0,
          })),
          itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 2 },
          labelLayout: { hideOverlap: true },
          label: { formatter: (param: { value: number }) => this.formatear(param.value) },
        }],
      };
      return;
    }
    if (grafico.tipo === 'scatter') {
      const grupos = Array.from(new Set((grafico.puntos || []).map((punto) => punto.grupo || 'Registro')));
      this.opciones = {
        color: SOSTENIMIENTO_CHART_COLORS,
        tooltip: {
          trigger: 'item',
          formatter: (param: any) => {
            const punto = grafico.puntos?.find((item) =>
              item.grupo === param.seriesName &&
              item.x === param.value[0] &&
              item.y === param.value[1],
            );
            return `${param.value[1]}<br/>${param.seriesName}<br/>Hora: ${this.horaTexto(param.value[0])}<br/>${punto?.detalle || ''}`;
          },
        },
        legend: { type: 'scroll', top: 0, textStyle: { color: '#526477', fontSize: 10 } },
        grid: { left: 64, right: 40, top: 48, bottom: 34, containLabel: true },
        xAxis: {
          type: 'value',
          min: grafico.unidad === 'noche' ? 19 : 7,
          max: grafico.unidad === 'noche' ? 31 : 19,
          axisLabel: {
            formatter: (value: number) => {
              return this.horaTexto(value);
            },
          },
          splitLine: { lineStyle: { type: 'dashed', color: '#E1E8EF' } },
        },
        yAxis: { type: 'category', data: categorias, axisLabel: { color: '#526477' } },
        series: grupos.map((grupo) => ({
          name: grupo,
          type: 'scatter',
          symbolSize: 11,
          labelLayout: { hideOverlap: true },
          emphasis: { label: { show: true } },
          label: { show: true, position: 'top', color: '#344963', fontSize: 10, formatter: (param: { value: [number, string] }) => this.horaTexto(param.value[0]) },
          data: (grafico.puntos || [])
            .filter((punto) => (punto.grupo || 'Registro') === grupo)
            .map((punto) => [punto.x, punto.y]),
        })),
      };
      return;
    }
    this.opciones = {
      color: SOSTENIMIENTO_CHART_COLORS,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any[]) => {
          const categoria = params[0]?.axisValueLabel;
          const valores = params.map((param) => {
            const porcentaje = pareto && param.seriesIndex === 1;
            const unidad = porcentaje
              ? '%'
              : param.seriesIndex >= 0 && series[param.seriesIndex]?.ejeSecundario
                ? grafico.unidadSecundaria || ''
                : grafico.unidad || '';
            return `${param.marker} ${param.seriesName}: ${this.formatear(param.value)} ${unidad}`;
          }).join('<br/>');
          return `${categoria ? `<strong>${categoria}</strong><br/>` : ''}${valores}`;
        },
      },
      legend: {
        show: series.length > 1,
        bottom: 0,
        textStyle: { fontSize: 10, color: '#526477' },
      },
      grid: {
        left: 48,
        right: pareto ? 48 : 18,
        top: 48,
        bottom: categorias.length > 7
          ? (series.length > 1 ? 78 : 66)
          : series.length > 1 ? 48 : 38,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: categorias,
        axisLabel: {
          interval: 'auto',
          hideOverlap: true,
          rotate: rankingOperadores || categorias.length > 7 ? 35 : 0,
          align: rankingOperadores || categorias.length > 7 ? 'right' : 'center',
          margin: categorias.length > 7 ? 10 : 8,
          formatter: (value: string) => {
            const fecha = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (fecha) return `${fecha[3]}/${fecha[2]}`;
            return value.length > 18 ? `${value.slice(0, 17)}…` : value;
          },
          fontSize: 10,
          color: '#526477',
        },
      },
      yAxis: [
        {
          type: 'value',
          name: grafico.unidad || '',
          max: grafico.unidad === '%' ? 100 : undefined,
          axisLabel: {
            formatter: grafico.unidad === '%' ? '{value}%' : undefined,
            fontSize: 10,
            color: '#526477',
          },
          splitLine: { lineStyle: { type: 'dashed', color: '#E1E8EF' } },
        },
        ...(tieneEjeSecundario ? [{
          type: 'value',
          min: grafico.unidadSecundaria === '%' || pareto ? 0 : undefined,
          max: grafico.unidadSecundaria === '%' || pareto ? 100 : undefined,
          axisLabel: {
            formatter: grafico.unidadSecundaria === '%' || pareto
              ? '{value}%'
              : undefined,
            fontSize: 10,
            color: '#526477',
          },
          splitLine: { show: false },
        }] : []),
      ],
      series: series.map((item, index) => ({
        name: item.nombre,
        type: item.tipo || (grafico.tipo === 'line' ? 'line' : 'bar'),
        data: item.valores,
        yAxisIndex: (pareto && index === 1) || item.ejeSecundario ? 1 : 0,
        smooth: item.tipo === 'line' || grafico.tipo === 'line',
        showSymbol: item.tipo === 'line' || grafico.tipo === 'line',
        symbolSize: 6,
        barMaxWidth: 34,
        labelLayout: { moveOverlap: 'shiftY', hideOverlap: true },
        label: {
          show: true, position: 'top', distance: 6,
          fontSize: 10, color: '#344963', fontWeight: 600,
          formatter: (param: { value: number }) => this.formatear(param.value),
        },
        itemStyle: { borderRadius: item.tipo === 'line' ? 0 : [5, 5, 0, 0] },
        lineStyle: { width: 3 },
        areaStyle: grafico.tipo === 'line' ? { opacity: 0.08 } : undefined,
      })),
    };
    if (this.esRanking) {
      const orden = categorias.map((_, index) => index).sort((a, b) => (series[0]?.valores[b] || 0) - (series[0]?.valores[a] || 0));
      this.opciones.xAxis = this.opciones.yAxis[0];
      this.opciones.yAxis = {
        type: 'category', inverse: true, data: orden.map(index => categorias[index]),
        axisLabel: { color: '#526477', fontSize: 11, width: 170, overflow: 'truncate', interval: 0 },
      };
      this.opciones.grid = { left: 16, right: 90, top: 24, bottom: series.length > 1 ? 48 : 32, containLabel: true };
      this.opciones.series = this.opciones.series.map((serie: any, index: number) => ({
        ...serie, data: orden.map(i => series[index].valores[i]),
        label: { ...serie.label, position: 'right' },
        itemStyle: { borderRadius: [0, 5, 5, 0] },
      }));
    }
  }
}
