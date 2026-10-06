import {
  Component, Inject, OnInit, OnDestroy, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OperacionBaseJumbo } from '../../../../../models/OperacionBase.models';
import { EstadoService } from '../../../../../services/estado.service';

export interface PresentacionJefeGuardiaHzData {
  operaciones: OperacionBaseJumbo[];
  turnoAplicado?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

interface KpiResumen {
  totalOperaciones: number;
  totalEquipos: number;
  totalMetros: number;
  totalTaladros: number;
  totalBarras: number;
  promedioMetrosDia: number;
  promedioTaladrosDia: number;
  promedioMetrosTaladro: number;
  promedioBarrasTaladro: number;
  horasTotales: number;
  horasOperativas: number;
  horasMtto: number;
  disponibilidad: number;
  utilizacion: number;
  rendimiento: number;
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
  tipoPerforacion: string;
  material: string;
  longBarras: number;
  talProduccion: number;
  talRimados: number;
  talAlivio: number;
  metraje: number;
}

@Component({
  selector: 'app-presentacion-jefe-guardia-hz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './presentacion-jefe-guardia-hz.component.html',
  styleUrl: './presentacion-jefe-guardia-hz.component.css',
})
export class PresentacionJefeGuardiaHzComponent implements OnInit, OnDestroy {

  // ==========================================
  // FULLSCREEN
  // ==========================================
  @ViewChild('dialogContainer', { static: true })
  dialogContainer!: ElementRef<HTMLElement>;

  isFullscreen = false;
  private fullscreenChangeHandler = () => this.onFullscreenChange();

  // ==========================================
  // DATA
  // ==========================================
  operacionesOriginal: OperacionBaseJumbo[] = [];
  operacionesFiltradas: OperacionBaseJumbo[] = [];

  equiposDisponibles: string[] = [];
  nEquipoSeleccionado = '';

  // ==========================================
  // KPIs
  // ==========================================
  kpis: KpiResumen = this.kpisVacios();

  // ==========================================
  // GRÁFICOS (barras)
  // ==========================================
  barrasMetrosPorEquipo: BarraData[] = [];
  barrasMetrosPorGuardia: BarraData[] = [];
  barrasMetrosPorTipoActividad: BarraData[] = [];
  barrasTaladrosPorEquipo: BarraData[] = [];
  barrasHorasPorEquipo: BarraData[] = [];
  barrasDisponibilidadPorEquipo: BarraData[] = [];
  barrasUtilizacionPorEquipo: BarraData[] = [];
  barrasRendimientoPorEquipo: BarraData[] = [];
  barrasTopOperadores: BarraData[] = [];
  resumenLabores: ResumenLabor[] = [];
  totalMetrajeResumen = 0;

  // Mapa de estados (igual que en principal-grafico-horizontal)
  private mapaEstados = new Map<string, any>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PresentacionJefeGuardiaHzData,
    private dialogRef: MatDialogRef<PresentacionJefeGuardiaHzComponent>,
    private estadoService: EstadoService,
  ) {}

