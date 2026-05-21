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
  selector: 'app-mtbf-mes',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './mtbf-mes.component.html',
  styleUrl: './mtbf-mes.component.css'
})
export class MtbfMesComponent implements OnInit {

  chartOptions: any = {};

  // Datos de MTBF por mes (solo 3 meses)
  readonly datosMTBFMes = [
    { mes: 'Marzo 2026', mtbf: 285.5 },
    { mes: 'Abril 2026', mtbf: 312.8 },
    { mes: 'Mayo 2026', mtbf: 348.2 }
  ];

  ngOnInit(): void {
    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    // Nombres de meses para el eje X
    const meses = this.datosMTBFMes.map(item => item.mes);
    
    // Valores de MTBF
    const valores = this.datosMTBFMes.map(item => item.mtbf);
    
    // Calcular máximo y mínimo para escala dinámica
    const maxValor = Math.max(...valores);
    const minValor = Math.min(...valores);
    const escalaMax = Math.ceil(maxValor / 50) * 50;
    const escalaMin = Math.floor(minValor / 50) * 50;

    // Calcular promedio de MTBF (solo para tooltip)
    const promedio = valores.reduce((sum, val) => sum + val, 0) / valores.length;

    // Calcular variación mes a mes
    const variaciones: any[] = [];
    for (let i = 1; i < valores.length; i++) {
      const variacion = valores[i] - valores[i-1];
      variaciones.push({
        mes: this.datosMTBFMes[i].mes,
        variacion: variacion,
        porcentaje: (variacion / valores[i-1]) * 100
      });
    }

    this.chartOptions = {
      title: {
        text: 'MTBF POR MES',
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
          const item = this.datosMTBFMes[index];
          
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
          
          // Comparación con el promedio
          const comparacion = data.value - promedio;
          let tendencia = '';
          let colorTendencia = '';
          if (comparacion > 0) {
            tendencia = `+${comparacion.toFixed(1)} hrs sobre promedio`;
            colorTendencia = '#2ecc71';
          } else if (comparacion < 0) {
            tendencia = `${comparacion.toFixed(1)} hrs bajo promedio`;
            colorTendencia = '#e74c3c';
          } else {
            tendencia = 'Igual al promedio';
            colorTendencia = '#3498db';
          }
          
          let tooltipText = `
            <strong>${item.mes}</strong><br/>
            <hr style="margin: 4px 0;"/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            MTBF: <strong>${data.value.toFixed(1)}</strong> horas<br/>
            <span style="color:${colorNivel}; font-weight:bold;">●</span>
            Confiabilidad: <strong>${nivel}</strong><br/>
            <span style="color:${colorTendencia}; font-weight:bold;">●</span>
            ${tendencia}
          `;
          
          // Agregar variación si no es el primer mes
          if (index > 0) {
            const variacion = variaciones[index - 1];
            const signo = variacion.variacion >= 0 ? '+' : '';
            const colorVariacion = variacion.variacion >= 0 ? '#2ecc71' : '#e74c3c';
            tooltipText += `<br/>
              <span style="color:${colorVariacion}; font-weight:bold;">●</span>
              Variación: <strong>${signo}${variacion.variacion.toFixed(1)} hrs (${signo}${variacion.porcentaje.toFixed(1)}%)</strong>
            `;
          }
          
          return tooltipText;
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
        data: meses,
        axisLabel: {
          fontSize: 11,
          fontWeight: 'bold',
          color: '#2c3e50',
          fontFamily: 'Arial',
          rotate: 0,
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
        name: 'MTBF (horas)',
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
          name: 'MTBF',
          type: 'bar',
          barWidth: '50%',
          data: valores.map((valor) => ({
            value: valor,
            itemStyle: {
              color: this.getColorByMTBF(valor)
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
            fontSize: 12,
            formatter: (params: any) => params.value.toFixed(1) + ' hrs',
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
        // ❌ ELIMINADA LA SERIE DE LA LÍNEA ROJA
      ]
    };
  }

  // Color según el valor del MTBF
  private getColorByMTBF(valor: number): string {
    if (valor >= 330) return '#2ecc71';   // Verde - Excelente
    if (valor >= 300) return '#3498db';   // Azul - Bueno
    if (valor >= 270) return '#f39c12';   // Naranja - Regular
    return '#e74c3c';                     // Rojo - Crítico
  }
}