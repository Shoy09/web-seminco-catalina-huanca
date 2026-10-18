import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, ScatterChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, DataZoomComponent, ToolboxComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { LabelLayout } from 'echarts/features';
import { PuntoScalamin } from './scalamin-indicadores';
import { SOSTENIMIENTO_CHART_COLORS } from 'src/app/config/sostenimiento-chart-colors';
import { PuntoTurnoScalamin } from './scalamin-turnos';

echarts.use([LabelLayout, BarChart, LineChart, ScatterChart, GridComponent, TooltipComponent, DataZoomComponent, ToolboxComponent, LegendComponent, CanvasRenderer]);

@Component({
  selector: 'app-grafico-scalamin', standalone: true,
  imports: [CommonModule, NgxEchartsDirective], providers: [provideEchartsCore({ echarts })],
  template: `<article class="indicator-card"><h2>{{ titulo }}</h2><div class="chart-wrap"><div *ngIf="turnoAnalisis ? puntosTurno.length : puntos.length" echarts [options]="options" [autoResize]="true" class="chart"></div></div></article>`,
  styleUrl: '../../sostenimiento/principal-grafico-sostenimiento/indicador-power-bi.component.css',
})
export class GraficoScalaminComponent implements OnChanges {
  @Input() titulo = '';
  @Input() puntos: PuntoScalamin[] = [];
  @Input() unidad = '';
  @Input() horizontal = false;
  @Input() pareto = false;
  @Input() showZoom = false;
  @Input() mensaje = '';
  @Input() turnoAnalisis: 'día' | 'noche' | '' = '';
  @Input() puntosTurno: PuntoTurnoScalamin[] = [];
  options: echarts.EChartsCoreOption = {};

  ngOnChanges(): void {
    if (this.turnoAnalisis) {
      this.actualizarAnalisisTurno();
      return;
    }
    const formato = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 });
    const etiqueta = (unidad: string, position: string) => ({
      show: true,
      position,
      distance: 6,
      color: '#344963',
      fontSize: 10,
      fontWeight: 600,
      formatter: (params: { value: number }) => `${formato.format(params.value)}${unidad ? ` ${unidad}` : ''}`,
    });
    const categorias = {
      type: 'category', data: this.puntos.map(p => p.label),
      axisLabel: {
        hideOverlap: true, fontSize: 10, color: '#526477',
        rotate: !this.horizontal && this.puntos.length > 7 ? 35 : 0,
        formatter: (valor: string) => valor.length > 18 ? `${valor.slice(0, 17)}…` : valor,
      },
    };
    const valores = {
      type: 'value', name: this.unidad, ...(this.unidad === '%' ? { max: 100 } : {}),
      axisLabel: { fontSize: 10, color: '#526477', formatter: this.unidad === '%' ? '{value}%' : undefined },
      splitLine: { lineStyle: { type: 'dashed', color: '#E1E8EF' } },
    };
    this.options = {
      color: SOSTENIMIENTO_CHART_COLORS,
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, renderMode: 'richText' },
      legend: { show: this.pareto, bottom: 0, textStyle: { fontSize: 10, color: '#526477' } },
      toolbox: { feature: { saveAsImage: { title: 'Guardar imagen', name: this.titulo } } },
      grid: { left: 48, right: this.horizontal ? 90 : this.pareto ? 60 : 24, top: 48, bottom: this.showZoom ? 80 : this.puntos.length > 7 ? 78 : this.pareto ? 48 : 38, containLabel: true },
      xAxis: this.horizontal ? valores : categorias,
      yAxis: this.horizontal ? { ...categorias, inverse: true } : [valores, ...(this.pareto ? [{ type: 'value', min: 0, max: 100, name: '%', axisLabel: { formatter: '{value}%', fontSize: 10, color: '#526477' }, splitLine: { show: false } }] : [])],
      dataZoom: this.showZoom ? [{ type: 'slider', ...(this.horizontal ? { yAxisIndex: 0 } : { xAxisIndex: 0, bottom: this.pareto ? 24 : 4 }) }] : [],
      series: [{ type: 'bar', name: this.unidad || this.titulo, data: this.puntos.map(p => Number(p.valor.toFixed(2))), barMaxWidth: 34, label: etiqueta(this.unidad, this.horizontal ? 'right' : 'top'), labelLayout: { moveOverlap: 'shiftY', hideOverlap: true }, itemStyle: { borderRadius: this.horizontal ? [0, 5, 5, 0] : [5, 5, 0, 0] } },
        ...(this.pareto ? [{ type: 'line', name: 'Acumulado %', yAxisIndex: 1, smooth: true, symbolSize: 6, label: etiqueta('%', 'top'), labelLayout: { moveOverlap: 'shiftY', hideOverlap: true }, lineStyle: { width: 3 }, data: this.puntos.map(p => Number(p.acumulado?.toFixed(2))) }] : [])],
    };
  }

  private actualizarAnalisisTurno(): void {
    const horaTexto = (decimal: number): string => {
      const minutos = Math.round(decimal * 60) % 1440;
      return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
    };
    const grupos = [...new Set(this.puntosTurno.map(p => p.grupo))].sort();
    this.options = {
      color: SOSTENIMIENTO_CHART_COLORS,
      tooltip: {
        trigger: 'item', renderMode: 'richText',
        formatter: (param: { seriesName: string; data: { value: [number, string]; codigo: string } }) =>
          `${param.data.value[1]}\n${param.seriesName}\nHora: ${horaTexto(param.data.value[0])}\nCódigo: ${param.data.codigo}`,
      },
      legend: { type: 'scroll', top: 0, textStyle: { color: '#526477', fontSize: 10 } },
      toolbox: { feature: { saveAsImage: { title: 'Guardar imagen', name: this.titulo } } },
      grid: { left: 64, right: 40, top: 48, bottom: this.showZoom ? 64 : 34, containLabel: true },
      xAxis: {
        type: 'value', min: this.turnoAnalisis === 'noche' ? 19 : 7,
        max: this.turnoAnalisis === 'noche' ? 31 : 19,
        axisLabel: { formatter: horaTexto, color: '#526477', fontSize: 10 },
        splitLine: { lineStyle: { type: 'dashed', color: '#E1E8EF' } },
      },
      yAxis: { type: 'category', data: [...new Set(this.puntosTurno.map(p => p.y))].sort(), axisLabel: { color: '#526477' } },
      dataZoom: this.showZoom ? [{ type: 'slider', xAxisIndex: 0, bottom: 4 }] : [],
      series: grupos.map(grupo => ({
        name: grupo, type: 'scatter', symbolSize: 11,
        labelLayout: { hideOverlap: true },
        emphasis: { label: { show: true } },
        label: { show: true, position: 'top', color: '#344963', fontSize: 10, formatter: (param: { value: [number, string] }) => horaTexto(param.value[0]) },
        data: this.puntosTurno.filter(p => p.grupo === grupo).map(p => ({ value: [p.x, p.y], codigo: p.codigo })),
      })),
    };
  }
}
