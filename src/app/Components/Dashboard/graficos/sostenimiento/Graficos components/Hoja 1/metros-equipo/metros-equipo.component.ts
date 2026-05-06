import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

@Component({
  selector: 'app-metros-equipo',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './metros-equipo.component.html',
  styleUrl: './metros-equipo.component.css'
})
export class MetrosEquipoComponent implements OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  // Paleta de colores azules
  private readonly paletaAzules: string[] = [
    '#1E88E5', // Azul intenso
    '#42A5F5', // Azul medio
    '#64B5F6', // Azul claro
    '#1565C0', // Azul oscuro
    '#1976D2', // Azul principal
    '#2196F3', // Azul estándar
    '#0D47A1', // Azul muy oscuro
    '#90CAF9', // Azul muy claro
    '#2C3E50', // Azul grisáceo
    '#2980B9'  // Azul petróleo
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.updateChart();
    }
  }

  updateChart(): void {
    if (!this.data || this.data.length === 0) {
      this.chartOptions = {};
      return;
    }

    // Preparar datos para el gráfico
    const xAxisData = this.data.map(item => 
      `${item.modeloEquipo || 'N/A'}`
    );
    
    const seriesData = this.data.map(item => Number(item.metros) || 0);
    
    // Calcular max redondeado hacia arriba (múltiplo de 20 para ejes limpios)
    const maxMetros = Math.max(...seriesData);
    const maxY = Math.ceil(maxMetros / 20) * 20;

    // Asignar colores azules a cada barra
    const coloresBarras = seriesData.map((_, index) => 
      this.paletaAzules[index % this.paletaAzules.length]
    );

    this.chartOptions = {
      title: {
        text: 'METROS PERFORADOS POR EQUIPO',
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
          return `<strong>${item.modeloEquipo}</strong><br/>
                  Metros perforados: <strong style="color: ${this.paletaAzules[params[0].dataIndex % this.paletaAzules.length]};">${params[0].value.toFixed(2)} m</strong>`;
        }
      },
      grid: {
        left: '12%',
        right: '8%',
        top: '15%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          fontSize: 11,
          fontWeight: 'bold',
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
        name: 'Metros',
        nameLocation: 'middle',
        nameGap: 50,
        min: 0,
        max: maxY,
        interval: maxY / 4,
        axisLabel: {
          fontSize: 10,
          formatter: '{value} m'
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: '#e0e0e0',
            width: 1
          }
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        }
      },
      series: [
        {
          name: 'Metros',
          type: 'bar',
          data: seriesData.map((value, index) => ({
            value: value,
            itemStyle: {
              color: coloresBarras[index]
            }
          })),
          itemStyle: {
            borderRadius: [5, 5, 0, 0],
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowBlur: 4
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => `${Math.round(params.value)} m`,
            fontWeight: 'bold',
            fontSize: 11,
            color: '#333',
            offset: [0, 5]
          },
          barWidth: '50%',
          barCategoryGap: '30%'
        }
      ]
    };
  }
}