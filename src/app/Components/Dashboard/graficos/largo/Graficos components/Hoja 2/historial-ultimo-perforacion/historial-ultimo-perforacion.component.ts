import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';

@Component({
  selector: 'app-historial-ultimo-perforacion',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './historial-ultimo-perforacion.component.html',
  styleUrl: './historial-ultimo-perforacion.component.css'
})
export class HistorialUltimoPerforacionComponent implements OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      //console.log('🔥 HISTORIAL PRIMERA PERFORACIÓN RECIBIDO:', this.data);
      this.updateChart();
    }
  }
  
  // Formatear fecha (mismo método que en DisparosDiaComponent)
  formatearFecha(fechaStr: string): string {
    if (!fechaStr) {
      return '';
    }

    // Fix timezone
    const [year, month, day] = fechaStr.split('-').map(Number);
    const fecha = new Date(year, month - 1, day);

    const dia = fecha.getDate();

    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const mes = meses[fecha.getMonth()];

    return `${dia} ${mes}`;
  }

  // Convertir horas a formato numérico para el gráfico
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

  updateChart(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    // Agrupar datos por modelo_equipo
    const equiposMap = new Map<string, Map<string, number>>();
    const fechasSet = new Set<string>();

    this.data.forEach(item => {
      const equipo = item.modelo_equipo;
      const fecha = item.fecha || item.fecha_perforacion || 'Fecha desconocida';
      const valor = item.promedio_ultima_perf_dia_fr || 0;
      
      fechasSet.add(fecha);
      
      if (!equiposMap.has(equipo)) {
        equiposMap.set(equipo, new Map());
      }
      equiposMap.get(equipo)!.set(fecha, valor);
    });

    // Ordenar fechas cronológicamente
    const fechas = Array.from(fechasSet).sort();
    
    // Preparar fechas formateadas para mostrar en el eje X
    const fechasFormateadas = fechas.map(fecha => this.formatearFecha(fecha));
    
    // Preparar series para cada equipo
    const series: any[] = [];
    const colores = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
    let colorIndex = 0;

    equiposMap.forEach((valoresMap, equipo) => {
      const dataPorFecha = fechas.map(fecha => valoresMap.get(fecha) || null);
      
      series.push({
        name: equipo,
        type: 'line',
        data: dataPorFecha,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: colores[colorIndex % colores.length],
          width: 2,
          type: 'solid'
        },
        itemStyle: {
          color: colores[colorIndex % colores.length],
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'top',
          offset: [0, -10],
          formatter: (params: any) => {
            if (params.value === null) return '';
            return this.formatearHora(params.value);
          },
          fontSize: 10,
          fontWeight: 'bold',
          color: colores[colorIndex % colores.length]
          // Sin backgroundColor, sin padding, sin borderRadius, sin border
        },
        smooth: false,
        connectNulls: true,
        markPoint: {
          data: [
            { type: 'min', name: 'Mínimo', symbolSize: 30 },
            { type: 'max', name: 'Máximo', symbolSize: 30 }
          ],
          label: {
            formatter: (params: any) => {
              return this.formatearHora(params.value);
            }
          }
        },
        markLine: {
          data: [
            { 
              type: 'average', 
              name: 'Promedio',
              lineStyle: {
                color: colores[colorIndex % colores.length],
                width: 1,
                type: 'dashed'
              },
              label: {
                formatter: (params: any) => {
                  return this.formatearHora(params.value);
                }
              }
            }
          ]
        }
      });
      colorIndex++;
    });

    // Calcular min y max global para el eje Y
    let globalMin = Infinity;
    let globalMax = -Infinity;
    equiposMap.forEach(valoresMap => {
      valoresMap.forEach(valor => {
        if (valor < globalMin) globalMin = valor;
        if (valor > globalMax) globalMax = valor;
      });
    });
    
    const margin = (globalMax - globalMin) * 0.2;
    const yAxisMin = Math.max(0, Math.floor(globalMin - margin));
    const yAxisMax = Math.ceil(globalMax + margin);

    this.chartOptions = {
      title: {
        text: 'Historial Horas de Inicio de Perforación Turno DIA',
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
          const fechaOriginal = fechas[params[0].dataIndex];
          const fechaFormateada = this.formatearFecha(fechaOriginal);
          let result = `<strong>${fechaFormateada}</strong><br/>`;
          params.forEach((p: any) => {
            if (p.value !== null) {
              const horaFormateada = this.formatearHora(p.value);
              result += `${p.marker} ${p.seriesName}: ${horaFormateada}<br/>`;
            }
          });
          return result;
        }
      },
      legend: {
        data: Array.from(equiposMap.keys()),
        left: 'center',
        top: 45,
        orient: 'horizontal',
        itemWidth: 30,
        itemHeight: 14,
        textStyle: {
          fontSize: 11,
          fontWeight: 'bold'
        }
      },
      grid: {
        left: '10%',
        right: '8%',
        top: '22%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: fechasFormateadas,
        axisLabel: {
          fontSize: 11,
          fontWeight: 'bold',
          color: '#333',
          interval: 0,
          rotate: 30
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
      series: series
    };
  }
}