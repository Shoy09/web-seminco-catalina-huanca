import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CommonModule } from '@angular/common';

// Registramos los componentes necesarios
echarts.use([
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent,
  LegendComponent,
  CanvasRenderer
]);

@Component({
  selector: 'app-metros-perforados-rango-hora',
  standalone: true,
  imports: [NgxEchartsDirective, CommonModule],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './metros-perforados-rango-hora.component.html',
  styleUrl: './metros-perforados-rango-hora.component.css'
})
export class MetrosPerforadosRangoHoraComponent implements OnInit, OnChanges {

  @Input() data: any[] = []; // Datos procesados por la función
  @Input() turno: string = '';

  chartOptions: any = {};
  
  
  // Almacenará los totales por tipo de perforación
  totalesPorTipo: { [key: string]: number } = {};
  tiposPerforacion: string[] = [];

  totalesPorEquipo: { [key: string]: number } = {};
equipos: string[] = [];

   maxItemsMostrar: number = 5; // Cambia este valor según necesites (5, 6, etc.)
  verTodos: boolean = false;

  // Paleta de colores dinámica
  public  coloresBase = [
    '#9df6c2', '#1eff7c', '#2ecc71', '#27ae60', '#f39c12', 
    '#e74c3c', '#3498db', '#9b59b6', '#1abc9c', '#e67e22',
    '#95a5a6', '#d35400', '#c0392b', '#16a085', '#8e44ad'
  ];

  private rangosPorTurno: { [key: string]: string[] } = {
    'DÍA': [
      '06:00 - 07:00', '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00', 
      '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', 
      '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00'
    ],
    'NOCHE': [
      '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00', 
      '22:00 - 23:00', '23:00 - 00:00', '00:00 - 01:00', '01:00 - 02:00', 
      '02:00 - 03:00', '03:00 - 04:00', '04:00 - 05:00', '05:00 - 06:00'
    ],
    '': [
      '06:00 - 07:00', '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00', 
      '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', 
      '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00',
      '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00', 
      '22:00 - 23:00', '23:00 - 00:00', '00:00 - 01:00', '01:00 - 02:00', 
      '02:00 - 03:00', '03:00 - 04:00', '04:00 - 05:00', '05:00 - 06:00'
    ]
  };

  ngOnInit(): void {
    this.procesarDatos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['turno']) {
      this.procesarDatos();
    }
  }

  // Filtra los tipos que tienen metros > 0
get tiposPerforacionFiltrados(): string[] {
  return this.tiposPerforacion.filter(tipo => (this.totalesPorTipo[tipo] || 0) > 0);
}

get equiposFiltrados(): string[] {

  return this.equipos.filter(
    equipo =>
      (this.totalesPorEquipo[equipo] || 0) > 0
  );

}

extraerEquipos(): void {
  const equiposSet = new Set<string>();

  if (this.data && this.data.length > 0) {

    this.data.forEach(item => {

      if (item.equipos) {

        Object.keys(item.equipos).forEach(equipo => {
          equiposSet.add(equipo);
        });

      }

    });

  }

  this.equipos = Array.from(equiposSet).sort();
}

calcularTotalesPorEquipo(): void {

  this.totalesPorEquipo = {};

  if (this.data && this.data.length > 0) {

    this.equipos.forEach(equipo => {

      this.totalesPorEquipo[equipo] =
        this.data.reduce((sum, item) => {

          const valor =
  item.equipos?.[equipo]?.total || 0;

          return sum + valor;

        }, 0);

    });

  }

}

