import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, ToolboxComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { colorPorRendimiento } from '../../../../../../../shared/chart-theme';

@Component({
  selector: 'app-rendimiento-guardia',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './rendimiento-guardia.component.html',
  styleUrl: './rendimiento-guardia.component.css'
})
export class RendimientoGuardiaComponent implements OnInit, OnChanges {
  
  @Input() data: any[] = [];

  chartOptions: any = {};

  datosPorGuardia: any[] = [];

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
      this.datosPorGuardia = [];
      this.chartOptions = {};
      return;
    }

    // Mapear los datos: seccion = guardia, rendimiento = valor
    // Ordenar por rendimiento de mayor a menor
    this.datosPorGuardia = this.data
      .map(item => ({
        guardia: item.seccion || item.guardia || 'Sin datos',
        valor: item.rendimiento || 0,
        // Guardar datos adicionales para tooltip
        cantidadEquipos: item.cantidadEquipos || 0,
        cantidadOperaciones: item.cantidadOperaciones || 0,
        horasOperativas: item.horasOperativas || 0,
        rendimientoDesmonte: item.rendimientoDesmonte || 0,
        rendimientoMineral: item.rendimientoMineral || 0,
        toneladasDesmonte: item.toneladasDesmonte || 0,
        toneladasMineral: item.toneladasMineral || 0,
        totalToneladas: item.totalToneladas || 0,
        totalCucharas: item.totalCucharas || 0
      }))
      .sort((a, b) => b.valor - a.valor);

    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    if (!this.datosPorGuardia.length) {
      this.chartOptions = {};
      return;
    }

    const guardias = this.datosPorGuardia.map(item => item.guardia);
    const valores = this.datosPorGuardia.map(item => item.valor);
    
    // Encontrar el valor máximo para escala dinámica
    const maxValor = Math.max(...valores);
    const escalaMax = Math.ceil(maxValor / 50) * 50;

    this.chartOptions = {
      title: {
        text: 'RENDIMIENTO POR GUARDIA',
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
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const data = params[0];
          const index = data.dataIndex;
          const item = this.datosPorGuardia[index];
          
          return `
            <strong>🏭 Guardia ${item.guardia}</strong><br/>
            <hr style="margin: 4px 0;"/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            Rendimiento: <strong>${item.valor.toFixed(2)}</strong> t/h<br/>
            <span style="color:#2ecc71; font-weight:bold;">●</span>
            Rendimiento Desmonte: <strong>${item.rendimientoDesmonte.toFixed(2)}</strong> t/h<br/>
            <span style="color:#f39c12; font-weight:bold;">●</span>
            Rendimiento Mineral: <strong>${item.rendimientoMineral.toFixed(2)}</strong> t/h<br/>
            <span style="color:#9b59b6; font-weight:bold;">●</span>
            Total Toneladas: <strong>${item.totalToneladas.toFixed(2)}</strong> t<br/>
            <span style="color:#1abc9c; font-weight:bold;">●</span>
            Toneladas Desmonte: <strong>${item.toneladasDesmonte.toFixed(2)}</strong> t<br/>
            <span style="color:#e67e22; font-weight:bold;">●</span>
            Toneladas Mineral: <strong>${item.toneladasMineral.toFixed(2)}</strong> t<br/>
            <span style="color:#e74c3c; font-weight:bold;">●</span>
            Cantidad Operaciones: <strong>${item.cantidadOperaciones}</strong><br/>
            <span style="color:#95a5a6; font-weight:bold;">●</span>
            Total Cucharas: <strong>${item.totalCucharas}</strong><br/>
            <span style="color:#34495e; font-weight:bold;">●</span>
            Horas Operativas: <strong>${item.horasOperativas.toFixed(2)}</strong> hrs
          `;
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
        type: 'value',
        nameLocation: 'middle',
        nameGap: 35,
        min: 0,
        max: escalaMax,
        axisLabel: {
          fontSize: 10,
          formatter: '{value}'
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#ccc'
          }
        }
      },

      yAxis: {
        type: 'category',
        data: guardias,
        axisLabel: {
          fontSize: 12,
          fontWeight: 'bold',
          fontFamily: 'Arial'
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

      series: [
        {
          name: 'Rendimiento',
          type: 'bar',
          barWidth: '45%',

          data: valores.map((valor) => ({
            value: valor,
            itemStyle: {
              color: colorPorRendimiento(valor)
            }
          })),

          itemStyle: {
            borderRadius: [0, 5, 5, 0],
            shadowColor: 'rgba(0,0,0,0.2)',
            shadowBlur: 6,
            shadowOffsetY: 2
          },

          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => params.value.toFixed(1),
            fontWeight: 'bold',
            fontSize: 13,
            color: '#333'
          },

          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.3)'
            }
          },

          showBackground: true,

          backgroundStyle: {
            color: 'rgba(180,180,180,0.1)',
            borderRadius: 5
          }
        }
      ]
    };
  }
 
}