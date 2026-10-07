import {
  Component, Inject, OnInit, OnDestroy, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OperacionBaseScalamin } from '../../../../../models/OperacionBase.models';

export interface PresentacionGefeGuardiaScalaminData {
  operaciones: OperacionBaseScalamin[];
  turnoAplicado?: string;
  fechaInicio?: string;
  fechaFin?: string;
  equipos?: any[];
}

interface KpiResumen {
  totalOperaciones: number;
  totalEquipos: number;
  totalMetrosLineales: number;
  totalArea: number;
  promedioMetrosDia: number;
  promedioAreaDia: number;
  disponibilidad: number;
  utilizacion: number;
}

interface BarraData {
  label: string;
  valor: number;
  porcentaje: number;
  extra?: string;
}

interface ResumenLabor {
  equipo: string;
  labor: string;
  tipoLabor: string;
  areaM2: number;
  metrosLineales: number;
  observaciones: string;
}

@Component({
  selector: 'app-presentacion-gefe-guardia-scalamin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './presentacion-gefe-guardia-scalamin.component.html',
  styleUrl: './presentacion-gefe-guardia-scalamin.component.css',
})
export class PresentacionGefeGuardiaScalaminComponent implements OnInit, OnDestroy {

  @ViewChild('dialogContainer', { static: true })
  dialogContainer!: ElementRef<HTMLElement>;

  isFullscreen = false;
  private fullscreenChangeHandler = () => this.onFullscreenChange();

  // DATA
  operacionesOriginal: OperacionBaseScalamin[] = [];
  operacionesFiltradas: OperacionBaseScalamin[] = [];
  equiposProceso: any[] = [];

  equiposDisponibles: string[] = [];
  nEquipoSeleccionado = '';

  // KPIs
  kpis: KpiResumen = this.kpisVacios();

  // Tabla resumen
  resumenLabores: ResumenLabor[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PresentacionGefeGuardiaScalaminData,
    private dialogRef: MatDialogRef<PresentacionGefeGuardiaScalaminComponent>,
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
  // ==========================================
  get totalMetrosLinealesResumen(): number {
    return this.resumenLabores.reduce((acc, f) => acc + f.metrosLineales, 0);
  }

  get totalAreaResumen(): number {
    return this.resumenLabores.reduce((acc, f) => acc + f.areaM2, 0);
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
  // AGRUPAR RESUMEN DE LABORES
  // 1 fila por registro OPERATIVO
  // ==========================================
  private agruparResumenLabores(ops: OperacionBaseScalamin[]): ResumenLabor[] {
    const filas: ResumenLabor[] = [];

    ops.forEach((op) => {
      const equipo = String(op.n_equipo || 'SIN EQUIPO').trim();

      const registrosArray: any[] = (op as any).registros ?? [];
      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        if (registro.estado !== 'OPERATIVO') continue;

        const opReg = registro.operacion || registro;

        const labor = String(opReg.labor || '').trim() || '—';
        const tipoLabor = String(opReg.tipo_labor_texto || '').trim() || '—';
        const areaM2 = Number(opReg.area_m2) || 0;
        const metrosLineales = Number(opReg.metros_lineales) || 0;
        const observaciones = String(opReg.observaciones || '').trim() || '—';

        filas.push({
          equipo,
          labor,
          tipoLabor,
          areaM2,
          metrosLineales,
          observaciones,
        });
      }
    });

    // Filtrar filas sin información útil
    const filasValidas = filas.filter((f) => {
      const tieneLabor = f.labor && f.labor !== '—';
      const tieneTipoLabor = f.tipoLabor && f.tipoLabor !== '—';
      const tieneArea = f.areaM2 > 0;
      const tieneMetros = f.metrosLineales > 0;

      return tieneLabor || tieneTipoLabor || tieneArea || tieneMetros;
    });

    return filasValidas.sort((a, b) => {
      const e = a.equipo.localeCompare(b.equipo);
      if (e !== 0) return e;
      return a.labor.localeCompare(b.labor);
    });
  }

  // ==========================================
  // KPIs
  // ==========================================
  private kpisVacios(): KpiResumen {
    return {
      totalOperaciones: 0,
      totalEquipos: 0,
      totalMetrosLineales: 0,
      totalArea: 0,
      promedioMetrosDia: 0,
      promedioAreaDia: 0,
      disponibilidad: 0,
      utilizacion: 0,
    };
  }

  private calcularKpis(ops: OperacionBaseScalamin[]): KpiResumen {
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

        res.totalArea += Number(opReg.area_m2) || 0;
        res.totalMetrosLineales += Number(opReg.metros_lineales) || 0;
      }
    });

    res.totalEquipos = equipos.size;
    const dias = fechas.size || 1;

    res.totalArea = Number(res.totalArea.toFixed(2));
    res.totalMetrosLineales = Number(res.totalMetrosLineales.toFixed(2));

    res.promedioMetrosDia = Number((res.totalMetrosLineales / dias).toFixed(2));
    res.promedioAreaDia = Number((res.totalArea / dias).toFixed(2));

    res.disponibilidad = horasTotales > 0
      ? Number((((horasTotales - horasMtto) / horasTotales) * 100).toFixed(2))
      : 0;

    res.utilizacion = (horasTotales - horasMtto) > 0
      ? Number(((res.totalMetrosLineales / (horasTotales - horasMtto)) * 100).toFixed(2))
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