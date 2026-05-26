import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent,
  CanvasRenderer,
]);

@Component({
  selector: 'app-ranking-rendimiento-guardia',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './rendimiento-guardia.component.html',
  styleUrl: './rendimiento-guardia.component.css',
})
export class RendimientoRankingGuardiaComponent implements OnInit, OnChanges {

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
    //console.log('DATA RENDIMIENTO GUARDIA:', this.data);

    if (!this.data || this.data.length === 0) {
      this.chartOptions = {};
      return;
    }

    this.actualizarGrafico();
  }

  obtenerColor(rendimiento: number): string {
    if (rendimiento >= 80) return '#2ecc71'; // verde
    if (rendimiento >= 60) return '#f1c40f'; // amarillo
    return '#e74c3c'; // rojo
  }

  actualizarGrafico(): void {

    const datosOrdenados = [...this.data]
      .sort((a, b) => b.rendimiento - a.rendimiento);

    const guardias = datosOrdenados.map((item) => `Guardia ${item.guardia}`);

    const valores = datosOrdenados.map((item) => item.rendimiento);

    const colores = datosOrdenados.map((item) =>
      this.obtenerColor(item.rendimiento)
    );

    const maxValor = Math.max(...valores, 100);

    this.chartOptions = {
      title: {
        text: 'RENDIMIENTO POR GUARDIA',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          color: '#333',
          fontFamily: 'Arial',
        },
      },

      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const index = params[0].dataIndex;
          const item = datosOrdenados[index];

          let nivel = '';

          if (item.rendimiento >= 80) nivel = 'Excelente 🏆';
          else if (item.rendimiento >= 60) nivel = 'Bueno 👍';
          else if (item.rendimiento >= 40) nivel = 'Regular ⚠️';
          else nivel = 'Requiere mejora 🔧';

          return `
            <strong>Guardia ${item.guardia}</strong><br/>
            Tn Total Ajustado: ${item.tnTotalAjustado?.toFixed(2) || 0} Tn<br/>
            Horas operativas: ${item.horasOperativas?.toFixed(2) || 0} h<br/>
            Registros productivos: ${item.cantidadRegistrosProductivos || 0}<br/>
            Cantidad operaciones: ${item.cantidadOperaciones || 0}<br/>
            Rendimiento: <strong>${item.rendimiento} Tn/h</strong><br/>
            Nivel: ${nivel}
          `;
        },
      },

      grid: {
        left: '15%',
        right: '15%',
        top: '18%',
        bottom: '10%',
        containLabel: true,
      },

      xAxis: {
        type: 'value',
        min: 0,
        max: Math.ceil(maxValor / 10) * 10,
        interval: 20,
        axisLabel: {
          formatter: '{value} Tn/h',
          fontSize: 10,
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#ccc',
          },
        },
      },

      yAxis: {
        type: 'category',
        data: guardias,
        inverse: true,
        axisLabel: {
          fontSize: 12,
          fontWeight: 'bold',
          fontFamily: 'Arial',
        },
        axisLine: {
          lineStyle: {
            color: '#666',
          },
        },
      },

      series: [
        {
          name: 'Rendimiento',
          type: 'bar',
          barWidth: '45%',

          data: valores.map((valor, index) => ({
            value: valor,
            itemStyle: {
              color: colores[index],
            },
          })),

          itemStyle: {
            borderRadius: [0, 5, 5, 0],
            shadowColor: 'rgba(0,0,0,0.2)',
            shadowBlur: 6,
            shadowOffsetY: 2,
          },

          label: {
            show: true,
            position: 'right',
            formatter: '{c} Tn/h',
            fontWeight: 'bold',
            fontSize: 12,
            color: '#333',
          },

          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.3)',
            },
          },

          showBackground: true,

          backgroundStyle: {
            color: 'rgba(180,180,180,0.1)',
            borderRadius: 5,
          },
        },
      ],
    };
  }
}