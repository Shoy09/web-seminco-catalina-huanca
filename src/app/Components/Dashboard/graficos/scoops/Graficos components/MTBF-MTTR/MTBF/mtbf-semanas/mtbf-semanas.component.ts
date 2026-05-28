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
  selector: 'app-mtbf-semanas',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './mtbf-semanas.component.html',
  styleUrl: './mtbf-semanas.component.css'
})
export class MtbfSemanasComponent implements OnInit, OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  datosMtbfSemanas: any[] = [];

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
      this.datosMtbfSemanas = [];
      this.chartOptions = {};
      return;
    }

    // Mapear los datos: semana, mtbf como valor
    // Ordenar por número de semana
    this.datosMtbfSemanas = this.data
      .map(item => ({
        semana: item.semana || `Semana ${item.numeroSemana || '?'}`,
        numeroSemana: item.numeroSemana || 0,
        mtbf: item.mtbf || 0,
        // Guardar datos adicionales para tooltip
        cantidadEquipos: item.cantidadEquipos || 0,
        cantidadFallas: item.cantidadFallas || 0,
        cantidadOperaciones: item.cantidadOperaciones || 0,
        horasOperacion: item.horasOperacion || 0,
        horasMtto: item.horasMtto || 0
      }))
      .sort((a, b) => a.numeroSemana - b.numeroSemana);

    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    if (!this.datosMtbfSemanas.length) {
      this.chartOptions = {};
      return;
    }

    // Nombres de semanas para el eje X
    const semanas = this.datosMtbfSemanas.map(item => item.semana);
    
    // Valores de MTBF
    const valores = this.datosMtbfSemanas.map(item => item.mtbf);
    
    // Calcular máximo y mínimo para escala dinámica
    const maxValor = Math.max(...valores);
    const minValor = Math.min(...valores);
    const escalaMax = Math.ceil(maxValor / 50) * 50;
    const escalaMin = Math.floor(minValor / 50) * 50;

    this.chartOptions = {
      title: {
        text: 'MTBF POR SEMANA',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 14,
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
          const item = this.datosMtbfSemanas[index];
          
          return `
            <strong>📅 ${item.semana}</strong><br/>
            <hr style="margin: 4px 0;"/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            MTBF: <strong>${data.value.toFixed(1)}</strong> horas<br/>
            <span style="color:#9b59b6; font-weight:bold;">●</span>
            Equipos: <strong>${item.cantidadEquipos}</strong><br/>
            <span style="color:#e67e22; font-weight:bold;">●</span>
            Fallas: <strong>${item.cantidadFallas}</strong><br/>
            <span style="color:#1abc9c; font-weight:bold;">●</span>
            Operaciones: <strong>${item.cantidadOperaciones}</strong><br/>
            <span style="color:#f39c12; font-weight:bold;">●</span>
            Horas Operación: <strong>${item.horasOperacion}</strong> hrs
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
            fontSize: 10,
            formatter: (params: any) => params.value.toFixed(0),
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
}