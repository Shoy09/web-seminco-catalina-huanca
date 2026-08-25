import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

@Component({
  selector: 'app-metros-perforados-disparo',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './metros-perforados-disparo.component.html',
  styleUrl: './metros-perforados-disparo.component.css'
})
export class MetrosPerforadosDisparoComponent implements OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      //console.log('📦 Data recibida en metros-perforados-disparo:', this.data);
      this.updateChart();
    }
  }

  updateChart(): void {
    if (!this.data || this.data.length === 0) { return; }

    const datosFiltrados = this.data.filter(item => Number(item.m_disparo_fr || 0) > 0);
    if (!datosFiltrados.length) { this.chartOptions = {}; return; }

    const xAxisData = datosFiltrados.map(item =>
      `${item.modelo_equipo || 'N/A'}\n(${item.seccion || 'N/A'})`
    );

    const seriesData = datosFiltrados.map(item => item.m_disparo_fr || 0);

    this.chartOptions = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const item = this.data[params[0].dataIndex];
          return `${item.modelo_equipo} (${item.seccion})<br/>Metros/Disparo: ${params[0].value.toFixed(2)} m`;
        }
      },
      grid: {
        left: '12%',      // Aumentado para dar más espacio a las etiquetas del eje Y
        right: '5%',
        top: '18%',       // Reducido para dar más espacio a las barras
        bottom: '18%',    // Aumentado IMPORTANTE: más espacio para etiquetas del eje X de 2 líneas
        containLabel: false // Cambiado a false para control manual
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          fontSize: 11,
          fontWeight: 'bold',
          rotate: 0,
          interval: 0,
          formatter: (value: string) => value,
          margin: 10,     // Margen entre etiqueta y eje
          lineHeight: 20  // Altura de línea para texto de 2 líneas
        },
        axisLine: {
          lineStyle: {
            color: '#333'
          }
        },
        axisTick: {
          alignWithLabel: true  // Alinear ticks con las etiquetas
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        axisLabel: {
          fontSize: 11,
          formatter: '{value} m'
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#ccc'
          }
        }
      },
      series: [
        {
          type: 'bar',
          data: seriesData,
          itemStyle: {
            borderRadius: [5, 5, 0, 0],
            color: '#3498db',
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 5
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => `${Math.round(params.value)} m`,
            fontWeight: 'bold',
            fontSize: 12,
            color: '#2980b9'
          },
          barWidth: '40%',      // Reducido de 50% a 40% para barras más delgadas
          barCategoryGap: '30%' // Espacio entre categorías
        }
      ]
    };
  }
}