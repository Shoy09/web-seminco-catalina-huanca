import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, PieChart, CanvasRenderer]);

@Component({
  selector: 'app-disparos-tipo-perforacion',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './disparos-tipo-perforacion.component.html',
  styleUrl: './disparos-tipo-perforacion.component.css'
})
export class DisparosTipoPerforacionComponent implements OnChanges {

  @Input() data: any[] = [];

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      //console.log('🔥 DISPAROS POR TIPO DE PERFORACIÓN RECIBIDO:', this.data);

      if (Array.isArray(this.data)) {
        // Usar setTimeout para evitar el error de main process
        setTimeout(() => {
          this.generarGrafico();
        }, 0);
      }
    }
  }

  generarGrafico() {
    // Datos de prueba (por si no hay datos reales)
    if (!this.data || this.data.length === 0) {
      this.chartOptions = this.getOpcionesGrafico([
        { name: 'FRENTE COMPLETO', value: 50 },
        { name: 'BREASTING', value: 25 },
        { name: 'DESQUINCHE', value: 25 }
      ]);
      return;
    }

    // Agrupar por tipo de perforación
    const agrupado: { [key: string]: number } = {};

    this.data.forEach(item => {
      const tipo = item.tipo || item.tipo_perforacion || 'SIN TIPO';
      const n_disparos = Number(item.n_disparos) || Number(item.n_frentes) || 0;

      if (!agrupado[tipo]) {
        agrupado[tipo] = 0;
      }
      agrupado[tipo] += n_disparos;
    });

    // Convertir a formato echarts
    const dataGrafico = Object.keys(agrupado).map(tipo => ({
      name: tipo,
      value: agrupado[tipo]
    }));

    //console.log('🔥 DATA GRAFICO DISPAROS:', dataGrafico);

    this.chartOptions = this.getOpcionesGrafico(dataGrafico);
  }

  getOpcionesGrafico(data: any[]) {
    // Colores para cada tipo
    const colores: { [key: string]: string } = {
      'FRENTE COMPLETO': '#3498db',
      'BREASTING': '#2ecc71',
      'DESQUINCHE': '#e74c3c'
    };

    // Asignar color a cada dato
    const datosConColor = data.map(item => ({
      ...item,
      itemStyle: { color: colores[item.name] || '#95a5a6' }
    }));

    return {
      title: {
        text: 'DISPAROS POR TIPO DE PERFORACIÓN',
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
        formatter: '{b}: {c} n_disparos ({d}%)'
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
          name: 'Disparos',
          type: 'pie',
          radius: '55%',
          center: ['50%', '55%'],
          data: datosConColor,
          label: {
            show: true,
            formatter: '{b}\n{c} ({d}%)',
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
}