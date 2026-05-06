import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

@Component({
  selector: 'app-perforado-equipo',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './perforado-equipo.component.html',
  styleUrl: './perforado-equipo.component.css'
})
export class PerforadoEquipoComponent implements OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      //console.log('📦 Data recibida en metros-perforados equipo:', this.data);
      this.updateChart();
    }
  }

  updateChart(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    // Preparar datos para el gráfico
    const xAxisData = this.data.map(item => 
      `${item.modelo_equipo || 'N/A'}\n(${item.seccion || 'N/A'})`
    );
    
    const seriesData = this.data.map(item => item.metros_perforados || 0);

    this.chartOptions = {
      title: {
        text: 'PERFORADO POR EQUIPO',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold',
          color: '#333'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
  const item = this.data[params[0].dataIndex];
  const valor = Number(params[0].value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return `${item.modelo_equipo} (${item.seccion})<br/>
          Metros/Disparo: ${valor} m`;
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
        name: 'Metros',
        nameLocation: 'middle',
        nameGap: 45,
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
          name: 'Metros/Disparo',
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
            formatter: (params: any) => {
  return Number(params.value || 0).toLocaleString('en-US', {
    maximumFractionDigits: 0
  }) + ' m';
},
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