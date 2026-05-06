import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { AuxiliaresInterLanzador, AuxiliaresLanzador } from '../../models/auxiliares-lanzador.model';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportAuxiliaresLanzadorService {

  exportToExcel(data: AuxiliaresLanzador[], fileName: string) {

    // (opcional) filtrar solo activos
    const registros = data.filter(d => d.estado?.toLowerCase() === 'cerrado');

    const ejecutadoData = this.prepareEjecutadoData(registros);
    const estadosData = this.prepareEstadosData(registros);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    const ejecutadoWS = XLSX.utils.json_to_sheet(ejecutadoData);
    const estadosWS = XLSX.utils.json_to_sheet(estadosData);

    this.adjustColumnWidth(ejecutadoWS, ejecutadoData);
    this.adjustColumnWidth(estadosWS, estadosData);

    XLSX.utils.book_append_sheet(wb, ejecutadoWS, 'EJECUTADO_LANZADOR');
    XLSX.utils.book_append_sheet(wb, estadosWS, 'ESTADOS_LANZADOR');

    XLSX.writeFile(
      wb,
      `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  }

  // ======================================================
  // =================== HOJA EJECUTADO ===================
  // ======================================================
  private prepareEjecutadoData(registros: AuxiliaresLanzador[]): any[] {
    const data: any[] = [];

    registros.forEach(padre => {
      data.push({
        'ID': padre.id,
        'Fecha': padre.fecha,
        'Turno': padre.turno,
        'Equipo': padre.equipo,
        'Código': padre.codigo,
        'Empresa': padre.empresa,
        'Operador': padre.operador,
        'Jefe Guardia': padre.jefe_guardia,

        'Horómetro Diesel Inicial': padre.horometro_diesel_inicia,
        'Horómetro Diesel Final': padre.horometro_diesel_final,
        'Diferencia Horómetro':
          padre.horometro_diesel_final && padre.horometro_diesel_inicia
            ? padre.horometro_diesel_final - padre.horometro_diesel_inicia
            : '',

        'Estado': padre.estado,
        'Enviado': padre.envio === 1 ? 'Sí' : 'No',
        'Fecha_Mina': this.calcularFechaMina(padre.fecha, padre.turno)
      });
    });

    return data;
  }

  // ======================================================
  // ==================== HOJA ESTADOS ====================
  // ======================================================
  private prepareEstadosData(registros: AuxiliaresLanzador[]): any[] {
    const data: any[] = [];

    registros.forEach(padre => {
      const fechaMina = this.calcularFechaMina(padre.fecha, padre.turno);

      if (padre.detalles && padre.detalles.length > 0) {
        padre.detalles.forEach((det: AuxiliaresInterLanzador) => {
          data.push({
            'ID Padre': padre.id,
            'IT': det.it,

            // ================= OPERADOR =================
            'Op. Hora Inicio': det.operador_hora_inicial,
            'Op. Hora Final': det.operador_hora_final,
            'Op. Código': det.operador_codigo,
            'Op. Estado': det.operador_estado,
            'Op. Nivel': det.operador_nivel,
            'Op. Labor': det.operador_labor,
            'Op. Ubicación': det.operador_ubicacion,
            'Op. Observación': det.operador_observacion,
            'Op. m3 Lanzados': det.operador_m3_lanzados,
            'Op. Labor Origen': det.operador_labor_origen,
            'Op. Labor Destino': det.operador_labor_destino,

            // ================= GUARDIA ==================
            'Gd. Hora Inicio': det.guardia_hora_inicial,
            'Gd. Hora Final': det.guardia_hora_final,
            'Gd. Código': det.guardia_codigo,
            'Gd. Estado': det.guardia_estado,
            'Gd. Nivel': det.guardia_nivel,
            'Gd. Labor': det.guardia_labor,
            'Gd. Ubicación': det.guardia_ubicacion,
            'Gd. Observación': det.guardia_observacion,
            'Gd. m3 Lanzados': det.guardia_m3_lanzados,
            'Gd. Labor Origen': det.guardia_labor_origen,
            'Gd. Labor Destino': det.guardia_labor_destino,

            'Fecha_Mina': fechaMina
          });
        });
      } else {
        data.push({
          'ID Padre': padre.id,
          'Mensaje': 'No hay estados registrados',
          'Fecha_Mina': fechaMina
        });
      }
    });

    return data;
  }

  // ======================================================
  // =================== UTILIDADES =======================
  // ======================================================
  private calcularFechaMina(fechaOriginal: string, turno?: string): string {
    if (!fechaOriginal) return '';

    if (turno?.toLowerCase() === 'noche') {
      const fecha = new Date(fechaOriginal);
      fecha.setDate(fecha.getDate() + 1);
      return fecha.toISOString().split('T')[0];
    }

    return fechaOriginal.split('T')[0];
  }

  private adjustColumnWidth(worksheet: XLSX.WorkSheet, data: any[]) {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    worksheet['!cols'] = headers.map(header => {
      let maxWidth = header.length * 1.2;

      data.forEach(row => {
        const value = row[header];
        if (value) {
          maxWidth = Math.max(maxWidth, value.toString().length * 1.1);
        }
      });

      return { wch: Math.min(Math.max(maxWidth, 10), 45) };
    });
  }
}
