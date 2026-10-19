import { Component, Input, OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { DataZoomComponent } from 'echarts/components';
import { IndicadorPowerBiComponent } from '../../sostenimiento/principal-grafico-sostenimiento/indicador-power-bi.component';

echarts.use([DataZoomComponent]);

/** Reutiliza la presentación de gráficos del proyecto y agrega el zoom de Scalamin. */
@Component({
  selector: 'app-grafico-utilitario', standalone: true,
  imports: [CommonModule, NgxEchartsDirective], providers: [provideEchartsCore({ echarts })],
  templateUrl: '../../sostenimiento/principal-grafico-sostenimiento/indicador-power-bi.component.html',
  styleUrl: '../../sostenimiento/principal-grafico-sostenimiento/indicador-power-bi.component.css',
})
export class GraficoUtilitarioComponent extends IndicadorPowerBiComponent implements OnChanges {
  @Input() showZoom = false;

  override ngOnChanges(changes: SimpleChanges): void {
    if (!this.grafico) return;
    super.ngOnChanges({ ...changes, grafico: new SimpleChange(null, this.grafico, false) });
    if (!['bar', 'combo', 'pareto', 'line'].includes(this.grafico.tipo)) return;
    // Tooltip richText evita interpretar los nombres u observaciones como HTML.
    const formato = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 });
    this.opciones = {
      ...this.opciones,
      tooltip: { trigger: 'axis', renderMode: 'richText', axisPointer: { type: 'shadow' },
        formatter: (params: { axisValueLabel: string; seriesName: string; value: number; seriesIndex: number }[]) =>
          [params[0]?.axisValueLabel || '', ...params.map(p => {
            const unidad = this.grafico.series?.[p.seriesIndex]?.ejeSecundario
              ? this.grafico.tipo === 'pareto' ? '%' : this.grafico.unidadSecundaria : this.grafico.unidad;
            return `${p.seriesName}: ${formato.format(p.value)} ${unidad || ''}`;
          })].join('\n') },
      toolbox: { feature: { saveAsImage: { title: 'Guardar imagen', name: this.grafico.titulo } } },
      ...(this.showZoom ? {
        grid: { ...this.opciones.grid, bottom: 84 },
        dataZoom: [{ type: 'slider', bottom: 24, ...(this.esRanking ? { yAxisIndex: 0 } : { xAxisIndex: 0 }) }],
      } : {}),
    };
  }
}
