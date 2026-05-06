import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent, GraphicComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, GraphicComponent, CanvasRenderer]);

@Component({
  selector: 'app-disparos-equipo',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './disparos-equipo.component.html',
  styleUrl: './disparos-equipo.component.css'
})
export class DisparosEquipoComponent implements OnChanges {
  
  @Input() data: any[] = [];

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['objetivoDisparos']) {
      console.log('📊 DATA RECIBIDAaaaaaaaaaaaaaaaaaaa:', this.data);
      this.actualizarGrafico();
    }
  }

  actualizarGrafico(): void {
  if (!this.data || this.data.length === 0) {
    this.chartOptions = {};
    return;
  }

  // Agrupar los datos por seccion_labor
  const gruposPorSeccionLabor = new Map<string, any[]>();
  
  this.data.forEach(item => {
    const seccionLabor = item.seccion_labor || 'SIN_SECCION';
    if (!gruposPorSeccionLabor.has(seccionLabor)) {
      gruposPorSeccionLabor.set(seccionLabor, []);
    }
    gruposPorSeccionLabor.get(seccionLabor)!.push(item);
  });

  // Preparar datos para el gráfico con estructura jerárquica
  const xAxisData: string[] = [];
  const seriesData: number[] = [];
  const tooltipMap: Map<number, any> = new Map();

  let index = 0;
  gruposPorSeccionLabor.forEach((items, seccionLabor) => {
    items.forEach(item => {
      // Mantener el formato original con dos líneas
      const label = `${item.modelo_equipo}\n(${item.seccion || 'N/A'})`;
      xAxisData.push(label);
      seriesData.push(item.n_frentes);
      tooltipMap.set(index, item);
      index++;
    });
  });

  const maxValor = Math.max(...seriesData);
  const yAxisMax = Math.ceil(maxValor * 1.2);

  this.chartOptions = {
    title: {
      text: 'DISPAROS POR EQUIPO',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const dataPoint = params[0];
        const item = tooltipMap.get(dataPoint.dataIndex);
        if (!item) return '';
        
        return `<strong>${item.modelo_equipo}</strong><br/>
                Sección: ${item.seccion || 'N/A'}<br/>
                Sección Labor: ${item.seccion_labor || 'N/A'}<br/>
                <strong style="color: #3498db;">Disparos: ${dataPoint.value}</strong>`;
      }
    },
    grid: {
      left: '10%',
      right: '5%',
      top: '15%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        rotate: 0,
        interval: 0,
        formatter: (value: string) => value,
        rich: {
          equipment: {
            fontSize: 12,
            fontWeight: 'bold',
            color: '#333'
          },
          section: {
            fontSize: 10,
            color: '#666'
          }
        }
      },
      axisLine: {
        lineStyle: {
          color: '#333'
        }
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      name: 'Cantidad de Disparos',
      nameLocation: 'middle',
      nameGap: 45,
      min: 0,
      max: yAxisMax,
      interval: this.calcularIntervalo(yAxisMax),
      axisLabel: {
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: 'DISPAROS',
        type: 'bar',
        data: seriesData,
        itemStyle: {
          borderRadius: [5, 5, 0, 0],
          color: '#3498db',
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowBlur: 5
        },
        label: {
          show: true,
          position: 'top',
          fontWeight: 'bold',
          fontSize: 14,
          formatter: '{c}',
          color: '#333'
        },
        barWidth: '50%'
      }
    ]
  };
}

  agregarSeparadores(grupos: Map<string, any[]>, totalItems: number): any[] {
    const separadores: any[] = [];
    let acumulado = 0;
    let grupoIndex = 0;
    
    grupos.forEach((items, seccionLabor) => {
      const itemsCount = items.length;
      acumulado += itemsCount;
      
      // No agregar separador después del último grupo
      if (grupoIndex < grupos.size - 1) {
        // Calcular posición del separador (entre grupos)
        const posicionX = (acumulado / totalItems) * 100;
        
        // Agregar línea vertical separadora
        separadores.push({
          type: 'line',
          shape: {
            x1: posicionX,
            y1: 0,
            x2: posicionX,
            y2: 1
          },
          style: {
            stroke: '#ccc',
            lineWidth: 1,
            lineDash: [4, 4]
          },
          left: '8%',
          right: '5%',
          top: '10%',
          bottom: '10%',
          bounding: 'raw',
          z: 50
        });
        
        // Agregar texto del grupo (seccion_labor) encima de las barras
        const posicionTexto = acumulado - (itemsCount / 2);
        const posicionXTexto = (posicionTexto / totalItems) * 100;
        
        separadores.push({
          type: 'text',
          style: {
            text: seccionLabor,
            fill: '#2c3e50',
            fontSize: 12,
            fontWeight: 'bold',
            fontFamily: 'Arial'
          },
          left: `${posicionXTexto}%`,
          top: 5,
          styleHtml: true,
          z: 100,
          bounding: 'raw'
        });
      } else {
        // Para el último grupo, solo agregar el texto
        const posicionTexto = acumulado - (itemsCount / 2);
        const posicionXTexto = (posicionTexto / totalItems) * 100;
        
        separadores.push({
          type: 'text',
          style: {
            text: seccionLabor,
            fill: '#2c3e50',
            fontSize: 12,
            fontWeight: 'bold',
            fontFamily: 'Arial'
          },
          left: `${posicionXTexto}%`,
          top: 5,
          styleHtml: true,
          z: 100,
          bounding: 'raw'
        });
      }
      
      grupoIndex++;
    });
    
    return separadores;
  }

  calcularIntervalo(max: number): number {
    if (max <= 5) return 1;
    if (max <= 10) return 2;
    if (max <= 20) return 5;
    if (max <= 50) return 10;
    return 20;
  }
}