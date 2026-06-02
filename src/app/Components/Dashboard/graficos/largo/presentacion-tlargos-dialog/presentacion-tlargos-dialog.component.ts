import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MetrosPerforadosRangoHoraComponent } from '../../horizontal/horas/metros-perforados-rango-hora/metros-perforados-rango-hora.component';
import { TablaMetrosPerforadosEquipoComponent } from '../../horizontal/horas/tabla-metros-perforados-equipo/tabla-metros-perforados-equipo.component';
import { OperacionBaseTLargos } from '../../../../../models/OperacionBase.models';
import { CommonModule } from '@angular/common';
import { OperacionTLargos } from '../../../../../models/OperacionTLargos';

export interface PresentacionTlargosDialogData {
  operaciones: OperacionBaseTLargos[];
  turnoAplicado: string;
  fechaInicio: string;
  fechaFin: string;
}

@Component({
  selector: 'app-presentacion-tlargos-dialog',
  imports: [
    CommonModule,
    MetrosPerforadosRangoHoraComponent,
    TablaMetrosPerforadosEquipoComponent,
  ],
  templateUrl: './presentacion-tlargos-dialog.component.html',
  styleUrl: './presentacion-tlargos-dialog.component.css',
})
export class PresentacionTlargosDialogComponent {
  hojaActual: string = 'hoja1';
  turnoAplicado: string = '';
  isFullscreen: boolean = false;
  operaciones: OperacionBaseTLargos[] = [];
  fechaInicio: string = '';
  fechaFin: string = '';

  DataMetrosPerforadosPorHora: any[] = [];
  DataMetrosPerforadosPorLaborYRangoHora: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<PresentacionTlargosDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PresentacionTlargosDialogData,
  ) {
    console.log('Datos recibidos en el diálogo:', data);

    // 🔥 Extraer turnoAplicado de los datos recibidos
    this.operaciones = this.data.operaciones || [];
    this.turnoAplicado = this.data.turnoAplicado || '';
    this.fechaInicio = this.data.fechaInicio || '';
    this.fechaFin = this.data.fechaFin || '';
  }
  ngOnInit(): void {
    this.procesarTodo();

    // Escuchar el evento de teclado para ESC
    document.addEventListener('keydown', this.handleEscKey.bind(this));
  }

  ngOnDestroy(): void {
    // Limpiar event listener
    document.removeEventListener('keydown', this.handleEscKey.bind(this));
  }

  private handleEscKey(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isFullscreen) {
      this.isFullscreen = false;
    }
  }

  procesarTodo(): void {
    if (!this.data.operaciones.length) return;

    this.DataMetrosPerforadosPorHora =
      this.MetrosPerforadosPorRangoHoraCompleto(this.turnoAplicado);
    this.DataMetrosPerforadosPorLaborYRangoHora =
      this.MetrosPerforadosPorLaborYRangoHora(this.turnoAplicado);
  }

