import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { NgFor, CommonModule } from '@angular/common';

@Component({
  selector: 'app-rendimiento-general',
  standalone: true,
  imports: [CommonModule, NgFor],
  templateUrl: './rendimiento-general.component.html',
  styleUrls: ['./rendimiento-general.component.css']
})
export class RendimientoGeneralComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  
  tarjetas: any[] = [];

  constructor() {}

  ngOnInit(): void {
    this.procesarDatos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.procesarDatos();
    }
  }

  procesarDatos(): void {
    // Si no hay datos, mostrar valores por defecto
    if (!this.data || this.data.length === 0) {
      this.tarjetas = [
        {
          titulo: 'Rendimiento General',
          valor: 0,
          tipo: 'principal'
        }
      ];
      return;
    }

    // ============================================
    // AGRUPAR POR capacidadYd3 Y SUMAR RENDIMIENTOS
    // ============================================
    const gruposPorCapacidad = new Map();

    this.data.forEach(equipo => {
      const capacidad = equipo.capacidadYd3;
      const rendimiento = equipo.rendimiento || 0;
      
      if (gruposPorCapacidad.has(capacidad)) {
        // Si ya existe, sumar rendimiento y acumular datos
        const grupo = gruposPorCapacidad.get(capacidad);
        grupo.rendimientoTotal += rendimiento;
        grupo.cantidadEquipos++;
        grupo.codigos.push(equipo.codigo);
        grupo.totalCucharas += equipo.totalCucharas || 0;
        grupo.cantidadOperaciones += equipo.cantidadOperaciones || 0;
        // El toneladasPorCuchara puede variar, guardamos el promedio o el primero
        grupo.toneladasPorCuchara = (grupo.toneladasPorCuchara + (equipo.toneladasPorCuchara || 0)) / 2;
      } else {
        // Crear nuevo grupo
        gruposPorCapacidad.set(capacidad, {
          capacidadYd3: capacidad,
          capacidadTonelada: equipo.capacidadTonelada,
          rendimientoTotal: rendimiento,
          cantidadEquipos: 1,
          codigos: [equipo.codigo],
          totalCucharas: equipo.totalCucharas || 0,
          cantidadOperaciones: equipo.cantidadOperaciones || 0,
          toneladasPorCuchara: equipo.toneladasPorCuchara || 0
        });
      }
    });

    // Convertir el mapa a un array y ordenar por rendimientoTotal de mayor a menor
    const gruposArray = Array.from(gruposPorCapacidad.values());
    gruposArray.sort((a, b) => b.rendimientoTotal - a.rendimientoTotal);

    // Calcular el promedio simple de los grupos (no ponderado)
    const totalRendimiento = gruposArray.reduce((sum, grupo) => sum + grupo.rendimientoTotal, 0);
    const cantidadGrupos = gruposArray.length;
    const rendimientoGeneral = cantidadGrupos > 0 ? totalRendimiento / cantidadGrupos : 0;

    // Encontrar el valor máximo de rendimiento para calcular porcentajes
    const maxRendimiento = Math.max(...gruposArray.map(grupo => grupo.rendimientoTotal), 0);

    // Crear tarjetas para cada grupo de capacidad
    const tarjetasEquipos = gruposArray.map(grupo => {
      const porcentaje = maxRendimiento > 0 ? (grupo.rendimientoTotal / maxRendimiento) * 100 : 0;
      
      // Determinar color según porcentaje
      let color = '#8a8a8a'; // gris por defecto
      if (porcentaje >= 80) {
        color = '#2ecc71'; // verde excelente
      } else if (porcentaje >= 60) {
        color = '#0f6b61'; // teal bueno
      } else if (porcentaje >= 40) {
        color = '#f39c12'; // naranja regular
      } else {
        color = '#e74c3c'; // rojo bajo
      }

      // Crear título con los códigos de equipos agrupados
      const codigosTexto = grupo.codigos.join(' + ');
      const titulo = grupo.cantidadEquipos > 1 
        ? `REND (t/h) - ${grupo.capacidadYd3} yd`
        : `REND (t/h) - ${grupo.capacidadYd3} yd`;

      return {
        titulo: titulo,
        valor: grupo.rendimientoTotal,
        porcentaje: Math.round(porcentaje),
        color: color,
        tipo: 'equipo',
        capacidadYd3: grupo.capacidadYd3,
        capacidadTonelada: grupo.capacidadTonelada,
        totalCucharas: grupo.totalCucharas,
        cantidadOperaciones: grupo.cantidadOperaciones,
        toneladasPorCuchara: grupo.toneladasPorCuchara,
        cantidadEquipos: grupo.cantidadEquipos,
        codigos: grupo.codigos
      };
    });

    // Construir todas las tarjetas
    this.tarjetas = [
      {
        titulo: 'Rendimiento General',
        valor: rendimientoGeneral.toFixed(2),
        tipo: 'principal',
        totalRendimiento: totalRendimiento,
        cantidadGrupos: cantidadGrupos
      },
      ...tarjetasEquipos
    ];

    // console.log('Datos agrupados por capacidad:', this.tarjetas);
  }

  // Método para generar texto dinámico en los tooltips
  getTooltipText(item: any): string {
    if (item.tipo === 'principal') {
      return `Rendimiento General: ${item.valor} t/op | Promedio de ${item.cantidadGrupos} grupos de capacidad`;
    }
    
    if (item.cantidadEquipos > 1) {
      return `${item.titulo}: ${item.valor} t/op (suma de ${item.cantidadEquipos} equipos: ${item.codigos.join(', ')}) | ${item.porcentaje}% del máximo | Total cucharas: ${item.totalCucharas} | Total operaciones: ${item.cantidadOperaciones} | Promedio t/cuchara: ${item.toneladasPorCuchara.toFixed(2)}`;
    }
    
    return `${item.titulo}: ${item.valor} t/op | ${item.porcentaje}% del máximo | ${item.totalCucharas} cucharas | ${item.cantidadOperaciones} operaciones | ${item.toneladasPorCuchara} t/cuchara`;
  }
}