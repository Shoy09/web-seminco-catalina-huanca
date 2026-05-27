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

// 🔥 Registramos LineChart también
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
  selector: 'app-toneladas-rango-hora',
  standalone: true,
  imports: [NgxEchartsDirective, CommonModule],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './toneladas-rango-hora.component.html',
  styleUrl: './toneladas-rango-hora.component.css'
})
export class ToneladasRangoHoraComponent implements OnInit, OnChanges {

  @Input() data: any[] = [];
  @Input() turno: string = '';

  chartOptions: any = {};
  
  totalesMateriales = {
    mineral: 0,
    desmonte: 0,
    relave: 0,
    relleno: 0
  };

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

  procesarDatos(): void {
    this.calcularTotalesMateriales();
    const rangosCompletos = this.rangosPorTurno[this.turno] || this.rangosPorTurno[''];
    
    if (!this.data || this.data.length === 0) {
      this.actualizarGraficoConRangosCompletos(rangosCompletos, []);
      return;
    }

    this.actualizarGraficoConRangosCompletos(rangosCompletos, this.data);
  }
  
  calcularTotalesMateriales(): void {
    if (!this.data || this.data.length === 0) {
      this.totalesMateriales = { mineral: 0, desmonte: 0, relave: 0, relleno: 0 };
      return;
    }
    
    this.totalesMateriales = {
      mineral: this.data.reduce((sum, item) => sum + (item.mineral || 0), 0),
      desmonte: this.data.reduce((sum, item) => sum + (item.desmonte || 0), 0),
      relave: this.data.reduce((sum, item) => sum + (item.relave || 0), 0),
      relleno: this.data.reduce((sum, item) => sum + (item.relleno || 0), 0)
    };
  }

  get totalGeneral(): number {
    return this.totalesMateriales.mineral + 
           this.totalesMateriales.desmonte + 
           this.totalesMateriales.relave + 
           this.totalesMateriales.relleno;
  }

  actualizarGraficoConRangosCompletos(rangosCompletos: string[], datosOriginales: any[]): void {
    const datosPorRango = new Map<string, any>();
    datosOriginales.forEach(item => {
      datosPorRango.set(item.rangoHora, item);
    });

    const rangos: string[] = [];
    const mineral: number[] = [];
    const desmonte: number[] = [];
    const relave: number[] = [];
    const relleno: number[] = [];
    const totales: number[] = [];

    rangosCompletos.forEach(rango => {
      rangos.push(rango);
      
      if (datosPorRango.has(rango)) {
        const item = datosPorRango.get(rango);
        mineral.push(item.mineral || 0);
        desmonte.push(item.desmonte || 0);
        relave.push(item.relave || 0);
        relleno.push(item.relleno || 0);
        totales.push(item.total || 0);
      } else {
        mineral.push(0);
        desmonte.push(0);
        relave.push(0);
        relleno.push(0);
        totales.push(0);
      }
    });

    // 🔥 Calcular línea acumulativa
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

    const colores = {
      mineral: '#9df6c2',
      desmonte: '#1eff7c',
      relave: '#2ecc71',
      relleno: '#27ae60'
    };

    this.chartOptions = {
      title: {
        text: `TONELADAS POR RANGO DE HORA ${this.turno ? `- TURNO ${this.turno}` : '- TODOS LOS TURNOS'}`,
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
              <strong>Sin producción</strong>`;
          }
          
          let tooltipText = `<strong>📊 ${rango}</strong><br/>
            <hr style="margin: 5px 0;"/>
            <strong>Total hora: ${total.toFixed(2)} ton</strong><br/>
            <strong style="color: #ff6b6b;">📈 Acumulado: ${acumulado.toFixed(2)} ton</strong><br/><br/>`;
          
          params.forEach((param: any) => {
            if (param.seriesName !== 'ACUMULADO' && param.value > 0) {
              const porcentaje = ((param.value / total) * 100).toFixed(1);
              tooltipText += `<span style="display:inline-block; width:12px; height:12px; background-color:${param.color}; border-radius:2px; margin-right:8px;"></span>
                <strong>${param.seriesName}:</strong> ${param.value.toFixed(2)} ton (${porcentaje}%)<br/>`;
            }
          });
          
          return tooltipText;
        }
      },

      legend: {
        data: ['MINERAL', 'DESMONTE', 'RELAVE', 'RELLENO', 'ACUMULADO'],
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
        name: 'Toneladas',
        nameLocation: 'middle',
        nameGap: 45,
        min: 0,
        max: escalaMax,
        axisLabel: {
          fontSize: 10,
          formatter: '{value} t'
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#ccc'
          }
        }
      },

      series: [
        {
          name: 'MINERAL',
          type: 'bar',
          stack: 'total',
          barWidth: '60%',
          data: mineral,
          itemStyle: {
            color: colores.mineral,
            borderRadius: [0, 0, 0, 0],
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
          z: 1  // 🔥 Prioridad baja
        },
        {
          name: 'DESMONTE',
          type: 'bar',
          stack: 'total',
          barWidth: '60%',
          data: desmonte,
          itemStyle: {
            color: colores.desmonte,
            borderRadius: [0, 0, 0, 0]
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
          z: 1  // 🔥 Prioridad baja
        },
        {
          name: 'RELAVE',
          type: 'bar',
          stack: 'total',
          barWidth: '60%',
          data: relave,
          itemStyle: {
            color: colores.relave,
            borderRadius: [0, 0, 0, 0]
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
          z: 1  // 🔥 Prioridad baja
        },
        {
          name: 'RELLENO',
          type: 'bar',
          stack: 'total',
          barWidth: '60%',
          data: relleno,
          itemStyle: {
            color: colores.relleno,
            borderRadius: [4, 4, 0, 0]
          },
          label: {
            show: true,
            position: 'top',
            fontWeight: 'bold',
            fontSize: 12,
            formatter: (params: any) => {
              const total = totales[params.dataIndex];
              return total > 0 ? total.toFixed(0) + ' t' : '';
            },
            color: '#2c3e50',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: [2, 6, 2, 6],
            borderRadius: 4,
            borderColor: '#ddd',
            borderWidth: 1,
            z: 100  // 🔥 Prioridad MUY ALTA - siempre visible
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 8,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          },
          z: 2  // 🔥 Prioridad media-alta para las barras
        },
        // 🔥 Línea acumulativa con menor prioridad
        {
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
            show: false  // Etiquetas ocultas normalmente
          },
          smooth: false,
          z: 0,  // 🔥 Prioridad MÁS BAJA - la línea queda detrás de las barras
          emphasis: {
            focus: 'series',
            scale: true,
            label: {
              show: true,
              position: 'top',
              formatter: (params: any) => {
                return params.value.toFixed(0) + ' t';
              },
              fontSize: 10,
              fontWeight: 'bold',
              color: '#ff6b6b',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: [2, 6, 2, 6],
              borderRadius: 4,
              borderColor: '#ff6b6b',
              borderWidth: 1,
              z: 50  // Prioridad media en hover
            }
          },
          tooltip: {
            valueFormatter: (value: any) => value?.toFixed(2) + ' ton (acumulado)'
          }
        }
      ],
      
      // 🔥 Configuración de z-index global
      graphic: {
        type: 'group',
        z: 100
      }
    };
  }
}