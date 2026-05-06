import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';

import { BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer
]);

@Component({
  selector: 'app-promedio-estados-echarts',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './promedio-estados-echarts.component.html',
  styleUrl: './promedio-estados-echarts.component.css'
})
export class PromedioEstadosEchartsComponent implements OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  // Almacenar tipos_estado con sus horas por estado
  private tiposPorEstado: Map<string, Map<string, { horas: number, categoria: string | null }>> = new Map();

  coloresPorEstado: any = {
    'OPERATIVO': '#4CAF50',
    'DEMORA': '#FFC107',
    'MANTENIMIENTO': '#F44336',
    'RESERVA': '#FF9800',
    'FUERA DE PLAN': '#2196F3'
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      console.log('🔥 PROMEDIO DE HORAS POR ESTADO RECIBIDO:', this.data);
      setTimeout(() => {
        this.buildChart();
      }, 0);
    }
  }

  buildChart() {
    if (!this.data || this.data.length === 0) {
      this.chartOptions = this.getOpcionesGrafico([]);
      return;
    }

    // Reiniciar el mapa de tipos por estado
    this.tiposPorEstado.clear();

    // ⏱ Calcular duración y agrupar por estado y tipo_estado
    const datosConDuracion = this.data.map(item => {
      const inicio = this.parseHora(item.hora_inicio).getTime();
      const fin = this.parseHora(item.hora_final).getTime();

      let duracion = (fin - inicio) / (1000 * 60 * 60);
      if (duracion < 0) duracion += 24;

      return { ...item, duracion };
    });

    // 📊 Agrupar por estado y por tipo_estado
    const sumas: any = {};
    const codigosOperacion = new Set<string>();

    datosConDuracion.forEach(d => {
      const estado = (d.estado || '').toUpperCase().trim();
      const tipoEstado = d.tipo_estado || 'SIN TIPO';
      const categoria = d.categoria || null;
      
      codigosOperacion.add(d.codigoOperacion);
      sumas[estado] = (sumas[estado] || 0) + d.duracion;
      
      // Guardar tipo_estado y acumular sus horas
      if (!this.tiposPorEstado.has(estado)) {
        this.tiposPorEstado.set(estado, new Map());
      }
      const tiposMap = this.tiposPorEstado.get(estado)!;
      const dataActual = tiposMap.get(tipoEstado) || { horas: 0, categoria: categoria };
      dataActual.horas += d.duracion;
      // Actualizar categoría si no existe o si encontramos una mejor
      if (!dataActual.categoria && categoria) {
        dataActual.categoria = categoria;
      }
      tiposMap.set(tipoEstado, dataActual);
    });

    const totalCodigos = codigosOperacion.size;
    const estados = Object.keys(sumas);

    // 📉 Calcular promedios
    const dataGrafico = estados.map(estado => ({
      name: estado,
      value: totalCodigos ? +(sumas[estado] / totalCodigos).toFixed(2) : 0
    }));

    this.chartOptions = this.getOpcionesGrafico(dataGrafico);
  }

  getOpcionesGrafico(data: any[]) {
    // Asignar color a cada estado
    const datosConColor = data.map(item => ({
      ...item,
      itemStyle: { color: this.coloresPorEstado[item.name] || '#757575' }
    }));

    // Guardar referencia al componente para usar en tooltip
    const self = this;
    const coloresPorEstadoTooltip = this.coloresPorEstado;

    return {
      title: {
        text: 'HORAS PROMEDIO POR ESTADO',
        left: 'center',
        top: 20,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333'
        }
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderWidth: 0,
        padding: 0,
        enterable: true,
        hideDelay: 300,
        position: function(point: any, params: any, dom: any, rect: any, size: any) {
          const x = point[0] + 20;
          const y = point[1] - 50;
          
          const tooltipWidth = dom ? dom.clientWidth : 320;
          const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
          
          if (x + tooltipWidth > windowWidth) {
            return [point[0] - tooltipWidth - 20, y];
          }
          
          return [x, y];
        },
        formatter: function(params: any) {
          const estado = params.name;
          const color = coloresPorEstadoTooltip[estado] || '#757575';
          const horasPromedio = params.value;
          const porcentaje = params.percent.toFixed(1);
          
          // Obtener los tipos_estado con sus horas para este estado
          const tiposMap = self.tiposPorEstado.get(estado);
          
          let tiposHtml = '';
          if (tiposMap && tiposMap.size > 0) {
            // Convertir a array y ordenar por horas (descendente)
            const tiposArray = Array.from(tiposMap.entries())
              .map(([tipo, { horas, categoria }]) => ({ 
                tipo, 
                horas: horas.toFixed(2),
                categoria 
              }))
              .sort((a, b) => parseFloat(b.horas) - parseFloat(a.horas));
            
            // 🔥 Mostrar tipo_estado con su categoría
            const itemsHtml = tiposArray.map(item => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                <div style="flex: 1;">
                  <span style="display: inline-block; background: ${color}20; color: ${color}; padding: 4px 10px; border-radius: 14px; font-size: 11px; font-weight: 600; margin-bottom: 4px;">
                    ${item.tipo}
                  </span>
                </div>
                <span style="font-size: 12px; font-weight: 600; color: #333; margin-left: 12px;">
                  ${item.horas} hrs
                </span>
              </div>
            `).join('');
            
            // 🔥 Limitar altura pero con mejor scroll
            const scrollHeight = tiposArray.length > 6 ? '200px' : 'auto';
            
            tiposHtml = `
              <div style="margin-top: 12px;">
                <div style="font-size: 11px; font-weight: 600; color: #666; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 4px; border-bottom: 2px solid ${color};">
                  📋 DESGLOSE POR TIPO DE ESTADO
                </div>
                <div style="max-height: ${scrollHeight}; overflow-y: auto; padding-right: 6px;">
                  ${itemsHtml}
                </div>
                <div style="margin-top: 8px; text-align: center; font-size: 10px; color: #999; padding-top: 4px; border-top: 1px solid #f0f0f0;">
                  Total tipos: ${tiposArray.length}
                </div>
              </div>
            `;
          }
          
          return `
            <div style="background: white; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.15); padding: 0; overflow: hidden; min-width: 280px; max-width: 350px;">
              <!-- Header con color del estado -->
              <div style="background: ${color}; padding: 12px 16px;">
                <div style="color: white; font-size: 16px; font-weight: bold; letter-spacing: 0.5px;">
                  ${estado}
                </div>
              </div>
              
              <!-- Cuerpo del tooltip -->
              <div style="padding: 16px;">
                <!-- Métricas principales -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px;">
                  <div>
                    <div style="font-size: 11px; color: #666;">⏱️ Horas promedio</div>
                    <div style="font-size: 22px; font-weight: bold; color: ${color};">${horasPromedio}</div>
                  </div>
                  <div>
                    <div style="font-size: 11px; color: #666;">📊 Porcentaje</div>
                    <div style="font-size: 18px; font-weight: bold; color: #333;">${porcentaje}%</div>
                  </div>
                </div>
                ${tiposHtml}
              </div>
            </div>
          `;
        }
      },
      legend: {
        orient: 'horizontal',
        bottom: 5,
        left: 'center',
        data: data.map(d => d.name),
        itemWidth: 18,
        itemHeight: 10,
        textStyle: {
          fontSize: 11,
          fontWeight: 'bold',
          color: '#2c3e50'
        }
      },
      series: [
        {
          name: 'Horas Promedio por Estado',
          type: 'pie',
          radius: '55%',
          center: ['50%', '55%'],
          data: datosConColor,
          label: {
            show: true,
            formatter: '{b}\n{c} hrs ({d}%)',
            fontSize: 12,
            fontWeight: 'bold'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            },
            scale: true,
            scaleSize: 10
          },
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
          }
        }
      ]
    };
  }

  parseHora(hora: string): Date {
    const [h, m] = (hora || '00:00').split(':').map(Number);
    const d = new Date();
    d.setHours(h || 0, m || 0, 0, 0);
    return d;
  }
}