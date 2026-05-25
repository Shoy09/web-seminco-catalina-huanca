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
  selector: 'app-pareto-no-programadas',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './pareto-no-programada.component.html',
  styleUrl: './pareto-no-programada.component.css'
})
export class ParetoNoProgramadasComponent implements OnInit, OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  datosParadas: any[] = [];

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
      this.datosParadas = [];
      this.chartOptions = {};
      return;
    }

    // Filtrar datos: excluir observaciones "SIN OBSERVACIÓN" (case insensitive)
    const datosFiltrados = this.data.filter(item => {
      const observacion = (item.observacion || '').toUpperCase();
      return observacion !== 'SIN OBSERVACIÓN' && observacion !== 'SIN OBSERVACION';
    });

    if (datosFiltrados.length === 0) {
      this.datosParadas = [];
      this.chartOptions = {};
      return;
    }

    // Agrupar por observación (causa) y sumar horasTotales
    const gruposPorObservacion = new Map();

    datosFiltrados.forEach(item => {
      const observacion = item.observacion || 'Sin observación';
      const horas = item.horasTotales || 0;
      
      if (gruposPorObservacion.has(observacion)) {
        const grupo = gruposPorObservacion.get(observacion);
        grupo.horas += horas;
        grupo.cantidadRegistros += item.cantidadRegistros || 1;
        // Acumular códigos y estados relacionados
        if (item.codigosRelacionados) {
          grupo.codigosRelacionados.push(...item.codigosRelacionados);
        }
        if (item.estadosRelacionados) {
          grupo.estadosRelacionados.push(...item.estadosRelacionados);
        }
      } else {
        gruposPorObservacion.set(observacion, {
          causa: observacion,
          frecuencia: horas,
          horas: horas,
          cantidadRegistros: item.cantidadRegistros || 1,
          codigosRelacionados: item.codigosRelacionados ? [...item.codigosRelacionados] : [],
          estadosRelacionados: item.estadosRelacionados ? [...item.estadosRelacionados] : []
        });
      }
    });

    // Convertir el mapa a un array y ordenar por horas de mayor a menor
    this.datosParadas = Array.from(gruposPorObservacion.values())
      .map(grupo => ({
        causa: grupo.causa,
        frecuencia: grupo.horas,
        cantidadRegistros: grupo.cantidadRegistros,
        codigosRelacionados: grupo.codigosRelacionados,
        estadosRelacionados: grupo.estadosRelacionados
      }))
      .sort((a, b) => b.frecuencia - a.frecuencia);

    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    if (!this.datosParadas.length) {
      this.chartOptions = {};
      return;
    }

    // Nombres de causas para el eje X (con salto de línea si son largos)
    const causas = this.datosParadas.map(item => {
      // Si la causa tiene más de 20 caracteres, agregar salto de línea
      if (item.causa.length > 20) {
        const medio = Math.floor(item.causa.length / 2);
        const espacio = item.causa.indexOf(' ');
        if (espacio !== -1 && espacio < medio) {
          const primeraParte = item.causa.substring(0, espacio);
          const segundaParte = item.causa.substring(espacio + 1);
          return primeraParte + '\n' + segundaParte;
        } else {
          return item.causa.substring(0, medio) + '\n' + item.causa.substring(medio);
        }
      }
      return item.causa;
    });
    
    // Valores de horas
    const valores = this.datosParadas.map(item => item.frecuencia);
    
    // Calcular total para tooltip
    const total = valores.reduce((sum, val) => sum + val, 0);

    // Calcular máximo para escala dinámica
    const maxValor = Math.max(...valores);
    const escalaMax = Math.ceil(maxValor / 5) * 5;

    this.chartOptions = {
      title: {
        text: 'PARADAS NO PROGRAMADAS - HORAS',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 14,
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
          const data = params[0];
          const index = data.dataIndex;
          const item = this.datosParadas[index];
          const porcentajeIndividual = (item.frecuencia / total * 100).toFixed(1);
          
          // Determinar nivel de criticidad
          let criticidad = '';
          let colorCriticidad = '';
          if (data.value >= 40) {
            criticidad = 'Crítica';
            colorCriticidad = '#e74c3c';
          } else if (data.value >= 25) {
            criticidad = 'Alta';
            colorCriticidad = '#e67e22';
          } else if (data.value >= 15) {
            criticidad = 'Media';
            colorCriticidad = '#f39c12';
          } else {
            criticidad = 'Baja';
            colorCriticidad = '#2ecc71';
          }
          
          // Mostrar códigos relacionados si existen
          let codigosTexto = '';
          if (item.codigosRelacionados && item.codigosRelacionados.length > 0) {
            const codigosUnicos = [...new Set(item.codigosRelacionados)];
            codigosTexto = `<br/><span style="color:#9b59b6; font-weight:bold;">●</span>
              Códigos: <strong>${codigosUnicos.join(', ')}</strong>`;
          }
          
          let estadosTexto = '';
          if (item.estadosRelacionados && item.estadosRelacionados.length > 0) {
            const estadosUnicos = [...new Set(item.estadosRelacionados)];
            estadosTexto = `<br/><span style="color:#1abc9c; font-weight:bold;">●</span>
              Estados: <strong>${estadosUnicos.join(', ')}</strong>`;
          }
          
          return `
            <strong>📋 ${item.causa}</strong><br/>
            <hr style="margin: 4px 0;"/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            Horas Totales: <strong>${data.value.toFixed(2)}</strong> hrs<br/>
            <span style="color:${colorCriticidad}; font-weight:bold;">●</span>
            Contribución: <strong>${porcentajeIndividual}%</strong><br/>
            <span style="color:#f39c12; font-weight:bold;">●</span>
            Criticidad: <strong>${criticidad}</strong><br/>
            <span style="color:#e67e22; font-weight:bold;">●</span>
            Cantidad Registros: <strong>${item.cantidadRegistros}</strong>
            ${codigosTexto}
            ${estadosTexto}
          `;
        }
      },

      grid: {
        left: '8%',
        right: '8%',
        top: '15%',
        bottom: '12%',
        containLabel: true
      },

      xAxis: {
        type: 'category',
        data: causas,
        axisLabel: {
          fontSize: 10,
          fontWeight: 'bold',
          color: '#2c3e50',
          fontFamily: 'Arial',
          rotate: 0,
          interval: 0,
          lineHeight: 18,
          formatter: (value: string) => {
            return value;
          }
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
          formatter: '{value} hrs'
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
          name: 'Horas de Parada',
          type: 'bar',
          barWidth: '60%',
          data: valores,
          itemStyle: {
            color: '#3498db',
            borderRadius: [6, 6, 0, 0],
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 6,
            shadowOffsetY: 2
          },
          label: {
            show: true,
            position: 'top',
            fontWeight: 'bold',
            fontSize: 11,
            formatter: (params: any) => params.value.toFixed(1) + 'h',
            color: '#333'
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetY: 0,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          },
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.1)',
            borderRadius: 6
          }
        }
      ]
    };
  }
}