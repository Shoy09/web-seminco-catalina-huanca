import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import * as echarts from 'echarts/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';

@Component({
  selector: 'app-horas-operativas-semana',
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './horas-operativas-semana.component.html',
  styleUrl: './horas-operativas-semana.component.css',
})
export class HorasOperativasSemanaComponent implements OnInit, OnChanges {
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
    console.log('DATA HORAS OPERATIVAS DÍA:', this.data);

    if (!this.data || this.data.length === 0) {
      this.chartOptions = {};
      return;
    }

    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    const datosOrdenados = [...this.data];

    const periodos = datosOrdenados.map((item) => item.periodo);

    const valores = datosOrdenados.map((item) =>
      Number(item.horasOperativas || 0),
    );

    const maxValor = Math.max(...valores, 1);
    const escalaMax = Math.ceil(maxValor / 10) * 10;

    this.chartOptions = {
      title: {
        text: 'HORAS OPERATIVAS POR SEMANA',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          color: '#333',
          fontFamily: 'Arial',
        },
      },

      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const index = params[0].dataIndex;
          const item = datosOrdenados[index];

          return `
            <strong>${item.periodo}</strong><br/>
            Rango: ${item.fechaInicio} al ${item.fechaFin}<br/>
            Promedio horas operativas: <strong>${item.horasOperativas} h</strong><br/>
            Operaciones: ${item.cantidadOperaciones || 0}<br/>
            Registros operativos: ${item.cantidadRegistrosOperativos || 0}
          `;
        },
      },

      grid: {
        left: '10%',
        right: '10%',
        top: '18%',
        bottom: '12%',
        containLabel: true,
      },

      xAxis: {
        type: 'category',
        data: periodos,
        axisLabel: {
          fontSize: 10,
          rotate: 35,
        },
        axisLine: {
          lineStyle: {
            color: '#666',
          },
        },
      },

      yAxis: {
        type: 'value',
        min: 0,
        max: escalaMax,
        axisLabel: {
          formatter: '{value} h',
          fontSize: 10,
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#ccc',
          },
        },
      },

      series: [
        {
          name: 'Horas operativas',
          type: 'bar',
          barWidth: '45%',
          data: valores,
          itemStyle: {
            borderRadius: [5, 5, 0, 0],
            shadowColor: 'rgba(0,0,0,0.2)',
            shadowBlur: 6,
            shadowOffsetY: 2,
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => {
              return `${Number(params.value).toFixed(2)} h`;
            },
            fontWeight: 'bold',
            fontSize: 11,
            color: '#333',
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.3)',
            },
          },
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(180,180,180,0.1)',
          },
        },
      ],
    };
  }
}
