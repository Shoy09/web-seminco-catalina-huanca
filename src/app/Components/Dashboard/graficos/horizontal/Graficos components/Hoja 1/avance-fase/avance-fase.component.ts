import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, PieChart, CanvasRenderer]);

@Component({
  selector: 'app-avance-fase',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './avance-fase.component.html',
  styleUrl: './avance-fase.component.css'
})
export class AvanceFaseComponent implements OnChanges {

  @Input() data: any[] = []; // 🔥 viene del padre

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {

  if (changes['data']) {
    //console.log('🔥 data cambió:', this.data);

    if (Array.isArray(this.data)) {
      this.generarGrafico();
    }
  }
}

  // =========================================
  // 🔥 AGRUPAR POR fase + SUMAR METROS
  // =========================================
  generarGrafico() {
    const agrupado: { [key: string]: number } = {};

    this.data.forEach(item => {
      const fase = item.fase || 'SIN fase';
      const metros = Number(item.metros) || 0;

      if (!agrupado[fase]) {
        agrupado[fase] = 0;
      }

      agrupado[fase] += metros;
    });

    // 🔥 convertir a formato echarts
    const dataGrafico = Object.keys(agrupado).map(fase => ({
      name: fase,
      value: Number(agrupado[fase].toFixed(2))
    }));

    //console.log('🔥 DATA GRAFICO PIE:', dataGrafico);

    // =========================================
    // 🔥 OPCIONES DEL GRAFICO
    // =========================================
    this.chartOptions = {
      title: {
        text: 'METROS PERFORADOS POR FASE',
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
        formatter: (params: any) => {
  const valor = Number(params.value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return `${params.name}: ${valor} m (${params.percent}%)`;
}
      },
      legend: {
  orient: 'horizontal',
  bottom: 5,
  left: 'center',
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
          name: 'Metros',
          type: 'pie',
          radius: '70%',
          data: dataGrafico,
          label: {
            show: true,
            formatter: (params: any) => {
  const valor = Number(params.value || 0).toLocaleString('en-US', {
    maximumFractionDigits: 1
  });

  return `${params.name}\n${valor} m`;
},
            fontSize: 12
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          }
        }
      ]
    };
  }
}