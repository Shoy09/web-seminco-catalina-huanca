import {
  Component, Inject, OnInit, OnDestroy, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OperacionBaseSostenimiento } from '../../../../../models/OperacionBase.models';

export interface PresentacionGefeGuardiaEmpernadorData {
  operaciones: OperacionBaseSostenimiento[];
  turnoAplicado?: string;
  fechaInicio?: string;
  fechaFin?: string;
  equipos?: any[];
}

interface KpiResumen {
  totalOperaciones: number;
  totalEquipos: number;
  totalPernos: number;
  totalMetros: number;
  totalTaladros: number;
  totalMalla: number;
  promedioPernosDia: number;
  promedioMetrosDia: number;
  disponibilidad: number;
  utilizacion: number;
}

interface BarraData {
  label: string;
  valor: number;
  porcentaje: number;
  extra?: string;
}

// CAMBIO: los campos numéricos ahora aceptan null (cuando no existe ese elemento en la fila)
interface ResumenLabor {
  equipo: string;
  labor: string;
  tipoPerno: string;
  logPerno: number | null;
  nPernos: number | null;
  sistematico: string;
  tipoMalla: string;
  mt52Malla: number | null;
  nTaladros: number | null;
  longPerforacion: number | null;
  tipoPerforacion: string;
  metros: number | null;
}

@Component({
  selector: 'app-presentacion-gefe-guardia-empernador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './presentacion-gefe-guardia-empernador.component.html',
  styleUrl: './presentacion-gefe-guardia-empernador.component.css',
})
export class PresentacionGefeGuardiaEmpernadorComponent implements OnInit, OnDestroy {

  @ViewChild('dialogContainer', { static: true })
  dialogContainer!: ElementRef<HTMLElement>;

  isFullscreen = false;
  private fullscreenChangeHandler = () => this.onFullscreenChange();

  // DATA
  operacionesOriginal: OperacionBaseSostenimiento[] = [];
  operacionesFiltradas: OperacionBaseSostenimiento[] = [];
  equiposProceso: any[] = [];

  equiposDisponibles: string[] = [];
  nEquipoSeleccionado = '';

  // KPIs
  kpis: KpiResumen = this.kpisVacios();

  // Tabla resumen
  resumenLabores: ResumenLabor[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PresentacionGefeGuardiaEmpernadorData,
    private dialogRef: MatDialogRef<PresentacionGefeGuardiaEmpernadorComponent>,
  ) {}

  ngOnInit(): void {
    this.operacionesOriginal = this.data?.operaciones ?? [];
    this.operacionesFiltradas = [...this.operacionesOriginal];
    this.equiposProceso = this.data?.equipos ?? [];

    this.equiposDisponibles = this.obtenerEquiposUnicos();
    this.recalcularTodo();

    document.addEventListener('fullscreenchange', this.fullscreenChangeHandler);
    document.addEventListener('webkitfullscreenchange', this.fullscreenChangeHandler);
    document.addEventListener('mozfullscreenchange', this.fullscreenChangeHandler);
    document.addEventListener('MSFullscreenChange', this.fullscreenChangeHandler);
  }

