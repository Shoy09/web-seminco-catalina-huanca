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
  selector: 'app-pareto-no-programadas',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './pareto-no-programada.component.html',
  styleUrl: './pareto-no-programada.component.css'
})
export class ParetoNoProgramadasComponent implements OnInit {

  chartOptions: any = {};

  // Datos de causas de paradas no programadas
  readonly datosParadas = [
    { causa: 'Fallas Eléctricas', frecuencia: 45 },
    { causa: 'Mantenimiento Correctivo', frecuencia: 38 },
    { causa: 'Falta de Material', frecuencia: 32 },
    { causa: 'Problemas Operativos', frecuencia: 25 },
    { causa: 'Fallas Mecánicas', frecuencia: 20 },
    { causa: 'Falta de Personal', frecuencia: 15 },
    { causa: 'Problemas de Calidad', frecuencia: 10 },
    { causa: 'Otros', frecuencia: 5 }
  ];

  ngOnInit(): void {
    // Ordenar datos de mayor a menor frecuencia
    this.datosParadas.sort((a, b) => b.frecuencia - a.frecuencia);
    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    // Nombres de causas para el eje X (con salto de línea si son largos)
    const causas = this.datosParadas.map(item => {
      // Si la causa tiene más de 15 caracteres, agregar salto de línea
      if (item.causa.length > 15) {
        const medio = Math.floor(item.causa.length / 2);
        const espacio = item.causa.indexOf(' ');
        if (espacio !== -1 && espacio < medio) {
          // Cortar por espacio si existe
          const primeraParte = item.causa.substring(0, espacio);
          const segundaParte = item.causa.substring(espacio + 1);
          return primeraParte + '\n' + segundaParte;
        } else {
          // Cortar por la mitad si no hay espacio
          return item.causa.substring(0, medio) + '\n' + item.causa.substring(medio);
        }
      }
      return item.causa;
    });
    
    // Valores de frecuencia
    const frecuencias = this.datosParadas.map(item => item.frecuencia);
    
    // Calcular total para tooltip
    const total = frecuencias.reduce((sum, val) => sum + val, 0);

    this.chartOptions = {
      title: {
        text: 'PARADAS NO PROGRAMADAS',
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
          const index = data.dataIndex;
          const item = this.datosParadas[index];
          const porcentajeIndividual = (item.frecuencia / total * 100).toFixed(1);
          
          // Determinar nivel de criticidad
          let criticidad = '';
          let colorCriticidad = '';
          if (data.value >= 40) {
            criticidad = 'Crítica';
            colorCriticidad = '#e74c3c';
          } else if (data.value >= 25) {
            criticidad = 'Alta';
            colorCriticidad = '#e67e22';
          } else if (data.value >= 15) {
            criticidad = 'Media';
            colorCriticidad = '#f39c12';
          } else {
            criticidad = 'Baja';
            colorCriticidad = '#2ecc71';
          }
          
          return `
            <strong>${item.causa}</strong><br/>
            <hr style="margin: 4px 0;"/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            Frecuencia: <strong>${data.value}</strong> veces<br/>
            <span style="color:${colorCriticidad}; font-weight:bold;">●</span>
            Contribución: <strong>${porcentajeIndividual}%</strong><br/>
            <span style="color:#f39c12; font-weight:bold;">●</span>
            Criticidad: <strong>${criticidad}</strong>
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
        data: causas,
        axisLabel: {
          fontSize: 10,
          fontWeight: 'bold',
          color: '#2c3e50',
          fontFamily: 'Arial',
          rotate: 0,           // Sin rotación, texto horizontal
          interval: 0,
          lineHeight: 18,      // Altura de línea para texto con salto
          formatter: (value: string) => {
            // Mantener los saltos de línea que ya agregamos
            return value;
          }
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
        nameLocation: 'middle',
        nameGap: 45,
        min: 0,
        max: Math.max(...frecuencias) + 10,
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
          name: 'Frecuencia de Paradas',
          type: 'bar',
          barWidth: '60%',
          data: frecuencias,
          itemStyle: {
            color: '#3498db',  // ← UN SOLO COLOR AZUL
            borderRadius: [6, 6, 0, 0],
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 6,
            shadowOffsetY: 2
          },
          label: {
            show: true,
            position: 'top',
            fontWeight: 'bold',
            fontSize: 11,
            formatter: '{c}',
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
}