obtenerTooltipEquipo(equipo: string): string {

  const laboresTotales: {
    [labor: string]: number
  } = {};

  this.data.forEach(item => {

    const equipoData =
      item.equipos?.[equipo];

    if (!equipoData?.labores) return;

    Object.keys(equipoData.labores)
      .forEach(labor => {

        if (!laboresTotales[labor]) {
          laboresTotales[labor] = 0;
        }

        laboresTotales[labor] +=
          equipoData.labores[labor];

      });

  });

  const laboresTexto =
    Object.entries(laboresTotales)
      .map(([labor, metros]) =>
        `${labor}: ${Number(metros).toFixed(2)} m`
      )
      .join('\n');

  return laboresTexto || 'Sin labores';
}

  procesarDatos(): void {
    this.extraerTiposPerforacion();
    this.calcularTotalesPorTipo();
    
     this.extraerEquipos();
  this.calcularTotalesPorEquipo();

    const rangosCompletos = this.rangosPorTurno[this.turno] || this.rangosPorTurno[''];
    
    if (!this.data || this.data.length === 0) {
      this.actualizarGraficoConRangosCompletos(rangosCompletos, []);
      return;
    }

    this.actualizarGraficoConRangosCompletos(rangosCompletos, this.data);
  }

   get tiposPerforacionMostrados(): string[] {
    if (this.verTodos) {
      return this.tiposPerforacion;
    }
    return this.tiposPerforacion.slice(0, this.maxItemsMostrar);
  }

  // Toggle sin cambiar altura
  toggleVerTodos(): void {
    this.verTodos = !this.verTodos;
    // Ya no cambiamos maxHeightLista porque usamos scroll
  }
  
  // Extraer todos los tipos de perforación únicos de los datos
  extraerTiposPerforacion(): void {

  const tiposSet = new Set<string>();

  if (this.data && this.data.length > 0) {

    this.data.forEach(item => {

      Object.keys(item).forEach(key => {

        if (
          ![
            'rangoHora',
            'total',
            'cantidadRegistros',
            'equipos'
          ].includes(key)
        ) {
          tiposSet.add(key);
        }

      });

    });

  }

  this.tiposPerforacion =
    Array.from(tiposSet).sort();

}

  // Calcular totales acumulados por tipo de perforación
  calcularTotalesPorTipo(): void {
    this.totalesPorTipo = {};
    
    if (this.data && this.data.length > 0) {
      this.tiposPerforacion.forEach(tipo => {
        this.totalesPorTipo[tipo] = this.data.reduce((sum, item) => {
          return sum + (item[tipo] || 0);
        }, 0);
      });
    }
  }

  get totalGeneral(): number {
    if (!this.data || this.data.length === 0) return 0;
    return this.data.reduce((sum, item) => sum + (item.total || 0), 0);
  }

  actualizarGraficoConRangosCompletos(rangosCompletos: string[], datosOriginales: any[]): void {
    const datosPorRango = new Map<string, any>();
    datosOriginales.forEach(item => {
      datosPorRango.set(item.rangoHora, item);
    });

    const rangos: string[] = [];
    const seriesData: { [key: string]: number[] } = {};
    
    // Inicializar arrays para cada tipo de perforación
    this.tiposPerforacion.forEach(tipo => {
      seriesData[tipo] = [];
    });
    
    const totales: number[] = [];

    // Llenar datos por rango
    rangosCompletos.forEach(rango => {
      rangos.push(rango);
      
      if (datosPorRango.has(rango)) {
        const item = datosPorRango.get(rango);
        
        this.tiposPerforacion.forEach(tipo => {
          seriesData[tipo].push(item[tipo] || 0);
        });
        
        totales.push(item.total || 0);
      } else {
        this.tiposPerforacion.forEach(tipo => {
          seriesData[tipo].push(0);
        });
        totales.push(0);
      }
    });

    // Calcular línea acumulativa
    const acumulativo: number[] = [];
    let sumaAcumulada = 0;
    for (let i = 0; i < totales.length; i++) {
      sumaAcumulada += totales[i];
      acumulativo.push(sumaAcumulada);
    }

    const maxTotal = Math.max(...totales, 0);
    const maxAcumulado = Math.max(...acumulativo, 0);
    const escalaMax = Math.max(maxTotal, maxAcumulado) > 0 
      ? Math.ceil(Math.max(maxTotal, maxAcumulado) / 100) * 100 
      : 100;

    // Generar series para cada tipo de perforación
    const series: any[] = [];

    
    
    this.tiposPerforacion.forEach((tipo, index) => {
      const colorIndex = index % this.coloresBase.length;
      const isLast = index === this.tiposPerforacion.length - 1;
      
      series.push({
        name: tipo,
        type: 'bar',
        stack: 'total',
        barWidth: '60%',
        data: seriesData[tipo],
        itemStyle: {
          color: this.coloresBase[colorIndex],
          borderRadius: isLast ? [4, 4, 0, 0] : [0, 0, 0, 0],
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowBlur: 4,
          shadowOffsetY: 1
        },
        label: {
          show: false
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 8,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        z: 1
      });
    });

    // Agregar etiquetas de total en la última serie
    if (series.length > 0) {
      series[series.length - 1].label = {
        show: true,
        position: 'top',
        fontWeight: 'bold',
        fontSize: 12,
        formatter: (params: any) => {
          const total = totales[params.dataIndex];
          return total > 0 ? total.toFixed(0) + ' m' : '';
        },
        color: '#2c3e50',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: [2, 6, 2, 6],
        borderRadius: 4,
        borderColor: '#ddd',
        borderWidth: 1,
        z: 100
      };
    }

    // Agregar línea acumulativa
    series.push({
      name: 'ACUMULADO',
      type: 'line',
      data: acumulativo,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: '#ff6b6b',
        width: 3,
        type: 'solid',
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowBlur: 6
      },
      itemStyle: {
        color: '#ff6b6b',
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false
      },
      smooth: true,  // ← CAMBIADO: de false a true para suavizar la curva
      smoothMonotone: 'x', // ← NUEVO: asegura que la suavidad sea monótona en X
      connectNulls: false, // ← NUEVO: no conectar valores nulos
      step: false, // ← NUEVO: asegurar que no sea una línea escalonada
      z: 0,
      emphasis: {
        focus: 'series',
        scale: true,
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => {
            return params.value.toFixed(0) + ' m';
          },
          fontSize: 10,
          fontWeight: 'bold',
          color: '#ff6b6b',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: [2, 6, 2, 6],
          borderRadius: 4,
          borderColor: '#ff6b6b',
          borderWidth: 1,
          z: 50
        }
      },
      tooltip: {
        valueFormatter: (value: any) => value?.toFixed(2) + ' m (acumulado)'
      }
    });

    this.chartOptions = {
      title: {
        text: `METROS PERFORADOS POR RANGO DE HORA ${this.turno ? `- TURNO ${this.turno}` : '- TODOS LOS TURNOS'}`,
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333',
          fontFamily: 'Arial'
        }
      },

      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const rango = params[0].axisValue;
          const index = params[0].dataIndex;
          const total = totales[index];
          const acumulado = acumulativo[index];
          
          if (total === 0 && acumulado === 0) {
            return `<strong>📊 ${rango}</strong><br/>
              <hr style="margin: 5px 0;"/>
              <strong>Sin perforación</strong>`;
          }
          
          let tooltipText = `<strong>📊 ${rango}</strong><br/>
            <hr style="margin: 5px 0;"/>
            <strong>Total hora: ${total.toFixed(2)} m</strong><br/>
            <strong style="color: #ff6b6b;">📈 Acumulado: ${acumulado.toFixed(2)} m</strong><br/><br/>`;
          
          // Mostrar solo los tipos que tienen valor > 0
          params.forEach((param: any) => {
            if (param.seriesName !== 'ACUMULADO' && param.value > 0) {
              const porcentaje = ((param.value / total) * 100).toFixed(1);
              tooltipText += `<span style="display:inline-block; width:12px; height:12px; background-color:${param.color}; border-radius:2px; margin-right:8px;"></span>
                <strong>${param.seriesName}:</strong> ${param.value.toFixed(2)} m (${porcentaje}%)<br/>`;
            }
          });
          
          return tooltipText;
        }
      },

      legend: {
        data: [...this.tiposPerforacion, 'ACUMULADO'],
        top: 40,
        left: 'center',
        itemWidth: 25,
        itemHeight: 14,
        textStyle: {
          fontSize: 12,
          fontWeight: 'bold'
        }
      },

      grid: {
        left: '8%',
        right: '5%',
        top: '18%',
        bottom: '8%',
        containLabel: true
      },

      xAxis: {
        type: 'category',
        data: rangos,
        axisLabel: {
          fontSize: 11,
          fontWeight: 'normal',
          color: '#2c3e50',
          fontFamily: 'Arial',
          rotate: 0,
          interval: 0,
          margin: 10
        },
        axisLine: {
          lineStyle: {
            color: '#666'
          }
        },
        axisTick: {
          show: false
        }
      },

      yAxis: {
        type: 'value',
        nameLocation: 'middle',
        nameGap: 45,
        min: 0,
        max: escalaMax,
        axisLabel: {
          fontSize: 10,
          formatter: '{value} m'
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#ccc'
          }
        }
      },

      series: series,
      
      graphic: {
        type: 'group',
        z: 100
      }
    };
  }
}