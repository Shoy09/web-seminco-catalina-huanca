import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent, GraphicComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, GraphicComponent, CanvasRenderer]);

@Component({
  selector: 'app-pernos-equipo',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './pernos-equipo.component.html',
  styleUrl: './pernos-equipo.component.css'
})
export class PernosEquipoComponent implements OnChanges {
  
  @Input() data: any[] = [];

  chartOptions: any = {};

  readonly PALETA_AZULES = [
    '#85c1e9',
    '#5dade2',
    '#3498db',
    '#2e86c1',
    '#2874a6',
    '#21618c',
    '#1b4f72',
    '#154360'
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

    // Agrupar por seccionLabor, modeloEquipo y seccion
    const itemsMap = new Map<string, any>();
    
    this.data.forEach(item => {
      const key = `${item.seccionLabor}|${item.modeloEquipo}|${item.seccion}`;
      if (!itemsMap.has(key)) {
        itemsMap.set(key, {
          seccionLabor: item.seccionLabor,
          modeloEquipo: item.modeloEquipo,
          seccion: item.seccion,
          tipos: {}
        });
      }
      const itemData = itemsMap.get(key);
      itemData.tipos[item.tipoPernos] = (itemData.tipos[item.tipoPernos] || 0) + item.totalPernos;
    });

    // Convertir mapa a array
    const itemsArray = Array.from(itemsMap.values());
    
    // Ordenar por seccionLabor y luego por modeloEquipo
    itemsArray.sort((a, b) => {
      if (a.seccionLabor !== b.seccionLabor) {
        return a.seccionLabor.localeCompare(b.seccionLabor);
      }
      return a.modeloEquipo.localeCompare(b.modeloEquipo);
    });

    // Preparar eje X con: seccionLabor - modeloEquipo (seccion)
    const xAxisData: string[] = [];
    const tooltipMap: Map<number, any> = new Map();

    itemsArray.forEach((item, idx) => {
      // Formato: SECCION_LABOR - modeloEquipo (seccion)
      const label = `${item.seccionLabor}\n${item.modeloEquipo}\n(${item.seccion})`;
      xAxisData.push(label);
      tooltipMap.set(idx, item);
    });

    // Detectar tipos de pernos
    const tiposSet = new Set<string>();
    this.data.forEach(item => {
      if (item.tipoPernos) {
        tiposSet.add(item.tipoPernos);
      }
    });
    const tiposArray = Array.from(tiposSet);

    // Crear series
    const series = tiposArray.map((tipo, tipoIndex) => ({
      name: tipo,
      type: 'bar',
      stack: 'total',
      barWidth: '50%',
      data: itemsArray.map(item => item.tipos[tipo] || 0),
      itemStyle: {
        color: this.PALETA_AZULES[tipoIndex % this.PALETA_AZULES.length],
        borderRadius: tipoIndex === tiposArray.length - 1 ? [5, 5, 0, 0] : [0, 0, 0, 0],
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowBlur: 5
      },
      label: {
        show: true,
        position: 'inside',
        fontWeight: 'bold',
        fontSize: 11,
        formatter: (params: any) => params.value > 0 ? params.value : ''
      }
    }));

    // Calcular máximo
    const totales = itemsArray.map(item => {
      return Object.values(item.tipos).reduce((sum: number, val: any) => sum + val, 0);
    });
    const maxValor = Math.max(...totales, 0);
    const yAxisMax = Math.ceil(maxValor * 1.2);

    this.chartOptions = {
      title: {
        text: 'PERNOS POR EQUIPO',
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

          let detalle = '';
          let total = 0;
          params.forEach((p: any) => {
            if (p.value > 0) {
              detalle += `${p.marker} ${p.seriesName}: ${p.value}<br/>`;
              total += p.value;
            }
          });

          return `<strong>${item.modeloEquipo}</strong><br/>
                  Sección: ${item.seccion || 'N/A'}<br/>
                  Sección Labor: ${item.seccionLabor || 'N/A'}<br/><br/>
                  ${detalle}
                  <strong>Total: ${total}</strong>`;
        }
      },
      legend: {
        bottom: 0,
        left: 'center'
      },
      graphic: [], // ← Vacío, sin separadores
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
          fontSize: 10,
          fontWeight: 'bold',
          interval: 0,
          rotate: 0,
          formatter: (value: string) => {
            // Si el texto es muy largo, se puede rotar o truncar
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
      series
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