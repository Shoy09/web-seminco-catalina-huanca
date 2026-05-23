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
  selector: 'app-rendimiento-seccion-labor',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './rendimiento-seccion-labor.component.html',
  styleUrl: './rendimiento-seccion-labor.component.css'
})
export class RendimientoSeccionLaborComponent implements OnInit, OnChanges {

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
      this.actualizarGrafico();
      return;
    }

    // Transformar los datos: seccion = capacidadYd3, labor = codigo, cantidad = rendimiento
    this.datosRendimiento = this.data.map(equipo => ({
      seccion: `${equipo.capacidadYd3} yd`,
      labor: equipo.codigo,
      cantidad: equipo.rendimiento || 0,
      // Guardar datos originales para tooltip
      totalCucharas: equipo.totalCucharas,
      cantidadOperaciones: equipo.cantidadOperaciones,
      toneladasPorCuchara: equipo.toneladasPorCuchara
    }));

    // Ordenar por rendimiento de mayor a menor
    this.datosRendimiento.sort((a, b) => b.cantidad - a.cantidad);

    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    if (!this.datosRendimiento.length) {
      this.chartOptions = {};
      return;
    }

    // Etiquetas para eje X (usaremos solo el índice)
    const categorias = this.datosRendimiento.map((_, index) => index.toString());
    
    // Valores (rendimiento)
    const valores = this.datosRendimiento.map(item => item.cantidad);
    
    // Nombres de códigos para mostrar arriba de cada barra
    const codigos = this.datosRendimiento.map(item => item.labor);

    // Calcular máximo para escala dinámica
    const maxValor = Math.max(...valores);
    const escalaMax = Math.ceil(maxValor / 50) * 50;

    // =========================
    // GRAPHICS: Capacidades (yd) abajo y Códigos arriba de cada barra
    // =========================
    const graphics: any[] = [];

    // Agrupar por capacidad (seccion) para mostrar centrado abajo
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
    
    // Dibujar capacidades centradas ABAJO
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

    this.chartOptions = {
      title: {
        text: 'RENDIMIENTO POR EQUIPO',
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
            <strong>📌 CAPACIDAD: ${item.seccion}</strong><br/>
            <strong>🔧 EQUIPO: ${item.labor}</strong><br/>
            <hr style="margin: 4px 0;"/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            Rendimiento: <strong>${data.value.toFixed(2)}</strong> t/op<br/>
            <span style="color:#2ecc71; font-weight:bold;">●</span>
            Porcentaje: ${((data.value / maxValor) * 100).toFixed(1)}% del máximo<br/>
            <span style="color:#f39c12; font-weight:bold;">●</span>
            Operaciones: ${item.cantidadOperaciones}<br/>
            <span style="color:#9b59b6; font-weight:bold;">●</span>
            Cucharas: ${item.totalCucharas}<br/>
            <span style="color:#1abc9c; font-weight:bold;">●</span>
            t/cuchara: ${item.toneladasPorCuchara}
          `;
        }
      },

      grid: {
        left: '8%',
        right: '5%',
        top: '18%',
        bottom: '12%',
        containLabel: true
      },

      xAxis: {
        type: 'category',
        data: categorias,
        axisLabel: {
          show: true,
          interval: 0,
          rotate: 0,
          margin: 35,
          fontSize: 11,
          fontWeight: 'bold',
          color: '#2c3e50',
          formatter: (value: string, index: number) => {
            return codigos[index];  // Mostrar el código del equipo
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
        name: 'Rendimiento (t/op)',
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
          barWidth: '50%',
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

  // Color según valor (verde bueno, naranja medio, rojo bajo)
  private getColorByValue(valor: number, maxValor: number): string {
    const porcentaje = (valor / maxValor) * 100;
    if (porcentaje >= 80) return '#2ecc71';  // Verde excelente
    if (porcentaje >= 60) return '#3498db';  // Azul bueno
    if (porcentaje >= 40) return '#f39c12';  // Naranja regular
    return '#e74c3c';  // Rojo bajo
  }
}