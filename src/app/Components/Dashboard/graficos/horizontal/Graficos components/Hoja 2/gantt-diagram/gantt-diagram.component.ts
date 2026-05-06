import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent, DataZoomComponent, ToolboxComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, DataZoomComponent, ToolboxComponent, CanvasRenderer]);

@Component({
  selector: 'app-gantt-diagram',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './gantt-diagram.component.html',
  styleUrl: './gantt-diagram.component.css'
})
export class GanttDiagramComponent implements OnChanges {

  @Input() title: string = 'DIAGRAMA DE GANTT';
  @Input() data: any[] = [];
  @Input() recursos: string[] = [];
  @Input() minHora: number = 7;
  @Input() maxHora: number = 19;

  chartOptions: any = {};

  private colorMap: { [key: string]: string } = {
    'FRENTE COMPLETO': '#2ecc71',
    'BREASTING': '#95a5a6',
    'DES': '#3498db',
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['recursos'] || changes['minHora'] || changes['maxHora']) {
      console.log('🔥 GANTT DIAGRAM DATA:', this.data);
      this.updateChart();
    }
  }

  updateChart(): void {
    if (!this.data || this.data.length === 0) {
      this.chartOptions = this.getEmptyChartOptions();
      return;
    }

    // Obtener lista de recursos
    const recursosList = this.recursos.length > 0 
      ? this.recursos 
      : [...new Set(this.data.map(a => a.recurso || a.equipo || a.nombre))].sort();

    // Mapear recursos a índices (de abajo hacia arriba para que J-14 arriba, J-20 abajo)
    const recursoIndexMap = new Map<string, number>();
    recursosList.forEach((recurso, idx) => {
      recursoIndexMap.set(recurso, recursosList.length - 1 - idx);
    });

    // Preparar series por tipo de actividad
    const seriesMap = new Map<string, any[]>();
    
    this.data.forEach(actividad => {
      const tipo = actividad.actividad;
      const recurso = actividad.recurso || actividad.equipo || actividad.nombre;
      const yIndex = recursoIndexMap.get(recurso);
      
      if (yIndex !== undefined) {
        if (!seriesMap.has(tipo)) {
          seriesMap.set(tipo, []);
        }
        
        // Formato para gráfico de barras: [x_inicio, y, x_fin]
        // Usamos custom render o convertimos a barras normales con formato especial
        seriesMap.get(tipo)!.push({
          name: recurso,
          value: [actividad.inicio, actividad.fin],
          yAxis: yIndex,
          itemStyle: {
            color: this.colorMap[tipo] || '#95a5a6'
          },
          label: actividad.label || ''
        });
      }
    });

    // Construir series para el gráfico usando custom series
    const series: any[] = [];
    
    seriesMap.forEach((actividades, tipo) => {
      // Para cada actividad, crear una serie separada con sus datos
      series.push({
        name: tipo,
        type: 'bar',
        data: actividades.map(a => ({
          value: a.value,
          yAxis: a.yAxis,
          itemStyle: a.itemStyle,
          label: a.label
        })),
        barWidth: 30,
        itemStyle: {
          borderRadius: [4, 4, 4, 4],
        },
        label: {
          show: true,
          position: 'insideLeft',
          formatter: (params: any) => {
            const data = params.data;
            if (data.label && data.label.length > 0) {
              return data.label.length > 10 ? data.label.substring(0, 8) + '..' : data.label;
            }
            return '';
          },
          fontSize: 10,
          fontWeight: 'bold',
          color: '#fff',
          overflow: 'break'
        },
        stack: undefined,
        encode: {
          x: [0, 1],
          y: 1
        }
      });
    });

    // Configuración del eje X
    const xAxisTicks = [];
    for (let i = this.minHora; i <= this.maxHora; i++) {
      xAxisTicks.push(i);
    }

    this.chartOptions = {
      title: {
        text: this.title,
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#2c3e50'
        }
      },
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          if (!params.data) return '';
          const data = params.data;
          const inicio = this.formatearHora(data.value[0]);
          const fin = this.formatearHora(data.value[1]);
          const duracion = data.value[1] - data.value[0];
          
          let result = `<strong>${params.name}</strong><br/>`;
          result += `📋 Actividad: ${params.seriesName}<br/>`;
          result += `⏰ ${inicio} - ${fin}<br/>`;
          result += `⌛ Duración: ${duracion.toFixed(1)} horas<br/>`;
          
          if (data.label && data.label.length > 0 && data.label !== params.seriesName) {
            result += `📝 ${data.label}`;
          }
          return result;
        }
      },
      legend: {
        data: Array.from(seriesMap.keys()),
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
        top: '18%',
        bottom: '10%',
        containLabel: false
      },
      xAxis: {
        type: 'value',
        name: 'Hora del Día',
        nameLocation: 'middle',
        nameGap: 35,
        min: this.minHora,
        max: this.maxHora,
        interval: 1,
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
          lineStyle: {
            color: '#333',
            width: 2
          }
        }
      },
      yAxis: {
        type: 'category',
        data: [...recursosList].reverse(),
        axisLabel: {
          fontSize: 13,
          fontWeight: 'bold',
          color: '#333'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        }
      },
      series: series,
      toolbox: {
        feature: {
          saveAsImage: { title: 'Guardar como imagen' }
        },
        right: 20,
        top: 10
      }
    };
  }

  formatearHora(horaNum: number): string {
    const hora = Math.floor(horaNum);
    const minuto = Math.round((horaNum - hora) * 60);
    return `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
  }

  getEmptyChartOptions(): any {
    return {
      title: {
        text: this.title,
        left: 'center',
        top: 10,
        textStyle: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' }
      },
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: 'No hay datos disponibles',
          fill: '#999',
          fontSize: 14
        }
      }
    };
  }
}