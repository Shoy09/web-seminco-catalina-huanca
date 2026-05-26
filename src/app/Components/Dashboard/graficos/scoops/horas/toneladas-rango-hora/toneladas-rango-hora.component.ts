import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CommonModule } from '@angular/common';

echarts.use([
  BarChart,
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

  chartOptions: any = {};

  ngOnInit(): void {
    this.procesarDatos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.procesarDatos();
    }
  }

  procesarDatos(): void {
    if (!this.data || this.data.length === 0) {
      this.chartOptions = {};
      return;
    }

    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    if (!this.data.length) {
      this.chartOptions = {};
      return;
    }

    // 🔥 Rangos de hora para el eje X
    const rangos = this.data.map(item => item.rangoHora);
    
    // 🔥 Valores por tipo de material
    const mineral = this.data.map(item => item.mineral || 0);
    const desmonte = this.data.map(item => item.desmonte || 0);
    const relave = this.data.map(item => item.relave || 0);
    const relleno = this.data.map(item => item.relleno || 0);
    
    // 🔥 Totales por rango (para mostrar arriba de la barra)
    const totales = this.data.map(item => item.total || 0);
    
    // 🔥 Calcular máximo para escala dinámica
    const maxTotal = Math.max(...totales);
    const escalaMax = Math.ceil(maxTotal / 100) * 100;

    // 🔥 Colores para cada tipo de material
    const colores = {
      mineral: '#2ecc71',      // Verde
      desmonte: '#f39c12',     // Naranja
      relave: '#9b59b6',       // Morado
      relleno: '#3498db'       // Azul
    };

    this.chartOptions = {
      title: {
        text: 'TONELADAS POR RANGO DE HORA',
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
          const total = totales[params[0].dataIndex];
          
          let tooltipText = `<strong>📊 ${rango}</strong><br/>
            <hr style="margin: 5px 0;"/>
            <strong>Total: ${total.toFixed(2)} ton</strong><br/><br/>`;
          
          // Mostrar cada material con su valor
          params.forEach((param: any) => {
            if (param.value > 0) {
              const porcentaje = ((param.value / total) * 100).toFixed(1);
              tooltipText += `<span style="display:inline-block; width:12px; height:12px; background-color:${param.color}; border-radius:2px; margin-right:8px;"></span>
                <strong>${param.seriesName}:</strong> ${param.value.toFixed(2)} ton (${porcentaje}%)<br/>`;
            }
          });
          
          return tooltipText;
        }
      },

      legend: {
        data: ['MINERAL', 'DESMONTE', 'RELAVE', 'RELLENO'],
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
          fontSize: 9,           // 🔥 Texto más pequeño
          fontWeight: 'normal',  // 🔥 Normal en lugar de bold
          color: '#2c3e50',
          fontFamily: 'Arial',
          rotate: 0,             // 🔥 Horizontal (sin rotación)
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
          }
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
          }
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
          }
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
            fontSize: 10,
            formatter: (params: any) => {
              const total = totales[params.dataIndex];
              return total > 0 ? total.toFixed(0) + 't' : '';
            },
            color: '#333'
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 8,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          }
        }
      ]
    };
  }
}