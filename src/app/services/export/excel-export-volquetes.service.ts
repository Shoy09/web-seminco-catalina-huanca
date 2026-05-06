import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Volquetes, InterVolquetes } from '../../models/volquetes.model';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportVolquetesService {

  exportToExcel(data: Volquetes[], fileName: string) {

    // (opcional) filtrar solo cerrados / activos
    const registros = data.filter(d => d.estado?.toLowerCase() === 'cerrado');

    const ejecutadoData = this.prepareEjecutadoData(registros);
    const estadosData = this.prepareEstadosData(registros);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    const ejecutadoWS = XLSX.utils.json_to_sheet(ejecutadoData);
    const estadosWS = XLSX.utils.json_to_sheet(estadosData);

    this.adjustColumnWidth(ejecutadoWS, ejecutadoData);
    this.adjustColumnWidth(estadosWS, estadosData);

    XLSX.utils.book_append_sheet(wb, ejecutadoWS, 'EJECUTADO_VOLQUETES');
    XLSX.utils.book_append_sheet(wb, estadosWS, 'DETALLE_VOLQUETES');

    XLSX.writeFile(
      wb,
      `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  }

  // ======================================================
  // =================== HOJA EJECUTADO ===================
  // ======================================================
  private prepareEjecutadoData(registros: Volquetes[]): any[] {
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

        'Horómetro Inicial': padre.horometro_inicia,
        'Horómetro Final': padre.horometro_final,
        'Diferencia Horómetro':
          padre.horometro_final && padre.horometro_inicia
            ? padre.horometro_final - padre.horometro_inicia
            : '',

        'Km Inicial': padre.kilometraje_inicia,
        'Km Final': padre.kilometraje_final,
        'Diferencia Km':
          padre.kilometraje_final && padre.kilometraje_inicia
            ? padre.kilometraje_final - padre.kilometraje_inicia
            : '',

        'Estado': padre.estado,
        'Enviado': padre.envio === 1 ? 'Sí' : 'No',
        'Fecha_Mina': this.calcularFechaMina(padre.fecha, padre.turno)
      });
    });

    return data;
  }

  // ======================================================
  // =================== HOJA DETALLES ====================
  // ======================================================
  private prepareEstadosData(registros: Volquetes[]): any[] {
    const data: any[] = [];

    registros.forEach(padre => {
      const fechaMina = this.calcularFechaMina(padre.fecha, padre.turno);

      if (padre.detalles && padre.detalles.length > 0) {
        padre.detalles.forEach((det: InterVolquetes) => {
          data.push({
            'ID Padre': padre.id,
            'IT': det.it,

            // ================= OPERADOR =================
            'Hora Inicio': det.operador_hora_inicial,
            'Hora Final': det.operador_hora_final,
            'Código Operador': det.operador_codigo,
            'Estado Operador': det.operador_estado,

            'Horómetro Inicio': det.horometro_inicia,
            'Horómetro Final': det.horometro_final,
            'Diferencia Horómetro':
              det.horometro_final && det.horometro_inicia
                ? det.horometro_final - det.horometro_inicia
                : '',

            'Nivel': det.operador_nivel,
            'Zona': det.operador_zona,
            'Labor': det.operador_labor,
            'Hora Llegada': det.operador_hora_llegada,

            'Hora Carguío Inicio': det.operador_hora_carguio_inicio,
            'Hora Carguío Final': det.operador_hora_carguio_final,
            'Destino': det.operador_destino,
            'Hora Descarga': det.operador_hora_descarga,

            'Fecha_Mina': fechaMina
          });
        });
      } else {
        data.push({
          'ID Padre': padre.id,
          'Mensaje': 'No hay registros de detalle',
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
        if (value !== null && value !== undefined) {
          maxWidth = Math.max(
            maxWidth,
            value.toString().length * 1.1
          );
        }
      });

      return { wch: Math.min(Math.max(maxWidth, 10), 45) };
    });
  }
}
