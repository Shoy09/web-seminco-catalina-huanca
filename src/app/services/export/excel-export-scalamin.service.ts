import { Injectable } from '@angular/core';
import { OperacionBaseJumbo } from 'app/models/OperacionBase.models';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelScalaminExportService {

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

    // Ajustar anchos
    this.adjustColumnWidth(ws, excelData);

    XLSX.utils.book_append_sheet(wb, ws, 'OPERACIONES');

    // Exportar
    XLSX.writeFile(wb, `${fileName}_Scalamin_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  private prepareExcelData(operaciones: OperacionBaseJumbo[]): any[] {
    const data: any[] = [];

    operaciones.forEach(op => {
      // 🆕 Bandera: horómetros solo en la primera fila de la operación
      let horometrosYaColocados = false;

      if (op.registros && op.registros.length > 0) {
        op.registros.forEach((registro: any) => {
          // Calcular horas del registro
          const horas = this.calcularHoras(
            registro.hora_inicio || '',
            registro.hora_final || ''
          );

          // Obtener horómetros
          const horometros = this.getHorometros(op, registro);

          // Obtener datos de labor
          const laborData = this.getLaborData(registro);

          // 🔥 Si el registro tiene barras, generamos una fila por barra
          //    distribuyendo el tiempo equitativamente
          const barras = registro.operacion?.barras || [];

          if (barras.length > 0) {
            // Calcular intervalos de tiempo por barra
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
                horas / barras.length, // horas proporcionales
                horometros,
                laborData,
                mostrarHorometros
              );
              data.push(row);

              if (mostrarHorometros) horometrosYaColocados = true;
            });
          } else {
            // Sin barras: una sola fila
            const mostrarHorometros = !horometrosYaColocados;
            const row = this.buildRow(
              op,
              registro,
              null,
              registro.hora_inicio || '',
              registro.hora_final || '',
              horas,
              horometros,
              laborData,
              mostrarHorometros
            );
            data.push(row);

            if (mostrarHorometros) horometrosYaColocados = true;
          }
        });
      }
    });

    return data;
  }

  /**
   * Construye una fila del Excel para Scalamin
   */
  private buildRow(
    op: OperacionBaseJumbo,
    registro: any,
    barra: any | null,
    horaInicio: string,
    horaFinal: string,
    horas: number,
    horometros: any,
    laborData: any,
    mostrarHorometros: boolean
  ): any {
    // Cálculos de horómetros
    const hpi = horometros.percusion?.inicio ?? '';
    const hpf = horometros.percusion?.final ?? '';
    const dhpi = (typeof hpi === 'number' && typeof hpf === 'number')
      ? Math.round((hpf - hpi) * 100) / 100
      : '';

    const hmi = horometros.motor?.inicio ?? '';
    const hmf = horometros.motor?.final ?? '';
    const dhm = (typeof hmi === 'number' && typeof hmf === 'number')
      ? Math.round((hmf - hmi) * 100) / 100
      : '';

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
      'HORAS': this.formatearNumero(horas),

      // Horómetros percusión
      'HORO PERC INICIAL': mostrarHorometros ? this.formatearNumero(hpi) : '',
      'HORO PERC FINAL': mostrarHorometros ? this.formatearNumero(hpf) : '',
      'HORAS PERC': mostrarHorometros ? this.formatearNumero(dhpi) : '',

      // Horómetros motor (diesel)
      'HORO MOTOR INICIAL': mostrarHorometros ? this.formatearNumero(hmi) : '',
      'HORO MOTOR FINAL': mostrarHorometros ? this.formatearNumero(hmf) : '',
      'HORAS MOTOR': mostrarHorometros ? this.formatearNumero(dhm) : '',

      // Datos de labor
      'LABOR': laborData.labor || '',
      'TIPO DE LABOR': laborData.tipo_labor || '',
      'MATERIAL (M/D)': laborData.material || '',
      'OBSERVACIÓN': laborData.observaciones || '',

      // 🔥 Columnas repetidas al final (según formato solicitado)
      'HPI': mostrarHorometros ? this.formatearNumero(hpi) : '',
      'HPF': mostrarHorometros ? this.formatearNumero(hpf) : '',
      'DHP': mostrarHorometros ? this.formatearNumero(dhpi) : '',
      'HMI': mostrarHorometros ? this.formatearNumero(hmi) : '',
      'HMF': mostrarHorometros ? this.formatearNumero(hmf) : ''
    };
  }

  /**
   * Divide el rango [horaInicio, horaFinal] en `cantidad` intervalos iguales
   */
  private calcularIntervalosPorBarra(
    horaInicio: string,
    horaFinal: string,
    cantidad: number
  ): { horaInicio: string; horaFinal: string }[] {
    const intervalos: { horaInicio: string; horaFinal: string }[] = [];

    if (!horaInicio || !horaFinal || cantidad <= 0) {
      for (let i = 0; i < Math.max(cantidad, 1); i++) {
        intervalos.push({ horaInicio, horaFinal });
      }
      return intervalos;
    }

    const minutosInicio = this.horaAMinutos(horaInicio);
    let minutosFinal = this.horaAMinutos(horaFinal);

    if (minutosFinal < minutosInicio) minutosFinal += 24 * 60;

    const duracionTotal = minutosFinal - minutosInicio;

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

  private horaAMinutos(hora: string): number {
    if (!hora) return 0;
    const [h, m] = hora.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  private minutosAHora(minutos: number): string {
    let mins = Math.round(minutos) % (24 * 60);
    if (mins < 0) mins += 24 * 60;

    const h = Math.floor(mins / 60);
    const m = mins % 60;

    return `${this.pad2(h)}:${this.pad2(m)}`;
  }

  private pad2(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
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

  private getLaborData(registro: any): any {
    const operacion = registro.operacion || {};

    return {
      labor: operacion.labor || '',
      tipo_labor: operacion.tipo_labor_texto || operacion.tipo_labor || '',
      material: operacion.material || '',
      observaciones: operacion.observaciones || ''
    };
  }

  /**
   * Calcula las horas entre dos horas (formato "HH:MM")
   */
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
   * Formatea números con coma decimal (formato solicitado: 1803,63)
   */
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

  private obtenerGuardia(op: OperacionBaseJumbo): string {
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