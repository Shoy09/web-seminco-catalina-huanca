import { Component, OnInit } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, ToolboxComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent,
  CanvasRenderer
]);

@Component({
  selector: 'app-disponibilidad-guardia',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './disponibilidad-guardia.component.html',
  styleUrl: './disponibilidad-guardia.component.css'
})
export class DisponibilidadGuardiaComponent implements OnInit {
  
  chartOptions: any = {};

  // Datos por tipo de guardia
  readonly datosPorGuardia = [
    { guardia: 'C', valor: 98, color: '#f9e79f' },
    { guardia: 'B', valor: 95, color: '#85c1e9' },
    { guardia: 'A', valor: 92, color: '#85c1e9' }
  ];

  ngOnInit(): void {
    this.actualizarGrafico();
  }

actualizarGrafico(): void {
  const guardias = this.datosPorGuardia.map(item => item.guardia);
  const valores = this.datosPorGuardia.map(item => item.valor);
  const colores = this.datosPorGuardia.map(item => item.color);

  this.chartOptions = {
    title: {
      text: 'DISPONIBILIDAD POR GUARDIA',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        fontFamily: 'Arial'
      }
    },

    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const data = params[0];
        return `<strong>${data.name}</strong><br/>
                Disponibilidad: ${data.value}%`;
      }
    },

    grid: {
      left: '10%',
      right: '10%',
      top: '18%',
      bottom: '10%',
      containLabel: true
    },

    // AHORA EL X ES VALUE
    xAxis: {
      type: 'value',
      min: 0,
      max: 110,
      interval: 20,
      axisLabel: {
        formatter: '{value}%',
        fontSize: 10
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#ccc'
        }
      }
    },

    // AHORA EL Y ES CATEGORY
    yAxis: {
      type: 'category',
      data: guardias,
      axisLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Arial'
      },
      axisLine: {
        lineStyle: {
          color: '#666'
        }
      }
    },

    series: [
      {
        name: 'Disponibilidad',
        type: 'bar',
        barWidth: '45%',

        data: valores.map((valor, index) => ({
          value: valor,
          itemStyle: {
            color: colores[index]
          }
        })),

        itemStyle: {
          // Horizontal
          borderRadius: [0, 5, 5, 0],

          shadowColor: 'rgba(0,0,0,0.2)',
          shadowBlur: 6,
          shadowOffsetY: 2
        },

        label: {
          show: true,
          position: 'right',
          formatter: '{c}%',
          fontWeight: 'bold',
          fontSize: 13,
          color: '#333'
        },

        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.3)'
          }
        },

        showBackground: true,

        backgroundStyle: {
          color: 'rgba(180,180,180,0.1)',
          borderRadius: 5
        }
      }
    ]
  };
}
} 