  ngOnDestroy(): void {
    document.removeEventListener('fullscreenchange', this.fullscreenChangeHandler);
    document.removeEventListener('webkitfullscreenchange', this.fullscreenChangeHandler);
    document.removeEventListener('mozfullscreenchange', this.fullscreenChangeHandler);
    document.removeEventListener('MSFullscreenChange', this.fullscreenChangeHandler);

    if (document.fullscreenElement === this.dialogContainer?.nativeElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }

  // ==========================================
  // FULLSCREEN
  // ==========================================
  async toggleFullscreen(): Promise<void> {
    try {
      if (!this.isFullscreen) {
        await this.entrarFullscreen();
      } else {
        await this.salirFullscreen();
      }
    } catch (err) {
      console.warn('No se pudo cambiar a pantalla completa:', err);
    }
  }

  private async entrarFullscreen(): Promise<void> {
    const el: any = this.dialogContainer?.nativeElement;
    if (!el) return;

    const request =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen;

    if (!request) return;
    await request.call(el);
  }

  private async salirFullscreen(): Promise<void> {
    const doc: any = document;
    const exit =
      doc.exitFullscreen ||
      doc.webkitExitFullscreen ||
      doc.mozCancelFullScreen ||
      doc.msExitFullscreen;

    if (!exit) return;
    await exit.call(doc);
  }

  private onFullscreenChange(): void {
    const doc: any = document;
    const fsElement =
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement;

    this.isFullscreen = fsElement === this.dialogContainer?.nativeElement;
  }

  // ==========================================
  // EQUIPOS ÚNICOS
  // ==========================================
  private obtenerEquiposUnicos(): string[] {
    const set = new Set<string>();
    this.operacionesOriginal.forEach((op) => {
      const n = String(op.n_equipo || '').trim();
      if (n) set.add(n);
    });
    return Array.from(set).sort();
  }

  // ==========================================
  // FILTROS
  // ==========================================
  aplicarFiltro(): void {
    if (!this.nEquipoSeleccionado) {
      this.operacionesFiltradas = [...this.operacionesOriginal];
    } else {
      this.operacionesFiltradas = this.operacionesOriginal.filter(
        (op) => String(op.n_equipo || '').trim() === this.nEquipoSeleccionado,
      );
    }
    this.recalcularTodo();
  }

  limpiarFiltro(): void {
    this.nEquipoSeleccionado = '';
    this.operacionesFiltradas = [...this.operacionesOriginal];
    this.recalcularTodo();
  }

  // ==========================================
  // GETTERS — totales del footer
  // (CAMBIO: tratan null como 0 y se agregan malla, taladros y long. perforación)
  // ==========================================
  get totalPernosResumen(): number {
    return this.resumenLabores.reduce((acc, f) => acc + (f.nPernos ?? 0), 0);
  }

  get totalMetrosResumen(): number {
    return this.resumenLabores.reduce((acc, f) => acc + (f.metros ?? 0), 0);
  }

  get totalMallaResumen(): number {
    return this.resumenLabores.reduce((acc, f) => acc + (f.mt52Malla ?? 0), 0);
  }

  get totalTaladrosResumen(): number {
    return this.resumenLabores.reduce((acc, f) => acc + (f.nTaladros ?? 0), 0);
  }

  get totalLongPerforacionResumen(): number {
    return this.resumenLabores.reduce((acc, f) => acc + (f.longPerforacion ?? 0), 0);
  }

  // ==========================================
  // RECALCULAR TODO
  // ==========================================
  private recalcularTodo(): void {
    this.kpis = this.calcularKpis(this.operacionesFiltradas);
    this.resumenLabores = this.agruparResumenLabores(this.operacionesFiltradas);
  }

  // ==========================================
  // HELPERS
  // ==========================================
  private calcularDuracionHoras(horaInicio: string, horaFinal: string): number {
    if (!horaInicio || !horaFinal) return 0;

    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaFinal.split(':').map(Number);

    let inicio = h1 * 60 + m1;
    let fin = h2 * 60 + m2;

    if (fin < inicio) fin += 24 * 60;

    return Number(((fin - inicio) / 60).toFixed(2));
  }

  // ==========================================
  // HELPERS NUEVO FORMATO (perno/malla/perforacion son ARRAYS)
  // ==========================================
  // CAMBIO: se descartan los elementos "fantasma" (objetos vacíos o con todo en 0/blanco)
  private tieneTexto(v: any): boolean {
    return String(v ?? '').trim() !== '';
  }

  private pernoTieneDatos(p: any): boolean {
    return !!p && (
      this.tieneTexto(p.tipo_pernos) ||
      (Number(p.log_pernos) || 0) > 0 ||
      (Number(p.n_pernos_instalados) || 0) > 0
    );
  }

  private mallaTieneDatos(m: any): boolean {
    return !!m && (
      this.tieneTexto(m.tipo_malla) ||
      (Number(m.mt52_malla) || 0) > 0
    );
  }

  private perforacionTieneDatos(p: any): boolean {
    return !!p && (
      this.tieneTexto(p.tipo_perforacion) ||
      (Number(p.n_taladros) || 0) > 0 ||
      (Number(p.longitud_perforacion) || 0) > 0
    );
  }

  private getPernos(opReg: any): any[] {
    if (!opReg?.perno) return [];
    const arr = Array.isArray(opReg.perno) ? opReg.perno : [opReg.perno];
    return arr.filter((p: any) => this.pernoTieneDatos(p));
  }

  private getMallas(opReg: any): any[] {
    if (!opReg?.malla) return [];
    const arr = Array.isArray(opReg.malla) ? opReg.malla : [opReg.malla];
    return arr.filter((m: any) => this.mallaTieneDatos(m));
  }

  private getPerforaciones(opReg: any): any[] {
    if (!opReg?.perforacion) return [];
    const arr = Array.isArray(opReg.perforacion) ? opReg.perforacion : [opReg.perforacion];
    return arr.filter((p: any) => this.perforacionTieneDatos(p));
  }

  // ==========================================
  // AGRUPAR RESUMEN DE LABORES
  // CAMBIO: las filas se generan por ÍNDICE (perno[i], malla[i], perforación[i]).
  // Cada elemento aparece una sola vez; donde no existe se muestra "—".
  // Así ningún total (malla, taladros, metros) se duplica.
  // ==========================================
  private agruparResumenLabores(ops: OperacionBaseSostenimiento[]): ResumenLabor[] {
    const filas: ResumenLabor[] = [];

    ops.forEach((op) => {
      const equipo = String(op.n_equipo || 'SIN EQUIPO').trim();
      const registrosArray: any[] = (op as any).registros ?? [];
      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        if (String(registro.estado || '').trim().toUpperCase() !== 'OPERATIVO') continue;

        const opReg = registro.operacion || registro;
        const labor = String(opReg.labor || '').trim() || '—';

        const pernos = this.getPernos(opReg);
        const mallas = this.getMallas(opReg);
        const perforaciones = this.getPerforaciones(opReg);

        // Una fila por cada "slot": el mayor de los tres arrays
        const totalFilas = Math.max(pernos.length, mallas.length, perforaciones.length);

        for (let i = 0; i < totalFilas; i++) {
          const perno = pernos[i];
          const malla = mallas[i];
          const perf = perforaciones[i];

          // --- Perno ---
          const logPerno = perno ? Number(perno.log_pernos) || 0 : null;
          const nPernos = perno ? Number(perno.n_pernos_instalados) || 0 : null;
          const metros = perno
            ? Number(((nPernos ?? 0) * (logPerno ?? 0) * 0.3048).toFixed(2))
            : null;

          filas.push({
            equipo,
            labor,

            // --- Perno ---
            tipoPerno: perno ? String(perno.tipo_pernos || '').trim() || '—' : '—',
            logPerno,
            nPernos,
            sistematico: perno ? String(perno.sistematico_puntual || '').trim() || '—' : '—',

            // --- Malla ---
            tipoMalla: malla ? String(malla.tipo_malla || '').trim() || '—' : '—',
            mt52Malla: malla ? Number((Number(malla.mt52_malla) || 0).toFixed(2)) : null,

            // --- Perforación ---
            nTaladros: perf ? Number(perf.n_taladros) || 0 : null,
            longPerforacion: perf
              ? Number((Number(perf.longitud_perforacion) || 0).toFixed(2))
              : null,
            tipoPerforacion: perf ? String(perf.tipo_perforacion || '').trim() || '—' : '—',

            metros,
          });
        }
      }
    });

    return filas.sort((a, b) => {
      const e = a.equipo.localeCompare(b.equipo);
      return e !== 0 ? e : a.labor.localeCompare(b.labor);
    });
  }

