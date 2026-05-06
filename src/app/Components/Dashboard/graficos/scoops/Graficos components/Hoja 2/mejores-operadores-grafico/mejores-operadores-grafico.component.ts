import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  CanvasRenderer,
]);

@Component({
  selector: 'app-mejores-operadores-grafico',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './mejores-operadores-grafico.component.html',
  styleUrl: './mejores-operadores-grafico.component.css',
})
export class MejoresOperadoresGraficoComponent implements OnChanges {
  @Input() data: any[] = [];

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      console.log('Data Mejores Operadores Gráfico:', this.data);
      this.actualizarGrafico();
    }
  }

  formatearNombre(nombre: string): string {
    if (!nombre || nombre === 'N/A') return 'N/A';
    
    const partes = nombre.split(' ');
    
    if (partes.length === 1) {
      return nombre;
    }
    
    // Si tiene 2 o más palabras, unir las primeras dos con salto de línea
    const primerApellido = partes[0];
    const segundoNombre = partes[1] || '';
    const resto = partes.slice(2).join(' ');
    
    if (resto) {
      return `${primerApellido} ${segundoNombre}\n${resto}`;
    }
    return `${primerApellido}\n${segundoNombre}`;
  }

  actualizarGrafico(): void {
    if (!this.data || !this.data.length) {
      this.chartOptions = {};
      return;
    }

    // Ordenar por Tonelaje (mayor a menor)
    const datosOrdenados = [...this.data].sort((a, b) => {
      return (b.Tonelaje || 0) - (a.Tonelaje || 0);
    });

    // Tomar top 10 para mejor visualización
    const topDatos = datosOrdenados.slice(0, 10);

    // Categorías (nombres de operadores formateados con salto de línea)
    const operadores = topDatos.map((item) => {
      const nombre = item.operador || 'N/A';
      return this.formatearNombre(nombre);
    });

    // Tonelaje para las barras
    const tonelajes = topDatos.map((item) => Number(item.Tonelaje) || 0);

    // Tn/Hr para la línea (redondeado a entero)
    const tnHr = topDatos.map((item) => Math.round(Number(item.Tn_h_SC) || 0));

    // Calcular maxTonelaje con 20% de margen
    const maxTonelajeOriginal = Math.max(...tonelajes, 1);
    const margenSuperior = 0.20;
    let maxTonelaje = maxTonelajeOriginal * (1 + margenSuperior);

    // Escalar la línea de Tn/Hr al eje Y (que está en escala de tonelaje)
    const maxTnHr = Math.max(...tnHr, 1);
    const factorEscala = maxTonelaje / maxTnHr;
    const tnHrEscalados = tnHr.map((valor) => valor * factorEscala);

    this.chartOptions = {
      title: {
        text: 'MEJORES OPERADORES',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#2c3e50',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const operadorOriginal = topDatos[params[0].dataIndex]?.operador || 'N/A';
          let result = `<strong>${operadorOriginal}</strong><br/>`;
          
          params.forEach((p: any) => {
            if (p.seriesName === 'Tonelaje') {
              const valorOriginal = tonelajes[p.dataIndex];
              result += `${p.marker} ${p.seriesName}: ${valorOriginal.toFixed(0)}<br/>`;
            } else if (p.seriesName === 'Tn/Hr') {
              const tnHrOriginal = tnHr[p.dataIndex];
              result += `${p.marker} ${p.seriesName}: ${tnHrOriginal}<br/>`;
            }
          });
          return result;
        },
      },
      legend: {
        data: ['Tonelaje', 'Tn/Hr'],
        bottom: 0,
        left: 'center',
        orient: 'horizontal',
      },
      grid: {
        left: '10%',
        right: '8%',
        top: '15%',
        bottom: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: operadores,
        axisLabel: {
          rotate: 0,
          interval: 0,
          fontSize: 10,
          fontWeight: 'bold',
          lineHeight: 16,
          formatter: (value: string) => {
            return value;
          },
        },
        axisLine: {
          lineStyle: { color: '#333' }
        },
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        name: '',
        nameLocation: 'middle',
        nameGap: 50,
        min: 0,
        max: maxTonelaje,
        axisLabel: {
          formatter: (value: number) => `${Math.round(value)}`,
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            width: 1,
            color: '#e0e0e0',
          },
        },
      },
      series: [
        {
          name: 'Tonelaje',
          type: 'bar',
          data: tonelajes,
          itemStyle: {
            borderRadius: [5, 5, 0, 0],
            color: '#3498db',
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 5,
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => `${Math.round(params.value)}`,
            offset: [0, 3],
            fontWeight: 'bold',
            fontSize: 11,
          },
          barCategoryGap: '30%',
          barGap: '30%',
        },
        {
          name: 'Tn/Hr',
          type: 'line',
          data: tnHrEscalados,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            color: '#e74c3c',
            width: 3,
          },
          itemStyle: {
            color: '#e74c3c',
            borderColor: '#ffffff',
            borderWidth: 2,
          },
          label: {
            show: true,
            position: 'top',
            offset: [0, -8],
            formatter: (params: any) => {
              const tnHrOriginal = tnHr[params.dataIndex];
              return `${tnHrOriginal}`;
            },
            fontWeight: 'bold',
            fontSize: 11,
            color: '#e74c3c',
          },
          zlevel: 1,
          z: 10,
        },
      ],
    };
  }
}