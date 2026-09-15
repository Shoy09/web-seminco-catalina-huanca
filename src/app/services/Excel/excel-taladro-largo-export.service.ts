import { Injectable } from '@angular/core';
import { OperacionBaseJumbo } from 'app/models/OperacionBase.models';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelTaladroLargoExportService {

  exportOperacionesToExcel(operacionesOriginal: OperacionBaseJumbo[], fileName: string) {
    const operacionesCerradas = operacionesOriginal.filter(op =>
      op.estado?.toLowerCase() === 'cerrado'
    );

    const excelData = this.prepareExcelData(operacionesCerradas);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    this.adjustColumnWidth(ws, excelData);

    XLSX.utils.book_append_sheet(wb, ws, 'OPERACIONES');

    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  private prepareExcelData(operaciones: OperacionBaseJumbo[]): any[] {
    const data: any[] = [];

    operaciones.forEach(op => {
      // 🆕 Bandera para colocar los horómetros solo en la primera fila de la operación
      let horometrosYaColocados = false;

      if (op.registros && op.registros.length > 0) {
        op.registros.forEach((registro: any) => {
          const barras = registro.operacion?.barras || [];

          if (barras.length > 0) {
            // 🔥 Calcular los intervalos de tiempo para cada barra
            const intervalos = this.calcularIntervalosPorBarra(
              registro.hora_inicio || '',
              registro.hora_final || '',
              barras.length
            );

            barras.forEach((barra: any, indexBarra: number) => {
              const mostrarHorometros = !horometrosYaColocados && indexBarra === 0;

              const row = this.buildRow(
                op,
                registro,
                barra,
                intervalos[indexBarra].horaInicio,
                intervalos[indexBarra].horaFinal,
                mostrarHorometros
              );
              data.push(row);

              if (mostrarHorometros) {
                horometrosYaColocados = true;
              }
            });
          } else {
            // Sin barras: una sola fila con el rango original
            const mostrarHorometros = !horometrosYaColocados;
            const row = this.buildRow(
              op,
              registro,
              null,
              registro.hora_inicio || '',
              registro.hora_final || '',
              mostrarHorometros
            );
            data.push(row);

            if (mostrarHorometros) {
              horometrosYaColocados = true;
            }
          }
        });
      }
    });

    return data;
  }

  /**
   * Divide el rango [horaInicio, horaFinal] en `cantidad` intervalos iguales.
   * Ejemplo: 02:00 → 03:30 con 14 barras → 14 sub-rangos de ~6.43 min cada uno.
   */
  private calcularIntervalosPorBarra(
    horaInicio: string,
    horaFinal: string,
    cantidad: number
  ): { horaInicio: string; horaFinal: string }[] {
    const intervalos: { horaInicio: string; horaFinal: string }[] = [];

    if (!horaInicio || !horaFinal || cantidad <= 0) {
      // Si no hay datos válidos, devolvemos el mismo rango repetido
      for (let i = 0; i < Math.max(cantidad, 1); i++) {
        intervalos.push({ horaInicio, horaFinal });
      }
      return intervalos;
    }

    // Convertir horas a minutos desde medianoche
    const minutosInicio = this.horaAMinutos(horaInicio);
    let minutosFinal = this.horaAMinutos(horaFinal);

    // Si cruza medianoche, sumar 24h
    if (minutosFinal < minutosInicio) {
      minutosFinal += 24 * 60;
    }

    const duracionTotal = minutosFinal - minutosInicio;

    // Si la duración es 0, no tiene sentido dividir
    if (duracionTotal <= 0) {
      for (let i = 0; i < cantidad; i++) {
        intervalos.push({ horaInicio, horaFinal });
      }
      return intervalos;
    }

    const duracionPorBarra = duracionTotal / cantidad;

    for (let i = 0; i < cantidad; i++) {
      const inicioMin = minutosInicio + duracionPorBarra * i;
      const finMin = minutosInicio + duracionPorBarra * (i + 1);

      intervalos.push({
        horaInicio: this.minutosAHora(inicioMin),
        horaFinal: this.minutosAHora(finMin)
      });
    }

    return intervalos;
  }

  /**
   * Convierte "HH:MM" a minutos desde medianoche
   */
  private horaAMinutos(hora: string): number {
    if (!hora) return 0;
    const [h, m] = hora.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  /**
   * Convierte minutos desde medianoche a "HH:MM" (maneja cruce de medianoche)
   */
  private minutosAHora(minutos: number): string {
    // Normalizar dentro de 0-1439
    let mins = Math.round(minutos) % (24 * 60);
    if (mins < 0) mins += 24 * 60;

    const h = Math.floor(mins / 60);
    const m = mins % 60;

    return `${this.pad2(h)}:${this.pad2(m)}`;
  }

  private pad2(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }

  /**
   * Construye una fila del Excel
   */
  private buildRow(
    op: OperacionBaseJumbo,
    registro: any,
    barra: any | null,
    horaInicio: string,
    horaFinal: string,
    mostrarHorometros: boolean
  ): any {
    const operacionData = registro.operacion || {};
    const horometros = this.getHorometros(op, registro);

    return {
      'EQUIPO': op.n_equipo || '',
      'N° ITEM': registro.numero || '',
      'FECHA': this.formatearFecha(op.fecha),
      'TURNO': this.formatearTurno(op.turno),
      'GUARDIA': this.obtenerGuardia(op),
      'OPERADOR': this.formatearOperador(op.operador),
      'JEFE DE GUARDIA': op.jefe_guardia || '',
      'SEMANA': this.calcularSemana(op.fecha),
      'CÓDIGO DE ACTIVIDAD': registro.codigo || '',
      'HORA INICIAL': horaInicio,
      'HORA FINAL': horaFinal,
      // 'HORAS': horas,
      'LABOR': operacionData.labor || '',
      'Nº DE FILA': barra?.n_fila ?? '',
      'Nº DE TALADRO': barra?.n_taladro ?? '',
      'Nº DE BARRAS': barra?.n_barras ?? '',
      'METROS PERFORADOS': barra?.longitud_perforacion ?? '',
      'TIPO DE TALADRO': barra?.tipo_perforacion ?? '',
      'OBSERVACIÓN': operacionData.observaciones || '',

      // 🔥 Horómetros solo en la primera fila de la operación
      'HEI': mostrarHorometros ? (horometros.electrico.inicio ?? '') : '',
      'HEF': mostrarHorometros ? (horometros.electrico.final ?? '') : '',
      'HPI': mostrarHorometros ? (horometros.percusion.inicio ?? '') : '',
      'HPF': mostrarHorometros ? (horometros.percusion.final ?? '') : '',
      'HMI': mostrarHorometros ? (horometros.motor.inicio ?? '') : '',
      'HMF': mostrarHorometros ? (horometros.motor.final ?? '') : ''
    };
  }

  private getHorometros(op: OperacionBaseJumbo, registro: any): any {
    let horometrosData = registro.horometros;

    if (!horometrosData || Object.keys(horometrosData).length === 0) {
      horometrosData = op.horometros;
    }

    return this.procesarHorometros(horometrosData);
  }

  private procesarHorometros(horometros: any): any {
    const defaultHorometro = { inicio: '', final: '' };

    const result = {
      electrico: { ...defaultHorometro },
      percusion: { ...defaultHorometro },
      motor: { ...defaultHorometro }
    };

    if (!horometros) return result;

    if (typeof horometros === 'object' && !Array.isArray(horometros)) {
      if (horometros.electrico) {
        result.electrico = {
          inicio: horometros.electrico.inicio ?? '',
          final: horometros.electrico.final ?? ''
        };
      }
      if (horometros.percusion) {
        result.percusion = {
          inicio: horometros.percusion.inicio ?? '',
          final: horometros.percusion.final ?? ''
        };
      }
      if (horometros.diesel) {
        result.motor = {
          inicio: horometros.diesel.inicio ?? '',
          final: horometros.diesel.final ?? ''
        };
      }
      if (horometros.motor) {
        result.motor = {
          inicio: horometros.motor.inicio ?? '',
          final: horometros.motor.final ?? ''
        };
      }
    }

    if (Array.isArray(horometros)) {
      horometros.forEach((h: any) => {
        const nombre = h.nombre?.toLowerCase() || '';
        const inicio = h.inicio || h.inicial || '';
        const final = h.final || '';

        if (nombre.includes('electrico') || nombre.includes('eléctrico')) {
          result.electrico = { inicio, final };
        } else if (nombre.includes('percusion')) {
          result.percusion = { inicio, final };
        } else if (nombre.includes('motor') || nombre.includes('diesel')) {
          result.motor = { inicio, final };
        }
      });
    }

    return result;
  }

  private formatearFecha(fecha: string): string {
    if (!fecha) return '';

    const soloFecha = fecha.split('T')[0];
    const partes = soloFecha.split('-');

    if (partes.length !== 3) return fecha;

    const [year, month, day] = partes;
    return `${day}/${month}/${year}`;
  }

  private calcularSemana(fecha: string): string {
    if (!fecha) return '';
    try {
      const soloFecha = fecha.split('T')[0];
      const [year, month, day] = soloFecha.split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));

      const startOfYear = new Date(Date.UTC(year, 0, 1));
      const diff = (date.getTime() - startOfYear.getTime()) / 86400000;
      const weekNumber = Math.ceil((diff + startOfYear.getUTCDay() + 1) / 7);

      return `SEM ${weekNumber}`;
    } catch {
      return '';
    }
  }

  private obtenerGuardia(op: OperacionBaseJumbo): string {
    return op.seccion || '';
  }

  private adjustColumnWidth(worksheet: XLSX.WorkSheet, data: any[]) {
    if (!data || data.length === 0) return;

    const columnWidths: XLSX.ColInfo[] = [];
    const headers = Object.keys(data[0]);

    headers.forEach((header) => {
      let maxWidth = header.length * 1.2;

      data.forEach(row => {
        const value = row[header];
        if (value !== undefined && value !== null) {
          const length = value.toString().length;
          if (length > maxWidth) {
            maxWidth = length * 1.1;
          }
        }
      });

      const width = Math.min(Math.max(maxWidth, 10), 50);
      columnWidths.push({ wch: width });
    });

    worksheet['!cols'] = columnWidths;
  }

  private formatearTurno(turno: string | undefined | null): string {
    if (!turno) return '';

    return turno
      .toString()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private formatearOperador(operador: string | undefined | null): string {
    if (!operador) return '';
    return operador.toString().toUpperCase();
  }
}