import { Injectable } from '@angular/core';
import { OperacionBaseJumbo } from 'app/models/OperacionBase.models';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelScoopExportService {

  exportOperacionesToExcel(operacionesOriginal: OperacionBaseJumbo[], fileName: string) {
    // Filtrar solo operaciones con estado "cerrado"
    const operacionesCerradas = operacionesOriginal.filter(op =>
      op.estado?.toLowerCase() === 'cerrado'
    );

    // Preparar datos
    const excelData = this.prepareExcelData(operacionesCerradas);

    // Crear libro
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    this.adjustColumnWidth(ws, excelData);

    XLSX.utils.book_append_sheet(wb, ws, 'OPERACIONES');

    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  private prepareExcelData(operaciones: OperacionBaseJumbo[]): any[] {
    const data: any[] = [];

    operaciones.forEach(op => {
      if (op.registros && op.registros.length > 0) {
        op.registros.forEach((registro: any) => {
          // Calcular horas
          const horas = this.calcularHoras(registro.hora_inicio, registro.hora_final ?? '');

          // Obtener horómetros (diesel → motor)
          const horometros = this.getHorometros(op, registro);

          // Datos de la operación del registro
          const operacionData = registro.operacion || {};

          const row = {
            'EQUIPO': op.n_equipo || '',
            'N° ITEM': registro.numero || '',
            'FECHA': this.formatearFecha(op.fecha),
            'TURNO': this.formatearTurno(op.turno), 
            'GUARDIA': this.obtenerGuardia(op),
            'OPERADOR': this.formatearOperador(op.operador),
            'JEFE DE GUARDIA': op.jefe_guardia || '',
            'SEMANA': this.calcularSemana(op.fecha),
            'CÓDIGO DE ACTIVIDAD': registro.codigo || '',
            'HORA INICIAL': registro.hora_inicio || '',
            'HORA FINAL': registro.hora_final || '',
            //'HORAS': horas,
            'HOROMETRO M INICIAL': horometros.motor?.inicio ?? '',
            'HOROMETRO M FINAL': horometros.motor?.final ?? '',
            // 'HORAS MOTOR': horometros.motor?.diferencia ?? '',
            'LABOR': operacionData.labor_inicio || '',                    // ⚠️ REVISAR: en tu data es `labor_inicio`
            'DESTINO': operacionData.ubicacion_destino || '',             // ⚠️ REVISAR: en tu data es `ubicacion_destino`
            'MINERAL': operacionData.mineral ?? '',
            'DESMONTE': operacionData.desmonte ?? '',
            'RELLENO': operacionData.relleno ?? '',
            'Nº DE VOLQUETE': operacionData.numero_volquete || '',
            'TIPO DE LABOR': operacionData.tipo_labor || '',              // ⚠️ REVISAR: no vi este campo en la data
            'RELAVE': operacionData.relave ?? '',
            'OBSERVACIÓN': operacionData.observaciones || ''
          };

          data.push(row);
        });
      }
    });

    return data;
  }

  private getHorometros(op: OperacionBaseJumbo, registro: any): any {
    // Primero intentar obtener horómetros del registro
    let horometrosData = registro.horometros;

    // Si no tiene, usar los de la operación principal
    if (!horometrosData || Object.keys(horometrosData).length === 0) {
      horometrosData = op.horometros;
    }

    return this.procesarHorometros(horometrosData);
  }

  private procesarHorometros(horometros: any): any {
    const defaultHorometro = { inicio: 0, final: 0, diferencia: 0 };

    const result = {
      motor: { ...defaultHorometro }
    };

    if (!horometros) {
      return result;
    }

    // Formato: { horometro: { inicio, final } }  ← tu data actual
    if (horometros.horometro) {
      const h = horometros.horometro;
      result.motor = {
        inicio: h.inicio ?? 0,
        final: h.final ?? 0,
        diferencia: (h.final ?? 0) - (h.inicio ?? 0)
      };
      return result;
    }

    // Formato: { diesel: { inicio, final } }
    if (horometros.diesel) {
      const h = horometros.diesel;
      result.motor = {
        inicio: h.inicio ?? 0,
        final: h.final ?? 0,
        diferencia: (h.final ?? 0) - (h.inicio ?? 0)
      };
      return result;
    }

    // Formato: { motor: { inicio, final } }
    if (horometros.motor) {
      const h = horometros.motor;
      result.motor = {
        inicio: h.inicio ?? 0,
        final: h.final ?? 0,
        diferencia: (h.final ?? 0) - (h.inicio ?? 0)
      };
      return result;
    }

    // Formato directo: { inicio, final }
    if (horometros.inicio !== undefined || horometros.final !== undefined) {
      result.motor = {
        inicio: horometros.inicio ?? 0,
        final: horometros.final ?? 0,
        diferencia: (horometros.final ?? 0) - (horometros.inicio ?? 0)
      };
      return result;
    }

    // Formato array
    if (Array.isArray(horometros)) {
      horometros.forEach((h: any) => {
        const nombre = h.nombre?.toLowerCase() || '';
        if (nombre.includes('motor') || nombre.includes('diesel') || nombre.includes('horometro')) {
          const inicio = h.inicio ?? h.inicial ?? 0;
          const final = h.final ?? 0;
          result.motor = { inicio, final, diferencia: final - inicio };
        }
      });
    }

    return result;
  }

  private calcularHoras(horaInicio: string, horaFinal: string): number {
    if (!horaInicio || !horaFinal) return 0;

    try {
      const [h1, m1] = horaInicio.split(':').map(Number);
      const [h2, m2] = horaFinal.split(':').map(Number);

      let minutos = (h2 * 60 + m2) - (h1 * 60 + m1);
      if (minutos < 0) minutos += 1440;

      return Math.round((minutos / 60) * 100000) / 100000;
    } catch {
      return 0;
    }
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
    .normalize('NFD')                    // Descompone letras con tilde
    .replace(/[\u0300-\u036f]/g, '');    // Elimina los diacríticos
}

private formatearOperador(operador: string | undefined | null): string {
  if (!operador) return '';
  return operador.toString().toUpperCase();
}

}