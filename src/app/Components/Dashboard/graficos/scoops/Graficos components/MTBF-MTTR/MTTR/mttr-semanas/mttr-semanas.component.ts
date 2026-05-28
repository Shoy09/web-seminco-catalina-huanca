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
  selector: 'app-mttr-semanas',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './mttr-semanas.component.html',
  styleUrl: './mttr-semanas.component.css'
})
export class MttrSemanasComponent implements OnInit, OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  datosMttrSemanas: any[] = [];

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
      this.datosMttrSemanas = [];
      this.chartOptions = {};
      return;
    }

    // Mapear los datos: semana, mttr como valor
    // Ordenar por número de semana
    this.datosMttrSemanas = this.data
      .map(item => ({
        semana: item.semana || `Semana ${item.numeroSemana || '?'}`,
        numeroSemana: item.numeroSemana || 0,
        mttr: item.mttr || 0,
        // Guardar datos adicionales para tooltip
        cantidadEquipos: item.cantidadEquipos || 0,
        cantidadFallas: item.cantidadFallas || 0,
        cantidadOperaciones: item.cantidadOperaciones || 0,
        horasMtto: item.horasMtto || 0
      }))
      .sort((a, b) => a.numeroSemana - b.numeroSemana);

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

  const semanas = datosOrdenados.map((item) => item.periodo);

  const valores = datosOrdenados.map((item) =>
    Number(item.mttr || 0)
  );

  const maxValor = Math.max(...valores, 1);
  const escalaMax = Math.ceil(maxValor / 10) * 10;

  const porcentajeVisible =
    semanas.length > 8 ? (8 / semanas.length) * 100 : 100;

  this.chartOptions = {
    title: {
      text: 'MTTR POR SEMANA',
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

        let nivel = '';
        if (mttr === 0) nivel = 'Sin fallas';
        else if (mttr <= 12) nivel = 'Excelente';
        else if (mttr <= 24) nivel = 'Bueno';
        else if (mttr <= 48) nivel = 'Regular';
        else nivel = 'Crítico';

        return `
          <strong>Semana ${item.periodo}</strong><br/>
          Rango: ${item.fechaInicio || '-'} al ${item.fechaFin || '-'}<br/>
          <hr style="margin: 5px 0"/>
          MTTR: <b>${mttr.toFixed(2)} h</b><br/>
          MTBF: ${mtbf.toFixed(2)} h<br/>
          Nivel: <b>${nivel}</b><br/>
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
      data: semanas,
      axisLabel: {
        interval: 0,
        rotate: semanas.length > 8 ? 35 : 0,
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
        show: semanas.length > 8,
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