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
  selector: 'app-rendimiento-dia-mes',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './rendimiento-dia-mes.component.html',
  styleUrl: './rendimiento-dia-mes.component.css'
})
export class RendimientoDiaMesComponent implements OnInit, OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  datosDisponibilidad: any[] = [];

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
      this.datosDisponibilidad = [];
      this.chartOptions = {};
      return;
    }

    // Mapear los datos: mes y día, rendimiento como valor
    // Ordenar por fecha (año, mesNumero, día)
    this.datosDisponibilidad = this.data
      .map(item => ({
        mes: item.mes || 'SIN MES',
        dia: item.dia || 0,
        rendimiento: item.rendimiento || 0,
        // Guardar datos adicionales para tooltip
        año: item.año || 0,
        fechaOrden: item.fechaOrden,
        cantidadOperaciones: item.cantidadOperaciones || 0,
        horasOperativas: item.horasOperativas || 0,
        totalCucharas: item.totalCucharas || 0,
        totalToneladas: item.totalToneladas || 0,
        mesNumero: item.mesNumero || 0
      }))
      .sort((a, b) => {
        // Ordenar por año, luego por mesNumero, luego por día
        if (a.año !== b.año) return a.año - b.año;
        if (a.mesNumero !== b.mesNumero) return a.mesNumero - b.mesNumero;
        return a.dia - b.dia;
      });

    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    if (!this.datosDisponibilidad.length) {
      this.chartOptions = {};
      return;
    }

    // Etiquetas internas (combinación mes|día para el eje X)
    const xAxisLabels = this.datosDisponibilidad.map(item => ({
      value: `${item.mes}|${item.dia}`,
      mes: item.mes,
      dia: item.dia
    }));

    // Valores (rendimiento)
    const valores = this.datosDisponibilidad.map(item => item.rendimiento);

    // Calcular máximo para escala dinámica
    const maxValor = Math.max(...valores);
    const escalaMax = Math.ceil(maxValor / 50) * 50;

    // =========================
    // GRAPHICS: MESES CENTRADOS ABAJO
    // =========================
    const graphics: any[] = [];

    const mesesPosiciones = new Map();

    let mesActual = '';
    let inicio = 0;

    for (let i = 0; i < this.datosDisponibilidad.length; i++) {
      const item = this.datosDisponibilidad[i];

      if (item.mes !== mesActual) {
        if (mesActual !== '') {
          mesesPosiciones.set(mesActual, {
            start: inicio,
            end: i - 1
          });
        }
        mesActual = item.mes;
        inicio = i;
      }
    }

    // Guardar último mes
    if (mesActual !== '') {
      mesesPosiciones.set(mesActual, {
        start: inicio,
        end: this.datosDisponibilidad.length - 1
      });
    }

    const totalItems = this.datosDisponibilidad.length;

    // Dibujar meses centrados abajo
    mesesPosiciones.forEach((pos: any, mes: string) => {
      const centro = (pos.start + pos.end + 1) / 2;
      const leftPercent = (centro / totalItems) * 100;

      graphics.push({
        type: 'text',
        left: `${leftPercent}%`,
        bottom: 8,
        style: {
          text: mes,
          fill: '#2c3e50',
          fontSize: 13,
          fontWeight: 'bold',
          fontFamily: 'Arial'
        },
        z: 100,
        styleHtml: true
      });
    });

    this.chartOptions = {
      title: {
        text: 'RENDIMIENTO (t/h) - DÍA',
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
          const item = this.datosDisponibilidad[index];
          const partes = data.name.split('|');
          const mes = partes[0];
          const dia = partes[1];

          return `
            <strong>📅 ${mes} - DÍA ${dia} (${item.año})</strong><br/>
            <hr style="margin: 4px 0;"/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            Rendimiento: <strong>${data.value.toFixed(2)}</strong> t/h<br/>
            <span style="color:#2ecc71; font-weight:bold;">●</span>
            Porcentaje: ${((data.value / maxValor) * 100).toFixed(1)}% del máximo<br/>
            <span style="color:#f39c12; font-weight:bold;">●</span>
            Total Toneladas: <strong>${item.totalToneladas.toFixed(2)}</strong> t<br/>
            <span style="color:#9b59b6; font-weight:bold;">●</span>
            Total Cucharas: <strong>${item.totalCucharas}</strong><br/>
            <span style="color:#1abc9c; font-weight:bold;">●</span>
            Operaciones: <strong>${item.cantidadOperaciones}</strong><br/>
            <span style="color:#e67e22; font-weight:bold;">●</span>
            Horas Operativas: <strong>${item.horasOperativas.toFixed(2)}</strong> hrs
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
        data: xAxisLabels.map(item => item.value),
        axisLabel: {
          show: true,
          interval: 0,
          margin: 18,
          fontSize: 11,
          fontWeight: 'bold',
          color: '#2c3e50',
          formatter: (value: string) => {
            return value.split('|')[1]; // Solo muestra el día
          }
        },
        axisLine: {
          lineStyle: {
            color: '#666'
          }
        },
        axisTick: {
          alignWithLabel: true
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

  // Color según valor de rendimiento
  private getColorByValue(valor: number, maxValor: number): string {
    if (valor === 0) return '#95a5a6';  // Gris para valores cero
    const porcentaje = (valor / maxValor) * 100;
    if (porcentaje >= 80) return '#2ecc71';  // Verde - Excelente
    if (porcentaje >= 60) return '#3498db';  // Azul - Bueno
    if (porcentaje >= 40) return '#f39c12';  // Naranja - Regular
    return '#e74c3c';  // Rojo - Bajo
  }
}