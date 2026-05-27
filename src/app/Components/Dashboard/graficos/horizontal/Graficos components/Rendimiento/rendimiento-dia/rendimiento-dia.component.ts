import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent,
  DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent,
  DataZoomComponent,
  CanvasRenderer,
]);

@Component({
  selector: 'app-rendimiento-dia',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './rendimiento-dia.component.html',
  styleUrl: './rendimiento-dia.component.css',
})
export class RendimientoDiaComponent implements OnChanges {
  @Input() data: any[] = [];

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.actualizarGrafico();
    }
  }

  actualizarGrafico(): void {
    if (!this.data || this.data.length === 0) {
      this.chartOptions = {};
      return;
    }

    const datosOrdenados = [...this.data].sort((a, b) =>
      String(a.key).localeCompare(String(b.key))
    );

    const xAxisLabels = datosOrdenados.map((item) => {
      const partes = String(item.key || '').split('-');

      const anio = partes[0];
      const mes = partes[1];
      const dia = partes[2];

      return {
        value: item.key,
        periodo: item.periodo,
        dia,
        mes,
        anio,
        nombreMes: this.obtenerNombreMes(Number(mes)),
      };
    });

    const valores = datosOrdenados.map((item) =>
      Number(item.rendimiento || 0)
    );

    const maxValor = Math.max(...valores, 1);
    const escalaMax = Math.ceil(maxValor / 20) * 20;

    const graphics: any[] = [];
    const mesesPosiciones = new Map<string, any>();

    let mesActual = '';
    let inicio = 0;

    for (let i = 0; i < xAxisLabels.length; i++) {
      const item = xAxisLabels[i];

      if (item.nombreMes !== mesActual) {
        if (mesActual !== '') {
          mesesPosiciones.set(mesActual, {
            start: inicio,
            end: i - 1,
          });
        }

        mesActual = item.nombreMes;
        inicio = i;
      }
    }

    if (mesActual !== '') {
      mesesPosiciones.set(mesActual, {
        start: inicio,
        end: xAxisLabels.length - 1,
      });
    }

    mesesPosiciones.forEach((pos: any, mes: string) => {
      const centro = (pos.start + pos.end + 1) / 2;

      graphics.push({
        type: 'text',
        left: `${centro * (100 / xAxisLabels.length)}%`,
        bottom: 8,
        style: {
          text: mes,
          fill: '#333',
          fontSize: 12,
          fontWeight: 'bold',
          fontFamily: 'Arial',
        },
        z: 100,
      });
    });

    const porcentajeVisible = xAxisLabels.length > 10 ? 35 : 100;

    this.chartOptions = {
      title: {
        text: 'RENDIMIENTO POR DÍA',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333',
          fontFamily: 'Arial',
        },
      },

      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const data = params[0];
          const item = datosOrdenados[data.dataIndex];

          const rendimiento = Number(item.rendimiento || 0);
          const metrosPerforados = Number(item.metrosPerforados || 0);
          const horasOperativas = Number(item.horasOperativas || 0);

          return `
            <strong>${item.periodo}</strong><br/>
            <hr style="margin: 5px 0"/>
            Rendimiento: <b>${rendimiento.toFixed(2)} m/h</b><br/>
            Metros perforados: ${metrosPerforados.toFixed(2)} m<br/>
            Horas operativas: ${horasOperativas.toFixed(2)} h<br/>
            Operaciones: ${item.cantidadOperaciones || 0}<br/>
            Registros operativos: ${item.cantidadRegistrosOperativos || 0}<br/>
            Tal. producción: ${item.talProd || 0}<br/>
            Tal. rimados: ${item.talRimados || 0}<br/>
            Tal. alivio: ${item.talAlivio || 0}<br/>
            Tal. repaso: ${item.talRepaso || 0}<br/>
            Total taladros: ${item.totalTaladros || 0}
          `;
        },
      },

      grid: {
        left: '8%',
        right: '5%',
        top: '22%',
        bottom: '25%',
        containLabel: true,
      },

      xAxis: {
        type: 'category',
        data: xAxisLabels.map((item) => item.value),
        axisLabel: {
          show: true,
          interval: 0,
          margin: 18,
          fontSize: 11,
          fontWeight: 'bold',
          color: '#333',
          formatter: (value: string) => {
            const partes = String(value).split('-');
            return partes[2] || value;
          },
        },
        axisLine: {
          lineStyle: {
            color: '#666',
          },
        },
        axisTick: {
          alignWithLabel: true,
        },
      },

      yAxis: {
        type: 'value',
        name: 'Rendimiento (m/h)',
        nameLocation: 'middle',
        nameGap: 55,
        min: 0,
        max: escalaMax,
        axisLabel: {
          formatter: '{value} m/h',
          fontSize: 10,
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#ccc',
          },
        },
      },

      dataZoom: [
        {
          type: 'slider',
          show: true,
          xAxisIndex: 0,
          start: 0,
          end: porcentajeVisible,
          height: 18,
          bottom: 25,
        },
        {
          type: 'inside',
          xAxisIndex: 0,
          start: 0,
          end: porcentajeVisible,
        },
      ],

      series: [
        {
          name: 'Rendimiento',
          type: 'bar',
          barWidth: '50%',
          data: valores.map((valor) => ({
            value: valor,
            itemStyle: {
              color: '#27ae60',
            },
          })),
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            shadowColor: 'rgba(0,0,0,0.2)',
            shadowBlur: 6,
            shadowOffsetY: 2,
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => {
              return `${Number(params.value).toFixed(2)} m/h`;
            },
            fontWeight: 'bold',
            fontSize: 11,
            color: '#333',
          },
          emphasis: {
            focus: 'series',
          },
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(180,180,180,0.1)',
            borderRadius: 5,
          },
        },
      ],

      graphic: graphics,
    };
  }

  obtenerNombreMes(mes: number): string {
    const meses = [
      'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
      'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
    ];

    return meses[mes - 1] || '';
  }
}