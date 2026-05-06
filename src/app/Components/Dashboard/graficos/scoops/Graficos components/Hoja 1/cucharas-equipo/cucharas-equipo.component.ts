import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent, GraphicComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, GraphicComponent, CanvasRenderer]);

@Component({
  selector: 'app-cucharas-equipo',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './cucharas-equipo.component.html',
  styleUrl: './cucharas-equipo.component.css'
})
export class CucharasEquipoComponent implements OnChanges {
  
  @Input() data: any[] = [];

  chartOptions: any = {};

  readonly PALETA_VERDES = [
    '#a9dfbf',
    '#7dcea0',
    '#52be80',
    '#27ae60',
    '#1e8449',
    '#196f3d',
    '#145a32',
    '#0e4d2a'
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.actualizarGrafico();
    }
  }

  actualizarGrafico(): void {
    if (!this.data || this.data.length === 0) {
      this.chartOptions = {};
      return;
    }

    // Agrupar por modeloEquipo y seccion
    const itemsMap = new Map<string, any>();
    
    this.data.forEach(item => {
      const key = `${item.modeloEquipo}|${item.seccion}`;
      if (!itemsMap.has(key)) {
        itemsMap.set(key, {
          modeloEquipo: item.modeloEquipo,
          seccion: item.seccion,
          totalCucharas: 0
        });
      }
      const itemData = itemsMap.get(key);
      itemData.totalCucharas += item.totalCucharas;
    });

    // Convertir mapa a array
    const itemsArray = Array.from(itemsMap.values());
    
    // Ordenar por modeloEquipo y luego por seccion
    itemsArray.sort((a, b) => {
      if (a.modeloEquipo !== b.modeloEquipo) {
        return a.modeloEquipo.localeCompare(b.modeloEquipo);
      }
      return a.seccion.localeCompare(b.seccion);
    });

    // Preparar eje X con: modeloEquipo\n(seccion)
    const xAxisData: string[] = [];
    const tooltipMap: Map<number, any> = new Map();

    itemsArray.forEach((item, idx) => {
      // Formato: modeloEquipo\n(seccion)
      const label = `${item.modeloEquipo}\n(${item.seccion})`;
      xAxisData.push(label);
      tooltipMap.set(idx, item);
    });

    // Crear serie de barras (solo una serie para total de cucharas)
    const series = [{
      name: 'Total Cucharas',
      type: 'bar',
      barWidth: '50%',
      data: itemsArray.map(item => item.totalCucharas),
      itemStyle: {
        color: this.PALETA_VERDES[0],
        borderRadius: [5, 5, 0, 0],
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowBlur: 5
      },
      label: {
        show: true,
        position: 'top',
        fontWeight: 'bold',
        fontSize: 12,
        formatter: (params: any) => params.value > 0 ? params.value : ''
      }
    }];

    // Calcular máximo
    const totales = itemsArray.map(item => item.totalCucharas);
    const maxValor = Math.max(...totales, 0);
    const yAxisMax = Math.ceil(maxValor * 1.2);

    this.chartOptions = {
      title: {
        text: 'CUCHARAS POR EQUIPO',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = tooltipMap.get(params[0].dataIndex);
          if (!item) return '';

          return `<strong>Equipo: ${item.modeloEquipo}</strong><br/>
                  Sección: ${item.seccion}<br/><br/>
                  <strong>Total Cucharas: ${item.totalCucharas}</strong>`;
        }
      },
      legend: {
        show: false
      },
      graphic: [],
      grid: {
        left: '10%',
        right: '5%',
        top: '15%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          fontSize: 11,
          fontWeight: 'bold',
          interval: 0,
          rotate: 0,
          formatter: (value: string) => {
            return value;
          }
        },
        axisLine: {
          lineStyle: { color: '#333' }
        },
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        name: 'Cantidad de Cucharas',
        nameLocation: 'middle',
        nameGap: 45,
        min: 0,
        max: yAxisMax,
        interval: this.calcularIntervalo(yAxisMax),
        axisLabel: { fontSize: 12 },
        splitLine: {
          lineStyle: { type: 'dashed' }
        }
      },
      series
    };
  }

  calcularIntervalo(max: number): number {
    if (max <= 5) return 1;
    if (max <= 10) return 2;
    if (max <= 20) return 5;
    if (max <= 50) return 10;
    if (max <= 100) return 20;
    return 50;
  }
}