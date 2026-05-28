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
import { CHART_COLORS, colorPorMTBF } from '../../../../../../../../shared/chart-theme';

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
export class MtbfMesComponent implements OnInit, OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  datosMtbfMes: any[] = [];

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
      this.datosMtbfMes = [];
      this.chartOptions = {};
      return;
    }

    // Procesar datos y ordenar por año y mesNumero
    this.datosMtbfMes = [...this.data]
      .filter(item => item.mtbf !== undefined && item.mtbf !== null)
      .sort((a, b) => {
        if (a.año !== b.año) return a.año - b.año;
        return a.mesNumero - b.mesNumero;
      });

    if (this.datosMtbfMes.length === 0) {
      this.chartOptions = {};
      return;
    }

    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    // Etiquetas para eje X (meses)
    const meses = this.datosMtbfMes.map(item => item.mes);
    
    // Valores (MTBF)
    const valores = this.datosMtbfMes.map(item => item.mtbf);

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

    for (let i = 0; i < this.datosMtbfMes.length; i++) {
      const item = this.datosMtbfMes[i];
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
        end: this.datosMtbfMes.length - 1
      });
    }

    const totalItems = this.datosMtbfMes.length;

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
        text: 'MTBF (horas) - MES',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: CHART_COLORS.grey,
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
          const item = this.datosMtbfMes[index];
          
          
          return `
            <strong>📅 ${item.mes} ${item.año}</strong><br/>
            <hr style="margin: 4px 0;"/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            MTBF: <strong>${data.value.toFixed(2)}</strong> horas<br/>
            <span style="color:#9b59b6; font-weight:bold;">●</span>
            Equipos: <strong>${item.cantidadEquipos || 0}</strong><br/>
            <span style="color:#e67e22; font-weight:bold;">●</span>
            Fallas: <strong>${item.cantidadFallas || 0}</strong><br/>
            <span style="color:#1abc9c; font-weight:bold;">●</span>
            Operaciones: <strong>${item.cantidadOperaciones || 0}</strong><br/>
            <span style="color:#f39c12; font-weight:bold;">●</span>
            Horas Operación: <strong>${item.horasOperacion || 0}</strong> hrs
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
        name: 'MTBF (horas)',
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
          name: 'MTBF',
          type: 'bar',
          barWidth: '60%',
          data: valores.map((valor) => ({
            value: valor,
            itemStyle: {
              color: colorPorMTBF(valor)
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
            formatter: (params: any) => params.value.toFixed(0),
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
}