MetrosPerforadosPorRangoHoraCompleto(turno: string = '') {
  const resultadoMap = new Map<string, any>();
  const tiposPerforacionSet = new Set<string>();
  
  // ✅ AHORA USA LA MISMA ESTRUCTURA QUE EL MÉTODO DE TONELADAS
  let rangosHora: { label: string; inicio: number; fin: number }[] = [];

  if (turno === 'DÍA') {
    rangosHora = [
      { label: '06:00 - 07:00', inicio: 6, fin: 7 },
      { label: '07:00 - 08:00', inicio: 7, fin: 8 },
      { label: '08:00 - 09:00', inicio: 8, fin: 9 },
      { label: '09:00 - 10:00', inicio: 9, fin: 10 },
      { label: '10:00 - 11:00', inicio: 10, fin: 11 },
      { label: '11:00 - 12:00', inicio: 11, fin: 12 },
      { label: '12:00 - 13:00', inicio: 12, fin: 13 },
      { label: '13:00 - 14:00', inicio: 13, fin: 14 },
      { label: '14:00 - 15:00', inicio: 14, fin: 15 },
      { label: '15:00 - 16:00', inicio: 15, fin: 16 },
      { label: '16:00 - 17:00', inicio: 16, fin: 17 },
      { label: '17:00 - 18:00', inicio: 17, fin: 18 }
    ];
  } else if (turno === 'NOCHE') {
    rangosHora = [
      { label: '18:00 - 19:00', inicio: 18, fin: 19 },
      { label: '19:00 - 20:00', inicio: 19, fin: 20 },
      { label: '20:00 - 21:00', inicio: 20, fin: 21 },
      { label: '21:00 - 22:00', inicio: 21, fin: 22 },
      { label: '22:00 - 23:00', inicio: 22, fin: 23 },
      { label: '23:00 - 00:00', inicio: 23, fin: 24 },
      { label: '00:00 - 01:00', inicio: 0, fin: 1 },
      { label: '01:00 - 02:00', inicio: 1, fin: 2 },
      { label: '02:00 - 03:00', inicio: 2, fin: 3 },
      { label: '03:00 - 04:00', inicio: 3, fin: 4 },
      { label: '04:00 - 05:00', inicio: 4, fin: 5 },
      { label: '05:00 - 06:00', inicio: 5, fin: 6 }
    ];
  } else {
    rangosHora = [
      { label: '06:00 - 07:00', inicio: 6, fin: 7 },
      { label: '07:00 - 08:00', inicio: 7, fin: 8 },
      { label: '08:00 - 09:00', inicio: 8, fin: 9 },
      { label: '09:00 - 10:00', inicio: 9, fin: 10 },
      { label: '10:00 - 11:00', inicio: 10, fin: 11 },
      { label: '11:00 - 12:00', inicio: 11, fin: 12 },
      { label: '12:00 - 13:00', inicio: 12, fin: 13 },
      { label: '13:00 - 14:00', inicio: 13, fin: 14 },
      { label: '14:00 - 15:00', inicio: 14, fin: 15 },
      { label: '15:00 - 16:00', inicio: 15, fin: 16 },
      { label: '16:00 - 17:00', inicio: 16, fin: 17 },
      { label: '17:00 - 18:00', inicio: 17, fin: 18 },
      { label: '18:00 - 19:00', inicio: 18, fin: 19 },
      { label: '19:00 - 20:00', inicio: 19, fin: 20 },
      { label: '20:00 - 21:00', inicio: 20, fin: 21 },
      { label: '21:00 - 22:00', inicio: 21, fin: 22 },
      { label: '22:00 - 23:00', inicio: 22, fin: 23 },
      { label: '23:00 - 00:00', inicio: 23, fin: 24 },
      { label: '00:00 - 01:00', inicio: 0, fin: 1 },
      { label: '01:00 - 02:00', inicio: 1, fin: 2 },
      { label: '02:00 - 03:00', inicio: 2, fin: 3 },
      { label: '03:00 - 04:00', inicio: 3, fin: 4 },
      { label: '04:00 - 05:00', inicio: 4, fin: 5 },
      { label: '05:00 - 06:00', inicio: 5, fin: 6 }
    ];
  }

  // Función auxiliar para convertir hora string a decimal
  const horaStringToDecimal = (horaStr: string): number => {
    if (!horaStr) return 0;
    const [hora, minutos] = horaStr.split(':').map(Number);
    return hora + (minutos / 60);
  };

  // Calcular intersección entre operación y rango
  const calcularInterseccion = (
    inicioOp: number,
    finOp: number,
    inicioRango: number,
    finRango: number
  ): number => {
    const inicio = Math.max(inicioOp, inicioRango);
    const fin = Math.min(finOp, finRango);
    return fin > inicio ? fin - inicio : 0;
  };

  // Inicializar rango en el mapa
  const inicializarRangoSiNoExiste = (label: string) => {
    if (!resultadoMap.has(label)) {
      const nuevoItem: any = {
        rangoHora: label,
        total: 0,
        cantidadRegistros: 0,
        equipos: {},
      };
      
      tiposPerforacionSet.forEach((tipo) => {
        nuevoItem[tipo] = 0;
      });
      
      resultadoMap.set(label, nuevoItem);
    }
  };

  // 1. PRIMERO: Recopilar tipos de perforación disponibles
  this.data.operaciones.forEach((op: any) => {
    if (turno && op.turno !== turno) return;
    const registrosArray = op.registros;
    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      if (registro.estado !== 'OPERATIVO') continue;
      const operacionData = registro.operacion || {};
      const barrasArray = operacionData.barras;
      if (!Array.isArray(barrasArray)) continue;

      for (const barra of barrasArray) {
        const tipoPerforacion = String(barra.tipo_perforacion || 'SIN TIPO')
          .toUpperCase()
          .trim();
        tiposPerforacionSet.add(tipoPerforacion);
      }
    }
  });

  const tiposPerforacion = Array.from(tiposPerforacionSet).sort();

  // 2. SEGUNDO: Inicializar todos los rangos con ceros
  rangosHora.forEach((rango) => {
    const nuevoItem: any = {
      rangoHora: rango.label,
      total: 0,
      cantidadRegistros: 0,
      equipos: {},
    };
    
    tiposPerforacion.forEach((tipo) => {
      nuevoItem[tipo] = 0;
    });
    
    resultadoMap.set(rango.label, nuevoItem);
  });

  // 3. TERCERO: Procesar con distribución proporcional
  this.data.operaciones.forEach((op: any) => {
    if (turno && op.turno !== turno) return;

    const registrosArray = op.registros;
    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      if (registro.estado !== 'OPERATIVO') continue;
      
      const horaInicioStr = registro.hora_inicio;

let horaFinalStr = registro.hora_final;

if (!horaFinalStr && op.Hora_envio) {
  horaFinalStr = op.Hora_envio;
}

      const operacionData = registro.operacion || {};
      const barrasArray = operacionData.barras;
      if (!Array.isArray(barrasArray)) continue;

      // Calcular duración total de la operación
      let horaInicioDecimal = horaStringToDecimal(horaInicioStr);
      let horaFinalDecimal = horaStringToDecimal(horaFinalStr);

      // Manejar cruce de medianoche
      if (horaFinalDecimal < horaInicioDecimal) {
        horaFinalDecimal += 24;
      }

      const duracionTotal = horaFinalDecimal - horaInicioDecimal;
      if (duracionTotal <= 0) continue;

      // Calcular metros perforados totales para esta operación
      let metrosPerforadosTotales = 0;
      const barrasConDatos = [];

      for (const barra of barrasArray) {
        const longitudPerforacion = Number(barra.longitud_perforacion) || 0;
        if (longitudPerforacion <= 0) continue;
        
        const tipoPerforacion = String(barra.tipo_perforacion || 'SIN TIPO')
          .toUpperCase()
          .trim();
        
        metrosPerforadosTotales += longitudPerforacion;
        barrasConDatos.push({ longitudPerforacion, tipoPerforacion });
      }

      if (metrosPerforadosTotales <= 0) continue;

      // Distribuir proporcionalmente por rango de hora
      for (const rango of rangosHora) {
        let inicioRangoDecimal = rango.inicio;
        let finRangoDecimal = rango.fin;

        // Ajustar rangos si operación cruza medianoche
        if (horaFinalDecimal > 24 && finRangoDecimal <= 6) {
          inicioRangoDecimal += 24;
          finRangoDecimal += 24;
        }

        const interseccionHoras = calcularInterseccion(
          horaInicioDecimal,
          horaFinalDecimal,
          inicioRangoDecimal,
          finRangoDecimal
        );

        if (interseccionHoras <= 0) continue;

        // Proporción de tiempo en este rango
        const proporcion = interseccionHoras / duracionTotal;
        
        // Metros perforados que corresponden a este rango
        const metrosEnRango = metrosPerforadosTotales * proporcion;
        if (metrosEnRango <= 0.001) continue;

        // Obtener o inicializar el item del rango
        let item = resultadoMap.get(rango.label);
        if (!item) {
          inicializarRangoSiNoExiste(rango.label);
          item = resultadoMap.get(rango.label);
        }

        // Distribuir metros perforados por tipo
        for (const barra of barrasConDatos) {
          const proporcionBarra = barra.longitudPerforacion / metrosPerforadosTotales;
          const metrosPorTipo = metrosEnRango * proporcionBarra;
          
          if (item[barra.tipoPerforacion] === undefined) {
            item[barra.tipoPerforacion] = 0;
          }
          item[barra.tipoPerforacion] += metrosPorTipo;
        }

        // Acumular totales
        item.total += metrosEnRango;
        
        // Acumular por equipo (solo 1 vez por registro para no duplicar)
        const nEquipo = String(op.modelo_equipo || op.n_equipo || 'SIN EQUIPO').trim();
        const labor = String(operacionData.labor || 'SIN LABOR').trim();
        const claveLabor = labor === '' ? 'SIN LABOR' : labor;

        if (!item.equipos[nEquipo]) {
          item.equipos[nEquipo] = {
            total: 0,
            labores: {},
          };
        }
        
        item.equipos[nEquipo].total += metrosEnRango;
        
        if (!item.equipos[nEquipo].labores[claveLabor]) {
          item.equipos[nEquipo].labores[claveLabor] = 0;
        }
        item.equipos[nEquipo].labores[claveLabor] += metrosEnRango;
      }

      // Contar registro en el rango donde finalizó (opcional, como en toneladas)
      const rangoFinal = rangosHora.find(r => {
        const horaFin = horaStringToDecimal(horaFinalStr);
        return horaFin >= r.inicio && horaFin < r.fin;
      });
      
      if (rangoFinal) {
        const item = resultadoMap.get(rangoFinal.label);
        if (item) {
          item.cantidadRegistros += 1;
        }
      }
    }
  });

  // 4. Convertir a array, ordenar y redondear
  const resultado = Array.from(resultadoMap.values())
    .sort((a, b) => {
      const indexA = rangosHora.findIndex(r => r.label === a.rangoHora);
      const indexB = rangosHora.findIndex(r => r.label === b.rangoHora);
      return indexA - indexB;
    })
    .map((item) => {
      item.total = Number(item.total.toFixed(2));
      
      tiposPerforacion.forEach((tipo) => {
        item[tipo] = Number((item[tipo] || 0).toFixed(2));
      });
      
      // Limpiar equipos con valores muy pequeños
      Object.keys(item.equipos).forEach((equipo) => {
        if (item.equipos[equipo].total < 0.01) {
          delete item.equipos[equipo];
        } else {
          item.equipos[equipo].total = Number(item.equipos[equipo].total.toFixed(2));
          
          Object.keys(item.equipos[equipo].labores).forEach((labor) => {
            if (item.equipos[equipo].labores[labor] < 0.01) {
              delete item.equipos[equipo].labores[labor];
            } else {
              item.equipos[equipo].labores[labor] = Number(
                item.equipos[equipo].labores[labor].toFixed(2)
              );
            }
          });
          
          // Si no quedan labores, eliminar el equipo
          if (Object.keys(item.equipos[equipo].labores).length === 0) {
            delete item.equipos[equipo];
          }
        }
      });
      
      return item;
    });

  console.log(`📊 METROS PERFORADOS POR RANGO DE HORA (Turno: ${turno || 'TODOS'}):`, resultado);
  return resultado;
}

