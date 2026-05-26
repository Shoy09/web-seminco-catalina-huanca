import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
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
  selector: 'app-ranking-disponibilidad-guardia',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './disponibilidad-guardia.component.html',
  styleUrl: './disponibilidad-guardia.component.css',
})
export class DisponibilidadRankingGuardiaComponent
  implements OnInit, OnChanges
{
  @Input() data: any[] = [];

  chartOptions: any = {};

  ngOnInit(): void {
    this.procesarDatos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.procesarDatos();
    }
  }

  procesarDatos(): void {
    //consolele.log('DATA DISPONIBILIDAD GUARDIA:', this.data);

    if (!this.data || this.data.length === 0) {
      this.chartOptions = {};
      return;
    }

    this.actualizarGrafico();
  }

  obtenerColor(disponibilidad: number): string {
    if (disponibilidad >= 95) return '#2ecc71'; // verde
    if (disponibilidad >= 85) return '#f1c40f'; // amarillo
    return '#e74c3c'; // rojo
  }

  actualizarGrafico(): void {

  const datosOrdenados = [...this.data]
    .sort((a, b) => b.disponibilidad - a.disponibilidad);

  const guardias = datosOrdenados.map((item) => `Guardia ${item.guardia}`);

  const valores = datosOrdenados.map((item) => item.disponibilidad);

  const colores = datosOrdenados.map((item) =>
    this.obtenerColor(item.disponibilidad)
  );

  this.chartOptions = {
    title: {
      text: 'DISPONIBILIDAD POR GUARDIA',
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

        return `
          <strong>Guardia ${item.guardia}</strong><br/>
          Horas totales: ${item.horasTotales?.toFixed(2) || 0}<br/>
          Horas mantenimiento: ${item.horasMtto?.toFixed(2) || 0}<br/>
          Horas operativas: ${item.horasOperativas?.toFixed(2) || 0}<br/>
          Cantidad operaciones: ${item.cantidadOperaciones || 0}<br/>
          Disponibilidad: <strong>${item.disponibilidad}%</strong>
        `;
      },
    },

    grid: {
      left: '15%',
      right: '12%',
      top: '18%',
      bottom: '10%',
      containLabel: true,
    },

    xAxis: {
      type: 'value',
      min: 0,
      max: 100,
      interval: 20,
      axisLabel: {
        formatter: '{value}%',
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
        name: 'Disponibilidad',
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
          formatter: '{c}%',
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
