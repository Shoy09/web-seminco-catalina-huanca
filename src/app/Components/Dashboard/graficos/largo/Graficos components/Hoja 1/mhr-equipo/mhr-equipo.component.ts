import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

@Component({
  selector: 'app-mhr-equipo',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './mhr-equipo.component.html',
  styleUrl: './mhr-equipo.component.css'
})
export class MhrEquipoComponent implements OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      //console.log('🔥 DATA MHR EQUIPO RECIBIDA:', this.data);
      this.updateChart();
    }
  }

  updateChart(): void {
    if (!this.data || this.data.length === 0) {
      // Opcional: mostrar gráfico vacío o no mostrar nada
      return;
    }

    // Preparar datos para el gráfico
    const xAxisData = this.data.map(item => 
      `${item.modelo_equipo || 'N/A'}`
    );
    
    const seriesData = this.data.map(item => item.fr_mhr_hp || 0);

    this.chartOptions = {
      title: {
        text: 'M/HR POR EQUIPO',
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
          return `<strong>${item.modelo_equipo}</strong><br/>
                  Metros perforados: ${item.metros_perforados?.toFixed(2) || 0} m<br/>
                  Dif. Percusión: ${item.dif_percusion?.toFixed(2) || 0}<br/>
                  <strong style="color: #e74c3c;">Rendimiento: ${params[0].value.toFixed(2)} m/hr</strong>`;
        }
      },
      grid: {
        left: '10%',
        right: '5%',
        top: '18%',
        bottom: '12%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          fontSize: 12,
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
        name: 'Metros/Hora',
        nameLocation: 'middle',
        nameGap: 45,
        min: 0,
        axisLabel: {
          fontSize: 11,
          formatter: '{value} m/hr'
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
          name: 'M/HR',
          type: 'bar',
          data: seriesData,
          itemStyle: {
            borderRadius: [5, 5, 0, 0],
            color: '#e74c3c',
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 5
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => `${Math.round(params.value)}`,
            fontWeight: 'bold',
            fontSize: 12,
            color: '#c0392b'
          },
          barWidth: '40%',
          barCategoryGap: '30%'
        }
      ]
    };
  }
}