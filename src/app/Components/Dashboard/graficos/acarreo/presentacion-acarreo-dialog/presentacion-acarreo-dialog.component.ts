import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OperacionBaseVolquete } from '../../../../../models/OperacionBase.models';
import { convertirNumero, normalizarTexto, obtenerRangoHoraBase, obtenerRangosHoraPorTurno } from '../../../../../utils/fecha-utils';
import { CommonModule } from '@angular/common';
import { MetrosPerforadosRangoHoraComponent } from '../../horizontal/horas/metros-perforados-rango-hora/metros-perforados-rango-hora.component';
import { TablaMetrosPerforadosEquipoComponent } from '../../horizontal/horas/tabla-metros-perforados-equipo/tabla-metros-perforados-equipo.component';

export interface PresentacionAcarreoDialogData {
  operaciones: OperacionBaseVolquete[];
  turnoAplicado: string;
  fechaInicio: string;
  fechaFin: string;
}

@Component({
  selector: 'app-presentacion-acarreo-dialog',
  imports: [CommonModule, MetrosPerforadosRangoHoraComponent, TablaMetrosPerforadosEquipoComponent],
  templateUrl: './presentacion-acarreo-dialog.component.html',
  styleUrl: './presentacion-acarreo-dialog.component.css',
})
export class PresentacionAcarreoDialogComponent {
  hojaActual: string = 'hoja1';
  turnoAplicado: string = '';
  isFullscreen: boolean = false;
  operaciones: OperacionBaseVolquete[] = [];
  fechaInicio: string = '';
  fechaFin: string = '';

