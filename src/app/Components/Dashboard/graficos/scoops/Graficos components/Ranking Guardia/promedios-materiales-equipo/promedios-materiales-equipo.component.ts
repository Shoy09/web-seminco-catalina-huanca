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
  selector: 'app-promedios-materiales-equipo',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './promedios-materiales-equipo.component.html',
  styleUrl: './promedios-materiales-equipo.component.css'
})
export class PromediosMaterialesEquipoComponent implements OnInit {

  chartOptions: any = {};

  // Datos organizados por equipo y promedio de materiales
  readonly datosEquipos = [
    { equipo: 'ST22', promedio: 85.5 },
    { equipo: 'ST23', promedio: 92.3 },
    { equipo: 'ST24', promedio: 78.9 },
    { equipo: 'ST25', promedio: 88.7 },
    { equipo: 'ST26', promedio: 81.2 },
  ];

  ngOnInit(): void {
    // Ordenar datos de mayor a menor promedio
    this.datosEquipos.sort((a, b) => b.promedio - a.promedio);
    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    // Nombres de equipos para el eje Y
    const equipos = this.datosEquipos.map(item => item.equipo);
    
    // Valores de promedio
    const valores = this.datosEquipos.map(item => item.promedio);

    // Calcular máximo para escala dinámica
    const maxValor = Math.max(...valores);
    const escalaMax = Math.ceil(maxValor / 10) * 10;

    this.chartOptions = {
      title: {
        text: 'PROMEDIOS MATERIALES - EQUIPO',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 14,        // Título más pequeño
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
          const item = this.datosEquipos[index];
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
            <strong>${medalla}Equipo ${item.equipo}</strong><br/>
            <hr style="margin: 4px 0;"/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            Promedio: <strong>${data.value}%</strong><br/>
            <span style="color:#2ecc71; font-weight:bold;">●</span>
            Puesto: <strong>#${puesto}</strong> de ${this.datosEquipos.length}<br/>
            <span style="color:${colorNivel}; font-weight:bold;">●</span>
            Nivel: <strong>${nivel}</strong>
          `;
        }
      },

      grid: {
        left: '3%',
        right: '8%',
        top: '15%',
        bottom: '5%',
        containLabel: true
      },

      xAxis: {
        type: 'value',
        nameLocation: 'middle',
        nameGap: 35,
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

      yAxis: {
        type: 'category',
        data: equipos,
        inverse: true,  // Mayor promedio arriba
        axisLabel: {
          show: true,
          interval: 0,
          fontSize: 11,
          fontWeight: 'bold',
          color: '#2c3e50',
          fontFamily: 'Arial',
          formatter: (value: string, index: number) => {
            if (index === 0) return `🥇 ${value}`;
            if (index === 1) return `🥈 ${value}`;
            if (index === 2) return `🥉 ${value}`;
            return `${index + 1}. ${value}`;
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

      series: [
        {
          name: 'Promedio Materiales',
          type: 'bar',
          barWidth: '50%',
          data: valores.map((valor, index) => ({
            value: valor,
            itemStyle: {
              color: this.getColorByPositionAndValue(index, valor)
            }
          })),
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 6,
            shadowOffsetX: 2
          },
          label: {
            show: true,
            position: 'right',
            fontWeight: 'bold',
            fontSize: 11,
            formatter: '{c}%',
            color: '#333'
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
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