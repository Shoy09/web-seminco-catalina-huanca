import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

@Component({
  selector: 'app-disparos-dia',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  templateUrl: './disparos-dia.component.html',
  styleUrl: './disparos-dia.component.css'
})
export class DisparosDiaComponent implements OnChanges {
  
  @Input() data: any[] = [];

  chartOptions: any = {};

  ngOnChanges(changes: SimpleChanges): void {
  if (changes['data']) {
    //console.log('📊 DATA RECIBIDA:', this.data);
  }

  if (changes['data'] || changes['objetivoDisparos']) {
    this.actualizarGrafico();
  }
}

  actualizarGrafico(): void {
  if (!this.data || this.data.length === 0) {
    this.chartOptions = {};
    return;
  }

  const xAxisData = this.data.map(item => this.formatearFecha(item.fecha));
  const seriesData = this.data.map(item => item.n_frentes);

  const maxValor = Math.max(...seriesData);
  const yAxisMax = Math.ceil(maxValor * 1.2);

  this.chartOptions = {
    title: {
      text: 'DISPAROS POR DÍA',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: xAxisData
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: yAxisMax
    },
    series: [
      {
        name: 'DISPAROS',
        type: 'bar',
        data: seriesData
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

  formatearFecha(fechaStr: string): string {
  //console.log('📅 Fecha original:', fechaStr);

  if (!fechaStr) {
    //console.warn('⚠️ Fecha vacía o undefined');
    return '';
  }

  // 🔥 FIX TIMEZONE
  const [year, month, day] = fechaStr.split('-').map(Number);
  const fecha = new Date(year, month - 1, day);

  //console.log('🧪 Objeto Date CORREGIDO:', fecha);

  const dia = fecha.getDate();

  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const mes = meses[fecha.getMonth()];

  const resultado = `${dia} ${mes}`;
  //console.log('✅ Fecha formateada:', resultado);

  return resultado;
}

  calcularIntervalo(max: number): number {
    if (max <= 5) return 1;
    if (max <= 10) return 2;
    if (max <= 20) return 5;
    if (max <= 50) return 10;
    return 20;
  }
}