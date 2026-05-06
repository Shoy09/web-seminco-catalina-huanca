import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

@Component({
  selector: 'app-total-horometros',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './total-horometros.component.html',
  styleUrl: './total-horometros.component.css'
})
export class TotalHorometrosComponent implements OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      //console.log('🔥 TOTAL HORÓMETROS RECIBIDO:', this.data);
      this.updateChart();
    }
  }

  updateChart(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    // SUMAR todos los valores (sin agrupar por equipo)
    let totalDiesel = 0;
    let totalElectrico = 0;
    let totalPercusion = 0;

    this.data.forEach(item => {
      totalDiesel += item.diesel || 0;
      totalElectrico += item.electrico || 0;
      totalPercusion += item.percusion || 0;
    });

    // Preparar datos para el gráfico (una sola barra por tipo)
    const xAxisData = ['Horómetros'];
    
    const dieselData = [totalDiesel];
    const electricoData = [totalElectrico];
    const percusionData = [totalPercusion];

    // Calcular el valor máximo para el eje Y
    const allValues = [totalDiesel, totalElectrico, totalPercusion];
    const maxValor = Math.max(...allValues);
    const yAxisMax = Math.ceil(maxValor * 1.2);

    this.chartOptions = {
      title: {
        text: 'TOTAL HORÓMETROS',
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
          let result = `<strong>Totales</strong><br/>`;
          params.forEach((p: any) => {
            result += `${p.marker} ${p.seriesName}: ${p.value.toFixed(2)} horas<br/>`;
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
          fontSize: 14,
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
        name: 'Horas Totales',
        nameLocation: 'middle',
        nameGap: 45,
        min: 0,
        max: yAxisMax,
        axisLabel: {
          fontSize: 12,
          formatter: '{value} h'
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
            formatter: (params: any) => `${params.value.toFixed(1)} h`,
            fontWeight: 'bold',
            fontSize: 12,
            color: '#e74c3c'
          },
          barWidth: '25%',
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
            formatter: (params: any) => `${params.value.toFixed(1)} h`,
            fontWeight: 'bold',
            fontSize: 12,
            color: '#3498db'
          },
          barWidth: '25%',
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
            formatter: (params: any) => `${params.value.toFixed(1)} h`,
            fontWeight: 'bold',
            fontSize: 12,
            color: '#2ecc71'
          },
          barWidth: '25%',
          barGap: '0.2',
          barCategoryGap: '0.3'
        }
      ]
    };
  }
}