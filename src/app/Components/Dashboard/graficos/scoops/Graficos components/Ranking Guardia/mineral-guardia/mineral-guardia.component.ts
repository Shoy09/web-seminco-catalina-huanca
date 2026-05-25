import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent,
  CanvasRenderer
]);

@Component({
  selector: 'app-mineral-guardia',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './mineral-guardia.component.html',
  styleUrl: './mineral-guardia.component.css'
})
export class MineralRankingGuardiaComponent implements OnInit, OnChanges {

  chartOptions: any = {};

  @Input() data: any[] = [];

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

  obtenerColor(valor: number): string {
    if (valor >= 1200) return '#2ecc71'; // verde
    if (valor >= 800) return '#f1c40f';  // amarillo
    return '#e74c3c';                    // rojo
  }

  actualizarGrafico(): void {

    const datosOrdenados = [...this.data]
      .sort((a, b) => b.tnMineralAjustado - a.tnMineralAjustado);

    const guardias = datosOrdenados.map((item) => `Guardia ${item.guardia}`);

    const valores = datosOrdenados.map((item) =>
      Number(item.tnMineralAjustado || 0)
    );

    const colores = datosOrdenados.map((item) =>
      this.obtenerColor(Number(item.tnMineralAjustado || 0))
    );

    const maxValor = Math.max(...valores, 1);
    const escalaMax = Math.ceil(maxValor / 500) * 500;

    this.chartOptions = {
      title: {
        text: 'MINERAL POR GUARDIA',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          color: '#333',
          fontFamily: 'Arial'
        }
      },

      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const index = params[0].dataIndex;
          const item = datosOrdenados[index];

          const tnMineral = Number(item.tnMineralAjustado || 0);
          const horas = Number(item.horasOperativasMineral || 0);
          const cucharas = Number(item.cantidadCucharasMineral || 0);
          const rendimiento = Number(item.rendimientoMineral || 0);

          let produccion = '';

          if (tnMineral >= 1200) produccion = 'Alta 🚀';
          else if (tnMineral >= 1000) produccion = 'Media 📈';
          else if (tnMineral >= 800) produccion = 'Normal 📊';
          else produccion = 'Baja ⚠️';

          return `
            <strong>Guardia ${item.guardia}</strong><br/>
            Mineral ajustado: <strong>${tnMineral.toLocaleString()} Tn</strong><br/>
            Horas operativas mineral: ${horas.toFixed(2)} h<br/>
            Cucharas mineral: ${cucharas}<br/>
            Registros mineral: ${item.cantidadRegistrosMineral || 0}<br/>
            Cantidad operaciones: ${item.cantidadOperaciones || 0}<br/>
            Rendimiento mineral: ${rendimiento.toFixed(2)} Tn/h<br/>
            Nivel: ${produccion}
          `;
        }
      },

      grid: {
        left: '15%',
        right: '15%',
        top: '18%',
        bottom: '10%',
        containLabel: true
      },

      xAxis: {
        type: 'value',
        min: 0,
        max: escalaMax,
        axisLabel: {
          fontSize: 10,
          formatter: (value: number) => `${value.toLocaleString()} Tn`
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
        inverse: true,
        axisLabel: {
          fontSize: 12,
          fontWeight: 'bold',
          fontFamily: 'Arial'
        },
        axisLine: {
          lineStyle: {
            color: '#666'
          }
        }
      },

      series: [
        {
          name: 'Mineral',
          type: 'bar',
          barWidth: '45%',

          data: valores.map((valor, index) => ({
            value: valor,
            itemStyle: {
              color: colores[index]
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
            formatter: (params: any) => {
              return `${Number(params.value).toLocaleString()} Tn`;
            },
            fontWeight: 'bold',
            fontSize: 12,
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