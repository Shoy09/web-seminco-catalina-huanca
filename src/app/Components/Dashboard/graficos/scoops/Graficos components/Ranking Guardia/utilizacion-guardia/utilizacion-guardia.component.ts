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
  selector: 'app-ranking-utilizacion-guardia',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './utilizacion-guardia.component.html',
  styleUrl: './utilizacion-guardia.component.css'
})
export class UtilizacionRankingGuardiaComponent implements OnInit, OnChanges {

  chartOptions: any = {};

  @Input() data: any[] = [];

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
      this.chartOptions = {};
      return;
    }

    this.actualizarGrafico();
  }

  obtenerColor(utilizacion: number): string {
    if (utilizacion >= 90) return '#2ecc71'; // verde
    if (utilizacion >= 75) return '#f1c40f'; // amarillo
    return '#e74c3c'; // rojo
  }

  actualizarGrafico(): void {

    const datosOrdenados = [...this.data]
      .sort((a, b) => b.utilizacion - a.utilizacion);

    const guardias = datosOrdenados.map((item) => `Guardia ${item.guardia}`);

    const valores = datosOrdenados.map((item) =>
      Number(item.utilizacion || 0)
    );

    const colores = datosOrdenados.map((item) =>
      this.obtenerColor(Number(item.utilizacion || 0))
    );

    this.chartOptions = {
      title: {
        text: 'UTILIZACIÓN POR GUARDIA',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          color: '#333',
          fontFamily: 'Arial'
        }
      },

      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const index = params[0].dataIndex;
          const item = datosOrdenados[index];

          const utilizacion = Number(item.utilizacion || 0);
          const horasTotales = Number(item.horasTotales || 0);
          const horasMtto = Number(item.horasMtto || 0);
          const horasDisponibles = Number(item.horasDisponibles || 0);
          const horasOperativas = Number(item.horasOperativas || 0);

          let eficiencia = '';

          if (utilizacion >= 90) eficiencia = 'Óptima 🎯';
          else if (utilizacion >= 75) eficiencia = 'Buena ✅';
          else if (utilizacion >= 60) eficiencia = 'Aceptable 📊';
          else eficiencia = 'Baja ⚠️';

          return `
            <strong>Guardia ${item.guardia}</strong><br/>
            Horas totales: ${horasTotales.toFixed(2)} h<br/>
            Horas mantenimiento: ${horasMtto.toFixed(2)} h<br/>
            Horas disponibles: ${horasDisponibles.toFixed(2)} h<br/>
            Horas operativas: ${horasOperativas.toFixed(2)} h<br/>
            Cantidad operaciones: ${item.cantidadOperaciones || 0}<br/>
            Utilización: <strong>${utilizacion.toFixed(2)}%</strong><br/>
            Eficiencia: ${eficiencia}
          `;
        }
      },

      grid: {
        left: '15%',
        right: '12%',
        top: '18%',
        bottom: '10%',
        containLabel: true
      },

      xAxis: {
        type: 'value',
        min: 0,
        max: 100,
        interval: 20,
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
        inverse: true,
        axisLabel: {
          fontSize: 12,
          fontWeight: 'bold',
          fontFamily: 'Arial'
        },
        axisLine: {
          lineStyle: {
            color: '#666'
          }
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
            formatter: (params: any) => {
              return `${Number(params.value).toFixed(2)}%`;
            },
            fontWeight: 'bold',
            fontSize: 12,
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
}