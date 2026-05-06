import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  CanvasRenderer,
]);

@Component({
  selector: 'app-demoras-operativas',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './demoras-operativas.component.html',
  styleUrl: './demoras-operativas.component.css',
})
export class DemorasOperativasComponent implements OnChanges {
  @Input() data: any[] = [];

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.actualizarGrafico();
    }
  }

  actualizarGrafico(): void {
    if (!this.data || !this.data.length) return;

    // Categorías (Tipo Estado)
    const actividades = this.data.map((item) => item.tipo_estado);

    // Duración promedio (FR_Duración_Estado_Prom)
    const horas = this.data.map((item) => Number(item.promedio.toFixed(1)));

    // % acumulado
    const porcentajes = this.data.map((item) => item.tiempo_acu_pct * 100);

    // Calcular maxHoras con EXACTAMENTE 20% de margen (sin ceil ni redondeos extras)
    const maxHorasOriginal = Math.max(...horas, 1);
    const margenSuperior = 0.20; // 20% exacto
    let maxHoras = maxHorasOriginal * (1 + margenSuperior);

    // Escalar línea al eje Y
    const porcentajesEscalados = porcentajes.map((p) => (p / 100) * maxHoras);

    this.chartOptions = {
      title: {
        text: 'Demoras Operativas',
        left: 'center',
        top: 5,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#2c3e50',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          let result = `<strong>${params[0].axisValue}</strong><br/>`;
          params.forEach((p: any) => {
            if (p.seriesName === 'Duración promedio') {
              result += `${p.marker} ${p.seriesName}: ${p.value} h<br/>`;
            } else {
              const porcentajeOriginal = porcentajes[p.dataIndex];
              result += `${p.marker} ${p.seriesName}: ${porcentajeOriginal.toFixed(1)}%<br/>`;
            }
          });
          return result;
        },
      },
      legend: {
        data: ['Duración promedio', 'Porcentaje acumulado'],
        bottom: 0,
        left: 'center',
        orient: 'horizontal',
      },
      grid: {
        left: '12%',
        right: '8%',
        top: '15%',  // Reducido de 18% a 15%
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: actividades,
        axisLabel: {
          rotate: 0,
          interval: 0,
          fontSize: 10,
          formatter: (value: string) => {
            const words = value.split(' ');
            const lines = [];
            for (let i = 0; i < Math.min(words.length, 4); i++) {
              lines.push(words[i]);
            }
            let result = lines.join('\n');
            if (words.length > 3) {
              result += '\n...';
            }
            return result;
          },
        },
      },
      yAxis: {
        type: 'value',
        name: 'Duración (horas)',
        nameLocation: 'middle',
        nameGap: 45,
        min: 0,
        max: maxHoras,
        axisLabel: {
          formatter: '{value} h',
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            width: 1,
            color: '#e0e0e0',
          },
        },
      },
      series: [
        {
          name: 'Duración promedio',
          type: 'bar',
          data: horas,
          itemStyle: {
            borderRadius: [5, 5, 0, 0],
            color: '#3498db',
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c} h',
            offset: [0, 3],  // Separar etiqueta de la barra
          },
          barCategoryGap: '30%',
          barGap: '30%',
        },
        {
          name: 'Porcentaje acumulado',
          type: 'line',
          data: porcentajesEscalados,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            color: '#e74c3c',
            width: 3,
          },
          itemStyle: {
            color: '#e74c3c',
            borderColor: '#ffffff',
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'top',
            offset: [0, -5],  // Separar etiqueta de la línea
            formatter: (params: any) =>
              `${porcentajes[params.dataIndex].toFixed(1)}%`,
            fontWeight: 'bold',
            fontSize: 11,
          },
          zlevel: 1,  // Asegurar que la línea esté por encima de las barras
          z: 10,
        },
      ],
    };
  }
}