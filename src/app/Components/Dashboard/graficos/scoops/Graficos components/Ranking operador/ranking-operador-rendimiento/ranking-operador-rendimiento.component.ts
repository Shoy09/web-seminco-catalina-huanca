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
  selector: 'app-ranking-operador-rendimiento',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './ranking-operador-rendimiento.component.html',
  styleUrl: './ranking-operador-rendimiento.component.css'
})
export class RankingOperadorRendimientoComponent implements OnInit {

  chartOptions: any = {};

  // Datos organizados por operador y rendimiento (t/h)
  readonly datosOperadores = [
    { operador: 'Juan Pérez', rendimiento: 245 },
    { operador: 'Carlos López', rendimiento: 218 },
    { operador: 'María González', rendimiento: 235 },
    { operador: 'Ana Rodríguez', rendimiento: 195 },
  ];

  ngOnInit(): void {
    // Ordenar datos de mayor a menor rendimiento
    this.datosOperadores.sort((a, b) => b.rendimiento - a.rendimiento);
    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    // Nombres de operadores para el eje Y
    const operadores = this.datosOperadores.map(item => item.operador);
    
    // Valores de rendimiento
    const valores = this.datosOperadores.map(item => item.rendimiento);

    // Calcular máximo para escala dinámica
    const maxValor = Math.max(...valores);
    const escalaMax = Math.ceil(maxValor / 50) * 50;

    // Calcular promedio para referencia
    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;

    this.chartOptions = {
      title: {
        text: 'RANKING OPERADORES - RENDIMIENTO (t/h)',
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
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const data = params[0];
          const index = data.dataIndex;
          const item = this.datosOperadores[index];
          const puesto = index + 1;
          
          let medalla = '';
          if (puesto === 1) medalla = '🥇 ';
          else if (puesto === 2) medalla = '🥈 ';
          else if (puesto === 3) medalla = '🥉 ';
          
          // Determinar nivel de rendimiento
          let nivel = '';
          let colorNivel = '';
          const porcentajeMax = (data.value / maxValor) * 100;
          
          if (porcentajeMax >= 90) {
            nivel = 'Excelente';
            colorNivel = '#2ecc71';
          } else if (porcentajeMax >= 75) {
            nivel = 'Muy Bueno';
            colorNivel = '#3498db';
          } else if (porcentajeMax >= 60) {
            nivel = 'Bueno';
            colorNivel = '#f39c12';
          } else {
            nivel = 'Requiere mejora';
            colorNivel = '#e74c3c';
          }
          
          const diferenciaPromedio = data.value - promedio;
          const diferenciaTexto = diferenciaPromedio >= 0 
            ? `+${diferenciaPromedio.toFixed(1)} t/h sobre promedio`
            : `${diferenciaPromedio.toFixed(1)} t/h bajo promedio`;
          
          return `
            <strong>${medalla}${item.operador}</strong><br/>
            <hr style="margin: 4px 0;"/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            Rendimiento: <strong>${data.value} t/h</strong><br/>
            <span style="color:#2ecc71; font-weight:bold;">●</span>
            Puesto: <strong>#${puesto}</strong> de ${this.datosOperadores.length}<br/>
            <span style="color:${colorNivel}; font-weight:bold;">●</span>
            Nivel: <strong>${nivel}</strong><br/>
            <span style="color:#9b59b6; font-weight:bold;">●</span>
            ${diferenciaTexto}
          `;
        }
      },

      grid: {
        left: '12%',     // Espacio para nombres de operadores
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
          formatter: '{value}'
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
        data: operadores,
        inverse: true,  // Mayor rendimiento arriba
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
            
            // Mostrar ícono según rendimiento vs promedio
            const rendimiento = this.datosOperadores[index].rendimiento;
            if (rendimiento > promedio) return `⬆️ ${value}`;
            if (rendimiento < promedio) return `⬇️ ${value}`;
            return `➡️ ${value}`;
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
          name: 'Rendimiento',
          type: 'bar',
          barWidth: '50%',
          data: valores.map((valor, index) => ({
            value: valor,
            itemStyle: {
              color: this.getColorByPositionAndValue(index, valor, maxValor)
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
            formatter: '{c} t/h',
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

  // Color según posición (top 3 destacados) y valor de rendimiento
  private getColorByPositionAndValue(posicion: number, valor: number, maxValor: number): string {
    const porcentaje = (valor / maxValor) * 100;
    
    // Top 3 con colores especiales
    if (posicion === 0) return '#f39c12';  // Oro para el 1er puesto
    if (posicion === 1) return '#bdc3c7';  // Plata para el 2do puesto
    if (posicion === 2) return '#cd7f32';  // Bronce para el 3er puesto
    
    // Resto según nivel de rendimiento
    if (porcentaje >= 90) return '#2ecc71';   // Verde excelente
    if (porcentaje >= 75) return '#3498db';   // Azul muy bueno
    if (porcentaje >= 60) return '#f39c12';   // Naranja bueno
    return '#e74c3c';                         // Rojo necesita mejora
  }
}