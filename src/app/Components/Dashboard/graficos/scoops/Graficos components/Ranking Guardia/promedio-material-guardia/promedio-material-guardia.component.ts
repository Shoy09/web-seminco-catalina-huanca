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
  selector: 'app-promedio-material-guardia',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './promedio-material-guardia.component.html',
  styleUrl: './promedio-material-guardia.component.css'
})
export class PromedioMaterialGuardiaComponent implements OnInit {

  chartOptions: any = {};

  // Datos organizados por guardia y promedio de material
  readonly datosGuardias = [
    { guardia: 'Guardia A', promedio: 92.5 },
    { guardia: 'Guardia B', promedio: 88.3 },
    { guardia: 'Guardia C', promedio: 95.2 },
    { guardia: 'Guardia D', promedio: 79.8 },
    { guardia: 'Guardia E', promedio: 84.6 },
  ];

  ngOnInit(): void {
    // Ordenar datos de mayor a menor promedio
    this.datosGuardias.sort((a, b) => b.promedio - a.promedio);
    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    // Nombres de guardias para el eje X
    const guardias = this.datosGuardias.map(item => item.guardia);
    
    // Valores de promedio
    const valores = this.datosGuardias.map(item => item.promedio);

    // Calcular máximo para escala dinámica
    const maxValor = Math.max(...valores);
    const escalaMax = Math.ceil(maxValor / 10) * 10;

    this.chartOptions = {
      title: {
        text: 'PROMEDIO MATERIAL - GUARDIA',
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
          const item = this.datosGuardias[index];
          const puesto = index + 1;
          
          let medalla = '';
          if (puesto === 1) medalla = '🥇 ';
          else if (puesto === 2) medalla = '🥈 ';
          else if (puesto === 3) medalla = '🥉 ';
          
          // Determinar nivel de promedio
          let nivel = '';
          let colorNivel = '';
          if (data.value >= 90) {
            nivel = 'Excelente';
            colorNivel = '#2ecc71';
          } else if (data.value >= 80) {
            nivel = 'Bueno';
            colorNivel = '#3498db';
          } else if (data.value >= 70) {
            nivel = 'Regular';
            colorNivel = '#f39c12';
          } else {
            nivel = 'Requiere mejora';
            colorNivel = '#e74c3c';
          }
          
          return `
            <strong>${medalla}${item.guardia}</strong><br/>
            <hr style="margin: 4px 0;"/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            Promedio Material: <strong>${data.value}%</strong><br/>
            <span style="color:#2ecc71; font-weight:bold;">●</span>
            Puesto: <strong>#${puesto}</strong> de ${this.datosGuardias.length}<br/>
            <span style="color:${colorNivel}; font-weight:bold;">●</span>
            Nivel: <strong>${nivel}</strong>
          `;
        }
      },

      grid: {
        left: '8%',
        right: '8%',
        top: '15%',
        bottom: '10%',
        containLabel: true
      },

      xAxis: {
        type: 'category',
        data: guardias,
        axisLabel: {
          fontSize: 11,
          fontWeight: 'bold',
          color: '#2c3e50',
          fontFamily: 'Arial',
          rotate: 0,  // Si los nombres son largos, puedes usar rotate: 45
          interval: 0
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
        nameGap: 40,
        min: 0,
        max: escalaMax,
        axisLabel: {
          fontSize: 10,
          formatter: '{value}%'
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
          name: 'Promedio Material',
          type: 'bar',
          barWidth: '50%',
          data: valores.map((valor, index) => ({
            value: valor,
            itemStyle: {
              color: this.getColorByPositionAndValue(index, valor)
            }
          })),
          itemStyle: {
            borderRadius: [6, 6, 0, 0],  // Bordes redondeados arriba (vertical)
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 6,
            shadowOffsetY: 2
          },
          label: {
            show: true,
            position: 'top',  // Etiqueta arriba de la barra (vertical)
            fontWeight: 'bold',
            fontSize: 11,
            formatter: '{c}%',
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

  // Color según posición (top 3 destacados) y valor del promedio
  private getColorByPositionAndValue(posicion: number, valor: number): string {
    // Top 3 con colores especiales
    if (posicion === 0) return '#f39c12';  // Oro para el 1er puesto
    if (posicion === 1) return '#bdc3c7';  // Plata para el 2do puesto
    if (posicion === 2) return '#cd7f32';  // Bronce para el 3er puesto
    
    // Resto según nivel de promedio
    if (valor >= 90) return '#2ecc71';   // Verde excelente
    if (valor >= 80) return '#3498db';   // Azul bueno
    if (valor >= 70) return '#f39c12';   // Naranja regular
    return '#e74c3c';                    // Rojo necesita mejora
  }
}