import { Injectable } from '@angular/core';
import { Estado } from 'app/models/Estado';
import { Equipo } from 'app/models/equipo.model';
import { OperacionUtilitario } from 'app/Components/Dashboard/graficos/Utilitario/principal-grafico-utilitario/utilitario-indicadores';
import * as XLSX from 'xlsx';
import { normalizarLaborExcel } from '../../utils/normalizar-labor-excel';

@Injectable({ providedIn: 'root' })
export class ExcelUtilitarioExportService {
  async exportarOperaciones(operaciones: OperacionUtilitario[], _estados: Estado[] = [], equipos: Equipo[] = []): Promise<void> {
    this.exportOperacionesToExcel(operaciones, 'Operaciones', equipos);
  }

  exportOperacionesToExcel(operaciones: OperacionUtilitario[], fileName: string, equipos: Equipo[] = []): void {
    const mapa = new Map<string, string>();
    for (const equipo of equipos) {
      const codigo = this.normalizar(equipo.codigo);
      if (codigo && !mapa.has(codigo)) mapa.set(codigo, equipo.nombre_excel ?? equipo.nombre ?? '');
    }
    const datos = this.prepareExcelData(operaciones.filter(op => this.normalizar(op.estado) === 'CERRADO'), mapa);
    const libro = XLSX.utils.book_new();
    const hoja = XLSX.utils.json_to_sheet(datos);
    this.adjustColumnWidth(hoja, datos);
    XLSX.utils.book_append_sheet(libro, hoja, 'OPERACIONES');
    XLSX.writeFile(libro, `${fileName}_Utilitario_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  private normalizar(valor: unknown): string { return String(valor ?? '').trim().toUpperCase(); }

  private parsear(valor: any): any {
    if (typeof valor !== 'string') return valor;
    try { return JSON.parse(valor); } catch { return null; }
  }

  private prepareExcelData(operaciones: OperacionUtilitario[], equipos: Map<string, string>): Record<string, unknown>[] {
    return operaciones.flatMap(op => {
      const registros = this.parsear(op.registros);
      if (!Array.isArray(registros)) return [];
      return registros.map((registro, index) => {
        const detalle = this.parsear(registro.operacion) || {};
        const horometrosRegistro = this.parsear(registro.horometros);
        const horometros = horometrosRegistro && Object.keys(horometrosRegistro).length
          ? horometrosRegistro : this.parsear(op.horometros) || {};
        const motor = horometros.diesel ?? horometros.motor ?? {};
        const inicial = motor.inicio ?? '';
        const final = motor.final ?? '';
        const diferencia = inicial !== '' && final !== '' && Number.isFinite(Number(inicial)) && Number.isFinite(Number(final))
          ? Math.round((Number(final) - Number(inicial)) * 100) / 100 : '';
        const inicioHora = registro.hora_inicio || '';
        const finalHora = registro.hora_final || '';
        const mostrar = index === 0;
        return {
          'EQUIPO': equipos.get(this.normalizar(op.n_equipo)) ?? op.n_equipo ?? '',
          'N° ITEM': registro.numero ?? '',
          'FECHA': this.formatearFecha(op.fecha),
          'TURNO': this.formatearTurno(op.turno),
          'GUARDIA': this.obtenerGuardia(op),
          'OPERADOR': this.formatearOperador(op.operador),
          'JEFE DE GUARDIA': op.jefe_guardia || '',
          'SEMANA': this.calcularSemana(op.fecha),
          'CÓDIGO DE ACTIVIDAD': registro.codigo || '',
          'HORA INICIAL': inicioHora,
          'HORA FINAL': finalHora,
          'HORAS': this.formatearNumero(this.calcularHoras(inicioHora, finalHora)),
          'HORO MOTOR INICIAL': mostrar ? this.formatearNumero(inicial) : '',
          'HORO MOTOR FINAL': mostrar ? this.formatearNumero(final) : '',
          'HORAS MOTOR': mostrar ? this.formatearNumero(diferencia) : '',
          'LABOR': normalizarLaborExcel(detalle.labor ?? detalle.origen_labor ?? ''),
          'TIPO DE LABOR': detalle.tipo_labor_texto ?? detalle.tipo_labor ?? detalle.origen_tipo_labor ?? '',
          'DESTINO': normalizarLaborExcel(detalle.destino ?? detalle.destino_labor ?? ''),
          'DUCTO': detalle.ducto ?? '',
          'CABLE': detalle.cable ?? '',
          'TUBERÍA': detalle.tuberia ?? '',
          'OBSERVACIÓN': detalle.observaciones ?? '',
          'HMI': mostrar ? this.formatearNumero(inicial) : '',
          'HMF': mostrar ? this.formatearNumero(final) : '',
        };
      });
    });
  }

  private calcularHoras(inicio: string, final: string): number {
    if (!inicio || !final) return 0;
    const minutos = (hora: string) => {
      if (!/^\d{2}:\d{2}(:\d{2})?$/.test(hora)) return NaN;
      const [h, m, s = 0] = hora.split(':').map(Number);
      return h < 24 && m < 60 && s < 60 ? h * 60 + m + s / 60 : NaN;
    };
    const a = minutos(inicio), b = minutos(final);
    return Number.isFinite(a) && Number.isFinite(b) ? Math.round(((b - a + 1440) % 1440) / 60 * 100) / 100 : 0;
  }

  private formatearNumero(valor: any): string {
    if (valor === '' || valor === null || valor === undefined) return '';
    if (typeof valor === 'string') return valor;

    const num = Number(valor);
    if (isNaN(num)) return '';

    // Redondear a 2 decimales y reemplazar punto por coma
    return num.toFixed(2).replace('.', ',');
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

  private obtenerGuardia(op: OperacionUtilitario): string {
    // Preferir 'guardia' si existe, sino 'seccion'
    return (op as any).guardia || op.seccion || '';
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
