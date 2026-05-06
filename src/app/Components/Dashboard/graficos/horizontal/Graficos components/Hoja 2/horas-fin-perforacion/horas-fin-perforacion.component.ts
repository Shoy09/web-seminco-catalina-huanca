import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';

@Component({
  selector: 'app-horas-fin-perforacion',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './horas-fin-perforacion.component.html',
  styleUrl: './horas-fin-perforacion.component.css'
})
export class HorasFinPerforacionComponent  implements OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
     // console.log('🔥 PROMEDIO PRIMERA PERFORACIÓN RECIBIDO:', this.data);
      this.updateChart();
    }
  }
  
  // Convertir horas a formato numérico para el gráfico
  // 10:30 = 10.5, 13:30 = 13.5, 11:50 = 11.833
  getHoraNumerica(horaStr: string): number {
    const [hora, minuto] = horaStr.split(':');
    return parseInt(hora) + (parseInt(minuto) / 60);
  }

  // Formatear hora numérica a string
  formatearHora(horaNum: number): string {
    const hora = Math.floor(horaNum);
    const minuto = Math.round((horaNum - hora) * 60);
    return `${hora}:${minuto.toString().padStart(2, '0')}`;
  }

  // Convertir promedio (que es un número decimal representando horas) a formato hora
  promedioAHora(promedio: number): number {
    // promedio viene como 13.666... que significa 13:40 (0.666 * 60 = 40)
    return promedio;
  }

  updateChart(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    // Ordenar datos por modelo_equipo para consistencia
    const sortedData = [...this.data].sort((a, b) => 
      a.modelo_equipo.localeCompare(b.modelo_equipo)
    );

    // Preparar datos para el gráfico
    const xAxisData = sortedData.map(item => item.modelo_equipo || 'N/A');
    const seriesData = sortedData.map(item => item.promedio_ultima_perf_dia_fr || 0);

    // Calcular min y max para el eje Y (con un margen del 10%)
    const minValue = Math.min(...seriesData);
    const maxValue = Math.max(...seriesData);
    const margin = (maxValue - minValue) * 0.15;
    const yAxisMin = Math.max(0, Math.floor(minValue - margin));
    const yAxisMax = Math.ceil(maxValue + margin);

    this.chartOptions = {
      title: {
        text: 'Horas de Termino de Perforación Turno DIA',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#2c3e50'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const item = sortedData[params[0].dataIndex];
          const horaNum = params[0].value;
          const horaFormateada = this.formatearHora(horaNum);
          return `<strong>${item.modelo_equipo}</strong><br/>
                  Promedio hora de inicio: ${horaFormateada}<br/>
                  <small>(Valor decimal: ${horaNum.toFixed(2)})</small>`;
        }
      },
      grid: {
        left: '10%',
        right: '8%',
        top: '18%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          fontSize: 14,
          fontWeight: 'bold',
          color: '#333',
          interval: 0,
          rotate: 0
        },
        axisLine: {
          lineStyle: {
            color: '#333',
            width: 2
          }
        },
        axisTick: {
          show: true,
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        name: 'Hora del Día',
        nameLocation: 'middle',
        nameGap: 45,
        min: yAxisMin,
        max: yAxisMax,
        axisLabel: {
          fontSize: 11,
          formatter: (value: number) => {
            return this.formatearHora(value);
          }
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#ccc'
          }
        },
        axisLine: {
          show: false
        }
      },
      series: [
        {
          name: 'Hora de Inicio',
          type: 'line',
          data: seriesData,
          symbol: 'circle',
          symbolSize: 10,
          lineStyle: {
            color: '#3498db',
            width: 3,
            type: 'solid',
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 5
          },
          itemStyle: {
            color: '#2980b9',
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => {
              const horaFormateada = this.formatearHora(params.value);
              return horaFormateada;
            },
            fontWeight: 'bold',
            fontSize: 12,
            color: '#2980b9',
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: [4, 8, 4, 8],
            borderRadius: 4,
            borderColor: '#3498db',
            borderWidth: 1
          },
          smooth: false,
          connectNulls: false,
          areaStyle: {
            opacity: 0.1,
            color: '#3498db'
          },
          markPoint: {
            data: [
              { type: 'min', name: 'Más temprano' },
              { type: 'max', name: 'Más tarde' }
            ],
            symbolSize: 40,
            label: {
              formatter: (params: any) => {
                const hora = this.formatearHora(params.value);
                return params.name === 'Más temprano' ? `🔵 ${hora}` : `🔴 ${hora}`;
              }
            }
          },
          markLine: {
            data: [
              { 
                type: 'average', 
                name: 'Promedio',
                lineStyle: {
                  color: '#e74c3c',
                  width: 2,
                  type: 'dashed'
                },
                label: {
                  formatter: (params: any) => {
                    const hora = this.formatearHora(params.value);
                    return `Promedio: ${hora}`;
                  }
                }
              }
            ]
          }
        }
      ]
    };
  }
}