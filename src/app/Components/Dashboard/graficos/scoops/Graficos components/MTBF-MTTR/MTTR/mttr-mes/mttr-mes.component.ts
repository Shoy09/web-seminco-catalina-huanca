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
  selector: 'app-mttr-mes',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './mttr-mes.component.html',
  styleUrl: './mttr-mes.component.css'
})
export class MttrMesComponent implements OnInit, OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  datosMttrMes: any[] = [];

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
      this.datosMttrMes = [];
      this.chartOptions = {};
      return;
    }

    // Procesar datos y ordenar por año y mesNumero
    this.datosMttrMes = [...this.data]
      .filter(item => item.mttr !== undefined && item.mttr !== null)
      .sort((a, b) => {
        if (a.año !== b.año) return a.año - b.año;
        return a.mesNumero - b.mesNumero;
      });

    if (this.datosMttrMes.length === 0) {
      this.chartOptions = {};
      return;
    }

    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    // Etiquetas para eje X (meses)
    const meses = this.datosMttrMes.map(item => item.mes);
    
    // Valores (MTTR)
    const valores = this.datosMttrMes.map(item => item.mttr);

    // Calcular máximo para escala dinámica
    const maxValor = Math.max(...valores);
    const escalaMax = Math.ceil(maxValor / 10) * 10;

    // =========================
    // GRAPHICS: Año centrado abajo
    // =========================
    const graphics: any[] = [];

    // Agrupar por año
    const anosPosiciones = new Map();

    let anoActual = '';
    let inicio = 0;

    for (let i = 0; i < this.datosMttrMes.length; i++) {
      const item = this.datosMttrMes[i];
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
        end: this.datosMttrMes.length - 1
      });
    }

    const totalItems = this.datosMttrMes.length;

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
        text: 'MTTR (horas) - MES',
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
          const item = this.datosMttrMes[index];
          
          return `
            <strong>📅 ${item.mes} ${item.año}</strong><br/>
            <hr style="margin: 4px 0;"/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            MTTR: <strong>${data.value.toFixed(2)}</strong> horas<br/>
            <span style="color:#9b59b6; font-weight:bold;">●</span>
            Equipos: <strong>${item.cantidadEquipos || 0}</strong><br/>
            <span style="color:#e67e22; font-weight:bold;">●</span>
            Fallas: <strong>${item.cantidadFallas || 0}</strong><br/>
            <span style="color:#1abc9c; font-weight:bold;">●</span>
            Operaciones: <strong>${item.cantidadOperaciones || 0}</strong><br/>
            <span style="color:#e74c3c; font-weight:bold;">●</span>
            Horas Mtto: <strong>${item.horasMtto || 0}</strong> hrs
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
          rotate: 0,
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
        name: 'MTTR (horas)',
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
          name: 'MTTR',
          type: 'bar',
          barWidth: '60%',
          data: valores.map((valor, index) => ({
            value: valor,
            itemStyle: {
              color: this.getColorByMttr(valor)
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

  // Color según el valor del MTTR (menor es mejor)
  private getColorByMttr(valor: number): string {
    if (valor === 0) return '#2ecc71';      // Verde - Sin fallas
    if (valor <= 12) return '#2ecc71';      // Verde - Excelente
    if (valor <= 24) return '#3498db';      // Azul - Bueno
    if (valor <= 48) return '#f39c12';      // Naranja - Regular
    return '#e74c3c';                        // Rojo - Crítico
  }
}