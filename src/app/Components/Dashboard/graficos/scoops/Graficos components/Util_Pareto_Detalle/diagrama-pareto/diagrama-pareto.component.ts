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
import { CommonModule } from '@angular/common';

echarts.use([
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent,
  CanvasRenderer
]);

@Component({
  selector: 'app-diagrama-pareto',
  standalone: true,
  imports: [NgxEchartsDirective, CommonModule],
    providers: [provideEchartsCore({ echarts })],
  templateUrl: './diagrama-pareto.component.html',
  styleUrl: './diagrama-pareto.component.css'
})
export class DiagramaParetoComponent implements OnInit, OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  datosPareto: any[] = [];

  // Filtro seleccionado: 'NO OPERATIVA', 'OPERATIVA', o 'TODAS'
  tipoFiltro: string = 'TODAS';

  ngOnInit(): void {
    this.procesarDatos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.procesarDatos();
    }
  }

  cambiarFiltro(tipo: string): void {
    this.tipoFiltro = tipo;
    this.procesarDatos();
  }

  procesarDatos(): void {
    if (!this.data || this.data.length === 0) {
      this.datosPareto = [];
      this.chartOptions = {};
      return;
    }

    // Filtrar por tipoDemora según el filtro seleccionado
    let datosFiltrados = [...this.data];
    
    if (this.tipoFiltro !== 'TODAS') {
      datosFiltrados = datosFiltrados.filter(item => item.tipoDemora === this.tipoFiltro);
    }

    if (datosFiltrados.length === 0) {
      this.datosPareto = [];
      this.chartOptions = {};
      return;
    }

    // Agrupar por descripción (categoría) y sumar horasDemora
    const gruposPorDescripcion = new Map();

    datosFiltrados.forEach(item => {
      const descripcion = item.descripcion || 'Sin descripción';
      const horas = item.horasDemora || 0;
      const tipoDemora = item.tipoDemora || 'NO OPERATIVA';
      
      if (gruposPorDescripcion.has(descripcion)) {
        const grupo = gruposPorDescripcion.get(descripcion);
        grupo.horas += horas;
        grupo.cantidadRegistros += item.cantidadRegistros || 1;
        // Acumular códigos y equipos relacionados
        if (item.codigo && !grupo.codigos.includes(item.codigo)) {
          grupo.codigos.push(item.codigo);
        }
        if (item.equiposRelacionados) {
          grupo.equiposRelacionados.push(...item.equiposRelacionados);
        }
      } else {
        gruposPorDescripcion.set(descripcion, {
          categoria: descripcion,
          valor: horas,
          horas: horas,
          tipoDemora: tipoDemora,
          cantidadRegistros: item.cantidadRegistros || 1,
          codigos: item.codigo ? [item.codigo] : [],
          equiposRelacionados: item.equiposRelacionados ? [...item.equiposRelacionados] : []
        });
      }
    });

    // Convertir el mapa a un array y ordenar por horas de mayor a menor
    this.datosPareto = Array.from(gruposPorDescripcion.values())
      .map(grupo => ({
        categoria: grupo.categoria,
        valor: grupo.horas,
        tipoDemora: grupo.tipoDemora,
        cantidadRegistros: grupo.cantidadRegistros,
        codigos: grupo.codigos,
        equiposRelacionados: grupo.equiposRelacionados
      }))
      .sort((a, b) => b.valor - a.valor);

    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    if (!this.datosPareto.length) {
      this.chartOptions = {};
      return;
    }

    // Nombres de categorías para el eje X (con salto de línea si son largos)
    const categorias = this.datosPareto.map(item => {
      if (item.categoria.length > 20) {
        const medio = Math.floor(item.categoria.length / 2);
        const espacio = item.categoria.indexOf(' ');
        if (espacio !== -1 && espacio < medio) {
          const primeraParte = item.categoria.substring(0, espacio);
          const segundaParte = item.categoria.substring(espacio + 1);
          return primeraParte + '\n' + segundaParte;
        } else {
          return item.categoria.substring(0, medio) + '\n' + item.categoria.substring(medio);
        }
      }
      return item.categoria;
    });
    
    // Valores
    const valores = this.datosPareto.map(item => item.valor);
    
    // Calcular total para tooltip
    const total = valores.reduce((sum, val) => sum + val, 0);

    // Calcular máximo para escala dinámica
    const maxValor = Math.max(...valores);
    const escalaMax = Math.ceil(maxValor / 5) * 5;

    this.chartOptions = {
      title: {
        text: `DIAGRAMA DE PARETO - DEMORAS ${this.tipoFiltro === 'TODAS' ? 'TOTALES' : this.tipoFiltro}`,
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
          const item = this.datosPareto[index];
          const porcentajeIndividual = (item.valor / total * 100).toFixed(1);
          
          // Determinar el ícono según tipo de demora
          const iconoTipo = item.tipoDemora === 'NO OPERATIVA' ? '🔧' : '⚙️';
          
          // Mostrar códigos relacionados si existen
          let codigosTexto = '';
          if (item.codigos && item.codigos.length > 0) {
            codigosTexto = `<br/><span style="color:#9b59b6; font-weight:bold;">●</span>
              Códigos: <strong>${item.codigos.join(', ')}</strong>`;
          }
          
          let equiposTexto = '';
          if (item.equiposRelacionados && item.equiposRelacionados.length > 0) {
            const equiposUnicos = [...new Set(item.equiposRelacionados)];
            // Limitar a 5 equipos para no hacer muy largo el tooltip
            const equiposMostrar = equiposUnicos.slice(0, 5);
            const resto = equiposUnicos.length > 5 ? ` +${equiposUnicos.length - 5} más` : '';
            equiposTexto = `<br/><span style="color:#1abc9c; font-weight:bold;">●</span>
              Equipos: <strong>${equiposMostrar.join(', ')}${resto}</strong>`;
          }
          
          return `
            <strong>${iconoTipo} ${item.categoria}</strong><br/>
            <hr style="margin: 4px 0;"/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            Horas Totales: <strong>${data.value.toFixed(2)}</strong> hrs<br/>
            <span style="color:#2ecc71; font-weight:bold;">●</span>
            Contribución: <strong>${porcentajeIndividual}%</strong><br/>
            <span style="color:#f39c12; font-weight:bold;">●</span>
            Tipo Demora: <strong>${item.tipoDemora}</strong><br/>
            <span style="color:#e67e22; font-weight:bold;">●</span>
            Cantidad Registros: <strong>${item.cantidadRegistros}</strong>
            ${codigosTexto}
            ${equiposTexto}
          `;
        }
      },

      grid: {
        left: '8%',
        right: '8%',
        top: '18%',
        bottom: '12%',
        containLabel: true
      },

      xAxis: {
        type: 'category',
        data: categorias,
        axisLabel: {
          fontSize: 10,
          fontWeight: 'bold',
          color: '#2c3e50',
          fontFamily: 'Arial',
          rotate: 0,
          interval: 0,
          lineHeight: 18
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
        name: 'Horas Totales',
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
          name: 'Horas de Demora',
          type: 'bar',
          barWidth: '55%',
          data: this.datosPareto.map((item, index) => ({
            value: item.valor,
            itemStyle: {
              color: this.getColorByTipoYPosicion(item.tipoDemora, index, this.datosPareto.length)
            }
          })),
          itemStyle: {
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

  // Color según tipo de demora y posición (para diferenciar cuando hay ambos tipos)
  private getColorByTipoYPosicion(tipoDemora: string, posicion: number, total: number): string {
    if (tipoDemora === 'NO OPERATIVA') {
      // Rojo/Anaranjado para NO OPERATIVA
      if (posicion === 0) return '#e74c3c';  // Rojo intenso para la principal
      if (posicion === 1) return '#e67e22';  // Naranja
      return '#f39c12';  // Naranja claro
    } else if (tipoDemora === 'OPERATIVA') {
      // Azul/Verde para OPERATIVA
      if (posicion === 0) return '#2980b9';  // Azul intenso para la principal
      if (posicion === 1) return '#3498db';  // Azul
      return '#1abc9c';  // Verde azulado
    } else {
      // Color neutro para otros casos
      return '#95a5a6';
    }
  }
}