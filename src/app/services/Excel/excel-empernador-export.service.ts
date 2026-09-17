import { Injectable } from '@angular/core';
import { OperacionBaseJumbo } from 'app/models/OperacionBase.models';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelEmpernadorExportService {

  exportOperacionesToExcel(operacionesOriginal: OperacionBaseJumbo[], fileName: string) {
    const operacionesCerradas = operacionesOriginal.filter(op =>
      op.estado?.toLowerCase() === 'cerrado'
    );

    const excelData = this.prepareExcelData(operacionesCerradas);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    this.adjustColumnWidth(ws, excelData);

    XLSX.utils.book_append_sheet(wb, ws, 'OPERACIONES');

    XLSX.writeFile(wb, `${fileName}_Empernador_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  private prepareExcelData(operaciones: OperacionBaseJumbo[]): any[] {
    const data: any[] = [];

    operaciones.forEach(op => {
      // 🆕 Bandera: horómetros solo en la primera fila de la operación
      let horometrosYaColocados = false;

      if (op.registros && op.registros.length > 0) {
        op.registros.forEach((registro: any) => {
          const mostrarHorometros = !horometrosYaColocados;

          const row = this.buildRow(op, registro, mostrarHorometros);
          data.push(row);

          if (mostrarHorometros) {
            horometrosYaColocados = true;
          }
        });
      }
    });

    return data;
  }

  /**
   * Construye una fila del Excel para Empernador
   */
  private buildRow(
    op: OperacionBaseJumbo,
    registro: any,
    mostrarHorometros: boolean
  ): any {
    const operacionData = registro.operacion || {};
    const horometros = this.getHorometros(op, registro);

    // Calcular horas del registro
    const horas = this.calcularHoras(
      registro.hora_inicio || '',
      registro.hora_final || ''
    );

    // Calcular diferencias de horómetros
    const hei = horometros.electrico?.inicio ?? '';
    const hef = horometros.electrico?.final ?? '';
    const dhe = (typeof hei === 'number' && typeof hef === 'number')
      ? Math.round((hef - hei) * 100) / 100
      : '';

    const hpi = horometros.percusion?.inicio ?? '';
    const hpf = horometros.percusion?.final ?? '';
    const dhp = (typeof hpi === 'number' && typeof hpf === 'number')
      ? Math.round((hpf - hpi) * 100) / 100
      : '';

    const hmi = horometros.motor?.inicio ?? '';
    const hmf = horometros.motor?.final ?? '';
    const dhm = (typeof hmi === 'number' && typeof hmf === 'number')
      ? Math.round((hmf - hmi) * 100) / 100
      : '';

       // 🆕 Horómetro de empernador
  const hoi = horometros.empernador?.inicio ?? '';
  const hof = horometros.empernador?.final ?? '';
  const dho = (typeof hoi === 'number' && typeof hof === 'number')
    ? Math.round((hof - hoi) * 100) / 100
    : '';

    // 🔥 Procesar mallas
    const mallas = this.procesarMallas(operacionData.malla || []);

    // 🔥 Procesar pernos
    const pernos = this.procesarPernos(operacionData.perno || []);

    // 🔥 Procesar perforación
    const perforacion = this.procesarPerforacion(operacionData.perforacion || []);

    return {
      'EQUIPO': op.n_equipo || '',
      'N° ITEM': registro.numero || '',
      'FECHA': this.formatearFecha(op.fecha),
      'TURNO': this.formatearTurno(op.turno),
      'GUARDIA': this.obtenerGuardia(op),
      'OPERADOR': this.formatearOperador(op.operador),
      'JEFE DE SECCION': op.jefe_guardia || '',
      'SEMANA': this.calcularSemana(op.fecha),
      'CÓDIGO DE ACTIVIDAD': registro.codigo || '',
      'HORA INICIAL': registro.hora_inicio || '',
      'HORA FINAL': registro.hora_final || '',
    //   'HORAS': this.formatearNumero(horas),

      // Horómetros eléctrico
      'Horo. Elec. Inicial': mostrarHorometros ? this.formatearNumero(hei) : '',
      'Horo. Elec. Final': mostrarHorometros ? this.formatearNumero(hef) : '',
      //'Horas Horo. Elec.': mostrarHorometros ? this.formatearNumero(dhe) : '',

      // Horómetros percusión
      'Horo. Perc. Inicial': mostrarHorometros ? this.formatearNumero(hpi) : '',
      'Horo. Perc. Final': mostrarHorometros ? this.formatearNumero(hpf) : '',
      //'Horas Horo. Perc.': mostrarHorometros ? this.formatearNumero(dhp) : '',

      // Horómetros motor
      'Horo. Motor Inicial': mostrarHorometros ? this.formatearNumero(hmi) : '',
      'Horo. Motor Final': mostrarHorometros ? this.formatearNumero(hmf) : '',
      //'Horas Horo. Motor': mostrarHorometros ? this.formatearNumero(dhm) : '',

      // 🆕 Horómetros empernador (al costado derecho del motor)
    'Horo. Emper. Inicial': mostrarHorometros ? this.formatearNumero(hoi) : '',
    'Horo. Emper. Final': mostrarHorometros ? this.formatearNumero(hof) : '',

      // Datos de labor
      'LABOR': operacionData.labor || '',

      // 🔥 Pernos por tipo
      'SPLIT 3 PIES': pernos.split3Pies,
      'SPLIT 7 PIES': pernos.split7Pies,
      'SWELLEX 7 PIES': pernos.swellex7Pies,
      'PERNO HELICOIDAL 7 PIES': pernos.helicoidal7Pies,

      // 🔥 Mallas por tipo
      'MALLA 3 X 4 (Calibre 10)': mallas.malla3x4C10,
      'MALLA 4 X 4 (Calibre 8)': mallas.malla4x4C8,
      'MALLA \nM2\nEslabonada': mallas.mallaM2Eslabonada,

      // 🔥 Datos de perforación
      'N°TALD.PERF.': perforacion.nTaladros,
      'LONG. PERF.': perforacion.longitudPerforacion,
      'TIPO DE LABOR': perforacion.tipoPerforacion,

      // Campos adicionales (del formato solicitado)
      // 'Cant. TAL': perforacion.nTaladros,
      // 'LONG.PERFOR Pies': perforacion.longitudPerforacion,

      // Horómetros repetidos al final (formato solicitado)
      'HEI': mostrarHorometros ? this.formatearNumero(hei) : '',
      'HEF': mostrarHorometros ? this.formatearNumero(hef) : '',
      //'DHE': mostrarHorometros ? this.formatearNumero(dhe) : '',
      'HPI': mostrarHorometros ? this.formatearNumero(hpi) : '',
      'HPF': mostrarHorometros ? this.formatearNumero(hpf) : '',
      //'DHP': mostrarHorometros ? this.formatearNumero(dhp) : '',
      'HMI': mostrarHorometros ? this.formatearNumero(hmi) : '',
      'HMF': mostrarHorometros ? this.formatearNumero(hmf) : '',
      //'DHM': mostrarHorometros ? this.formatearNumero(dhm) : '',

      // 🆕 Horómetros empernador al final (al costado derecho del HMF)
    'HOI': mostrarHorometros ? this.formatearNumero(hoi) : '',
    'HOF': mostrarHorometros ? this.formatearNumero(hof) : '',

      'Observacion': operacionData.observaciones || ''
    };
  }

  /**
   * Procesa el array de mallas y devuelve la cantidad por tipo
   */
  private procesarMallas(mallas: any[]): any {
    const result = {
      malla3x4C10: '',
      malla4x4C8: '',
      mallaM2Eslabonada: ''
    };

    if (!mallas || !Array.isArray(mallas)) return result;

    mallas.forEach((malla: any) => {
      const tipo = (malla.tipo_malla || '').toLowerCase();
      const cantidad = malla.mt52_malla || '';

      // Malla m2 C-10 → MALLA 3 X 4 (Calibre 10)
      if (tipo.includes('c-10') || tipo.includes('c10')) {
        result.malla3x4C10 = cantidad;
      }
      // Malla m2 C-8 → MALLA 4 X 4 (Calibre 8)
      else if (tipo.includes('c-8') || tipo.includes('c8')) {
        result.malla4x4C8 = cantidad;
      }
      // Malla m2 Eslabonada → MALLA M2 Eslabonada
      else if (tipo.includes('eslabonada')) {
        result.mallaM2Eslabonada = cantidad;
      }
    });

    return result;
  }

  /**
   * Procesa el array de pernos y devuelve la cantidad por tipo
   */
  private procesarPernos(pernos: any[]): any {
    const result = {
      split3Pies: '',
      split7Pies: '',
      swellex7Pies: '',
      helicoidal7Pies: ''
    };

    if (!pernos || !Array.isArray(pernos)) return result;

    pernos.forEach((perno: any) => {
      const tipo = (perno.tipo_pernos || '').toLowerCase();
      const log = (perno.log_pernos || '').toString();
      const cantidad = perno.n_pernos_instalados ?? '';

      // Split Set
      if (tipo.includes('split')) {
        if (log.includes('3')) {
          result.split3Pies = cantidad;
        } else if (log.includes('7')) {
          result.split7Pies = cantidad;
        }
      }
      // Swellex
      else if (tipo.includes('swellex')) {
        if (log.includes('7')) {
          result.swellex7Pies = cantidad;
        }
      }
      // Perno Helicoidal
      else if (tipo.includes('helicoidal')) {
        if (log.includes('7')) {
          result.helicoidal7Pies = cantidad;
        }
      }
    });

    return result;
  }

  /**
   * Procesa el array de perforación
   */
  private procesarPerforacion(perforacion: any[]): any {
    const result = {
      nTaladros: '',
      longitudPerforacion: '',
      tipoPerforacion: ''
    };

    if (!perforacion || !Array.isArray(perforacion) || perforacion.length === 0) {
      return result;
    }

    // Tomar el primer elemento (o sumar si hay varios)
    const perf = perforacion[0];
    result.nTaladros = perf.n_taladros ?? '';
    result.longitudPerforacion = perf.longitud_perforacion ?? '';
    result.tipoPerforacion = perf.tipo_perforacion ?? '';

    return result;
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
    motor: { ...defaultHorometro },
    empernador: { ...defaultHorometro }  // 🆕 Agregado
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
    // 🆕 Horómetro de empernador
    if (horometros.empernador) {
      result.empernador = {
        inicio: horometros.empernador.inicio ?? '',
        final: horometros.empernador.final ?? ''
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
      } else if (nombre.includes('empernador')) {  // 🆕
        result.empernador = { inicio, final };
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

      return Math.round((minutos / 60) * 100) / 100;
    } catch {
      return 0;
    }
  }

  /**
   * Formatea números con coma decimal (formato solicitado)
   */
  private formatearNumero(valor: any): string {
    if (valor === '' || valor === null || valor === undefined) return '';
    if (typeof valor === 'string') return valor;

    const num = Number(valor);
    if (isNaN(num)) return '';

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