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
  let rangosHora: string[] = [];

  const obtenerRangoHoraBase = (horaStr: string): string => {
    if (!horaStr) return 'SIN HORA';
    let [hora, minutos] = horaStr.split(':').map(Number);
    if (isNaN(hora) || isNaN(minutos)) return 'SIN HORA';

    // Si termina exacto en :00 pertenece al rango anterior
    if (minutos === 0) {
      hora = hora === 0 ? 23 : hora - 1;
      minutos = 59;
    }

    if (hora >= 6 && hora < 7) return '06:00 - 07:00';
    if (hora >= 7 && hora < 8) return '07:00 - 08:00';
    if (hora >= 8 && hora < 9) return '08:00 - 09:00';
    if (hora >= 9 && hora < 10) return '09:00 - 10:00';
    if (hora >= 10 && hora < 11) return '10:00 - 11:00';
    if (hora >= 11 && hora < 12) return '11:00 - 12:00';
    if (hora >= 12 && hora < 13) return '12:00 - 13:00';
    if (hora >= 13 && hora < 14) return '13:00 - 14:00';
    if (hora >= 14 && hora < 15) return '14:00 - 15:00';
    if (hora >= 15 && hora < 16) return '15:00 - 16:00';
    if (hora >= 16 && hora < 17) return '16:00 - 17:00';
    if (hora >= 17 && hora < 18) return '17:00 - 18:00';
    if (hora >= 18 && hora < 19) return '18:00 - 19:00';
    if (hora >= 19 && hora < 20) return '19:00 - 20:00';
    if (hora >= 20 && hora < 21) return '20:00 - 21:00';
    if (hora >= 21 && hora < 22) return '21:00 - 22:00';
    if (hora >= 22 && hora < 23) return '22:00 - 23:00';
    if (hora >= 23) return '23:00 - 00:00';
    if (hora >= 0 && hora < 1) return '00:00 - 01:00';
    if (hora >= 1 && hora < 2) return '01:00 - 02:00';
    if (hora >= 2 && hora < 3) return '02:00 - 03:00';
    if (hora >= 3 && hora < 4) return '03:00 - 04:00';
    if (hora >= 4 && hora < 5) return '04:00 - 05:00';
    if (hora >= 5 && hora < 6) return '05:00 - 06:00';

    return 'SIN HORA';
  };

  // Definir rangos según turno
  if (turno === 'DÍA') {
    rangosHora = [
      '06:00 - 07:00', '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00',
      '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00',
      '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00'
    ];
  } else if (turno === 'NOCHE') {
    rangosHora = [
      '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00',
      '22:00 - 23:00', '23:00 - 00:00', '00:00 - 01:00', '01:00 - 02:00',
      '02:00 - 03:00', '03:00 - 04:00', '04:00 - 05:00', '05:00 - 06:00'
    ];
  } else {
    rangosHora = [
      '06:00 - 07:00', '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00',
      '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00',
      '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00',
      '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00',
      '22:00 - 23:00', '23:00 - 00:00', '00:00 - 01:00', '01:00 - 02:00',
      '02:00 - 03:00', '03:00 - 04:00', '04:00 - 05:00', '05:00 - 06:00'
    ];
  }

  // 1. Obtener tipos de perforación
  this.data.operaciones.forEach((op: OperacionBaseTLargos) => {
    if (turno && op.turno !== turno) return;
    const registrosArray = op.registros;
    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      if (registro.estado !== 'OPERATIVO') continue;
      if (!registro.hora_final) continue;

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

  // 2. Inicializar todos los rangos
  rangosHora.forEach((rangoHora) => {
    const nuevoItem: any = {
      rangoHora,
      total: 0,
      cantidadRegistros: 0,
      //cantidadBarras: 0,
      //totalTaladros: 0,
      //totalNBarras: 0,
      equipos: {},
    };

    tiposPerforacion.forEach((tipo) => {
      nuevoItem[tipo] = 0;
    });

    resultadoMap.set(rangoHora, nuevoItem);
  });

  // 3. Procesar registros - NUEVA LÓGICA
  this.data.operaciones.forEach((op: any) => {
    if (turno && op.turno !== turno) return;

    const registrosArray = op.registros;
    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      if (registro.estado !== 'OPERATIVO') continue;
      if (!registro.hora_final) continue;

      const rangoHora = obtenerRangoHoraBase(registro.hora_final);
      if (!rangosHora.includes(rangoHora)) continue;

      const operacionData = registro.operacion || {};
      const barrasArray = operacionData.barras;

      if (!Array.isArray(barrasArray)) continue;

      const labor = String(operacionData.labor || 'SIN LABOR').trim();
      const claveLabor = labor === '' ? 'SIN LABOR' : labor;
      const nEquipo = String(op.modelo_equipo || op.n_equipo || 'SIN EQUIPO').trim();

      const item = resultadoMap.get(rangoHora);
      if (!item) continue;

      for (const barra of barrasArray) {
        // ✅ NUEVO: Usar longitud_perforacion directamente
        const longitudPerforacion = Number(barra.longitud_perforacion) || 0;
        
        // Si viene n_fila, puedes usarlo para otros cálculos
        //const nFila = Number(barra.n_fila) || 0;
        
        const tipoPerforacion = String(barra.tipo_perforacion || 'SIN TIPO')
          .toUpperCase()
          .trim();

        // Los metros perforados son SOLO la longitud_perforacion
        const metrosPerforados = longitudPerforacion;

        if (metrosPerforados <= 0) continue;

        // Acumular por tipo de perforación
        if (item[tipoPerforacion] === undefined) {
          item[tipoPerforacion] = 0;
        }

        item[tipoPerforacion] += metrosPerforados;

        // Totales del rango
        item.total += metrosPerforados;
        item.cantidadRegistros += 1;
        //item.cantidadBarras += 1;
        
        // Nota: Ya no tienes n_taladro ni n_barras, solo n_fila
        // Si aún necesitas estos valores, puedes usar n_fila
        //item.totalTaladros += nFila;     // Ahora usa n_fila en lugar de n_taladro
        //item.totalNBarras += 1;          // Cada barra cuenta como 1

        // Acumular por equipo
        if (!item.equipos[nEquipo]) {
          item.equipos[nEquipo] = {
            total: 0,
            labores: {},
          };
        }

        item.equipos[nEquipo].total += metrosPerforados;

        // Acumular por labor dentro del equipo
        if (!item.equipos[nEquipo].labores[claveLabor]) {
          item.equipos[nEquipo].labores[claveLabor] = 0;
        }

        item.equipos[nEquipo].labores[claveLabor] += metrosPerforados;
      }
    }
  });

  // 4. Convertir a array y redondear
  const resultado = Array.from(resultadoMap.values()).map((item) => {
    item.total = Number(item.total.toFixed(2));
    //item.totalTaladros = Number(item.totalTaladros.toFixed(2));
    //item.totalNBarras = Number(item.totalNBarras.toFixed(2));

    tiposPerforacion.forEach((tipo) => {
      item[tipo] = Number((item[tipo] || 0).toFixed(2));
    });

    Object.keys(item.equipos).forEach((equipo) => {
      item.equipos[equipo].total = Number(item.equipos[equipo].total.toFixed(2));

      Object.keys(item.equipos[equipo].labores).forEach((labor) => {
        item.equipos[equipo].labores[labor] = Number(
          item.equipos[equipo].labores[labor].toFixed(2)
        );
      });
    });

    return item;
  });

  return resultado;
}

  MetrosPerforadosPorLaborYRangoHora(turno: string = '') {
    const resultadoMap = new Map<string, any>();

    let rangosHora: string[] = [];

    if (turno === 'DÍA') {
      rangosHora = [
        '06:00 - 07:00',
        '07:00 - 08:00',
        '08:00 - 09:00',
        '09:00 - 10:00',
        '10:00 - 11:00',
        '11:00 - 12:00',
        '12:00 - 13:00',
        '13:00 - 14:00',
        '14:00 - 15:00',
        '15:00 - 16:00',
        '16:00 - 17:00',
        '17:00 - 18:00',
      ];
    } else if (turno === 'NOCHE') {
      rangosHora = [
        '18:00 - 19:00',
        '19:00 - 20:00',
        '20:00 - 21:00',
        '21:00 - 22:00',
        '22:00 - 23:00',
        '23:00 - 00:00',
        '00:00 - 01:00',
        '01:00 - 02:00',
        '02:00 - 03:00',
        '03:00 - 04:00',
        '04:00 - 05:00',
        '05:00 - 06:00',
      ];
    } else {
      rangosHora = [
        '06:00 - 07:00',
        '07:00 - 08:00',
        '08:00 - 09:00',
        '09:00 - 10:00',
        '10:00 - 11:00',
        '11:00 - 12:00',
        '12:00 - 13:00',
        '13:00 - 14:00',
        '14:00 - 15:00',
        '15:00 - 16:00',
        '16:00 - 17:00',
        '17:00 - 18:00',
        '18:00 - 19:00',
        '19:00 - 20:00',
        '20:00 - 21:00',
        '21:00 - 22:00',
        '22:00 - 23:00',
        '23:00 - 00:00',
        '00:00 - 01:00',
        '01:00 - 02:00',
        '02:00 - 03:00',
        '03:00 - 04:00',
        '04:00 - 05:00',
        '05:00 - 06:00',
      ];
    }

    const obtenerRangoHora = (horaStr: string): string => {
      if (!horaStr) return 'SIN HORA';

      let [hora, minutos] = horaStr.split(':').map(Number);

      if (isNaN(hora) || isNaN(minutos)) return 'SIN HORA';

      // Si termina exacto en :00, pertenece al rango anterior
      if (minutos === 0) {
        hora = hora === 0 ? 23 : hora - 1;
        minutos = 59;
      }

      if (hora >= 6 && hora < 7) return '06:00 - 07:00';
      if (hora >= 7 && hora < 8) return '07:00 - 08:00';
      if (hora >= 8 && hora < 9) return '08:00 - 09:00';
      if (hora >= 9 && hora < 10) return '09:00 - 10:00';
      if (hora >= 10 && hora < 11) return '10:00 - 11:00';
      if (hora >= 11 && hora < 12) return '11:00 - 12:00';
      if (hora >= 12 && hora < 13) return '12:00 - 13:00';
      if (hora >= 13 && hora < 14) return '13:00 - 14:00';
      if (hora >= 14 && hora < 15) return '14:00 - 15:00';
      if (hora >= 15 && hora < 16) return '15:00 - 16:00';
      if (hora >= 16 && hora < 17) return '16:00 - 17:00';
      if (hora >= 17 && hora < 18) return '17:00 - 18:00';
      if (hora >= 18 && hora < 19) return '18:00 - 19:00';
      if (hora >= 19 && hora < 20) return '19:00 - 20:00';
      if (hora >= 20 && hora < 21) return '20:00 - 21:00';
      if (hora >= 21 && hora < 22) return '21:00 - 22:00';
      if (hora >= 22 && hora < 23) return '22:00 - 23:00';
      if (hora >= 23) return '23:00 - 00:00';
      if (hora >= 0 && hora < 1) return '00:00 - 01:00';
      if (hora >= 1 && hora < 2) return '01:00 - 02:00';
      if (hora >= 2 && hora < 3) return '02:00 - 03:00';
      if (hora >= 3 && hora < 4) return '03:00 - 04:00';
      if (hora >= 4 && hora < 5) return '04:00 - 05:00';
      if (hora >= 5 && hora < 6) return '05:00 - 06:00';

      return 'SIN HORA';
    };

    this.data.operaciones.forEach((op: any) => {
      if (turno && op.turno !== turno) return;

      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const estado = String(registro.estado || '')
          .trim()
          .toUpperCase();

        if (estado !== 'OPERATIVO') continue;

        if (!registro.hora_final) continue;

        const operacionData = registro.operacion || {};

        const labor = String(operacionData.labor || 'SIN LABOR').trim();
        const claveLabor = labor === '' ? 'SIN LABOR' : labor;

        const rangoHora = obtenerRangoHora(registro.hora_final);

        if (!rangosHora.includes(rangoHora)) continue;

        const longBarrasPies = Number(operacionData.long_barras) || 0;
        const longBarrasMetros = longBarrasPies * 0.3048;

        const barrasArray = operacionData.barras;

        if (!Array.isArray(barrasArray)) continue;

        const clave = `${claveLabor}|${rangoHora}`;

        if (!resultadoMap.has(clave)) {
          resultadoMap.set(clave, {
            labor: claveLabor,
            rangoHora,
            total: 0,
            cantidadRegistros: 0,
            cantidadBarras: 0,
            totalTaladros: 0,
            totalNBarras: 0,
            tipos: {},
          });
        }

        const item = resultadoMap.get(clave);

        for (const barra of barrasArray) {
          //const nTaladro = Number(barra.n_taladro) || 0;
          //const nBarras = Number(barra.n_barras) || 0;

          const tipoPerforacion = String(barra.tipo_perforacion || 'SIN TIPO')
            .toUpperCase()
            .trim();

          //const metrosPerforados = nTaladro * nBarras * longBarrasMetros;
          const longitudPerforacion = Number(barra.longitud_perforacion) || 0;

          const metrosPerforados = longitudPerforacion;



          if (metrosPerforados <= 0) continue;

          if (!item.tipos[tipoPerforacion]) {
            item.tipos[tipoPerforacion] = 0;
          }

          item.tipos[tipoPerforacion] += metrosPerforados;
          item.total += metrosPerforados;

          item.cantidadRegistros += 1;
          item.cantidadBarras += 1;
          //item.totalTaladros += nTaladro;
          //item.totalNBarras += nBarras;
        }
      }
    });

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
        cantidadRegistros: item.cantidadRegistros,
        cantidadBarras: item.cantidadBarras,
        totalTaladros: Number(item.totalTaladros.toFixed(2)),
        totalNBarras: Number(item.totalNBarras.toFixed(2)),
      };

      Object.keys(item.tipos).forEach((tipo) => {
        rangoObj[tipo] = Number(item.tipos[tipo].toFixed(2));
      });

      laborItem.rangos.push(rangoObj);

      laborItem.rangos.sort((a: any, b: any) => {
        const indexA = rangosHora.indexOf(a.rangoHora);
        const indexB = rangosHora.indexOf(b.rangoHora);

        return indexA - indexB;
      });
    });

    const resultado = Array.from(resultadoPorLabor.values()).sort((a, b) =>
      a.labor.localeCompare(b.labor),
    );

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
