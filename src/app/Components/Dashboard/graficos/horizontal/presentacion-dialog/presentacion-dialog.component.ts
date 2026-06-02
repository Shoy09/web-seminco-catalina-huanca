import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MetrosPerforadosRangoHoraComponent } from "../horas/metros-perforados-rango-hora/metros-perforados-rango-hora.component";
import { TablaMetrosPerforadosEquipoComponent } from "../horas/tabla-metros-perforados-equipo/tabla-metros-perforados-equipo.component";

@Component({
  selector: 'app-presentacion-dialog',
  imports: [CommonModule, MetrosPerforadosRangoHoraComponent, TablaMetrosPerforadosEquipoComponent],
  templateUrl: './presentacion-dialog.component.html',
  styleUrl: './presentacion-dialog.component.css'
})
export class PresentacionHorizontalDialogComponent implements OnInit {
  hojaActual: string = 'hoja1';
  turnoAplicado: string = '';
  
  //DATA
  DataMetrosPerforadosPorHora: any[] = [];
  DataMetrosPerforadosPorLaborYRangoHora: any[] = [];

private equiposProceso: any[] = [];
isFullscreen: boolean = false;

  constructor(
  public dialogRef: MatDialogRef<PresentacionHorizontalDialogComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any
) {
  console.log('Datos recibidos en el diálogo:', data);
  
  // 🔥 Extraer turnoAplicado de los datos recibidos
  this.turnoAplicado = data.turnoAplicado || '';
  
  // Extraer equiposProceso de los datos recibidos
  this.equiposProceso = data.equipos || [];
  //console.log('Equipos proceso:', this.equiposProceso);
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

  // 🔥 FUNCIÓN PARA PANTALLA COMPLETA
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

  // Manejar tecla ESC para salir de pantalla completa
  private handleEscKey(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isFullscreen) {
      this.isFullscreen = false;
    }
  }

  procesarTodo(): void {
    if (!this.data.operaciones?.length) {
      console.warn('No hay operaciones filtradas');
      return;
    }


   this.DataMetrosPerforadosPorHora = this.MetrosPerforadosPorRangoHoraCompleto(this.turnoAplicado) 
   this.DataMetrosPerforadosPorLaborYRangoHora = this.MetrosPerforadosPorLaborYRangoHora(this.turnoAplicado)
    }



  cerrar(): void {
    this.dialogRef.close();
  }

  cambiarHoja(hoja: string): void {
    this.hojaActual = hoja;
    //console.log('Cambiando a hoja:', hoja);
  }



MetrosPerforadosPorRangoHoraCompleto(turno: string = '') {
  const resultadoMap = new Map<string, any>();

  // Set para almacenar todos los tipos de perforación únicos
  const tiposPerforacionSet = new Set<string>();

  // ✅ AHORA USA LA MISMA ESTRUCTURA QUE LOS OTROS MÉTODOS
  let rangosHora: { label: string; inicio: number; fin: number }[] = [];

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

  // Definir rangos según turno
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

  // Función para inicializar un rango en el mapa
  const inicializarRangoSiNoExiste = (label: string) => {
    if (!resultadoMap.has(label)) {
      const nuevoItem: any = {
        rangoHora: label,
        total: 0,
        cantidadRegistros: 0,
        equipos: {}
      };

      // Inicializar tipos de perforación
      tiposPerforacionSet.forEach(tipo => {
        nuevoItem[tipo] = 0;
      });

      resultadoMap.set(label, nuevoItem);
    }
    return resultadoMap.get(label);
  };

  // PRIMER PASO: identificar todos los tipos de perforación únicos
  this.data.operaciones.forEach((op: any) => {
    if (turno && op.turno !== turno) return;

    const registrosArray = op.registros;
    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      if (registro.estado !== 'OPERATIVO') continue;

      const operacionData = registro.operacion || {};
      const tipoPerforacion = operacionData.tipo_perforacion;

      if (tipoPerforacion && typeof tipoPerforacion === 'string') {
        tiposPerforacionSet.add(tipoPerforacion.toUpperCase().trim());
      }
    }
  });

  const tiposPerforacion = Array.from(tiposPerforacionSet).sort();

  // SEGUNDO PASO: Inicializar todos los rangos con ceros
  rangosHora.forEach(rango => {
    inicializarRangoSiNoExiste(rango.label);
  });

  // TERCER PASO: Procesar con distribución proporcional
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

if (!horaInicioStr || !horaFinalStr) continue;

