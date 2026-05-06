import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

@Component({
  selector: 'app-horometros-jumbos',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './horometros-jumbos.component.html',
  styleUrl: './horometros-jumbos.component.css'
})
export class HorometrosJumbosComponent implements OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      //console.log('🔥 HORÓMETROS JUMBOS RECIBIDOS:', this.data);
      this.updateChart();
    }
  }

  updateChart(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    // Preparar datos para el gráfico
    const xAxisData = this.data.map(item => item.modelo_equipo || 'N/A');
    
    const dieselData = this.data.map(item => item.diesel || 0);
    const electricoData = this.data.map(item => item.electrico || 0);
    const percusionData = this.data.map(item => item.percusion || 0);

    // Calcular el valor máximo para el eje Y
    const allValues = [...dieselData, ...electricoData, ...percusionData];
    const maxValor = Math.max(...allValues);
    const yAxisMax = Math.ceil(maxValor * 1.2);

    this.chartOptions = {
      title: {
        text: 'HORÓMETROS DE JUMBOS FRONTONEROS',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#2c3e50'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const item = this.data[params[0].dataIndex];
          let result = `<strong>${item.modelo_equipo}</strong><br/>`;
          params.forEach((p: any) => {
            result += `${p.marker} ${p.seriesName}: ${p.value.toFixed(2)}<br/>`;
          });
          return result;
        }
      },
      legend: {
  data: ['H. Diesel', 'H. Eléctrico', 'H. Percusión'],
  bottom: 0,
  left: 'center',
  orient: 'horizontal',
  itemWidth: 30,
  itemHeight: 14,
  textStyle: {
    fontSize: 12,
    fontWeight: 'bold'
  }
},
      grid: {
        left: '10%',
        right: '8%',
        top: '20%',
        bottom: '12%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          fontSize: 13,
          fontWeight: 'bold',
          color: '#333',
          interval: 0,
          rotate: 0
        },
        axisLine: {
          lineStyle: {
            color: '#333'
          }
        },
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        name: 'Horas',
        nameLocation: 'middle',
        nameGap: 45,
        min: 0,
        max: yAxisMax,
        axisLabel: {
          fontSize: 12,
          formatter: '{value}'
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
          name: 'H. Diesel',
          type: 'bar',
          data: dieselData,
          itemStyle: {
            borderRadius: [5, 5, 0, 0],
            color: '#e74c3c',
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 5
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => `${params.value.toFixed(2)}`,
            fontWeight: 'bold',
            fontSize: 11,
            color: '#e74c3c'
          },
          barWidth: '20%',
          barGap: '0.2',
          barCategoryGap: '0.3'
        },
        {
          name: 'H. Eléctrico',
          type: 'bar',
          data: electricoData,
          itemStyle: {
            borderRadius: [5, 5, 0, 0],
            color: '#3498db',
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 5
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => `${params.value.toFixed(2)}`,
            fontWeight: 'bold',
            fontSize: 11,
            color: '#3498db'
          },
          barWidth: '20%',
          barGap: '0.2',
          barCategoryGap: '0.3'
        },
        {
          name: 'H. Percusión',
          type: 'bar',
          data: percusionData,
          itemStyle: {
            borderRadius: [5, 5, 0, 0],
            color: '#2ecc71',
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 5
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => `${params.value.toFixed(2)}`,
            fontWeight: 'bold',
            fontSize: 11,
            color: '#2ecc71'
          },
          barWidth: '20%',
          barGap: '0.2',
          barCategoryGap: '0.3'
        }
      ]
    };
  }
}