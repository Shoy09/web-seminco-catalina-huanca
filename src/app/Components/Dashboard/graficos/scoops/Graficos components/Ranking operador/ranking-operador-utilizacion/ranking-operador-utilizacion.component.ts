import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
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
  selector: 'app-ranking-operador-utilizacion',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './ranking-operador-utilizacion.component.html',
  styleUrl: './ranking-operador-utilizacion.component.css'
})
export class RankingOperadorUtilizacionComponent implements OnInit, OnChanges {

  @Input() data: any[] = []; // Recibe datos del componente padre
  @Input() title: string = 'RANKING OPERADORES - UTILIZACIÓN'; // Título configurable
  @Input() showMedals: boolean = true; // Mostrar medallas o no

  chartOptions: any = {};
  
  // Datos procesados para el gráfico
  datosOperadores: Array<{ operador: string; utilizacion: number }> = [];

  ngOnInit(): void {
    this.procesarDatos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Cuando los datos cambian, actualizar el gráfico
    if (changes['data'] && this.data) {
      this.procesarDatos();
    }
  }

  procesarDatos(): void {
    // Validar si hay datos
    if (!this.data || this.data.length === 0) {
      this.datosOperadores = [];
      this.mostrarGraficoSinDatos();
      return;
    }

    // Mapear la estructura de datos de DisponibilidadPorOperador()
    // Espera: { operador: string, disponibilidad: number, ... }
    this.datosOperadores = this.data.map(item => ({
      operador: item.operador || 'SIN OPERADOR',
      utilizacion: Number(item.disponibilidad) || 0 // Asegurar que sea número
    }));

    // Ordenar de mayor a menor utilización
    this.datosOperadores.sort((a, b) => b.utilizacion - a.utilizacion);
    
    // Actualizar el gráfico
    this.actualizarGrafico();
  }

  mostrarGraficoSinDatos(): void {
    this.chartOptions = {
      title: {
        text: this.title,
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#333',
          fontFamily: 'Arial'
        }
      },
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: '📊 No hay datos disponibles\nSeleccione un rango de fechas',
          fill: '#999',
          fontSize: 14,
          fontFamily: 'Arial',
          lineHeight: 24
        },
        z: 100
      }
    };
  }

  actualizarGrafico(): void {
    // Validar si hay datos
    if (this.datosOperadores.length === 0) {
      this.mostrarGraficoSinDatos();
      return;
    }

    // Nombres de operadores para el eje Y
    const operadores = this.datosOperadores.map(item => item.operador);
    
    // Valores de utilización
    const valores = this.datosOperadores.map(item => item.utilizacion);

    // Escala dinámica (mínimo 0, máximo redondeado hacia arriba al 5%)
    const maxValor = Math.max(...valores, 100); // Usar 100 como referencia mínima
    const escalaMax = Math.ceil(maxValor / 5) * 5; // Redondear a múltiplo de 5
    const escalaMin = 0;

    this.chartOptions = {
      title: {
        text: this.title,
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
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
          const item = this.datosOperadores[index];
          const puesto = index + 1;
          
          let medalla = '';
          if (this.showMedals) {
            if (puesto === 1) medalla = '🥇 ';
            else if (puesto === 2) medalla = '🥈 ';
            else if (puesto === 3) medalla = '🥉 ';
          }
          
          // Determinar nivel de eficiencia
          let nivel = '';
          let colorNivel = '';
          if (data.value >= 90) {
            nivel = 'Excelente';
            colorNivel = '#2ecc71';
          } else if (data.value >= 75) {
            nivel = 'Bueno';
            colorNivel = '#3498db';
          } else if (data.value >= 60) {
            nivel = 'Regular';
            colorNivel = '#f39c12';
          } else {
            nivel = 'Requiere mejora';
            colorNivel = '#e74c3c';
          }
          
          return `
            <strong>${medalla}${item.operador}</strong><br/>
            <hr style="margin: 4px 0;"/>
            <span style="color:#3498db; font-weight:bold;">●</span>
            Disponibilidad: <strong>${data.value}%</strong><br/>
            <span style="color:#2ecc71; font-weight:bold;">●</span>
            Puesto: <strong>#${puesto}</strong> de ${this.datosOperadores.length}<br/>
            <span style="color:${colorNivel}; font-weight:bold;">●</span>
            Nivel: <strong>${nivel}</strong>
          `;
        }
      },

      grid: {
        left: '3%',
        right: '8%',
        top: '15%',
        bottom: '5%',
        containLabel: true
      },

      xAxis: {
        type: 'value',
        nameLocation: 'middle',
        nameGap: 35,
        min: escalaMin,
        max: escalaMax,
        axisLabel: {
          fontSize: 10,
          formatter: '{value}%'
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
        data: operadores,
        inverse: true,
        axisLabel: {
          show: true,
          interval: 0,
          fontSize: 11,
          fontWeight: 'bold',
          color: '#2c3e50',
          fontFamily: 'Arial',
          formatter: (value: string, index: number) => {
            if (!this.showMedals) return `${index + 1}. ${value}`;
            if (index === 0) return `🥇 ${value}`;
            if (index === 1) return `🥈 ${value}`;
            if (index === 2) return `🥉 ${value}`;
            return `${index + 1}. ${value}`;
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

      series: [
        {
          name: 'Disponibilidad',
          type: 'bar',
          barWidth: '50%',
          data: valores.map((valor, index) => ({
            value: valor,
            itemStyle: {
              color: this.getColorByPositionAndValue(index, valor)
            }
          })),
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 6,
            shadowOffsetX: 2
          },
          label: {
            show: true,
            position: 'right',
            fontWeight: 'bold',
            fontSize: 11,
            formatter: '{c}%',
            color: '#333'
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
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

  // Color según posición (top 3 destacados) y valor de utilización
  private getColorByPositionAndValue(posicion: number, valor: number): string {
    // Top 3 con colores especiales
    if (posicion === 0) return '#f39c12';  // Oro para el 1er puesto
    if (posicion === 1) return '#bdc3c7';  // Plata para el 2do puesto
    if (posicion === 2) return '#cd7f32';  // Bronce para el 3er puesto
    
    // Resto según nivel de utilización
    if (valor >= 90) return '#2ecc71';   // Verde excelente
    if (valor >= 75) return '#3498db';   // Azul bueno
    if (valor >= 60) return '#f39c12';   // Naranja regular
    return '#e74c3c';                    // Rojo necesita mejora
  }
}