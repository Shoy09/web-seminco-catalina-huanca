import { Component, OnInit } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { ScatterChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, VisualMapComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([ScatterChart, TitleComponent, TooltipComponent, GridComponent, VisualMapComponent, CanvasRenderer]);

@Component({
  selector: 'app-scatter-plot',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './scatter-plot.component.html',
  styleUrls: ['./scatter-plot.component.css']
})
export class ScatterPlotComponent implements OnInit {
  
  chartOptions: any = {};

  ngOnInit(): void {
    this.generateMockData();
  }

  generateMockData(): void {
    // Datos basados en la imagen
    const equipos = ['J-19', 'J-20', 'J-23'];
    const fechas = ['03/04/2026', '14/04/2026'];
    const horas = ['7:00', '8:30', '9:00', '10:30', '11:00', '12:00', '13:00', '14:00', '15:00', '16:30', '17:00', '18:30', '19:00'];
    
    // Convertir horas a valores numéricos
    const horaToValue = (hora: string): number => {
      const [h, m] = hora.split(':');
      return parseInt(h) + parseInt(m) / 60;
    };
    
    // Generar puntos de dispersión
    const scatterData: any[] = [];
    
    equipos.forEach((equipo, equipoIndex) => {
      fechas.forEach(fecha => {
        // Generar entre 3-8 inicios por equipo/fecha
        const numInicios = Math.floor(Math.random() * 6) + 3;
        
        for (let i = 0; i < numInicios; i++) {
          const hora = horas[Math.floor(Math.random() * horas.length)];
          const horaValue = horaToValue(hora);
          const intensidad = Math.floor(Math.random() * 80) + 20; // 20-100
          
          scatterData.push({
            value: [horaValue, equipoIndex, intensidad],
            hora: hora,
            equipo: equipo,
            fecha: fecha,
            intensidad: intensidad
          });
        }
      });
    });
    
    this.chartOptions = {
      title: {
        text: 'Mapa de Calor de Inicios de Perforación',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const data = params.data;
          return `${data.equipo}<br/>${data.fecha}<br/>${data.hora}<br/>Intensidad: ${data.intensidad}%`;
        }
      },
      grid: {
        left: '10%',
        right: '10%',
        top: '15%',
        bottom: '10%'
      },
      xAxis: {
        type: 'value',
        name: 'Horas',
        min: 6.5,
        max: 19.5,
        axisLabel: {
          formatter: (value: number) => {
            const hora = Math.floor(value);
            const minutos = Math.round((value - hora) * 60);
            return `${hora}:${minutos === 0 ? '00' : minutos}`;
          },
          rotate: 45
        }
      },
      yAxis: {
        type: 'category',
        data: equipos,
        name: 'Inicio de Perforación',
        axisLabel: {
          fontWeight: 'bold'
        }
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'vertical',
        right: 10,
        top: 'center',
        text: ['Alta', 'Baja'],
        inRange: {
          color: ['#3498db', '#f39c12', '#e74c3c']
        }
      },
      series: [{
        type: 'scatter',
        data: scatterData,
        symbolSize: 12,
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        }
      }]
    };
  }
}