MetrosPerforadosPorLaborYRangoHora(turno: string = '') {
  const resultadoMap = new Map<string, any>();

  // ✅ AHORA USA LA MISMA ESTRUCTURA QUE LOS OTROS MÉTODOS
  let rangosHora: { label: string; inicio: number; fin: number }[] = [];

  if (turno === 'DÍA') {
    rangosHora = [
      { label: '06:00 - 07:00', inicio: 6, fin: 7 },
      { label: '07:00 - 08:00', inicio: 7, fin: 8 },
      { label: '08:00 - 09:00', inicio: 8, fin: 9 },
      { label: '09:00 - 10:00', inicio: 9, fin: 10 },
      { label: '10:00 - 11:00', inicio: 10, fin: 11 },
      { label: '11:00 - 12:00', inicio: 11, fin: 12 },
      { label: '12:00 - 13:00', inicio: 12, fin: 13 },
      { label: '13:00 - 14:00', inicio: 13, fin: 14 },
      { label: '14:00 - 15:00', inicio: 14, fin: 15 },
      { label: '15:00 - 16:00', inicio: 15, fin: 16 },
      { label: '16:00 - 17:00', inicio: 16, fin: 17 },
      { label: '17:00 - 18:00', inicio: 17, fin: 18 }
    ];
  } else if (turno === 'NOCHE') {
    rangosHora = [
      { label: '18:00 - 19:00', inicio: 18, fin: 19 },
      { label: '19:00 - 20:00', inicio: 19, fin: 20 },
      { label: '20:00 - 21:00', inicio: 20, fin: 21 },
      { label: '21:00 - 22:00', inicio: 21, fin: 22 },
      { label: '22:00 - 23:00', inicio: 22, fin: 23 },
      { label: '23:00 - 00:00', inicio: 23, fin: 24 },
      { label: '00:00 - 01:00', inicio: 0, fin: 1 },
      { label: '01:00 - 02:00', inicio: 1, fin: 2 },
      { label: '02:00 - 03:00', inicio: 2, fin: 3 },
      { label: '03:00 - 04:00', inicio: 3, fin: 4 },
      { label: '04:00 - 05:00', inicio: 4, fin: 5 },
      { label: '05:00 - 06:00', inicio: 5, fin: 6 }
    ];
  } else {
    rangosHora = [
      { label: '06:00 - 07:00', inicio: 6, fin: 7 },
      { label: '07:00 - 08:00', inicio: 7, fin: 8 },
      { label: '08:00 - 09:00', inicio: 8, fin: 9 },
      { label: '09:00 - 10:00', inicio: 9, fin: 10 },
      { label: '10:00 - 11:00', inicio: 10, fin: 11 },
      { label: '11:00 - 12:00', inicio: 11, fin: 12 },
      { label: '12:00 - 13:00', inicio: 12, fin: 13 },
      { label: '13:00 - 14:00', inicio: 13, fin: 14 },
      { label: '14:00 - 15:00', inicio: 14, fin: 15 },
      { label: '15:00 - 16:00', inicio: 15, fin: 16 },
      { label: '16:00 - 17:00', inicio: 16, fin: 17 },
      { label: '17:00 - 18:00', inicio: 17, fin: 18 },
      { label: '18:00 - 19:00', inicio: 18, fin: 19 },
      { label: '19:00 - 20:00', inicio: 19, fin: 20 },
      { label: '20:00 - 21:00', inicio: 20, fin: 21 },
      { label: '21:00 - 22:00', inicio: 21, fin: 22 },
      { label: '22:00 - 23:00', inicio: 22, fin: 23 },
      { label: '23:00 - 00:00', inicio: 23, fin: 24 },
      { label: '00:00 - 01:00', inicio: 0, fin: 1 },
      { label: '01:00 - 02:00', inicio: 1, fin: 2 },
      { label: '02:00 - 03:00', inicio: 2, fin: 3 },
      { label: '03:00 - 04:00', inicio: 3, fin: 4 },
      { label: '04:00 - 05:00', inicio: 4, fin: 5 },
      { label: '05:00 - 06:00', inicio: 5, fin: 6 }
    ];
  }

  // Función auxiliar para convertir hora string a decimal
  const horaStringToDecimal = (horaStr: string): number => {
    if (!horaStr) return 0;
    const [hora, minutos] = horaStr.split(':').map(Number);
    return hora + (minutos / 60);
  };

  // Calcular intersección entre operación y rango
  const calcularInterseccion = (
    inicioOp: number,
    finOp: number,
    inicioRango: number,
    finRango: number
  ): number => {
    const inicio = Math.max(inicioOp, inicioRango);
    const fin = Math.min(finOp, finRango);
    return fin > inicio ? fin - inicio : 0;
  };

  // Inicializar un registro de labor+rango
  const inicializarClave = (labor: string, rangoLabel: string) => {
    const clave = `${labor}|${rangoLabel}`;
    if (!resultadoMap.has(clave)) {
      resultadoMap.set(clave, {
        labor: labor,
        rangoHora: rangoLabel,
        total: 0,
        cantidadRegistros: 0,
        cantidadBarras: 0,
        totalTaladros: 0,
        totalNBarras: 0,
        tipos: {},
      });
    }
    return resultadoMap.get(clave);
  };

  // Procesar cada operación con distribución proporcional
  this.data.operaciones.forEach((op: any) => {
    if (turno && op.turno !== turno) return;

    const registrosArray = op.registros;
    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      const estado = String(registro.estado || '').trim().toUpperCase();
      if (estado !== 'OPERATIVO') continue;

      const horaInicioStr = registro.hora_inicio;

let horaFinalStr = registro.hora_final;

if (!horaFinalStr && op.Hora_envio) {
  horaFinalStr = op.Hora_envio;
}

      const operacionData = registro.operacion || {};
      const labor = String(operacionData.labor || 'SIN LABOR').trim();
      const claveLabor = labor === '' ? 'SIN LABOR' : labor;

      const barrasArray = operacionData.barras;
      if (!Array.isArray(barrasArray)) continue;

      // Calcular duración total de la operación
      let horaInicioDecimal = horaStringToDecimal(horaInicioStr);
      let horaFinalDecimal = horaStringToDecimal(horaFinalStr);

      // Manejar cruce de medianoche
      if (horaFinalDecimal < horaInicioDecimal) {
        horaFinalDecimal += 24;
      }

      const duracionTotal = horaFinalDecimal - horaInicioDecimal;
      if (duracionTotal <= 0) continue;

      // Calcular metros perforados totales por tipo de perforación
      interface BarraInfo {
        longitud: number;
        tipo: string;
      }
      
      const barrasInfo: BarraInfo[] = [];
      let metrosPerforadosTotales = 0;

      for (const barra of barrasArray) {
        const longitudPerforacion = Number(barra.longitud_perforacion) || 0;
        if (longitudPerforacion <= 0) continue;

        const tipoPerforacion = String(barra.tipo_perforacion || 'SIN TIPO')
          .toUpperCase()
          .trim();

        barrasInfo.push({
          longitud: longitudPerforacion,
          tipo: tipoPerforacion
        });
        
        metrosPerforadosTotales += longitudPerforacion;
      }

      if (metrosPerforadosTotales <= 0) continue;

      // Distribuir proporcionalmente por cada rango de hora
      for (const rango of rangosHora) {
        let inicioRangoDecimal = rango.inicio;
        let finRangoDecimal = rango.fin;

        // Ajustar rangos si operación cruza medianoche
        if (horaFinalDecimal > 24 && finRangoDecimal <= 6) {
          inicioRangoDecimal += 24;
          finRangoDecimal += 24;
        }

        const interseccionHoras = calcularInterseccion(
          horaInicioDecimal,
          horaFinalDecimal,
          inicioRangoDecimal,
          finRangoDecimal
        );

        if (interseccionHoras <= 0.001) continue;

        // Proporción de tiempo en este rango
        const proporcion = interseccionHoras / duracionTotal;
        
        // Metros perforados que corresponden a este rango
        const metrosEnRango = metrosPerforadosTotales * proporcion;
        if (metrosEnRango <= 0.001) continue;

        // Inicializar o obtener el registro para esta labor y rango
        const item = inicializarClave(claveLabor, rango.label);

        // Distribuir metros por tipo de perforación
        for (const barra of barrasInfo) {
          const proporcionBarra = barra.longitud / metrosPerforadosTotales;
          const metrosPorTipo = metrosEnRango * proporcionBarra;
          
          if (!item.tipos[barra.tipo]) {
            item.tipos[barra.tipo] = 0;
          }
          item.tipos[barra.tipo] += metrosPorTipo;
        }

        // Acumular totales
        item.total += metrosEnRango;
        
        // La cantidad de registros se cuenta por operación, no por barra
        // Para evitar duplicar, usamos un Set para saber qué registros ya contamos
        // Pero como estamos distribuyendo, contamos el registro en el rango principal
        // Alternativa: contar al final basado en el rango con mayor intersección
        
        // Acumular cantidad de barras (distribuidas proporcionalmente)
        const barrasEnRango = barrasInfo.length * proporcion;
        item.cantidadBarras += barrasEnRango;
      }
      
      // Contar el registro en el rango donde tuvo mayor duración o donde finalizó
      // Para simplificar, contamos en el rango de la hora final (similar a la versión original)
      const rangoFinal = rangosHora.find(r => {
        const horaFin = horaStringToDecimal(horaFinalStr);
        return horaFin >= r.inicio && horaFin < r.fin;
      });
      
      if (rangoFinal) {
        const clave = `${claveLabor}|${rangoFinal.label}`;
        const item = resultadoMap.get(clave);
        if (item) {
          item.cantidadRegistros += 1;
        } else {
          // Si no existe, crearlo
          const nuevoItem = inicializarClave(claveLabor, rangoFinal.label);
          nuevoItem.cantidadRegistros += 1;
        }
      }
    }
  });

  // Agrupar resultados por labor
  const resultadoPorLabor = new Map<string, any>();

  Array.from(resultadoMap.values()).forEach((item) => {
    const labor = item.labor;

    if (!resultadoPorLabor.has(labor)) {
      resultadoPorLabor.set(labor, {
        labor,
        turno: turno || 'TODOS',
        rangos: [],
      });
    }

    const laborItem = resultadoPorLabor.get(labor);

    const rangoObj: any = {
      rangoHora: item.rangoHora,
      total: Number(item.total.toFixed(2)),
      cantidadRegistros: Math.round(item.cantidadRegistros), // Redondear porque puede ser decimal
      cantidadBarras: Number(item.cantidadBarras.toFixed(2)),
      totalTaladros: Number((item.totalTaladros || 0).toFixed(2)),
      totalNBarras: Number((item.totalNBarras || 0).toFixed(2)),
    };

    // Agregar tipos de perforación
    Object.keys(item.tipos).forEach((tipo) => {
      rangoObj[tipo] = Number(item.tipos[tipo].toFixed(2));
    });

    laborItem.rangos.push(rangoObj);
  });

  // Ordenar rangos para cada labor
  resultadoPorLabor.forEach((laborItem) => {
    laborItem.rangos.sort((a: any, b: any) => {
      const indexA = rangosHora.findIndex(r => r.label === a.rangoHora);
      const indexB = rangosHora.findIndex(r => r.label === b.rangoHora);
      return indexA - indexB;
    });
  });

  const resultado = Array.from(resultadoPorLabor.values()).sort((a, b) =>
    a.labor.localeCompare(b.labor)
  );

  console.log(`📊 METROS PERFORADOS POR LABOR Y RANGO DE HORA (Turno: ${turno || 'TODOS'}):`, resultado);
  return resultado;
}

  cerrar(): void {
    this.dialogRef.close();
  }
  cambiarHoja(hoja: string): void {
    this.hojaActual = hoja;
    //console.log('Cambiando a hoja:', hoja);
  }
  toggleFullscreen(): void {
    const dialogContainer = document.querySelector('.dialog-container');

    if (!dialogContainer) return;

    if (!this.isFullscreen) {
      // Entrar a pantalla completa
      if (dialogContainer.requestFullscreen) {
        dialogContainer.requestFullscreen();
      }
      this.isFullscreen = true;
    } else {
      // Salir de pantalla completa
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      this.isFullscreen = false;
    }
  }
}
