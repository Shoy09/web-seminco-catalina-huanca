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
  selector: 'app-diagrama-pareto',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './diagrama-pareto.component.html',
  styleUrl: './diagrama-pareto.component.css'
})
export class DiagramaParetoComponent implements OnInit {

  chartOptions: any = {};

  // Datos genéricos para el diagrama de Pareto
  readonly datosPareto = [
    { categoria: 'Fallas Eléctricas', valor: 45 },
    { categoria: 'Mantenimiento Correctivo', valor: 38 },
    { categoria: 'Falta de Material', valor: 32 },
    { categoria: 'Problemas Operativos', valor: 25 },
    { categoria: 'Fallas Mecánicas', valor: 20 },
    { categoria: 'Falta de Personal', valor: 15 },
    { categoria: 'Problemas de Calidad', valor: 10 },
    { categoria: 'Otros', valor: 5 }
  ];

  ngOnInit(): void {
    // Ordenar datos de mayor a menor valor
    this.datosPareto.sort((a, b) => b.valor - a.valor);
    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    // Nombres de categorías para el eje X (con salto de línea si son largos)
    const categorias = this.datosPareto.map(item => {
      if (item.categoria.length > 15) {
        const medio = Math.floor(item.categoria.length / 2);
        const espacio = item.categoria.indexOf(' ');
        if (espacio !== -1 && espacio < medio) {
          const primeraParte = item.categoria.substring(0, espacio);
          const segundaParte = item.categoria.substring(espacio + 1);
          return primeraParte + '\n' + segundaParte;
        } else {
          return item.categoria.substring(0, medio) + '\n' + item.categoria.substring(medio);
        }
      }
      return item.categoria;
    });
    
    // Valores
    const valores = this.datosPareto.map(item => item.valor);
    
    // Calcular total para tooltip
    const total = valores.reduce((sum, val) => sum + val, 0);

    this.chartOptions = {
      title: {
        text: 'DIAGRAMA DE PARETO',
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
          const item = this.datosPareto[index];
          const porcentajeIndividual = (item.valor / total * 100).toFixed(1);
          
          return `
            <strong>${item.categoria}</strong><br/>
            <hr style="margin: 4px 0;"/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            Valor: <strong>${data.value}</strong><br/>
            <span style="color:#2ecc71; font-weight:bold;">●</span>
            Contribución: <strong>${porcentajeIndividual}%</strong>
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
        data: categorias,
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
        nameLocation: 'middle',
        nameGap: 45,
        min: 0,
        max: Math.max(...valores) + Math.max(...valores) * 0.1,
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
          name: 'Frecuencia',
          type: 'bar',
          barWidth: '55%',
          data: valores,
          itemStyle: {
            color: '#3498db',
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