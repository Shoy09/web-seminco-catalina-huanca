import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent, ToolboxComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  CanvasRenderer
]);

@Component({
  selector: 'app-ranking-operador',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './ranking-operador.component.html',
  styleUrl: './ranking-operador.component.css'
})
export class RankingOperadorComponent implements OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      //console.log('🏆 RANKING OPERADOR RECIBIDO:', this.data);
      this.actualizarGrafico();
    }
  }

  actualizarGrafico(): void {
    if (!this.data || !this.data.length) return;

    // 🔥 Ordenar
    const sortedData = [...this.data].sort(
      (a, b) => (b.metros_perforados || 0) - (a.metros_perforados || 0)
    );

    // 🔥 Datos
    const operadores = sortedData.map(item => item.operador || 'N/A');
    const metrosPerforados = sortedData.map(item => item.metros_perforados || 0);
    const mhrValues = sortedData.map(item => item.fr_mhr_hp || 0);

    // 🔥 NOMBRES EN 2 LÍNEAS (CLAVE)
    const operadoresFormateados = operadores.map(op => {
      const palabras = op.split(' ');
      if (palabras.length >= 2) {
        const mitad = Math.ceil(palabras.length / 2);
        return palabras.slice(0, mitad).join(' ') + '\n' + palabras.slice(mitad).join(' ');
      }
      return op;
    });

    this.chartOptions = {
      title: {
        text: 'RANKING OPERADOR',
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
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const i = params[0].dataIndex;
          return `
            <strong>${operadores[i]}</strong><br/>
            ${params[0].marker} Metros: ${metrosPerforados[i].toFixed(2)} m<br/>
            ${params[1].marker} M/HR: ${mhrValues[i].toFixed(2)}
          `;
        }
      },

      legend: {
        data: ['Metros', 'M/HR'],
        top: 45
      },

      grid: {
        left: '10%',
        right: '10%',
        top: '20%',
        bottom: '22%', // 🔥 MÁS ESPACIO PARA NOMBRES
        containLabel: true
      },

      xAxis: {
        type: 'category',
        data: operadoresFormateados,
        axisLabel: {
          interval: 0,
          fontSize: 10,
          lineHeight: 14
        },
        axisTick: {
          alignWithLabel: true
        }
      },

      yAxis: {
        type: 'value',
        name: 'Metros',
        axisLabel: {
          formatter: '{value} m'
        },
        splitLine: {
          lineStyle: { type: 'dashed' }
        }
      },

      series: [
        {
          name: 'Metros',
          type: 'bar',
          data: metrosPerforados,
          barWidth: '45%',
          z: 1,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: '#4A90E2'
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 11,
            formatter: (p: any) => `${p.value.toFixed(0)}`
          }
        },

        {
          name: 'M/HR',
          type: 'line',
          data: mhrValues, // ✅ SIN ESCALAR
          smooth: true,
          symbol: 'circle',
          symbolSize: 7,
          z: 3, // 🔥 SIEMPRE ENCIMA
          lineStyle: {
            width: 2,
            color: '#E74C3C'
          },
          itemStyle: {
            color: '#E74C3C'
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 10,
            formatter: (p: any) => p.value.toFixed(0)
          }
        }
      ]
    };
  }
}