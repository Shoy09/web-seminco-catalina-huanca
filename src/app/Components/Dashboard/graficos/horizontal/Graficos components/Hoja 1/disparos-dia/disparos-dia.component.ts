import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

@Component({
  selector: 'app-disparos-dia',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './disparos-dia.component.html',
  styleUrl: './disparos-dia.component.css'
})
export class DisparosDiaComponent implements OnChanges {
  
  @Input() data: any[] = [];

  chartOptions: any = {};

  // Paleta de colores para los turnos
  private readonly coloresTurnos: { [key: string]: string } = {
    'DÍA': '#3498db',    // Azul
    'NOCHE': '#5dade2'   // Azul oscuro / gris azulado
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      console.log('📊 DATA RECIBIDA:', this.data);
      this.actualizarGrafico();
    }
  }

  actualizarGrafico(): void {
    if (!this.data || this.data.length === 0) {
      this.chartOptions = {};
      return;
    }

    // Obtener fechas únicas
    const fechasSet = new Set<string>();
    this.data.forEach(item => {
      fechasSet.add(item.fecha);
    });
    const fechas = Array.from(fechasSet).sort();

    // Obtener turnos únicos (DÍA, NOCHE, etc.)
    const turnosSet = new Set<string>();
    this.data.forEach(item => {
      turnosSet.add(item.turno || 'SIN TURNO');
    });
    const turnos = Array.from(turnosSet).sort();

    // Preparar datos agrupados por fecha y turno
    const xAxisData = fechas.map(fecha => this.formatearFecha(fecha));
    
    // Crear series por turno (barras apiladas)
    const series = turnos.map(turno => ({
      name: turno,
      type: 'bar',
      stack: 'total',  // 👈 Apila las barras
      barWidth: '50%',
      data: fechas.map(fecha => {
        const item = this.data.find(d => d.fecha === fecha && d.turno === turno);
        return item ? item.n_frentes || 0 : 0;
      }),
      itemStyle: {
        color: this.coloresTurnos[turno] || '#95a5a6',
        borderRadius: turno === turnos[turnos.length - 1] 
          ? [5, 5, 0, 0]  // Solo la última serie (superior) tiene bordes redondeados
          : [0, 0, 0, 0],
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

    // Calcular totales por fecha para el eje Y
    const totalesPorFecha = fechas.map(fecha => {
      return this.data
        .filter(d => d.fecha === fecha)
        .reduce((sum, d) => sum + (d.n_frentes || 0), 0);
    });
    
    const maxValor = Math.max(...totalesPorFecha, 1);
    const yAxisMax = Math.ceil(maxValor * 1.2);

    this.chartOptions = {
      title: {
        text: 'DISPAROS POR DÍA',
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
          let fecha = '';
          let total = 0;
          let detalle = '';
          
          params.forEach((p: any) => {
            if (fecha === '') {
              fecha = p.axisValue;
            }
            if (p.value > 0) {
              detalle += `${p.marker} ${p.seriesName}: ${p.value}<br/>`;
              total += p.value;
            }
          });
          
          return `<strong>${fecha}</strong><br/><br/>
                  ${detalle}
                  <strong>Total: ${total}</strong>`;
        }
      },
      legend: {
        orient: 'horizontal',
        bottom: 5,
        left: 'center',
        data: turnos,
        itemWidth: 18,
        itemHeight: 10,
        textStyle: {
          fontSize: 11,
          fontWeight: 'bold',
          color: '#2c3e50'
        }
      },
      grid: {
        left: '10%',
        right: '5%',
        top: '15%',
        bottom: '12%',
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
        name: 'Cantidad de Disparos',
        nameLocation: 'middle',
        nameGap: 45,
        min: 0,
        max: yAxisMax,
        interval: this.calcularIntervalo(yAxisMax),
        axisLabel: {
          fontSize: 11,
          formatter: '{value}'
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: '#e0e0e0',
            width: 1
          }
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        }
      },
      series
    };
  }

  formatearFecha(fechaStr: string): string {
    if (!fechaStr) return '';

    const [year, month, day] = fechaStr.split('-').map(Number);
    const fecha = new Date(year, month - 1, day);

    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    return `${fecha.getDate()} ${meses[fecha.getMonth()]}`;
  }

  calcularIntervalo(max: number): number {
    if (max <= 5) return 1;
    if (max <= 10) return 2;
    if (max <= 20) return 5;
    if (max <= 50) return 10;
    return 20;
  }
}