import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root',
})
export class ExcelImportService {
  constructor() {}

  async leerExcel(file: File): Promise<any[]> {
    const data = await file.arrayBuffer();

    const workbook = XLSX.read(data);

    const sheetName = workbook.SheetNames[0];

    const worksheet = workbook.Sheets[sheetName];

    const rows: any[] = XLSX.utils.sheet_to_json(worksheet, {
      defval: '',
    });

    return this.mapearData(rows);
  }

  private mapearData(rows: any[]): any[] {
    const grupos = new Map<number, any>();

    rows.forEach((row, index) => {
      const itemPrincipal = Number(row['N° ITEM principal']);

      if (!grupos.has(itemPrincipal)) {
        grupos.set(itemPrincipal, {
          fecha: this.formatearFecha(row.fecha),

          turno: String(row.turno || '').trim(),

          seccion: String(row.seccion || '').trim(),

          operador: String(row.operador || '').trim(),

          jefe_guardia: String(row['jefe guardia'] || '').trim(),

          equipo: String(row.equipo || '').trim(),

          n_equipo: String(row.n_equipo || '').trim(),

          capacidad: String(row.capacidad || '').trim(),

          tipo_equipo: this.mapearTipoEquipo(row.tipo_equipo),

          registros: [],

          // DEFAULTS
          horometros: {
            horometro: {
              inicio: 0,
              final: 0,
              op: true,
              inop: false,
            },
          },

          condiciones_equipo: {
            op: false,
            noOp: false,
            lugar: '',
            descripcion: '',
            aceiteMotor: false,
            aceiteHidraulico: false,
            aceiteTransmision: false,
            combustible: '',
            horaLlenado: '',
          },

          programa_trabajo: {
            n_cucharas_programado: 0,
            n_cucharas_realizado: 0,
          },

          check_list: [],

          control_llantas: {
            numero1: false,
            numero2: false,
            numero3: false,
            numero4: false,
          },

          estado: 'cerrado',

          envio: 0,

          revisado: 0,

          aprobacion: 0,

          observaciones_jefe: null,

          observaciones_jefe2: null,

          observaciones_jefe3: null,
        });
      }

      const grupo = grupos.get(itemPrincipal);

      grupo.registros.push({
        id: Date.now() + index,

        numero: Number(row.numero || 0),

        estado: String(row.estado || '').trim(),

        codigo: String(row.codigo || '').trim(),

        hora_inicio: this.formatearHora(row.hora_inicio),

        hora_final: this.formatearHora(row.hora_final),

        operacion: {
          nivel_inicio: String(row.nivel_inicio || '').trim(),

          tipo_labor_inicio: String(row.tipo_labor_inicio || '').trim(),

          labor_inicio: String(row.labor_inicio || '').trim(),

          ala_inicio: String(row.ala_inicio || '').trim(),

          ubicacion_destino: String(row.ubicacion_destino || '').trim(),

          n_cucharas: Number(row.n_cucharas || 0),

          mineral: Number(row.MINERAL || 0),

          desmonte: Number(row.DESMONTE || 0),

          relleno: Number(row.RELLENO || 0),

          numero_volquete: String(row['Nº DE VOLQUETE'] || '').trim(),

          relave: Number(row.RELAVE || 0),

          observaciones: String(row.observaciones || '').trim(),
        },
      });
    });

    return Array.from(grupos.values());
  }

  private mapearTipoEquipo(tipo: string): any {
    const tipoTexto = String(tipo || '').toLowerCase();

    return {
      Diesel: tipoTexto.includes('diesel'),
      Electrico: tipoTexto.includes('electrico'),
      Battery: tipoTexto.includes('battery'),
    };
  }

  private formatearFecha(fecha: any): string {
    if (!fecha) return '';

    if (typeof fecha === 'string') {
      return fecha;
    }

    try {
      const date = XLSX.SSF.parse_date_code(fecha);

      const yyyy = date.y;

      const mm = String(date.m).padStart(2, '0');

      const dd = String(date.d).padStart(2, '0');

      return `${yyyy}-${mm}-${dd}`;
    } catch {
      return String(fecha);
    }
  }

  private formatearHora(hora: any): string {
    if (!hora) return '';

    return String(hora).trim().padStart(5, '0');
  }
}
