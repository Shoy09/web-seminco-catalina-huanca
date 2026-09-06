import { Injectable } from '@angular/core';
import { OperacionBaseJumbo } from 'app/models/OperacionBase.models';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelHorizontalExportService {
  
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
    XLSX.writeFile(wb, `${fileName}_Horizontal_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  private prepareExcelData(operaciones: OperacionBaseJumbo[]): any[] {
    const data: any[] = [];

    operaciones.forEach(op => {
      // Procesar cada registro de la operación
      if (op.registros && op.registros.length > 0) {
        op.registros.forEach((registro) => {
          // Calcular horas
          const horas = this.calcularHoras(registro.hora_inicio, registro.hora_final ?? '');
          
          // Obtener horómetros del registro o de la operación principal
          const horometros = this.getHorometros(op, registro);
          
          // Obtener datos de perforación
          const perforacionData = this.getPerforacionData(registro);

          const row = {
            'EQUIPO': op.n_equipo || '',
            'N° ITEM': registro.numero || '', // ✅ Usamos el número del registro
            'FECHA': this.formatearFecha(op.fecha),
            'TURNO': op.turno || '',
            'GUARDIA': this.obtenerGuardia(op),
            'OPERADOR': op.operador || '',
            'JEFE DE GUARDIA': op.jefe_guardia || '',
            'SEMANA': this.calcularSemana(op.fecha),
            'CÓDIGO DE ACTIVIDAD': registro.codigo || '',
            'HORA INICIAL': registro.hora_inicio || '',
            'HORA FINAL': registro.hora_final || '',
            'HORAS': horas,
            'HORO ELEC INICIAL': horometros.electrico?.inicio ?? '',
            'HORO ELEC FINAL': horometros.electrico?.final ?? '',
            'HORAS ELÉCTRICO': horometros.electrico?.diferencia ?? '',
            'HORO PERC INICIAL': horometros.percusion?.inicio ?? '',
            'HORO PERC FINAL': horometros.percusion?.final ?? '',
            'HORAS PERCUSIÓN': horometros.percusion?.diferencia ?? '',
            'HOROMETRO M INICIAL': horometros.motor?.inicio ?? '',
            'HOROMETRO M FINAL': horometros.motor?.final ?? '',
            'HORAS MOTOR': horometros.motor?.diferencia ?? '',
            'LABOR': perforacionData.labor || '',
            'Nº DE TALADRO': perforacionData.tal_prod || '',
            'Nº TAL. RIMADO': perforacionData.tal_rimados || '',
            'LONGITUD (PIES)': perforacionData.longitud || '',
            'BRAZO (IZQ/DCH)': perforacionData.brazo || '',
            'MATERIAL (M/D)': perforacionData.material || '',
            'TIPO LABOR': perforacionData.tipo_perforacion || '',
            'SUB TIPO LABOR': perforacionData.tipo_perforacion || '',
            'OBSERVACIÓN': perforacionData.observaciones || ''
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
    
    // Procesar horómetros
    return this.procesarHorometros(horometrosData);
  }

  private procesarHorometros(horometros: any): any {
    // Valores por defecto
    const defaultHorometro = { inicio: 0, final: 0, diferencia: 0 };
    
    const result = {
      electrico: { ...defaultHorometro },
      percusion: { ...defaultHorometro },
      motor: { ...defaultHorometro }
    };

    if (!horometros) {
      return result;
    }

    // Si es un objeto con propiedades (diesel, electrico, percusion)
    if (typeof horometros === 'object' && !Array.isArray(horometros)) {
      // Procesar eléctrico
      if (horometros.electrico) {
        const h = horometros.electrico;
        result.electrico = {
          inicio: h.inicio ?? 0,
          final: h.final ?? 0,
          diferencia: (h.final ?? 0) - (h.inicio ?? 0)
        };
      }

      // Procesar percusión
      if (horometros.percusion) {
        const h = horometros.percusion;
        result.percusion = {
          inicio: h.inicio ?? 0,
          final: h.final ?? 0,
          diferencia: (h.final ?? 0) - (h.inicio ?? 0)
        };
      }

      // Procesar diesel (se mapea a motor para el Excel)
      if (horometros.diesel) {
        const h = horometros.diesel;
        result.motor = {
          inicio: h.inicio ?? 0,
          final: h.final ?? 0,
          diferencia: (h.final ?? 0) - (h.inicio ?? 0)
        };
      }

      // Si hay un campo "motor" directamente
      if (horometros.motor) {
        const h = horometros.motor;
        result.motor = {
          inicio: h.inicio ?? 0,
          final: h.final ?? 0,
          diferencia: (h.final ?? 0) - (h.inicio ?? 0)
        };
      }
    }

    // Si es un array (formato anterior)
    if (Array.isArray(horometros)) {
      horometros.forEach(h => {
        const nombre = h.nombre?.toLowerCase() || '';
        const inicio = h.inicio || h.inicial || 0;
        const final = h.final || 0;
        const diferencia = final - inicio;

        if (nombre.includes('electrico') || nombre.includes('eléctrico')) {
          result.electrico = { inicio, final, diferencia };
        } else if (nombre.includes('percusion')) {
          result.percusion = { inicio, final, diferencia };
        } else if (nombre.includes('motor') || nombre.includes('diesel')) {
          result.motor = { inicio, final, diferencia };
        }
      });
    }

    return result;
  }

  private getPerforacionData(registro: any): any {
    const operacion = registro.operacion || {};
    
    return {
      labor: operacion.labor || '',
      tal_prod: operacion.tal_prod || '',
      tal_rimados: operacion.tal_rimados || '',
      longitud: operacion.longitud || operacion.long_barras || '',
      brazo: operacion.brazo || '',
      material: operacion.material || '',
      tipo_labor: operacion.tipo_labor || '',
      sub_tipo_labor: operacion.sub_tipo_labor || '',
      tipo_perforacion: operacion.tipo_perforacion || '',
      observaciones: operacion.observaciones || ''
    };
  }

  private calcularHoras(horaInicio: string, horaFinal: string): number {
    if (!horaInicio || !horaFinal) return 0;
    
    try {
      const [h1, m1] = horaInicio.split(':').map(Number);
      const [h2, m2] = horaFinal.split(':').map(Number);
      
      let minutos = (h2 * 60 + m2) - (h1 * 60 + m1);
      if (minutos < 0) minutos += 1440; // Si pasa de medianoche
      
      return Math.round((minutos / 60) * 10) / 10; // Redondear a 1 decimal
    } catch {
      return 0;
    }
  }

  private formatearFecha(fecha: string): string {
    if (!fecha) return '';
    
    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return fecha;
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch {
      return fecha;
    }
  }

  private calcularSemana(fecha: string): string {
    if (!fecha) return '';
    
    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return '';
      
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const diff = (date.getTime() - startOfYear.getTime()) / 86400000;
      const weekNumber = Math.ceil((diff + startOfYear.getDay() + 1) / 7);
      
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
}