  DataToneladasPorHora: any[] = [];
  DataToneladasPorLaborYRangoHora: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<PresentacionAcarreoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PresentacionAcarreoDialogData,
  ) {
    console.log('Datos recibidos en el diálogo:', data);

    //this.operaciones = this.data.operaciones || [];
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

    this.DataToneladasPorHora =
      this.TonPorRangoHoraCompleto(this.turnoAplicado);
    this.DataToneladasPorLaborYRangoHora =
      this.TonPorLaborYRangoHora(this.turnoAplicado);
  }

  TonPorRangoHoraCompleto(turno: string = '') {
    const resultadoMap = new Map<string, any>();
    const materialesSet = new Set<string>();

    const rangosHora = obtenerRangosHoraPorTurno(turno);

    // 1. Obtener materiales dinámicos
    this.data.operaciones.forEach((op: any) => {
      if (turno && op.turno !== turno) return;

      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const estado = normalizarTexto(registro.estado);

        if (estado !== 'OPERATIVO') continue;
        if (!registro.hora_final) continue;

        const detalleToneladas = this.obtenerToneladasPorMaterialVolquete(
          registro.operacion,
        );

        detalleToneladas.forEach((item) => {
          materialesSet.add(item.material);
        });
      }
    });

    const materiales = Array.from(materialesSet).sort();

    // 2. Inicializar todos los rangos
    rangosHora.forEach((rangoHora) => {
      const nuevoItem: any = {
        rangoHora,
        total: 0,
        cantidadRegistros: 0,
        totalViajes: 0,
        equipos: {},
      };

      materiales.forEach((material) => {
        nuevoItem[material] = 0;
      });

      resultadoMap.set(rangoHora, nuevoItem);
    });

    // 3. Procesar registros
    this.data.operaciones.forEach((op: any) => {
      if (turno && op.turno !== turno) return;

      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const estado = normalizarTexto(registro.estado);

        if (estado !== 'OPERATIVO') continue;
        if (!registro.hora_final) continue;

        const rangoHora = obtenerRangoHoraBase(registro.hora_final);

        if (!rangosHora.includes(rangoHora)) continue;

        const operacionData = registro.operacion || {};

        const detalleToneladas =
          this.obtenerToneladasPorMaterialVolquete(operacionData);

        if (!detalleToneladas.length) continue;

        const labor = String(
          operacionData.labor_inicio || operacionData.labor || 'SIN LABOR',
        ).trim();

        const claveLabor = labor === '' ? 'SIN LABOR' : labor;

        const numeroVolquete = String(
          operacionData.numero_volquete ||
            op.n_equipo ||
            op.modelo_equipo ||
            'SIN VOLQUETE',
        ).trim();

        const scoop = String(operacionData.scoop || 'SIN SCOOP').trim();

        const totalViajes = convertirNumero(operacionData.total_viajes);

        const item = resultadoMap.get(rangoHora);

        if (!item) continue;

        item.cantidadRegistros += 1;
        item.totalViajes += totalViajes;

        for (const detalle of detalleToneladas) {
          const material = detalle.material;
          const toneladas = detalle.toneladas;

          if (toneladas <= 0) continue;

          if (item[material] === undefined) {
            item[material] = 0;
          }

          item[material] += toneladas;
          item.total += toneladas;

          // Acumular por volquete
          if (!item.equipos[numeroVolquete]) {
            item.equipos[numeroVolquete] = {
              total: 0,
              labores: {},
              materiales: {},
              scoops: {},
            };
          }

          item.equipos[numeroVolquete].total += toneladas;

          // Acumular por labor
          if (!item.equipos[numeroVolquete].labores[claveLabor]) {
            item.equipos[numeroVolquete].labores[claveLabor] = 0;
          }

          item.equipos[numeroVolquete].labores[claveLabor] += toneladas;

          // Acumular por material
          if (!item.equipos[numeroVolquete].materiales[material]) {
            item.equipos[numeroVolquete].materiales[material] = 0;
          }

          item.equipos[numeroVolquete].materiales[material] += toneladas;

          // Acumular por scoop
          if (!item.equipos[numeroVolquete].scoops[scoop]) {
            item.equipos[numeroVolquete].scoops[scoop] = 0;
          }

          item.equipos[numeroVolquete].scoops[scoop] += toneladas;
        }
      }
    });

    // 4. Convertir a array y redondear
    const resultado = Array.from(resultadoMap.values()).map((item) => {
      item.total = Number(item.total.toFixed(2));
      item.totalViajes = Number(item.totalViajes.toFixed(2));

      materiales.forEach((material) => {
        item[material] = Number((item[material] || 0).toFixed(2));
      });

      Object.keys(item.equipos).forEach((volquete) => {
        item.equipos[volquete].total = Number(
          item.equipos[volquete].total.toFixed(2),
        );

        Object.keys(item.equipos[volquete].labores).forEach((labor) => {
          item.equipos[volquete].labores[labor] = Number(
            item.equipos[volquete].labores[labor].toFixed(2),
          );
        });

        Object.keys(item.equipos[volquete].materiales).forEach((material) => {
          item.equipos[volquete].materiales[material] = Number(
            item.equipos[volquete].materiales[material].toFixed(2),
          );
        });

        Object.keys(item.equipos[volquete].scoops).forEach((scoop) => {
          item.equipos[volquete].scoops[scoop] = Number(
            item.equipos[volquete].scoops[scoop].toFixed(2),
          );
        });
      });

      return item;
    });

    console.log('📊 TON POR RANGO HORA VOLQUETES:', resultado);

    return resultado;
  }
  TonPorLaborYRangoHora(turno: string = '') {
    const resultadoMap = new Map<string, any>();

    const rangosHora = obtenerRangosHoraPorTurno(turno);

    this.data.operaciones.forEach((op: any) => {
      if (turno && op.turno !== turno) return;

      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const estado = normalizarTexto(registro.estado);

        if (estado !== 'OPERATIVO') continue;
        if (!registro.hora_final) continue;

        const rangoHora = obtenerRangoHoraBase(registro.hora_final);

        if (!rangosHora.includes(rangoHora)) continue;

        const operacionData = registro.operacion || {};

        const detalleToneladas =
          this.obtenerToneladasPorMaterialVolquete(operacionData);

        if (!detalleToneladas.length) continue;

        const labor = String(
          operacionData.labor_inicio || operacionData.labor || 'SIN LABOR',
        ).trim();

        const claveLabor = labor === '' ? 'SIN LABOR' : labor;

        const ubicacionDestino = String(
          operacionData.ubicacion_destino || 'SIN DESTINO',
        ).trim();

        const numeroVolquete = String(
          operacionData.numero_volquete ||
            op.n_equipo ||
            op.modelo_equipo ||
            'SIN VOLQUETE',
        ).trim();

        const scoop = String(operacionData.scoop || 'SIN SCOOP').trim();

        const totalViajes = convertirNumero(operacionData.total_viajes);

        const clave = `${claveLabor}|${rangoHora}`;

        if (!resultadoMap.has(clave)) {
          resultadoMap.set(clave, {
            labor: claveLabor,
            rangoHora,
            ubicacionDestino,

            total: 0,
            cantidadRegistros: 0,
            totalViajes: 0,

            materiales: {},
            volquetes: {},
            scoops: {},
          });
        }

        const item = resultadoMap.get(clave);

        item.cantidadRegistros += 1;
        item.totalViajes += totalViajes;

        for (const detalle of detalleToneladas) {
          const material = detalle.material;
          const toneladas = detalle.toneladas;

          if (toneladas <= 0) continue;

          item.total += toneladas;

          // Materiales
          if (!item.materiales[material]) {
            item.materiales[material] = 0;
          }

          item.materiales[material] += toneladas;

          // Volquetes
          if (!item.volquetes[numeroVolquete]) {
            item.volquetes[numeroVolquete] = 0;
          }

          item.volquetes[numeroVolquete] += toneladas;

          // Scoops
          if (!item.scoops[scoop]) {
            item.scoops[scoop] = 0;
          }

          item.scoops[scoop] += toneladas;
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
        ubicacionDestino: item.ubicacionDestino,

        total: Number(item.total.toFixed(2)),
        cantidadRegistros: item.cantidadRegistros,
        totalViajes: Number(item.totalViajes.toFixed(2)),
      };

      Object.keys(item.materiales).forEach((material) => {
        rangoObj[material] = Number(item.materiales[material].toFixed(2));
      });

      rangoObj.volquetes = {};
      Object.keys(item.volquetes).forEach((volquete) => {
        rangoObj.volquetes[volquete] = Number(
          item.volquetes[volquete].toFixed(2),
        );
      });

      rangoObj.scoops = {};
      Object.keys(item.scoops).forEach((scoop) => {
        rangoObj.scoops[scoop] = Number(item.scoops[scoop].toFixed(2));
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

    console.log(
      `📊 TON POR LABOR Y RANGO HORA VOLQUETES (Turno: ${turno || 'TODOS'}):`,
      resultado,
    );

    return resultado;
  }

  private obtenerToneladasPorMaterialVolquete(operacion: any): {
    material: string;
    toneladas: number;
  }[] {
    if (!operacion) return [];

    const mineral = convertirNumero(operacion.mineral);
    const desmonte = convertirNumero(operacion.desmonte);
    const relleno = convertirNumero(operacion.relleno);
    const relave = convertirNumero(operacion.relave);

    const detalle = [
      { material: 'MINERAL', toneladas: mineral },
      { material: 'DESMONTE', toneladas: desmonte },
      { material: 'RELLENO', toneladas: relleno },
      { material: 'RELAVE', toneladas: relave },
    ].filter((item) => item.toneladas > 0);

    if (detalle.length > 0) return detalle;

    /**
     * Si tu backend más adelante manda un campo directo:
     * operacion.toneladas / operacion.total_toneladas,
     * esto lo soporta.
     */
    const toneladasDirectas =
      convertirNumero(operacion.toneladas) ||
      convertirNumero(operacion.total_toneladas) ||
      convertirNumero(operacion.ton_total);

    if (toneladasDirectas > 0) {
      const material = normalizarTexto(
        operacion.material || 'SIN MATERIAL',
      );

      return [
        {
          material,
          toneladas: toneladasDirectas,
        },
      ];
    }

    return [];
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
