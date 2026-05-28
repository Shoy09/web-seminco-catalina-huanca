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
import { CHART_BACKGROUND_BAR, CHART_BAR_SHADOW, CHART_COLORS, CHART_SPLIT_LINE, colorPorMTTR } from '../../../../../../../../shared/chart-theme';

echarts.use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent,
  CanvasRenderer
]);

@Component({
  selector: 'app-mttr-mes',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './mttr-mes.component.html',
  styleUrl: './mttr-mes.component.css'
})
export class MttrMesComponent implements OnInit, OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  datosMttrMes: any[] = [];

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
      this.datosMttrMes = [];
      this.chartOptions = {};
      return;
    }

    // Procesar datos y ordenar por año y mesNumero
    this.datosMttrMes = [...this.data]
      .filter(item => item.mttr !== undefined && item.mttr !== null)
      .sort((a, b) => {
        if (a.año !== b.año) return a.año - b.año;
        return a.mesNumero - b.mesNumero;
      });

    if (this.datosMttrMes.length === 0) {
      this.chartOptions = {};
      return;
    }

    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
  if (!this.data || this.data.length === 0) {
    this.chartOptions = {};
    return;
  }

  const datosOrdenados = [...this.data].sort((a, b) =>
    String(a.key).localeCompare(String(b.key))
  );

  const meses = datosOrdenados.map((item) => item.periodo);

  const valores = datosOrdenados.map((item) =>
    Number(item.mttr || 0)
  );

  const maxValor = Math.max(...valores, 1);
  const escalaMax = Math.ceil(maxValor / 10) * 10;

  const porcentajeVisible =
    meses.length > 8 ? (8 / meses.length) * 100 : 100;

  this.chartOptions = {
    title: {
      text: 'MTTR POR MES',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: CHART_COLORS.grey,
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

        const mttr = Number(item.mttr || 0);
        const mtbf = Number(item.mtbf || 0);
        const horasTotales = Number(item.horasTotales || 0);
        const horasMttoCorrectivo = Number(item.horasMttoCorrectivo || 0);
        const horasSinMttoCorrectivo = Number(item.horasSinMttoCorrectivo || 0);

        return `
          <strong>${item.periodo} ${item.anio || ''}</strong><br/>
          <hr style="margin: 5px 0"/>
          MTTR: <b>${mttr.toFixed(2)} h</b><br/>
          MTBF: ${mtbf.toFixed(2)} h<br/>
          Horas totales: ${horasTotales.toFixed(2)} h<br/>
          Hrs. Mtto. Correctivo: ${horasMttoCorrectivo.toFixed(2)} h<br/>
          Hrs. sin Mtto. Correctivo: ${horasSinMttoCorrectivo.toFixed(2)} h<br/>
          Fallas: ${item.fallas || 0}<br/>
          Registros: ${item.cantidadRegistros || 0}<br/>
          Registros Mtto. Correctivo: ${item.cantidadRegistrosMttoCorrectivo || 0}
        `;
      },
    },

    grid: {
      left: '8%',
      right: '8%',
      top: '18%',
      bottom: '22%',
      containLabel: true,
    },

    xAxis: {
      type: 'category',
      data: meses,
      axisLabel: {
        interval: 0,
        rotate: meses.length > 8 ? 35 : 0,
        fontSize: 10,
        fontWeight: 'bold',
        color: CHART_COLORS.grey,
        fontFamily: 'Arial',
      },
      axisLine: {
        lineStyle: {
          color: CHART_COLORS.axis,
        },
      },
      axisTick: {
        alignWithLabel: true,
      },
    },

    yAxis: {
      type: 'value',
      name: 'MTTR (horas)',
      nameLocation: 'middle',
      nameGap: 45,
      min: 0,
      max: escalaMax,
      axisLabel: {
        formatter: '{value} h',
        fontSize: 10,
        color: CHART_COLORS.grey,
      },
      splitLine: CHART_SPLIT_LINE,
    },

    dataZoom: [
      {
        type: 'slider',
        show: meses.length > 8,
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
        name: 'MTTR',
        type: 'bar',
        barWidth: '55%',

        data: valores.map((valor) => ({
          value: valor,
          itemStyle: {
            color: colorPorMTTR(valor),
          },
        })),

        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          ...CHART_BAR_SHADOW,
        },

        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => {
            return `${Number(params.value).toFixed(2)} h`;
          },
          fontWeight: 'bold',
          fontSize: 10,
          color: CHART_COLORS.grey,
        },

        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.3)',
          },
        },

        showBackground: true,
        backgroundStyle: CHART_BACKGROUND_BAR,
      },
    ],
  };
  }

  
}