      // Calcular duración total de la operación
      let horaInicioDecimal = horaStringToDecimal(horaInicioStr);
      let horaFinalDecimal = horaStringToDecimal(horaFinalStr);

      // Manejar cruce de medianoche
      if (horaFinalDecimal < horaInicioDecimal) {
        horaFinalDecimal += 24;
      }

      const duracionTotal = horaFinalDecimal - horaInicioDecimal;
      if (duracionTotal <= 0) continue;

      // Datos de perforación
      const operacionData = registro.operacion || {};

      const talAlivio = Number(operacionData.tal_alivio) || 0;
      const talProd = Number(operacionData.tal_prod) || 0;
      const talRimados = Number(operacionData.tal_rimados) || 0;
      const longBarras = Number(operacionData.long_barras) || 0;

      const tipoPerforacion = (operacionData.tipo_perforacion || 'SIN TIPO')
        .toUpperCase()
        .trim();

      const labor = (operacionData.labor || 'SIN LABOR').trim();
      const claveLabor = labor === '' ? 'SIN LABOR' : labor;
      const nEquipo = op.n_equipo || 'SIN EQUIPO';

      // Calcular metros perforados totales
      const sumaTaladros = talAlivio + talProd + talRimados;
      const metrosPerforadosTotales = sumaTaladros * longBarras * 0.3048;

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

        // Obtener o inicializar el item del rango
        let item = resultadoMap.get(rango.label);
        if (!item) {
          item = inicializarRangoSiNoExiste(rango.label);
        }

        // Acumular por tipo de perforación
        if (item[tipoPerforacion] !== undefined) {
          item[tipoPerforacion] += metrosEnRango;
        } else {
          item[tipoPerforacion] = metrosEnRango;
        }

        // Acumular totales
        item.total += metrosEnRango;

        // Acumular por equipo
        if (!item.equipos[nEquipo]) {
          item.equipos[nEquipo] = {
            total: 0,
            labores: {}
          };
        }

        item.equipos[nEquipo].total += metrosEnRango;

        // Acumular por labor dentro del equipo
        if (!item.equipos[nEquipo].labores[claveLabor]) {
          item.equipos[nEquipo].labores[claveLabor] = 0;
        }

        item.equipos[nEquipo].labores[claveLabor] += metrosEnRango;
      }

      // Contar el registro en el rango donde finalizó (para mantener compatibilidad)
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

  // Construir resultado final
  const resultado = Array.from(resultadoMap.values())
    .sort((a, b) => {
      const indexA = rangosHora.findIndex(r => r.label === a.rangoHora);
      const indexB = rangosHora.findIndex(r => r.label === b.rangoHora);
      return indexA - indexB;
    })
    .map(item => {
      // Redondear tipos de perforación
      tiposPerforacion.forEach(tipo => {
        if (item[tipo] !== undefined) {
          item[tipo] = Number(item[tipo].toFixed(2));
        }
      });

      item.total = Number(item.total.toFixed(2));

      // Redondear equipos y labores
      Object.keys(item.equipos).forEach(equipo => {
        item.equipos[equipo].total = Number(item.equipos[equipo].total.toFixed(2));

        Object.keys(item.equipos[equipo].labores).forEach(labor => {
          item.equipos[equipo].labores[labor] = Number(
            item.equipos[equipo].labores[labor].toFixed(2)
          );
        });
      });

      return item;
    });

  console.log(
    `📊 METROS PERFORADOS POR RANGO DE HORA (Turno: ${turno || 'TODOS'}):`,
    resultado
  );

  return resultado;
}

