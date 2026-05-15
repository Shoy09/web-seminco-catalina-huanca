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
  selector: 'app-rendimiento-seccion-labor',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './rendimiento-seccion-labor.component.html',
  styleUrl: './rendimiento-seccion-labor.component.css'
})
export class RendimientoSeccionLaborComponent implements OnInit {

  chartOptions: any = {};

  // Datos organizados por sección y labor
  readonly datosRendimiento = [
    { seccion: 'GL-22', labor: 'LP-23', cantidad: 200 },
    { seccion: 'GL-22', labor: 'PL-2', cantidad: 180 },
    { seccion: 'GL-22', labor: 'G-L2', cantidad: 140 },
  ];

  ngOnInit(): void {
    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    // Etiquetas para eje X (usaremos solo el índice)
    const categorias = this.datosRendimiento.map((item, index) => index.toString());
    
    // Valores (cantidad)
    const valores = this.datosRendimiento.map(item => item.cantidad);
    
    // Nombres de labores para mostrar arriba de cada barra
    const labores = this.datosRendimiento.map(item => item.labor);

    // Calcular máximo para escala dinámica
    const maxValor = Math.max(...valores);
    const escalaMax = Math.ceil(maxValor / 50) * 50;

    // =========================
    // GRAPHICS: Secciones abajo y Labores arriba de cada barra
    // =========================
    const graphics: any[] = [];

    // 1. SECCIONES CENTRADAS ABAJO (como en la imagen de ejemplo)
    const seccionesPosiciones = new Map();
    let seccionActual = '';
    let inicio = 0;

    for (let i = 0; i < this.datosRendimiento.length; i++) {
      const item = this.datosRendimiento[i];
      if (item.seccion !== seccionActual) {
        if (seccionActual !== '') {
          seccionesPosiciones.set(seccionActual, {
            start: inicio,
            end: i - 1
          });
        }
        seccionActual = item.seccion;
        inicio = i;
      }
    }
    
    if (seccionActual !== '') {
      seccionesPosiciones.set(seccionActual, {
        start: inicio,
        end: this.datosRendimiento.length - 1
      });
    }

    const totalItems = this.datosRendimiento.length;
    
    // Dibujar secciones centradas ABAJO (texto grande)
    seccionesPosiciones.forEach((pos: any, seccion: string) => {
      const centro = (pos.start + pos.end + 1) / 2;
      const leftPercent = (centro / totalItems) * 100;
      
      graphics.push({
        type: 'text',
        left: `${leftPercent}%`,
        bottom: 8,
        style: {
          text: seccion,
          fill: '#2c3e50',
          fontSize: 13,
          fontWeight: 'bold',
          fontFamily: 'Arial'
        },
        z: 100,
        styleHtml: true
      });
    });

    // 2. Usar axisLabel personalizado para mostrar LABORES arriba de las barras
    // En lugar de graphics, usamos axisLabel con rotate y formatter

    this.chartOptions = {
      title: {
        text: 'RENDIMIENTO EQUIPO',
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
          const item = this.datosRendimiento[index];
          
          return `
            <strong>📌 SECCIÓN: ${item.seccion}</strong><br/>
            <strong>🔧 LABOR: ${item.labor}</strong><br/>
            <hr style="margin: 4px 0;"/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            Cantidad: <strong>${data.value}</strong> unidades<br/>
            <span style="color:#2ecc71; font-weight:bold;">●</span>
            Rendimiento: ${((data.value / maxValor) * 100).toFixed(1)}% del máximo
          `;
        }
      },

      grid: {
        left: '8%',
        right: '5%',
        top: '20%',     // Espacio para títulos
        bottom: '12%',   // Espacio para secciones
        containLabel: true
      },

      xAxis: {
        type: 'category',
        data: categorias,
        axisLabel: {
          show: true,
          interval: 0,
          rotate: 0,
          margin: 30,    // Separación de las barras
          fontSize: 11,
          fontWeight: 'bold',
          color: '#000000',  // Color rojo para las labores
          formatter: (value: string, index: number) => {
            return labores[index];  // Mostrar el nombre de la labor
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
        name: 'Cantidad (unidades)',
        nameLocation: 'middle',
        nameGap: 45,
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

      series: [
        {
          name: 'Rendimiento',
          type: 'bar',
          barWidth: '50%',  // Ancho de las barras
          data: valores.map((valor, index) => ({
            value: valor,
            itemStyle: {
              color: this.getColorByValue(valor, maxValor)
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
            fontSize: 11,
            formatter: '{c}',
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
      ],

      graphic: graphics
    };
  }

  // Color según valor (verde bueno, naranja medio, rojo bajo)
  private getColorByValue(valor: number, maxValor: number): string {
    const porcentaje = (valor / maxValor) * 100;
    if (porcentaje >= 80) return '#2ecc71';  // Verde
    if (porcentaje >= 50) return '#f39c12';  // Naranja
    return '#e74c3c';  // Rojo
  }
}