import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
  selector: 'app-rendimiento-mes-ano',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './rendimiento-mes-ano.component.html',
  styleUrl: './rendimiento-mes-ano.component.css'
})
export class RendimientoMesAnoComponent implements OnInit, OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  datosRendimiento: any[] = [];

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
      this.datosRendimiento = [];
      this.chartOptions = {};
      return;
    }

    // Filtrar datos donde rendimiento es mayor a 0 (opcional)
    // Ordenar por mesNumero para mantener el orden cronológico
    this.datosRendimiento = [...this.data]
      .filter(item => item.rendimiento !== undefined && item.rendimiento !== null)
      .sort((a, b) => {
        // Ordenar por año primero, luego por mesNumero
        if (a.año !== b.año) return a.año - b.año;
        return a.mesNumero - b.mesNumero;
      });

    if (this.datosRendimiento.length === 0) {
      this.chartOptions = {};
      return;
    }

    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    // Etiquetas para eje X (meses)
    const meses = this.datosRendimiento.map(item => item.mes);
    
    // Valores (rendimiento)
    const valores = this.datosRendimiento.map(item => item.rendimiento);

    // Calcular máximo para escala dinámica
    const maxValor = Math.max(...valores);
    const escalaMax = Math.ceil(maxValor / 50) * 50;

    // =========================
    // GRAPHICS: Año centrado abajo
    // =========================
    const graphics: any[] = [];

    // Agrupar por año
    const anosPosiciones = new Map();

    let anoActual = '';
    let inicio = 0;

    for (let i = 0; i < this.datosRendimiento.length; i++) {
      const item = this.datosRendimiento[i];
      const anoStr = item.año?.toString() || '';

      if (anoStr !== anoActual) {
        if (anoActual !== '') {
          anosPosiciones.set(anoActual, {
            start: inicio,
            end: i - 1
          });
        }
        anoActual = anoStr;
        inicio = i;
      }
    }

    // Guardar último año
    if (anoActual !== '') {
      anosPosiciones.set(anoActual, {
        start: inicio,
        end: this.datosRendimiento.length - 1
      });
    }

    const totalItems = this.datosRendimiento.length;

    // Dibujar años centrados ABAJO
    anosPosiciones.forEach((pos: any, ano: string) => {
      const centro = (pos.start + pos.end + 1) / 2;
      const leftPercent = (centro / totalItems) * 100;

      graphics.push({
        type: 'text',
        left: `${leftPercent}%`,
        bottom: 8,
        style: {
          text: ano,
          fill: '#2c3e50',
          fontSize: 14,
          fontWeight: 'bold',
          fontFamily: 'Arial'
        },
        z: 100,
        styleHtml: true
      });
    });

    this.chartOptions = {
      title: {
        text: 'RENDIMIENTO (t/h) - MES',
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
            <strong>📅 ${item.mes} ${item.año}</strong><br/>
            <hr style="margin: 4px 0;"/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            Rendimiento: <strong>${data.value.toFixed(2)}</strong> t/h<br/>
            <span style="color:#2ecc71; font-weight:bold;">●</span>
            Porcentaje: ${((data.value / maxValor) * 100).toFixed(1)}% del máximo<br/>
            <span style="color:#f39c12; font-weight:bold;">●</span>
            Operaciones: ${item.cantidadOperaciones || 0}<br/>
            <span style="color:#9b59b6; font-weight:bold;">●</span>
            Total Toneladas: ${(item.totalToneladas || 0).toFixed(2)} t<br/>
            <span style="color:#1abc9c; font-weight:bold;">●</span>
            Total Cucharas: ${item.totalCucharas || 0}
          `;
        }
      },

      grid: {
        left: '8%',
        right: '5%',
        top: '18%',
        bottom: '15%',
        containLabel: true
      },

      xAxis: {
        type: 'category',
        data: meses,
        axisLabel: {
          show: true,
          interval: 0,
          rotate: 35,  // Rotar para que quepan los nombres
          margin: 15,
          fontSize: 11,
          fontWeight: 'bold',
          color: '#2c3e50',
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

      yAxis: {
        type: 'value',
        name: 'Rendimiento (t/h)',
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
          barWidth: '60%',
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
            formatter: (params: any) => params.value.toFixed(1),
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

  // Color según valor
  private getColorByValue(valor: number, maxValor: number): string {
    if (valor === 0) return '#95a5a6';  // Gris para valores cero
    const porcentaje = (valor / maxValor) * 100;
    if (porcentaje >= 80) return '#2ecc71';  // Verde
    if (porcentaje >= 60) return '#3498db';  // Azul
    if (porcentaje >= 40) return '#f39c12';  // Naranja
    return '#e74c3c';  // Rojo
  }
} 