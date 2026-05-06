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
  // 🔥 AGRUPAR POR area + SUMAR METROS
  // =========================================
  generarGrafico() {
    const agrupado: { [key: string]: number } = {};

    this.data.forEach(item => {
      const area = item.area || 'SIN area';
      const metros = Number(item.metros) || 0;

      if (!agrupado[area]) {
        agrupado[area] = 0;
      }

      agrupado[area] += metros;
    });

    // 🔥 convertir a formato echarts
    const dataGrafico = Object.keys(agrupado).map(area => ({
      name: area,
      value: Number(agrupado[area].toFixed(2))
    }));

    //console.log('🔥 DATA GRAFICO PIE:', dataGrafico);

    // =========================================
    // 🔥 OPCIONES DEL GRAFICO
    // =========================================
    this.chartOptions = {
      title: {
        text: 'METROS POR TIPO DE MINADO',
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
        formatter: '{b}: {c} m ({d}%)'
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
            formatter: '{b}\n{c} m',
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