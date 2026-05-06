import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

@Component({
  selector: 'app-horometro-diesel',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './horometro-diesel.component.html',
  styleUrl: './horometro-diesel.component.css'
})
export class HorometroDieselComponent implements OnChanges {
  
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
      //console.log('Data changed Horómetro Diesel:', this.data);
      this.actualizarGrafico();
    }
  }

  actualizarGrafico(): void {
    if (!this.data || this.data.length === 0) {
      this.chartOptions = {};
      return;
    }

    // Agrupar por modeloEquipo (sin sección)
    const itemsMap = new Map<string, any>();
    
    this.data.forEach(item => {
      const key = `${item.modeloEquipo}`;
      if (!itemsMap.has(key)) {
        itemsMap.set(key, {
          modeloEquipo: item.modeloEquipo,
          diferenciaDiesel: 0
        });
      }
      const itemData = itemsMap.get(key);
      // Sumar y mantener precisión para el tooltip
      itemData.diferenciaDiesel += item.DiferenciaDiesel || 0;
    });

    const itemsArray = Array.from(itemsMap.values());
    
    // Ordenar por modeloEquipo
    itemsArray.sort((a, b) => {
      return a.modeloEquipo.localeCompare(b.modeloEquipo);
    });

    const xAxisData: string[] = [];
    const tooltipMap: Map<number, any> = new Map();

    itemsArray.forEach((item, idx) => {
      const label = `${item.modeloEquipo}`;
      xAxisData.push(label);
      tooltipMap.set(idx, item);
    });

    // Redondear los datos para mostrar en la barra (sin decimales)
    const datosRedondeados = itemsArray.map(item => Math.round(item.diferenciaDiesel));

    const series = [{
      name: 'Diferencia Diesel',
      type: 'bar',
      barWidth: '50%',
      data: datosRedondeados,
      itemStyle: {
        color: this.PALETA_AZULES[2],
        borderRadius: [5, 5, 0, 0],
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowBlur: 5
      },
      label: {
        show: true,
        position: 'top',
        fontWeight: 'bold',
        fontSize: 12,
        offset: [0, 5],
        formatter: (params: any) => {
          // Mostrar sin decimales
          return Math.round(params.value).toString();
        }
      }
    }];

    const totales = itemsArray.map(item => item.diferenciaDiesel);
    const maxValor = Math.max(...totales, 0);
    const maxHoras = Math.ceil(maxValor * 1.2);

    this.chartOptions = {
      title: {
        text: 'HORÓMETRO DIESEL',
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

          return `<strong>Equipo: ${item.modeloEquipo}</strong><br/><br/>
                  <strong>Diferencia Diesel: ${item.diferenciaDiesel.toFixed(2)} hrs</strong>`;
        }
      },
      legend: {
        show: false
      },
      grid: {
        left: '15%',
        right: '8%',
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
          rotate: 0,
          fontFamily: 'Arial, sans-serif'
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
        name: 'Diferencia Diesel (hrs)',
        nameLocation: 'middle',
        nameGap: 60,
        nameTextStyle: {
          fontSize: 12,
          fontWeight: 'normal'
        },
        min: 0,
        max: maxHoras,
        interval: this.calcularIntervalo(maxHoras),
        axisLabel: { 
          fontSize: 11,
          formatter: (value: number) => {
            const rounded = Math.round(value);
            return `${rounded}`;
          }
        },
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
    if (max <= 200) return 50;
    if (max <= 500) return 100;
    return 200;
  }
}