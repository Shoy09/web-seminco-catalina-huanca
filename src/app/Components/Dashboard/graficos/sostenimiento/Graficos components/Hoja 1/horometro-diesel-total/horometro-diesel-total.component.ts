import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

@Component({
  selector: 'app-horometro-diesel-total',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './horometro-diesel-total.component.html',
  styleUrl: './horometro-diesel-total.component.css'
})
export class HorometroDieselTotalComponent implements OnChanges {
  
  @Input() data: any = null; // Puede recibir un objeto o un array

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
      console.log('Data changed Horómetro Diesel Total:', this.data);
      this.actualizarGrafico();
    }
  }

  actualizarGrafico(): void {
    if (!this.data) {
      this.chartOptions = {};
      return;
    }

    // Verificar si data es un array y tiene elementos
    let datosProcesados = this.data;
    if (Array.isArray(this.data) && this.data.length > 0) {
      datosProcesados = this.data[0]; // Tomar el primer elemento del array
    }

    // Obtener el valor total de DiferenciaDiesel
    const diferenciaDieselTotal = datosProcesados.DiferenciaDiesel || 0;
    
    console.log('Valor DiferenciaDiesel:', diferenciaDieselTotal);
    
    // Redondear para mostrar en la barra (sin decimales)
    const valorRedondeado = Math.round(diferenciaDieselTotal);

    const xAxisData = ['Diesel'];

    const series = [{
      name: 'Diferencia Diesel',
      type: 'bar',
      barWidth: '50%',
      data: [valorRedondeado],
      itemStyle: {
        color: this.PALETA_AZULES[3],
        borderRadius: [5, 5, 0, 0],
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowBlur: 5
      },
      label: {
        show: true,
        position: 'top',
        fontWeight: 'bold',
        fontSize: 14,
        offset: [0, 5],
        formatter: (params: any) => {
          // Mostrar sin decimales
          return Math.round(params.value).toString();
        }
      }
    }];

    // Calcular máximo para el eje Y con 20% de margen
    const maxValor = diferenciaDieselTotal;
    const maxHoras = Math.ceil(maxValor * 1.2);

    this.chartOptions = {
      title: {
        text: 'HORÓMETRO DIESEL TOTAL',
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
          return `<strong>Diesel Total</strong><br/><br/>
                  <strong>Diferencia Diesel: ${diferenciaDieselTotal.toFixed(2)} hrs</strong>`;
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
          fontSize: 13,
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
        max: maxHoras > 0 ? maxHoras : 10, // Si es 0, poner un mínimo de 10
        interval: this.calcularIntervalo(maxHoras > 0 ? maxHoras : 10),
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
    if (max <= 1000) return 200;
    if (max <= 2000) return 500;
    return 1000;
  }
}