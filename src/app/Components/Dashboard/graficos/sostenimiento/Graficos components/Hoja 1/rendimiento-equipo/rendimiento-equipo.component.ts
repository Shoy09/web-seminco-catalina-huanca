import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent, ToolboxComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  CanvasRenderer
]);

@Component({
  selector: 'app-rendimiento-equipo',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './rendimiento-equipo.component.html',
  styleUrl: './rendimiento-equipo.component.css'
})
export class RendimientoEquipoComponent implements OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = this.getBaseOptions();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      //console.log('📊 DATA RENDIMIENTO:', this.data);
      this.actualizarGrafico();
    }
  }

  // 🔥 BASE DEL GRAFICO (ESTÁTICO)
  getBaseOptions() {
    return {
      title: {
        text: 'DM y UTI por Equipo (%)',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          let result = `${params[0].axisValue}<br/>`;
          params.forEach((p: any) => {
            result += `${p.seriesName}: ${p.value}%<br/>`;
          });
          return result;
        }
      },
      legend: {
  data: ['DM', 'UTI'],
  bottom: 5,
  left: 'center',
  orient: 'horizontal',
  itemWidth: 18,
  itemHeight: 10,
  textStyle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2c3e50'
  }
},
      grid: {
        left: '8%',
        right: '5%',
        top: '18%',
        bottom: '12%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: [],
        axisLabel: {
          interval: 0,
          fontSize: 12,
          lineHeight: 16,
          fontWeight: 'bold',
          color: '#333'
        },
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        name: 'Porcentaje (%)',
        nameLocation: 'middle',
        nameGap: 45,
        min: 0,
        max: 100,
        interval: 20,
        axisLabel: {
          formatter: '{value}%'
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#ccc'
          }
        }
      },
      series: []
    };
  }

  // 🚀 TRANSFORMAR DATA → GRAFICO
  actualizarGrafico(): void {
    if (!this.data || this.data.length === 0) return;

    const categorias = this.data.map(item =>
      `${item.modeloEquipo}\n(${item.seccion || 'N/A'})`
    );

    const dmData = this.data.map(item =>
      Number((item.DM_SOS * 100).toFixed(2))
    );

    const utiData = this.data.map(item =>
      Number((item.UTI_SOS * 100).toFixed(2))
    );

    this.chartOptions = {
      ...this.chartOptions,

      xAxis: {
        ...this.chartOptions.xAxis,
        data: categorias
      },

      series: [
        {
          name: 'DM',
          type: 'bar',
          data: dmData,
          barGap: '20%',
          itemStyle: {
            borderRadius: [5, 5, 0, 0],
            color: '#3498db'
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}%',
            fontWeight: 'bold'
          },
          barWidth: '35%'
        },
        {
          name: 'UTI',
          type: 'bar',
          data: utiData,
          itemStyle: {
            borderRadius: [5, 5, 0, 0],
            color: '#2ecc71'
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}%',
            fontWeight: 'bold'
          },
          barWidth: '35%'
        }
      ]
    };
  }
}