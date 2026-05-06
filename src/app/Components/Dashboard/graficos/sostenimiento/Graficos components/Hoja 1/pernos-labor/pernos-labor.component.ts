import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, GraphicComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, GraphicComponent, CanvasRenderer]);

@Component({
  selector: 'app-pernos-labor',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './pernos-labor.component.html',
  styleUrl: './pernos-labor.component.css'
})
export class PernosLaborComponent implements OnChanges {
  
  @Input() data: any[] = [];

  chartOptions: any = {};

  readonly COLOR_BARRA = '#3498db'; // Azul medio para las barras

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

    // Agrupar por labor y seccion (para evitar duplicados)
    const itemsMap = new Map<string, any>();
    
    this.data.forEach(item => {
      const key = `${item.labor}|${item.seccion}`;
      if (!itemsMap.has(key)) {
        itemsMap.set(key, {
          labor: item.labor,
          seccion: item.seccion,
          seccionLabor: item.seccionLabor,
          totalPernos: 0
        });
      }
      const itemData = itemsMap.get(key);
      itemData.totalPernos += item.totalPernos;
    });

    // Convertir mapa a array
    let itemsArray = Array.from(itemsMap.values());
    
    // Ordenar por labor y luego por seccion
    itemsArray.sort((a, b) => {
      if (a.labor !== b.labor) {
        return a.labor.localeCompare(b.labor);
      }
      return a.seccion.localeCompare(b.seccion);
    });

    // Preparar eje X con: labor (seccion)
    const xAxisData: string[] = [];
    const tooltipMap: Map<number, any> = new Map();

    itemsArray.forEach((item, idx) => {
      const label = `${item.seccionLabor}\n${item.labor}\n(${item.seccion})`;
      xAxisData.push(label);
      tooltipMap.set(idx, item);
    });

    // Datos para las barras (solo totales)
    const seriesData = itemsArray.map(item => item.totalPernos);

    // Calcular máximo para el eje Y
    const maxValor = Math.max(...seriesData, 0);
    const yAxisMax = Math.ceil(maxValor * 1.2);

    this.chartOptions = {
      title: {
        text: 'PERNOS POR LABOR',
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

          return `<strong>Labor: ${item.labor}</strong><br/>
                  Sección: ${item.seccion || 'N/A'}<br/>
                  Sección Labor: ${item.seccionLabor || 'N/A'}<br/><br/>
                  <strong>Total Pernos: ${item.totalPernos}</strong>`;
        }
      },
      grid: {
        left: '10%',
        right: '5%',
        top: '15%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          fontSize: 11,
          fontWeight: 'bold',
          interval: 0,
          rotate: 0
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
        name: 'Cantidad de Pernos Instalados',
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
      series: [{
        name: 'Total Pernos',
        type: 'bar',
        data: seriesData,
        itemStyle: {
          color: this.COLOR_BARRA,
          borderRadius: [5, 5, 0, 0],
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowBlur: 5
        },
        label: {
          show: true,
          position: 'top',
          fontWeight: 'bold',
          fontSize: 11,
          formatter: (params: any) => params.value > 0 ? params.value : ''
        },
        barWidth: '60%'
      }]
    };
  }

  calcularIntervalo(max: number): number {
    if (max <= 5) return 1;
    if (max <= 10) return 2;
    if (max <= 20) return 5;
    if (max <= 50) return 10;
    return 20;
  }
}