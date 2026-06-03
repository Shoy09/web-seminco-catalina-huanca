import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MetrosPerforadosRangoHoraComponent } from '../../horizontal/horas/metros-perforados-rango-hora/metros-perforados-rango-hora.component';
import { TablaMetrosPerforadosEquipoComponent } from '../../horizontal/horas/tabla-metros-perforados-equipo/tabla-metros-perforados-equipo.component';
import { OperacionBaseTLargos } from '../../../../../models/OperacionBase.models';
import { CommonModule } from '@angular/common';
import { OperacionTLargos } from '../../../../../models/OperacionTLargos';
import {
  convertirNumero,
  distribuirValorPorRangosHora,
  normalizarTexto,
  obtenerRangosHoraPorTurno,
} from '../../../../../utils/fecha-utils';

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

    const rangosHora = obtenerRangosHoraPorTurno(turno);

    // 1. Obtener tipos de perforación dinámicos
    this.data.operaciones.forEach((op: any) => {
      if (turno && op.turno !== turno) return;

      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const estado = normalizarTexto(registro.estado);

        if (estado !== 'OPERATIVO') continue;
        if (!registro.hora_inicio || !registro.hora_final) continue;

        const detalleMetros = this.obtenerMetrosPorTipoPerforacionTLargos(
          registro.operacion,
        );

        detalleMetros.forEach((item) => {
          tiposPerforacionSet.add(item.tipoPerforacion);
        });
      }
    });

    const tiposPerforacion = Array.from(tiposPerforacionSet).sort();

    // 2. Inicializar todos los rangos
    rangosHora.forEach((rangoHora) => {
      const nuevoItem: any = {
        rangoHora,
        total: 0,
        cantidadRegistros: 0,
        minutosOperativos: 0,
        equipos: {},
      };

      tiposPerforacion.forEach((tipo) => {
        nuevoItem[tipo] = 0;
      });

      resultadoMap.set(rangoHora, nuevoItem);
    });

    // 3. Procesar registros con ponderación por tiempo
    this.data.operaciones.forEach((op: any) => {
      if (turno && op.turno !== turno) return;

      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const estado = normalizarTexto(registro.estado);

        if (estado !== 'OPERATIVO') continue;
        if (!registro.hora_inicio || !registro.hora_final) continue;

        const operacionData = registro.operacion || {};

        const detalleMetros =
          this.obtenerMetrosPorTipoPerforacionTLargos(operacionData);

        if (!detalleMetros.length) continue;

        const labor = String(operacionData.labor || 'SIN LABOR').trim();

        const claveLabor = labor === '' ? 'SIN LABOR' : labor;

        const nEquipo = String(
          op.modelo_equipo || op.n_equipo || 'SIN EQUIPO',
        ).trim();

        for (const detalle of detalleMetros) {
          const tipoPerforacion = detalle.tipoPerforacion;
          const metros = detalle.metros;

          if (metros <= 0) continue;

          const distribucionMetros = distribuirValorPorRangosHora(
            registro.hora_inicio,
            registro.hora_final,
            metros,
            rangosHora,
          );

          for (const tramo of distribucionMetros) {
            const item = resultadoMap.get(tramo.rangoHora);

            if (!item) continue;

            const metrosPonderados = tramo.valor;

            if (item[tipoPerforacion] === undefined) {
              item[tipoPerforacion] = 0;
            }

            item[tipoPerforacion] += metrosPonderados;
            item.total += metrosPonderados;

            item.cantidadRegistros += 1;
            item.minutosOperativos += tramo.minutos;

            if (!item.equipos[nEquipo]) {
              item.equipos[nEquipo] = {
                total: 0,
                labores: {},
                tipos: {},
              };
            }

            item.equipos[nEquipo].total += metrosPonderados;

            if (!item.equipos[nEquipo].labores[claveLabor]) {
              item.equipos[nEquipo].labores[claveLabor] = 0;
            }

            item.equipos[nEquipo].labores[claveLabor] += metrosPonderados;

            if (!item.equipos[nEquipo].tipos[tipoPerforacion]) {
              item.equipos[nEquipo].tipos[tipoPerforacion] = 0;
            }

            item.equipos[nEquipo].tipos[tipoPerforacion] += metrosPonderados;
          }
        }
      }
    });

    // 4. Convertir a array y redondear al final
    const resultado = Array.from(resultadoMap.values()).map((item) => {
      item.total = Number(item.total.toFixed(2));
      item.minutosOperativos = Number(item.minutosOperativos.toFixed(2));

      tiposPerforacion.forEach((tipo) => {
        item[tipo] = Number((item[tipo] || 0).toFixed(2));
      });

      Object.keys(item.equipos).forEach((equipo) => {
        item.equipos[equipo].total = Number(
          item.equipos[equipo].total.toFixed(2),
        );

        Object.keys(item.equipos[equipo].labores).forEach((labor) => {
          item.equipos[equipo].labores[labor] = Number(
            item.equipos[equipo].labores[labor].toFixed(2),
          );
        });

        Object.keys(item.equipos[equipo].tipos).forEach((tipo) => {
          item.equipos[equipo].tipos[tipo] = Number(
            item.equipos[equipo].tipos[tipo].toFixed(2),
          );
        });
      });

      return item;
    });

    console.log(
      `📊 METROS POR RANGO HORA TALADROS LARGOS PONDERADO (Turno: ${
        turno || 'TODOS'
      }):`,
      resultado,
    );

    return resultado;
  }

  MetrosPerforadosPorLaborYRangoHora(turno: string = '') {
    const resultadoMap = new Map<string, any>();

    const rangosHora = obtenerRangosHoraPorTurno(turno);

    this.data.operaciones.forEach((op: any) => {
      if (turno && op.turno !== turno) return;

      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const estado = normalizarTexto(registro.estado);

        if (estado !== 'OPERATIVO') continue;
        if (!registro.hora_inicio || !registro.hora_final) continue;

        const operacionData = registro.operacion || {};

        const detalleMetros =
          this.obtenerMetrosPorTipoPerforacionTLargos(operacionData);

        if (!detalleMetros.length) continue;

        const labor = String(operacionData.labor || 'SIN LABOR').trim();

        const claveLabor = labor === '' ? 'SIN LABOR' : labor;

        const equipo = String(
          op.modelo_equipo || op.n_equipo || 'SIN EQUIPO',
        ).trim();

        for (const detalle of detalleMetros) {
          const tipoPerforacion = detalle.tipoPerforacion;
          const metros = detalle.metros;

          if (metros <= 0) continue;

          const distribucionMetros = distribuirValorPorRangosHora(
            registro.hora_inicio,
            registro.hora_final,
            metros,
            rangosHora,
          );

          for (const tramo of distribucionMetros) {
            const rangoHora = tramo.rangoHora;
            const metrosPonderados = tramo.valor;

            const clave = `${claveLabor}|${rangoHora}`;

            if (!resultadoMap.has(clave)) {
              resultadoMap.set(clave, {
                labor: claveLabor,
                rangoHora,

                total: 0,
                cantidadRegistros: 0,
                minutosOperativos: 0,

                tipos: {},
                equipos: {},
              });
            }

            const item = resultadoMap.get(clave);

            item.total += metrosPonderados;
            item.cantidadRegistros += 1;
            item.minutosOperativos += tramo.minutos;

            if (!item.tipos[tipoPerforacion]) {
              item.tipos[tipoPerforacion] = 0;
            }

            item.tipos[tipoPerforacion] += metrosPonderados;

            if (!item.equipos[equipo]) {
              item.equipos[equipo] = 0;
            }

            item.equipos[equipo] += metrosPonderados;
          }
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
        minutosOperativos: Number(item.minutosOperativos.toFixed(2)),
      };

      Object.keys(item.tipos).forEach((tipo) => {
        rangoObj[tipo] = Number(item.tipos[tipo].toFixed(2));
      });

      rangoObj.equipos = {};

      Object.keys(item.equipos).forEach((equipo) => {
        rangoObj.equipos[equipo] = Number(item.equipos[equipo].toFixed(2));
      });

      laborItem.rangos.push(rangoObj);

      laborItem.rangos.sort((a: any, b: any) => {
        const indexA = rangosHora.indexOf(a.rangoHora);
        const indexB = rangosHora.indexOf(b.rangoHora);

        return indexA - indexB;
      });
    });

    const resultado = Array.from(resultadoPorLabor.values()).sort((a, b) =>
      String(a.labor).localeCompare(String(b.labor)),
    );

    return resultado;
  }

  private obtenerMetrosPorTipoPerforacionTLargos(operacion: OperacionTLargos) {
    if (!operacion) return [];

    const barrasArray = operacion.barras;

    if (!Array.isArray(barrasArray)) return [];

    const resultado: {
      tipoPerforacion: string;
      metros: number;
    }[] = [];

    for (const barra of barrasArray) {
      const tipoPerforacion = normalizarTexto(
        barra.tipo_perforacion || 'SIN TIPO',
      );

      const longitudDirecta = convertirNumero(barra.longitud_perforacion);

      let metros = 0;

      // Nueva estructura: longitud_perforacion ya viene en metros
      if (longitudDirecta > 0) {
        metros = longitudDirecta;
      }

      if (metros <= 0) continue;

      resultado.push({
        tipoPerforacion: tipoPerforacion || 'SIN TIPO',
        metros,
      });
    }

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