  ngOnInit(): void {
    this.operacionesOriginal = this.data?.operaciones ?? [];
    this.operacionesFiltradas = [...this.operacionesOriginal];
    this.equiposDisponibles = this.obtenerEquiposUnicos();

    // Cargar estados y luego recalcular
    this.cargarEstadosYRecalcular();

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
  // CARGA DE ESTADOS
  // ==========================================
  private cargarEstadosYRecalcular(): void {
    this.estadoService.getEstadosByProceso('PERFORACIÓN HORIZONTAL').subscribe({
      next: (data) => {
        this.mapaEstados.clear();
        (data || []).forEach((e: any) => {
          const codigo = String(e.codigo || '').trim();
          if (codigo) this.mapaEstados.set(codigo, e);
        });
        this.recalcularTodo();
      },
      error: (err) => {
        console.error('Error al traer estados', err);
        this.recalcularTodo();
      },
    });
  }

  // ==========================================
  // FULLSCREEN
  // ==========================================
  async toggleFullscreen(): Promise<void> {
    try {
      if (!this.isFullscreen) await this.entrarFullscreen();
      else await this.salirFullscreen();
    } catch (err) {
      console.warn('No se pudo cambiar a pantalla completa:', err);
    }
  }

  private async entrarFullscreen(): Promise<void> {
    const el: any = this.dialogContainer?.nativeElement;
    if (!el) return;
    const request = el.requestFullscreen || el.webkitRequestFullscreen
      || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (!request) return;
    await request.call(el);
  }

  private async salirFullscreen(): Promise<void> {
    const doc: any = document;
    const exit = doc.exitFullscreen || doc.webkitExitFullscreen
      || doc.mozCancelFullScreen || doc.msExitFullscreen;
    if (!exit) return;
    await exit.call(doc);
  }

  private onFullscreenChange(): void {
    const doc: any = document;
    const fsElement = doc.fullscreenElement || doc.webkitFullscreenElement
      || doc.mozFullScreenElement || doc.msFullscreenElement;
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
  // RECALCULAR TODO
  // ==========================================
  private recalcularTodo(): void {
    this.kpis = this.calcularKpis(this.operacionesFiltradas);

    this.resumenLabores = this.agruparPorEquipoYOperacion(this.operacionesFiltradas);
    this.totalMetrajeResumen = this.resumenLabores.reduce((total, fila) => total + fila.metraje, 0);
    this.barrasMetrosPorEquipo = this.agruparPorEquipo(this.operacionesFiltradas, 'metros');
    this.barrasMetrosPorGuardia = this.agruparPorGuardia(this.operacionesFiltradas);
    this.barrasMetrosPorTipoActividad = this.agruparPorTipoActividad(this.operacionesFiltradas);
    this.barrasTaladrosPorEquipo = this.agruparPorEquipo(this.operacionesFiltradas, 'taladros');
    this.barrasHorasPorEquipo = this.agruparPorEquipo(this.operacionesFiltradas, 'horasOperativas');
    this.barrasDisponibilidadPorEquipo = this.agruparPorEquipo(this.operacionesFiltradas, 'disponibilidad');
    this.barrasUtilizacionPorEquipo = this.agruparPorEquipo(this.operacionesFiltradas, 'utilizacion');
    this.barrasRendimientoPorEquipo = this.agruparPorEquipo(this.operacionesFiltradas, 'rendimiento');
    this.barrasTopOperadores = this.topOperadoresPorMetros(this.operacionesFiltradas, 5);
  }

  // ==========================================
  // HELPERS DE CLASIFICACIÓN
  // ==========================================
  private normalizarTexto(v: any): string {
    return String(v || '').trim().toUpperCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private obtenerEstado(codigo: string) {
    return this.mapaEstados.get(String(codigo || '').trim());
  }

  private esOperativo(codigo: string): boolean {
    const e = this.obtenerEstado(codigo);
    if (!e) return false;
    const principal = this.normalizarTexto(e.estado_principal);
    const categoria = this.normalizarTexto(e.categoria);
    return principal === 'OPERATIVO' || categoria.includes('ACTIVIDADES OPERATIVAS');
  }

  private esMantenimiento(codigo: string): boolean {
    const e = this.obtenerEstado(codigo);
    if (!e) return false;
    const principal = this.normalizarTexto(e.estado_principal);
    const categoria = this.normalizarTexto(e.categoria);
    return principal === 'MANTENIMIENTO' || categoria.includes('MANTENIMIENTO');
  }

  private duracionHoras(hi?: string, hf?: string): number {
    if (!hi || !hf) return 0;
    const [h1, m1] = hi.split(':').map(Number);
    const [h2, m2] = hf.split(':').map(Number);
    if ([h1, m1, h2, m2].some(isNaN)) return 0;
    const inicio = h1 * 60 + m1;
    const fin = h2 * 60 + m2;
    const diff = fin - inicio;
    return diff > 0 ? diff / 60 : 0;
  }

  private num(v: any, def = 0): number {
    if (v === null || v === undefined || v === '') return def;
    const n = Number(v);
    return isNaN(n) ? def : n;
  }

  // ==========================================
  // CÁLCULO DE METROS/TALADROS/BARRAS
  // ==========================================
  private resumenOperacion(op: OperacionBaseJumbo) {
    let metros = 0, taladros = 0, barras = 0;
    const porActividad: Record<string, { metros: number; taladros: number; barras: number }> = {};

    (op.registros ?? []).forEach((r: any) => {
      const codigo = String(r.codigo || '').trim();
      if (!this.esOperativo(codigo)) return;

      const horas = this.duracionHoras(r.hora_inicio, r.hora_final);
      if (horas <= 0) return;

      const o = r.operacion || {};
      const talProd = this.num(o.tal_prod);
      const talRim = this.num(o.tal_rimados);
      const talAli = this.num(o.tal_alivio);
      const totalTal = talProd + talRim + talAli;
      const longM = this.num(o.long_barras) * 0.3048;
      const nBarras = this.num(o.num_barras, 1);
      const metrosReg = totalTal * longM * nBarras;

      metros += metrosReg;
      taladros += totalTal;
      barras += nBarras;

      const est = this.obtenerEstado(codigo);
      const tipo = this.normalizarTexto(
        est?.tipo_estado || est?.categoria || est?.estado_principal || 'SIN TIPO'
      ) || 'SIN TIPO';

      if (!porActividad[tipo]) porActividad[tipo] = { metros: 0, taladros: 0, barras: 0 };
      porActividad[tipo].metros += metrosReg;
      porActividad[tipo].taladros += totalTal;
      porActividad[tipo].barras += nBarras;
    });

    return { metros, taladros, barras, porActividad };
  }

  // ==========================================
  // KPIs
  // ==========================================
  private kpisVacios(): KpiResumen {
    return {
      totalOperaciones: 0, totalEquipos: 0,
      totalMetros: 0, totalTaladros: 0, totalBarras: 0,
      promedioMetrosDia: 0, promedioTaladrosDia: 0,
      promedioMetrosTaladro: 0, promedioBarrasTaladro: 0,
      horasTotales: 0, horasOperativas: 0, horasMtto: 0,
      disponibilidad: 0, utilizacion: 0, rendimiento: 0,
    };
  }

  private calcularKpis(ops: OperacionBaseJumbo[]): KpiResumen {
    const res = this.kpisVacios();
    if (!ops.length) return res;

    const equipos = new Set<string>();
    const fechas = new Set<string>();

    res.totalOperaciones = ops.length;

    ops.forEach((op) => {
      if (op.n_equipo) equipos.add(String(op.n_equipo).trim());
      if (op.fecha) fechas.add(String(op.fecha));

      const r = this.resumenOperacion(op);
      res.totalMetros += r.metros;
      res.totalTaladros += r.taladros;
      res.totalBarras += r.barras;

      (op.registros ?? []).forEach((reg: any) => {
        const h = this.duracionHoras(reg.hora_inicio, reg.hora_final);
        if (h <= 0) return;
        const codigo = String(reg.codigo || '').trim();
        res.horasTotales += h;
        if (this.esOperativo(codigo)) res.horasOperativas += h;
        if (this.esMantenimiento(codigo)) res.horasMtto += h;
      });
    });

    res.totalEquipos = equipos.size;
    const dias = fechas.size || 1;

    res.promedioMetrosDia = res.totalMetros / dias;
    res.promedioTaladrosDia = res.totalTaladros / dias;
    res.promedioMetrosTaladro = res.totalTaladros > 0 ? res.totalMetros / res.totalTaladros : 0;
    res.promedioBarrasTaladro = res.totalTaladros > 0 ? res.totalBarras / res.totalTaladros : 0;

    res.disponibilidad = res.horasTotales > 0
      ? ((res.horasTotales - res.horasMtto) / res.horasTotales) * 100 : 0;
    res.utilizacion = (res.horasTotales - res.horasMtto) > 0
      ? (res.horasOperativas / (res.horasTotales - res.horasMtto)) * 100 : 0;
    res.rendimiento = res.horasOperativas > 0
      ? res.totalMetros / res.horasOperativas : 0;

    return res;
  }

  // ==========================================
  // AGRUPACIONES → BARRAS
  // ==========================================
  private agruparPorEquipo(
    ops: OperacionBaseJumbo[],
    metrica: 'metros' | 'taladros' | 'horasOperativas' | 'disponibilidad' | 'utilizacion' | 'rendimiento',
  ): BarraData[] {
    const mapa = new Map<string, { metros: number; taladros: number; horasTotales: number; horasOp: number; horasMtto: number }>();

    ops.forEach((op) => {
      const key = String(op.n_equipo || 'SIN EQUIPO').trim();
      if (!mapa.has(key)) mapa.set(key, { metros: 0, taladros: 0, horasTotales: 0, horasOp: 0, horasMtto: 0 });
      const item = mapa.get(key)!;

      const r = this.resumenOperacion(op);
      item.metros += r.metros;
      item.taladros += r.taladros;

      (op.registros ?? []).forEach((reg: any) => {
        const h = this.duracionHoras(reg.hora_inicio, reg.hora_final);
        if (h <= 0) return;
        const codigo = String(reg.codigo || '').trim();
        item.horasTotales += h;
        if (this.esOperativo(codigo)) item.horasOp += h;
        if (this.esMantenimiento(codigo)) item.horasMtto += h;
      });
    });

    const arr: BarraData[] = [];
    mapa.forEach((v, k) => {
      let valor = 0;
      switch (metrica) {
        case 'metros': valor = v.metros; break;
        case 'taladros': valor = v.taladros; break;
        case 'horasOperativas': valor = v.horasOp; break;
        case 'disponibilidad':
          valor = v.horasTotales > 0 ? ((v.horasTotales - v.horasMtto) / v.horasTotales) * 100 : 0; break;
        case 'utilizacion':
          valor = (v.horasTotales - v.horasMtto) > 0 ? (v.horasOp / (v.horasTotales - v.horasMtto)) * 100 : 0; break;
        case 'rendimiento':
          valor = v.horasOp > 0 ? v.metros / v.horasOp : 0; break;
      }
      arr.push({ label: k, valor: Number(valor.toFixed(2)), porcentaje: 0 });
    });

    arr.sort((a, b) => b.valor - a.valor);
    const max = Math.max(...arr.map((x) => x.valor), 1);
    arr.forEach((x) => (x.porcentaje = (x.valor / max) * 100));
    return arr;
  }

  private agruparPorGuardia(ops: OperacionBaseJumbo[]): BarraData[] {
    const mapa = new Map<string, number>();
    ops.forEach((op) => {
      const key = String(op.seccion || 'SIN GUARDIA').trim();
      const r = this.resumenOperacion(op);
      mapa.set(key, (mapa.get(key) ?? 0) + r.metros);
    });
    const arr = Array.from(mapa.entries()).map(([label, valor]) => ({
      label, valor: Number(valor.toFixed(2)), porcentaje: 0,
    }));
    arr.sort((a, b) => b.valor - a.valor);
    const max = Math.max(...arr.map((x) => x.valor), 1);
    arr.forEach((x) => (x.porcentaje = (x.valor / max) * 100));
    return arr;
  }

  private agruparPorTipoActividad(ops: OperacionBaseJumbo[]): BarraData[] {
    const mapa = new Map<string, { metros: number; taladros: number; barras: number }>();

    ops.forEach((op) => {
      const r = this.resumenOperacion(op);
      Object.entries(r.porActividad).forEach(([tipo, v]) => {
        if (!mapa.has(tipo)) mapa.set(tipo, { metros: 0, taladros: 0, barras: 0 });
        const item = mapa.get(tipo)!;
        item.metros += v.metros;
        item.taladros += v.taladros;
        item.barras += v.barras;
      });
    });

    const arr: BarraData[] = [];
    mapa.forEach((v, k) => {
      arr.push({
        label: k,
        valor: Number(v.metros.toFixed(2)),
        porcentaje: 0,
        extra: `${v.taladros} taladros · ${v.barras} barras`,
      });
    });

    arr.sort((a, b) => b.valor - a.valor);
    const max = Math.max(...arr.map((x) => x.valor), 1);
    arr.forEach((x) => (x.porcentaje = (x.valor / max) * 100));
    return arr;
  }

  private topOperadoresPorMetros(ops: OperacionBaseJumbo[], top: number): BarraData[] {
    const mapa = new Map<string, number>();
    ops.forEach((op) => {
      const key = String(op.operador || 'SIN OPERADOR').trim();
      const r = this.resumenOperacion(op);
      mapa.set(key, (mapa.get(key) ?? 0) + r.metros);
    });
    const arr = Array.from(mapa.entries())
      .map(([label, valor]) => ({ label, valor: Number(valor.toFixed(2)), porcentaje: 0 }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, top);
    const max = Math.max(...arr.map((x) => x.valor), 1);
    arr.forEach((x) => (x.porcentaje = (x.valor / max) * 100));
    return arr;
  }

  // ==========================================
  // RESUMEN POR EQUIPO Y DETALLE DE PERFORACIÓN
  // ==========================================
  private agruparPorEquipoYOperacion(ops: OperacionBaseJumbo[]): ResumenLabor[] {
    const resumen = new Map<string, ResumenLabor>();

    ops.forEach((op) => {
      const equipo = String(op.n_equipo || op.equipo || '').trim() || 'SIN EQUIPO';

      (op.registros ?? []).forEach((r) => {
        const codigo = String(r.codigo || '').trim();
        if (!this.esOperativo(codigo)) return;

        const horas = this.duracionHoras(r.hora_inicio, r.hora_final ?? undefined);
        if (horas <= 0) return;

        const o = r.operacion || {};
        const labor = String(o.labor || '').trim();
        const tipoPerforacion = String(o.tipo_perforacion || '').trim();
        if (!labor || !tipoPerforacion) return;

        const material = String(o.material || '').trim();
        const longBarras = this.num(o.long_barras);
        const talProduccion = this.num(o.tal_prod);
        const talRimados = this.num(o.tal_rimados);
        const talAlivio = this.num(o.tal_alivio);
        const totalTal = talProduccion + talRimados + talAlivio;
        const longM = longBarras * 0.3048;
        const nBarras = this.num(o.num_barras, 1);
        const metros = totalTal * longM * nBarras;

        if (metros <= 0) return;

        const clave = JSON.stringify([
          equipo, labor, tipoPerforacion, material, longBarras,
          talProduccion, talRimados, talAlivio,
        ]);
        const existente = resumen.get(clave);
        if (existente) existente.metraje += metros;
        else {
          resumen.set(clave, {
            equipo,
            labor,
            tipoPerforacion,
            material,
            longBarras,
            talProduccion,
            talRimados,
            talAlivio,
            metraje: metros,
          });
        }
      });
    });

    return Array.from(resumen.values())
      .map((f) => ({ ...f, metraje: Number(f.metraje.toFixed(2)) }))
      .sort((a, b) =>
        a.equipo.localeCompare(b.equipo)
        || a.labor.localeCompare(b.labor)
        || a.tipoPerforacion.localeCompare(b.tipoPerforacion)
        || a.material.localeCompare(b.material),
      );
  }

  cerrar(): void {
    if (this.isFullscreen) {
      this.salirFullscreen().finally(() => this.dialogRef.close());
    } else {
      this.dialogRef.close();
    }
  }
}