  // ==========================================
  // KPIs
  // ==========================================
  private kpisVacios(): KpiResumen {
    return {
      totalOperaciones: 0,
      totalEquipos: 0,
      totalPernos: 0,
      totalMetros: 0,
      totalTaladros: 0,
      totalMalla: 0,
      promedioPernosDia: 0,
      promedioMetrosDia: 0,
      disponibilidad: 0,
      utilizacion: 0,
    };
  }

  private calcularKpis(ops: OperacionBaseSostenimiento[]): KpiResumen {
    const res = this.kpisVacios();
    if (!ops.length) return res;

    const equipos = new Set<string>();
    const fechas = new Set<string>();

    let horasTotales = 0;
    let horasMtto = 0;

    res.totalOperaciones = ops.length;

    ops.forEach((op) => {
      if (op.n_equipo) equipos.add(String(op.n_equipo).trim());
      if (op.fecha) fechas.add(String(op.fecha));

      const registrosArray: any[] = (op as any).registros ?? [];
      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const estado = String(registro.estado || '').trim().toUpperCase();

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        horasTotales += horas;

        if (estado === 'MANTENIMIENTO') horasMtto += horas;

        if (estado !== 'OPERATIVO') continue;

        const opReg = registro.operacion || registro;

        const pernos = this.getPernos(opReg);
        const mallas = this.getMallas(opReg);
        const perforaciones = this.getPerforaciones(opReg);

        // Pernos + metros
        pernos.forEach((perno: any) => {
          const logPerno = Number(perno.log_pernos) || 0;
          const nPernos = Number(perno.n_pernos_instalados) || 0;

          res.totalPernos += nPernos;
          res.totalMetros += nPernos * logPerno * 0.3048;
        });

        // Malla
        mallas.forEach((m: any) => {
          res.totalMalla += Number(m.mt52_malla) || 0;
        });

        // Taladros
        perforaciones.forEach((p: any) => {
          res.totalTaladros += Number(p.n_taladros) || 0;
        });
      }
    });

    res.totalEquipos = equipos.size;
    const dias = fechas.size || 1;

    res.totalMetros = Number(res.totalMetros.toFixed(2));
    res.totalMalla = Number(res.totalMalla.toFixed(2));

    res.promedioPernosDia = Number((res.totalPernos / dias).toFixed(2));
    res.promedioMetrosDia = Number((res.totalMetros / dias).toFixed(2));

    res.disponibilidad = horasTotales > 0
      ? Number((((horasTotales - horasMtto) / horasTotales) * 100).toFixed(2))
      : 0;

    return res;
  }

  cerrar(): void {
    if (this.isFullscreen) {
      this.salirFullscreen().finally(() => this.dialogRef.close());
    } else {
      this.dialogRef.close();
    }
  }
}