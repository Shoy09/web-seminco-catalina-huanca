import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { exportarImagenChart, PdfExportOptions } from 'src/app/config/config-pdf';
import { SOSTENIMIENTO_CHART_COLORS } from 'src/app/config/sostenimiento-chart-colors';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, PieChart, CanvasRenderer]);

@Component({
  selector: 'app-pernos-instalados-tipo',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './pernos-instalados-tipo.component.html',
  styleUrl: './pernos-instalados-tipo.component.css'
})
export class PernosInstaladosTipoComponent implements OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      if (Array.isArray(this.data)) {
        setTimeout(() => {
          this.generarGrafico();
        }, 0);
      }
    }
  }

  generarGrafico() {
    // Si no hay datos o está vacío, no mostrar nada (gráfico vacío)
    if (!this.data || this.data.length === 0) {
      this.chartOptions = {};
      return;
    }

    // Agrupar por tipo de perno
    const agrupado: { [key: string]: number } = {};

    this.data.forEach(item => {
      const tipo = item.tipoPernos || item.tipo || 'SIN TIPO';
      const total = Number(item.total) || Number(item.cantidad) || 0;

      if (!agrupado[tipo]) {
        agrupado[tipo] = 0;
      }
      agrupado[tipo] += total;
    });

    // Convertir a formato echarts
    const dataGrafico = Object.keys(agrupado).map(tipo => ({
      name: tipo,
      value: agrupado[tipo]
    }));

    this.chartOptions = this.getOpcionesGrafico(dataGrafico);
  }

  getOpcionesGrafico(data: any[]) {
    // Asignar color aleatorio de la paleta de azules a cada dato
    const datosConColor = data.map((item, index) => ({
      ...item,
      itemStyle: {
        color: SOSTENIMIENTO_CHART_COLORS[index % SOSTENIMIENTO_CHART_COLORS.length],
      }
    }));

    return {
      color: SOSTENIMIENTO_CHART_COLORS,
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} pernos ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 5,
        left: 'center',
        data: data.map(d => d.name),
        itemWidth: 18,
        itemHeight: 10,
        textStyle: {
          fontSize: 11,
          fontWeight: 'bold',
          color: '#2c3e50'
        }
      },
      series: [
        {
          type: 'pie',
          radius: '55%',
          center: ['50%', '55%'],
          data: datosConColor,
          label: {
            show: true,
            formatter: '{b}\n{c} ({d}%)',
            fontSize: 12,
            fontWeight: 'bold'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            },
            scale: true,
            scaleSize: 10
          },
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
          }
        }
      ]
    };
  }

  private chartInstance: any;
  onChartInit(ec: any): void { this.chartInstance = ec; }
  getChartImage(options?: PdfExportOptions): string | null {
    return exportarImagenChart(this.chartInstance, options);
  }
}