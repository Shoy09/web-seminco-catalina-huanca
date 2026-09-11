import { Injectable } from '@angular/core';
import { OperacionBaseJumbo } from 'app/models/OperacionBase.models';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelTaladroLargoExportService {

  exportOperacionesToExcel(operacionesOriginal: OperacionBaseJumbo[], fileName: string) {
    // Filtrar solo operaciones con estado "cerrado"
    const operacionesCerradas = operacionesOriginal.filter(op =>
      op.estado?.toLowerCase() === 'cerrado'
    );

    // Preparar datos para el formato solicitado
    const excelData = this.prepareExcelData(operacionesCerradas);

    // Crear libro de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Ajustar anchos de columna
    this.adjustColumnWidth(ws, excelData);

    XLSX.utils.book_append_sheet(wb, ws, 'OPERACIONES');

    // Exportar archivo
    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  private prepareExcelData(operaciones: OperacionBaseJumbo[]): any[] {
    const data: any[] = [];

    operaciones.forEach(op => {
      if (op.registros && op.registros.length > 0) {
        op.registros.forEach((registro: any) => {
          // Calcular horas
          const horas = this.calcularHoras(registro.hora_inicio, registro.hora_final ?? '');

          // Obtener barras del registro
          const barras = registro.operacion?.barras || [];

          // 🔥 Si el registro tiene varias barras, generamos UNA FILA POR BARRA
          if (barras.length > 0) {
            barras.forEach((barra: any) => {
              const row = this.buildRow(op, registro, barra, horas);
              data.push(row);
            });
          } else {
            // Si no hay barras, generamos una sola fila con los datos del registro
            const row = this.buildRow(op, registro, null, horas);
            data.push(row);
          }
        });
      }
    });

    return data;
  }

  /**
   * Construye una fila del Excel a partir de la operación, el registro y (opcional) una barra
   */
  private buildRow(op: OperacionBaseJumbo, registro: any, barra: any | null, horas: number): any {
    const operacionData = registro.operacion || {};

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
      'HORA INICIAL': registro.hora_inicio || '',
      'HORA FINAL': registro.hora_final || '',
    //   'HORAS': horas,

      // ⚠️ REVISAR: ¿de dónde viene la labor? En tu ejemplo, `operacion.labor` viene vacío.
      'LABOR': operacionData.labor || '',

      // ⚠️ REVISAR: estos vienen del array `barras`
      'Nº DE FILA': barra?.n_fila ?? '',
      'Nº DE TALADRO': barra?.n_taladro ?? '',
      'Nº DE BARRAS': barra?.n_barras ?? '',
      'METROS PERFORADOS': barra?.longitud_perforacion ?? '',
      'TIPO DE TALADRO': barra?.tipo_perforacion ?? '',
      'OBSERVACIÓN': operacionData.observaciones || ''
    };
  }

  private calcularHoras(horaInicio: string, horaFinal: string): number {
    if (!horaInicio || !horaFinal) return 0;

    try {
      const [h1, m1] = horaInicio.split(':').map(Number);
      const [h2, m2] = horaFinal.split(':').map(Number);

      let minutos = (h2 * 60 + m2) - (h1 * 60 + m1);
      if (minutos < 0) minutos += 1440; // Si pasa de medianoche

      return Math.round((minutos / 60) * 100000) / 100000; // 5 decimales como en tu ejemplo
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