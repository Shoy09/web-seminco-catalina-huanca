import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EChartsOption, ScatterSeriesOption } from 'echarts';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';

// 👇 IMPORTAR CORE
import * as echarts from 'echarts/core';

// 👇 IMPORTAR LO NECESARIO
import { ScatterChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 👇 REGISTRAR
echarts.use([
  ScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer
]);

@Component({
  selector: 'app-scatter-turnos-noche',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './scatter-turnos-noche.component.html',
  styleUrl: './scatter-turnos-noche.component.css'
})
export class ScatterTurnosNocheComponent implements OnInit, OnChanges {

  @Input() data: any[] = []; // 👈 DATA REAL DESDE EL PADRE

  chartOption: EChartsOption = {};

  ngOnInit(): void {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      //console.log('📥 Data scatter recibida:', this.data);
      this.renderChart();
    }
  }

  // =========================================
  // 🔥 RENDER CENTRAL
  // =========================================
  private renderChart() {
    if (!this.data || this.data.length === 0) {
      console.warn('⚠️ No hay datos para el gráfico');
      this.chartOption = this.getEmptyChartOptions();
      return;
    }

    const dataFinal = this.transformData(this.data);
    
    if (dataFinal.length === 0) {
      console.warn('⚠️ No hay datos válidos después de transformar');
      this.chartOption = this.getEmptyChartOptions();
      return;
    }

    this.chartOption = this.buildChart(dataFinal);
  }

  // =========================================
  // 🔥 TRANSFORMACIÓN DATA REAL
  // =========================================
  private transformData(data: any[]): any[] {
  const transformed = [];

  for (const item of data) {

    const equipo = item.modeloEquipo;
    let hora = item.hora_decimal;
    const fecha = item.fecha;

    if (equipo && hora !== undefined && hora !== null && fecha) {

      // 🔥 NORMALIZAR TURNO NOCHE
      // Si es menor a 7 AM, pertenece al día siguiente del turno noche
      if (hora < 7) {
        hora = hora + 24;
      }

      transformed.push({
        equipo,
        hora,
        fecha: this.formatearFecha(fecha),
        codigo: item.codigo
      });
    }
  }

  return transformed;
}
  // =========================================
  // 🔥 FORMATO FECHA (YYYY-MM-DD → DD/MM/YYYY)
  // =========================================
  private formatearFecha(fecha: string): string {
    if (!fecha) return '';

    // Formato: "2026-04-09" → "09/04/2026"
    if (fecha.includes('-')) {
      const parts = fecha.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }

    return fecha;
  }

  // =========================================
  // 🔥 OPCIONES PARA GRÁFICO VACÍO
  // =========================================
  private getEmptyChartOptions(): EChartsOption {
    return {
      title: {
        text: 'Mapa de Calor de Inicios de Perforación Turno Noche',
        subtext: 'No hay datos disponibles',
        left: 'center',
        top: 'middle',
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold'
        }
      }
    };
  }

  // =========================================
  // BUILD CHART
  // =========================================
  private buildChart(data: any[]): EChartsOption {
    // Obtener equipos únicos y ordenarlos
    const equipos = [...new Set(data.map(d => d.equipo))].sort();
    
    // Obtener fechas únicas y ordenarlas
    const fechas = [...new Set(data.map(d => d.fecha))].sort((a, b) => {
      // Ordenar por fecha (DD/MM/YYYY)
      const [dayA, monthA, yearA] = a.split('/');
      const [dayB, monthB, yearB] = b.split('/');
      const dateA = new Date(`${yearA}-${monthA}-${dayA}`);
      const dateB = new Date(`${yearB}-${monthB}-${dayB}`);
      return dateA.getTime() - dateB.getTime();
    });

    const series: ScatterSeriesOption[] = fechas.map(fecha => ({
      name: fecha,
      type: 'scatter',
      data: data
        .filter(d => d.fecha === fecha)
        .map(d => ({
  value: [d.hora, d.equipo],
  codigo: d.codigo
})),
      symbolSize: 12,
      emphasis: {
        scale: 1.5
      }
    }));

    return {
      title: {
        text: 'Mapa de Calor de Inicios de Perforación Turno Noche',
        left: 'center',
        top: 5,
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold'
        }
      },

      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          return `
            <b>${params.value[1]}</b><br/>
            Hora: ${this.formatHoraTurnoNoche(params.value[0])}<br/>
            Fecha: ${params.seriesName}<br/>
            Código: ${params.data.codigo}
          `;
        }
      },

      legend: {
        data: fechas,
        top: 35,
        left: 'center'
      },

      grid: {
        left: 60,
        right: 30,
        top: 80,
        bottom: 40,
        containLabel: true
      },

      xAxis: {
        type: 'value',
        name: 'Horas',
        min: 19,
        max: 31,
        interval: 1,
        axisLabel: {
          formatter: (value: number) => this.formatHoraTurnoNoche(value),
          rotate: 0
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed'
          }
        }
      },

      yAxis: {
        type: 'category',
        data: equipos,
        name: 'Inicio de Perforación',
        axisLabel: {
          fontSize: 12,
          fontWeight: 'bold'
        },
        splitLine: {
          show: false
        }
      },

      series
    };
  }

  // =========================================
  // FORMATO HORA
  // =========================================
  private formatHoraTurnoNoche(value: number): string {
  if (isNaN(value)) return '--:--';

  // 🔥 volver a formato 24h real
  if (value >= 24) {
    value = value - 24;
  }

  const hora = Math.floor(value);
  const minutos = Math.round((value % 1) * 60);

  return `${hora}:${minutos.toString().padStart(2, '0')}`;
}
}