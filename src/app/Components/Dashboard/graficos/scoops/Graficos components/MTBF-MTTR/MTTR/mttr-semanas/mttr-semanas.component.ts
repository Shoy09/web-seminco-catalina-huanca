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
  selector: 'app-mttr-semanas',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './mttr-semanas.component.html',
  styleUrl: './mttr-semanas.component.css'
})
export class MttrSemanasComponent implements OnInit, OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  datosMttrSemanas: any[] = [];

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
      this.datosMttrSemanas = [];
      this.chartOptions = {};
      return;
    }

    // Mapear los datos: semana, mttr como valor
    // Ordenar por número de semana
    this.datosMttrSemanas = this.data
      .map(item => ({
        semana: item.semana || `Semana ${item.numeroSemana || '?'}`,
        numeroSemana: item.numeroSemana || 0,
        mttr: item.mttr || 0,
        // Guardar datos adicionales para tooltip
        cantidadEquipos: item.cantidadEquipos || 0,
        cantidadFallas: item.cantidadFallas || 0,
        cantidadOperaciones: item.cantidadOperaciones || 0,
        horasMtto: item.horasMtto || 0
      }))
      .sort((a, b) => a.numeroSemana - b.numeroSemana);

    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    if (!this.datosMttrSemanas.length) {
      this.chartOptions = {};
      return;
    }

    // Nombres de semanas para el eje X
    const semanas = this.datosMttrSemanas.map(item => item.semana);
    
    // Valores de MTTR
    const valores = this.datosMttrSemanas.map(item => item.mttr);
    
    // Calcular máximo y mínimo para escala dinámica
    const maxValor = Math.max(...valores);
    const minValor = Math.min(...valores);
    const escalaMax = Math.ceil(maxValor / 10) * 10;
    const escalaMin = Math.floor(minValor / 10) * 10;

    this.chartOptions = {
      title: {
        text: 'MTTR POR SEMANA',
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
          const item = this.datosMttrSemanas[index];
          
          // Determinar nivel según MTTR (menor es mejor)
          let nivel = '';
          let colorNivel = '';
          if (item.mttr === 0) {
            nivel = 'Sin Fallas ✅';
            colorNivel = '#2ecc71';
          } else if (item.mttr <= 12) {
            nivel = 'Excelente ✅';
            colorNivel = '#2ecc71';
          } else if (item.mttr <= 24) {
            nivel = 'Bueno 👍';
            colorNivel = '#3498db';
          } else if (item.mttr <= 48) {
            nivel = 'Regular ⚠️';
            colorNivel = '#f39c12';
          } else {
            nivel = 'Crítico 🔧';
            colorNivel = '#e74c3c';
          }
          
          return `
            <strong>📅 ${item.semana}</strong><br/>
            <hr style="margin: 4px 0;"/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            MTTR: <strong>${data.value.toFixed(1)}</strong> horas<br/>
            <span style="color:${colorNivel}; font-weight:bold;">●</span>
            Nivel: <strong>${nivel}</strong><br/>
            <span style="color:#9b59b6; font-weight:bold;">●</span>
            Equipos: <strong>${item.cantidadEquipos}</strong><br/>
            <span style="color:#e67e22; font-weight:bold;">●</span>
            Fallas: <strong>${item.cantidadFallas}</strong><br/>
            <span style="color:#1abc9c; font-weight:bold;">●</span>
            Operaciones: <strong>${item.cantidadOperaciones}</strong><br/>
            <span style="color:#e74c3c; font-weight:bold;">●</span>
            Horas Mtto: <strong>${item.horasMtto}</strong> hrs
          `;
        }
      },

      grid: {
        left: '8%',
        right: '8%',
        top: '15%',
        bottom: '12%',
        containLabel: true
      },

      xAxis: {
        type: 'category',
        data: semanas,
        axisLabel: {
          fontSize: 10,
          fontWeight: 'bold',
          color: '#2c3e50',
          fontFamily: 'Arial',
          rotate: 0,
          interval: 0,
          lineHeight: 18
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
          name: 'MTTR',
          type: 'bar',
          barWidth: '60%',
          data: valores.map((valor) => ({
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
            fontSize: 10,
            formatter: (params: any) => params.value.toFixed(1),
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
      ]
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