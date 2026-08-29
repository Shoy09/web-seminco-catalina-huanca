import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, ToolboxComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS, CHART_SPLIT_LINE, CHART_BAR_SHADOW, CHART_AXIS_LABEL } from '../../../../../../../shared/chart-theme';
import { exportarImagenChart, PdfExportOptions } from 'src/app/config/config-pdf';

echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, ToolboxComponent, CanvasRenderer]);

@Component({
  selector: 'app-produccion-guardia',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './produccion-guardia.component.html',
  styleUrl: './produccion-guardia.component.css',
})
export class ProduccionGuardiaComponent implements OnChanges {
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

    const guardias = datos.map(d => d.guardia || 'SIN GUARDIA');
    const valores = datos.map(d => Number(d.metrosPerforados || 0));
    const maxValor = Math.max(...valores, 1);
    const escalaMax = Math.ceil(maxValor / 50) * 50;

    this.chartOptions = {
      tooltip: {
        trigger: 'axis', axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = datos[params[0].dataIndex];
          return `<strong>Guardia ${item.guardia}</strong><br/><hr style="margin:5px 0"/>
            Metros perforados: <b>${Number(item.metrosPerforados || 0).toFixed(2)} m</b><br/>
            Horas operativas: ${Number(item.horasOperativas || 0).toFixed(2)} h<br/>
            Operaciones: ${item.cantidadOperaciones || 0}`;
        },
      },
      grid: { left: '5%', right: '12%', top: '10%', bottom: '10%', containLabel: true },
      xAxis: { type: 'value', min: 0, max: escalaMax, axisLabel: { formatter: '{value} m', ...CHART_AXIS_LABEL }, splitLine: CHART_SPLIT_LINE },
      yAxis: { type: 'category', data: guardias, axisLabel: { fontSize: 11, fontWeight: 'bold', color: CHART_COLORS.grey }, axisTick: { show: false } },
      series: [{
        type: 'bar', barMaxWidth: 48,
        data: valores.map((v, i) => {
          const pct = v / escalaMax;
          const inside = pct > 0.45;
          return {
            value: v,
            itemStyle: { color: CHART_COLORS.catalinaGreen, borderRadius: [0, 6, 6, 0], ...CHART_BAR_SHADOW },
            label: { show: true, position: inside ? 'insideRight' : 'right', distance: inside ? 8 : 6,
              formatter: `${v.toFixed(1)} m`, fontWeight: 'bold', fontSize: 11, color: inside ? '#fff' : CHART_COLORS.grey },
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


