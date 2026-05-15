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
  selector: 'app-top-equipos',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './top-equipos.component.html',
  styleUrl: './top-equipos.component.css'
})
export class TopEquiposComponent implements OnInit {

  chartOptions: any = {};

  // Datos organizados por equipo y rendimiento
  readonly datosEquipos = [
    { equipo: 'ST22', rendimiento: 200 },
    { equipo: 'ST23', rendimiento: 180 },
    { equipo: 'ST24', rendimiento: 140 },
  ];

  ngOnInit(): void {
    // Ordenar datos de mayor a menor rendimiento
    this.datosEquipos.sort((a, b) => b.rendimiento - a.rendimiento);
    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    // Nombres de equipos para el eje Y
    const equipos = this.datosEquipos.map(item => item.equipo);
    
    // Valores de rendimiento
    const valores = this.datosEquipos.map(item => item.rendimiento);

    // Calcular máximo para escala dinámica
    const maxValor = Math.max(...valores);
    const escalaMax = Math.ceil(maxValor / 50) * 50;

    // =========================
    // GRAPHICS: Sección de equipos destacados
    // =========================
    const graphics: any[] = [];

    this.chartOptions = {
      title: {
        text: 'TOP EQUIPOS - RENDIMIENTO',
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
          const item = this.datosEquipos[index];
          const puesto = index + 1;
          
          let medalla = '';
          if (puesto === 1) medalla = '🥇 ';
          else if (puesto === 2) medalla = '🥈 ';
          else if (puesto === 3) medalla = '🥉 ';
          
          return `
            <strong>${medalla}${item.equipo}</strong><br/>
            <hr style="margin: 4px 0;"/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            Rendimiento: <strong>${data.value}</strong> unidades<br/>
            <span style="color:#2ecc71; font-weight:bold;">●</span>
            Puesto: <strong>#${puesto}</strong> de ${this.datosEquipos.length}<br/>
            <span style="color:#f39c12; font-weight:bold;">●</span>
            Porcentaje: ${((data.value / maxValor) * 100).toFixed(1)}% del máximo
          `;
        }
      },

      grid: {
        left: '3%',      // ← REDUCIDO: antes 15%, ahora 3% (más a la izquierda)
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
        data: equipos,
        // IMPORTANTE: Invertir el eje Y para que el mayor valor aparezca arriba
        inverse: true,  // ← AÑADIDO: Esto hace que el primer elemento (mayor) esté arriba
        axisLabel: {
          show: true,
          interval: 0,
          fontSize: 11,
          fontWeight: 'bold',
          color: '#2c3e50',
          fontFamily: 'Arial',
          formatter: (value: string, index: number) => {
            // Como ahora está invertido, index 0 sigue siendo el primero (mayor rendimiento)
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
          name: 'Rendimiento',
          type: 'bar',
          barWidth: '50%',  // ← Reducido para mejor aspecto
          data: valores.map((valor, index) => ({
            value: valor,
            itemStyle: {
              color: this.getColorByPosition(index, maxValor, valor)
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

  // Color según posición (top 3 destacados) y rendimiento
  private getColorByPosition(posicion: number, maxValor: number, valor: number): string {
    const porcentaje = (valor / maxValor) * 100;
    
    // Top 3 con colores especiales
    if (posicion === 0) return '#f39c12';  // Oro para el 1er puesto
    if (posicion === 1) return '#bdc3c7';  // Plata para el 2do puesto
    if (posicion === 2) return '#cd7f32';  // Bronce para el 3er puesto
    
    // Resto según rendimiento
    if (porcentaje >= 70) return '#2ecc71';  // Verde
    if (porcentaje >= 40) return '#3498db';  // Azul
    return '#e74c3c';  // Rojo
  }
}