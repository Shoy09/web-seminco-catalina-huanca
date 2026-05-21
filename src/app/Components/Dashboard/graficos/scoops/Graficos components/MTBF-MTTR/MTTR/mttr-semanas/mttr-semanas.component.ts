import { Component, OnInit } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent
} from 'echarts/components';
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
  selector: 'app-mttr-semanas',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './mttr-semanas.component.html',
  styleUrl: './mttr-semanas.component.css'
})
export class MttrSemanasComponent implements OnInit {

  chartOptions: any = {};

  // Datos de mtte por semana
  readonly datosmtteSemanas = [
    { semana: 'Semana 1', mtte: 245.5 },
    { semana: 'Semana 2', mtte: 268.3 },
    { semana: 'Semana 3', mtte: 312.8 },
  ];

  ngOnInit(): void {
    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    // Nombres de semanas para el eje X
    const semanas = this.datosmtteSemanas.map(item => item.semana);
    
    // Valores de mtte
    const valores = this.datosmtteSemanas.map(item => item.mtte);
    
    // Calcular máximo y mínimo para escala dinámica
    const maxValor = Math.max(...valores);
    const minValor = Math.min(...valores);
    const escalaMax = Math.ceil(maxValor / 50) * 50;
    const escalaMin = Math.floor(minValor / 50) * 50;

    this.chartOptions = {
      title: {
        text: 'MTTE POR SEMANA',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold',
          color: '#333',
          fontFamily: 'Arial'
        }
      },

      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const data = params[0];
          const item = this.datosmtteSemanas[data.dataIndex];
          
          // Determinar nivel de confiabilidad
          let nivel = '';
          let colorNivel = '';
          if (data.value >= 330) {
            nivel = 'Excelente ✅';
            colorNivel = '#2ecc71';
          } else if (data.value >= 300) {
            nivel = 'Bueno 👍';
            colorNivel = '#3498db';
          } else if (data.value >= 270) {
            nivel = 'Regular ⚠️';
            colorNivel = '#f39c12';
          } else {
            nivel = 'Crítico 🔧';
            colorNivel = '#e74c3c';
          }
          
          return `
            <strong>${item.semana}</strong><br/>
            <hr style="margin: 4px 0;"/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            mtte: <strong>${data.value.toFixed(1)}</strong> horas<br/>
            <span style="color:${colorNivel}; font-weight:bold;">●</span>
            Confiabilidad: <strong>${nivel}</strong>
          `;
        }
      },

      grid: {
        left: '8%',
        right: '8%',
        top: '15%',
        bottom: '12%',
        containLabel: true
      },

      xAxis: {
        type: 'category',
        data: semanas,
        axisLabel: {
          fontSize: 10,
          fontWeight: 'bold',
          color: '#2c3e50',
          fontFamily: 'Arial',
          rotate: 0,
          interval: 0,
          lineHeight: 18
        },
        axisLine: {
          lineStyle: {
            color: '#666'
          }
        },
        axisTick: {
          show: false
        }
      },

      yAxis: {
        type: 'value',
        name: 'mtte (horas)',
        nameLocation: 'middle',
        nameGap: 45,
        min: escalaMin > 0 ? escalaMin : 0,
        max: escalaMax,
        axisLabel: {
          fontSize: 10,
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
          name: 'mtte',
          type: 'bar',
          barWidth: '60%',
          data: valores.map((valor) => ({
            value: valor,
            itemStyle: {
              color: this.getColorBymtte(valor)
            }
          })),
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 6,
            shadowOffsetY: 2
          },
          label: {
            show: true,
            position: 'top',
            fontWeight: 'bold',
            fontSize: 10,
            formatter: (params: any) => params.value.toFixed(0),
            color: '#333'
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetY: 0,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          },
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.1)',
            borderRadius: 6
          }
        }
      ]
    };
  }

  // Color según el valor del mtte
  private getColorBymtte(valor: number): string {
    if (valor >= 330) return '#2ecc71';   // Verde - Excelente
    if (valor >= 300) return '#3498db';   // Azul - Bueno
    if (valor >= 270) return '#f39c12';   // Naranja - Regular
    return '#e74c3c';                     // Rojo - Crítico
  }
}