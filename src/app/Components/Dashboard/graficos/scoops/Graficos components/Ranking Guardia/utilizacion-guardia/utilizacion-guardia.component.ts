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
  selector: 'app-ranking-utilizacion-guardia',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './utilizacion-guardia.component.html',
  styleUrl: './utilizacion-guardia.component.css'
})
export class UtilizacionRankingGuardiaComponent implements OnInit {
  
  chartOptions: any = {};

  // Datos por tipo de guardia - UTILIZACIÓN
  readonly datosPorGuardia = [
    { guardia: 'C', valor: 96, color: '#f9e79f' },
    { guardia: 'B', valor: 84, color: '#85c1e9' },
    { guardia: 'A', valor: 89, color: '#85c1e9' }
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
        text: 'UTILIZACIÓN - GUARDIA',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 12,
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
          let eficiencia = '';
          if (data.value >= 90) eficiencia = 'Óptima 🎯';
          else if (data.value >= 75) eficiencia = 'Buena ✅';
          else if (data.value >= 60) eficiencia = 'Aceptable 📊';
          else eficiencia = 'Baja ⚠️';
          
          return `<strong>Guardia ${data.name}</strong><br/>
                  Utilización: ${data.value}%<br/>
                  Eficiencia: ${eficiencia}`;
        }
      },

      grid: {
        left: '10%',
        right: '10%',
        top: '15%',
        bottom: '10%',
        containLabel: true
      },

      xAxis: {
        type: 'value',
        min: 0,
        max: 100,
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
          name: 'Utilización',
          type: 'bar',
          barWidth: '45%',
          data: valores.map((valor, index) => ({
            value: valor,
            itemStyle: {
              color: colores[index]
            }
          })),
          itemStyle: {
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