import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
  selector: 'app-utilizacion-guardia',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './utilizacion-guardia.component.html',
  styleUrl: './utilizacion-guardia.component.css'
})
export class UtilizacionGuardiaComponent implements OnInit, OnChanges {
  
  @Input() data: any[] = [];

  chartOptions: any = {};

  datosPorGuardia: any[] = [];

  ngOnInit(): void {
    this.procesarDatos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.procesarDatos();
    }
  }

  procesarDatos(): void {
    if (!this.data || this.data.length === 0) {
      this.datosPorGuardia = [];
      this.chartOptions = {};
      return;
    }

    // Mapear los datos: seccion = guardia, utilizacion = valor
    // Ordenar por utilización de mayor a menor
    this.datosPorGuardia = this.data
      .map(item => ({
        guardia: item.seccion || item.guardia || 'Sin datos',
        valor: item.utilizacion || 0,
        // Guardar datos adicionales para tooltip
        cantidadEquipos: item.cantidadEquipos || 0,
        cantidadOperaciones: item.cantidadOperaciones || 0,
        horasOperativas: item.horasOperativas || 0,
        horasTotales: item.horasTotales || 0,
        horasMtto: item.horasMtto || 0,
        totalCucharas: item.totalCucharas || 0
      }))
      .sort((a, b) => b.valor - a.valor);

    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    if (!this.datosPorGuardia.length) {
      this.chartOptions = {};
      return;
    }

    const guardias = this.datosPorGuardia.map(item => item.guardia);
    const valores = this.datosPorGuardia.map(item => item.valor);
    
    // Colores según el valor de utilización
    const colores = this.datosPorGuardia.map(item => this.getColorByValue(item.valor));

    // Calcular máximo para escala
    const maxValor = Math.max(...valores, 100);
    const escalaMax = Math.ceil(maxValor / 20) * 20;

    this.chartOptions = {
      title: {
        text: 'UTILIZACIÓN POR SECCIÓN',
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
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const data = params[0];
          const index = data.dataIndex;
          const item = this.datosPorGuardia[index];
          
          return `
            <strong>📊 Sección ${item.guardia}</strong><br/>
            <hr style="margin: 4px 0;"/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            Utilización: <strong>${item.valor.toFixed(2)}%</strong><br/>
            <span style="color:#2ecc71; font-weight:bold;">●</span>
            Horas Operativas: <strong>${item.horasOperativas.toFixed(2)}</strong> hrs<br/>
            <span style="color:#f39c12; font-weight:bold;">●</span>
            Horas Totales: <strong>${item.horasTotales}</strong> hrs<br/>
            <span style="color:#9b59b6; font-weight:bold;">●</span>
            Horas Mantenimiento: <strong>${item.horasMtto}</strong> hrs<br/>
            <span style="color:#1abc9c; font-weight:bold;">●</span>
            Cantidad Equipos: <strong>${item.cantidadEquipos}</strong><br/>
            <span style="color:#e67e22; font-weight:bold;">●</span>
            Cantidad Operaciones: <strong>${item.cantidadOperaciones}</strong><br/>
            <span style="color:#e74c3c; font-weight:bold;">●</span>
            Total Cucharas: <strong>${item.totalCucharas}</strong>
          `;
        }
      },

      grid: {
        left: '10%',
        right: '8%',
        top: '18%',
        bottom: '10%',
        containLabel: true
      },

      xAxis: {
        type: 'value',
        nameLocation: 'middle',
        nameGap: 35,
        min: 0,
        max: escalaMax,
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
        },
        axisTick: {
          show: false
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
            formatter: (params: any) => params.value.toFixed(1) + '%',
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

  // Color según valor de utilización
  private getColorByValue(valor: number): string {
    if (valor >= 80) return '#2ecc71';   // Verde - Excelente
    if (valor >= 60) return '#3498db';   // Azul - Bueno
    if (valor >= 40) return '#f39c12';   // Naranja - Regular
    if (valor >= 20) return '#e67e22';   // Naranja oscuro - Baja
    return '#e74c3c';                     // Rojo - Crítica
  }
}