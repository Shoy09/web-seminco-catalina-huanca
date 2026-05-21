import { Component, OnInit } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, ToolboxComponent } from 'echarts/components';
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
  selector: 'app-mineral-guardia',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './mineral-guardia.component.html',
  styleUrl: './mineral-guardia.component.css'
})
export class MineralRankingGuardiaComponent implements OnInit {
  
  chartOptions: any = {};

  // Datos por tipo de guardia - PRODUCCIÓN DE MINERAL (toneladas)
  readonly datosPorGuardia = [
    { guardia: 'C', valor: 1250, color: '#f9e79f' },
    { guardia: 'B', valor: 980, color: '#85c1e9' },
    { guardia: 'A', valor: 1100, color: '#85c1e9' }
  ];

  ngOnInit(): void {
    this.actualizarGrafico();
  }

  actualizarGrafico(): void {
    const guardias = this.datosPorGuardia.map(item => item.guardia);
    const valores = this.datosPorGuardia.map(item => item.valor);
    const colores = this.datosPorGuardia.map(item => item.color);
    
    // Calcular máximo para escala dinámica
    const maxValor = Math.max(...valores);
    const escalaMax = Math.ceil(maxValor / 500) * 500;

    this.chartOptions = {
      title: {
        text: 'MINERAL - GUARDIA',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          color: '#333',
          fontFamily: 'Arial'
        }
      },

      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const data = params[0];
          let produccion = '';
          if (data.value >= 1200) produccion = 'Alta 🚀';
          else if (data.value >= 1000) produccion = 'Media 📈';
          else if (data.value >= 800) produccion = 'Normal 📊';
          else produccion = 'Baja ⚠️';
          
          return `<strong>Guardia ${data.name}</strong><br/>
                  Producción: ${data.value.toLocaleString()} toneladas<br/>
                  Nivel: ${produccion}`;
        }
      },

      grid: {
        left: '10%',
        right: '10%',
        top: '15%',
        bottom: '10%',
        containLabel: true
      },

      xAxis: {
        type: 'value',
        nameLocation: 'middle',
        nameGap: 35,
        min: 0,
        max: escalaMax,
        axisLabel: {
          fontSize: 10,
          formatter: (value: number) => value.toLocaleString()
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
        data: guardias,
        axisLabel: {
          fontSize: 12,
          fontWeight: 'bold',
          fontFamily: 'Arial'
        },
        axisLine: {
          lineStyle: {
            color: '#666'
          }
        }
      },

      series: [
        {
          name: 'Producción',
          type: 'bar',
          barWidth: '45%',
          data: valores.map((valor, index) => ({
            value: valor,
            itemStyle: {
              color: colores[index]
            }
          })),
          itemStyle: {
            borderRadius: [0, 5, 5, 0],
            shadowColor: 'rgba(0,0,0,0.2)',
            shadowBlur: 6,
            shadowOffsetY: 2
          },
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => params.value.toLocaleString(),
            fontWeight: 'bold',
            fontSize: 13,
            color: '#333'
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.3)'
            }
          },
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(180,180,180,0.1)',
            borderRadius: 5
          }
        }
      ]
    };
  }
}