//GRAFICO - TONELADAS POR EQUIPO Y RANGO DE HORA
MetrosPerforadosPorLaborYRangoHora(turno: string = '') {
  const resultadoMap = new Map<string, any>();

  // ✅ AHORA USA LA MISMA ESTRUCTURA QUE LOS OTROS MÉTODOS
  let rangosHora: { label: string; inicio: number; fin: number }[] = [];

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

  // Definir rangos según turno
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

  // Función para inicializar una combinación labor+rango
  const inicializarClave = (labor: string, rangoLabel: string) => {
    const clave = `${labor}|${rangoLabel}`;
    if (!resultadoMap.has(clave)) {
      resultadoMap.set(clave, {
        labor: labor,
        rangoHora: rangoLabel,
        total: 0,
        cantidadRegistros: 0,
        tipos: {}
      });
    }
    return resultadoMap.get(clave);
  };

  // Procesar cada operación con distribución proporcional
  this.data.operaciones.forEach((op: any) => {
    // Filtrar por turno
    if (turno && op.turno !== turno) return;

    const registrosArray = op.registros;
    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      const codigo = registro.codigo?.toString() || '';
      
      // Verificar estado
      if (registro.estado !== 'OPERATIVO') continue;

      // Obtener horas de inicio y fin
      const horaInicioStr = registro.hora_inicio;

let horaFinalStr = registro.hora_final;

if (!horaFinalStr && op.Hora_envio) {
  horaFinalStr = op.Hora_envio;
}

      // Calcular duración total de la operación
      let horaInicioDecimal = horaStringToDecimal(horaInicioStr);
      let horaFinalDecimal = horaStringToDecimal(horaFinalStr);

      // Manejar cruce de medianoche
      if (horaFinalDecimal < horaInicioDecimal) {
        horaFinalDecimal += 24;
      }

      const duracionTotal = horaFinalDecimal - horaInicioDecimal;
      if (duracionTotal <= 0) continue;

      // Obtener labor
      const labor = registro.operacion?.labor || 'SIN LABOR';
      const claveLabor = labor.trim() === '' ? 'SIN LABOR' : labor.trim();

      // Datos de perforación
      const operacionData = registro.operacion || {};

      const talAlivio = Number(operacionData.tal_alivio) || 0;
      const talProd = Number(operacionData.tal_prod) || 0;
      const talRimados = Number(operacionData.tal_rimados) || 0;
      const longBarras = Number(operacionData.long_barras) || 0;

      // Calcular metros perforados totales
      const sumaTaladros = talAlivio + talProd + talRimados;
      const metrosPerforadosTotales = sumaTaladros * longBarras * 0.3048;

      if (metrosPerforadosTotales <= 0) continue;

      // Tipo de perforación
      const tipoPerforacion = (operacionData.tipo_perforacion || 'SIN TIPO')
        .toUpperCase()
        .trim();

      // Distribuir proporcionalmente por cada rango de hora
      let totalDistribuido = 0;
      
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

        totalDistribuido += metrosEnRango;

        // Inicializar o obtener el registro para esta labor y rango
        const item = inicializarClave(claveLabor, rango.label);

        // Acumular por tipo de perforación
        if (!item.tipos[tipoPerforacion]) {
          item.tipos[tipoPerforacion] = 0;
        }

        item.tipos[tipoPerforacion] += metrosEnRango;
        item.total += metrosEnRango;
      }

      // Validación: verificar que se distribuyó correctamente
      if (Math.abs(totalDistribuido - metrosPerforadosTotales) > 0.01) {
        console.warn(
          `⚠️ Labor ${claveLabor}: metros totales=${metrosPerforadosTotales.toFixed(2)} ` +
          `pero distribuidos=${totalDistribuido.toFixed(2)}. ` +
          `Diferencia de ${Math.abs(totalDistribuido - metrosPerforadosTotales).toFixed(2)}m`
        );
      }

      // Contar el registro en el rango donde finalizó (para mantener compatibilidad)
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
          const nuevoItem = inicializarClave(claveLabor, rangoFinal.label);
          nuevoItem.cantidadRegistros += 1;
        }
      }
    }
  });

  // Agrupar por labor
  const resultadoPorLabor = new Map<string, any>();

  Array.from(resultadoMap.values()).forEach(item => {
    const labor = item.labor;

    if (!resultadoPorLabor.has(labor)) {
      resultadoPorLabor.set(labor, {
        labor,
        turno: turno || 'TODOS',
        rangos: []
      });
    }

    const laborItem = resultadoPorLabor.get(labor);

    // Crear objeto rango
    const rangoObj: any = {
      rangoHora: item.rangoHora,
      total: Number(item.total.toFixed(2)),
      cantidadRegistros: item.cantidadRegistros
    };

    // Agregar tipos de perforación
    Object.keys(item.tipos).forEach(tipo => {
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

  // Resultado final ordenado por labor
  const resultado = Array.from(resultadoPorLabor.values()).sort((a, b) =>
    a.labor.localeCompare(b.labor)
  );

  console.log(
    `📊 METROS PERFORADOS POR LABOR Y RANGO DE HORA (Turno: ${turno || 'TODOS'}):`,
    resultado
  );

  return resultado;
}



}