import {
  Component, Inject, OnInit, OnDestroy, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OperacionBaseTLargos } from '../../../../../models/OperacionBase.models';

export interface PresentacionGefeGuardiaTlData {
  operaciones: OperacionBaseTLargos[];
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

interface ResumenBarras {
  metros: number;
  taladros: number;
  barras: number;
  porTipo: Record<string, { metros: number; taladros: number; barras: number }>;
}

interface ResumenLabor {
  equipo: string;
  labor: string;
  tipoPerforacion: string;
  nFila: number;         // fila dentro de la labor
  nBarras: number;       // n_barras de esa fila
  nTaladros: number;     // taladros únicos en esa fila
  longBarra: number;     // longitud_perforacion (m)
  metraje: number;       // suma de longitud_perforacion de la fila
}

@Component({
  selector: 'app-presentacion-gefe-guardia-tl',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './presentacion-gefe-guardia-tl.component.html',
  styleUrl: './presentacion-gefe-guardia-tl.component.css',
})
export class PresentacionGefeGuardiaTlComponent implements OnInit, OnDestroy {

  // ==========================================
  // FULLSCREEN — referencia directa al contenedor
  // ==========================================
  @ViewChild('dialogContainer', { static: true })
  dialogContainer!: ElementRef<HTMLElement>;

  isFullscreen = false;

  private fullscreenChangeHandler = () => this.onFullscreenChange();

  // ==========================================
  // DATA
  // ==========================================
  operacionesOriginal: OperacionBaseTLargos[] = [];
  operacionesFiltradas: OperacionBaseTLargos[] = [];

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
  barrasMetrosPorTipoPerforacion: BarraData[] = [];
  barrasTaladrosPorEquipo: BarraData[] = [];
  barrasHorasPorEquipo: BarraData[] = [];
  barrasDisponibilidadPorEquipo: BarraData[] = [];
  barrasUtilizacionPorEquipo: BarraData[] = [];
  barrasRendimientoPorEquipo: BarraData[] = [];
  barrasTopOperadores: BarraData[] = [];
  resumenLabores: ResumenLabor[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PresentacionGefeGuardiaTlData,
    private dialogRef: MatDialogRef<PresentacionGefeGuardiaTlComponent>,
  ) {}

  ngOnInit(): void {
    this.operacionesOriginal = this.data?.operaciones ?? [];
    this.operacionesFiltradas = [...this.operacionesOriginal];
    this.equiposDisponibles = this.obtenerEquiposUnicos();
    this.recalcularTodo();

    // 🔥 Escuchar cambios de fullscreen (ESC, F11, botón, etc.)
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

    // Salir solo si este diálogo es el elemento actualmente en pantalla completa.
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

    if (!request) {
      console.warn('Fullscreen API no soportada');
      return;
    }

    await request.call(el);
    // El estado lo actualiza el listener fullscreenchange
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
    // El estado lo actualiza el listener fullscreenchange
  }

  private onFullscreenChange(): void {
    const doc: any = document;
    const fsElement =
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement;

    // 🔥 Solo es true si NUESTRO contenedor es el que está en fullscreen
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
  // GETTER — total metraje del resumen (footer)
  // ==========================================
  get totalMetrajeResumen(): number {
    return this.resumenLabores.reduce((acc, f) => acc + f.metraje, 0);
  }

  // ==========================================
  // RECALCULAR TODO
  // ==========================================
  private recalcularTodo(): void {
    this.kpis = this.calcularKpis(this.operacionesFiltradas);

    this.resumenLabores = this.agruparPorEquipoLaborYTipo(this.operacionesFiltradas);
    this.barrasMetrosPorEquipo = this.agruparPorEquipo(this.operacionesFiltradas, 'metros');
    this.barrasMetrosPorGuardia = this.agruparPorGuardia(this.operacionesFiltradas);
    this.barrasMetrosPorTipoPerforacion = this.agruparPorTipoPerforacion(this.operacionesFiltradas);
    this.barrasTaladrosPorEquipo = this.agruparPorEquipo(this.operacionesFiltradas, 'taladros');
    this.barrasHorasPorEquipo = this.agruparPorEquipo(this.operacionesFiltradas, 'horasOperativas');
    this.barrasDisponibilidadPorEquipo = this.agruparPorEquipo(this.operacionesFiltradas, 'disponibilidad');
    this.barrasUtilizacionPorEquipo = this.agruparPorEquipo(this.operacionesFiltradas, 'utilizacion');
    this.barrasRendimientoPorEquipo = this.agruparPorEquipo(this.operacionesFiltradas, 'rendimiento');
    this.barrasTopOperadores = this.topOperadoresPorMetros(this.operacionesFiltradas, 5);
  }

  /**
   * Agrupa por equipo + labor + tipo_perforacion + n_fila.
   * - nBarras: n_barras representativo de la fila (el mayor si varía)
   * - nTaladros: cantidad de n_taladro únicos en esa fila
   * - longBarra: longitud_perforacion (m) representativa
   * - metraje: suma de longitud_perforacion de todas las barras de la fila
   */
  private agruparPorEquipoLaborYTipo(ops: OperacionBaseTLargos[]): ResumenLabor[] {
    const resumen = new Map<string, ResumenLabor>();

    ops.forEach((op) => {
      const equipo = String(op.n_equipo || op.equipo || '').trim() || 'SIN EQUIPO';

      (op.registros ?? []).forEach((registro) => {
        const labor = String(registro.operacion?.labor || '').trim();
        if (!labor) return;

        // Sub-agrupación por tipo + n_fila para contar taladros únicos
        const porFilaTipo = new Map<string, {
          tipoPerforacion: string;
          nFila: number;
          nBarras: number;
          longBarra: number;
          taladros: Set<number>;
          metraje: number;
        }>();

        (registro.operacion?.barras ?? []).forEach((barra: any) => {
          const tipoPerforacion = String(barra.tipo_perforacion || '').trim().toUpperCase();
          const nFila = Number(barra.n_fila) || 0;
          const nTaladro = Number(barra.n_taladro) || 0;
          const nBarras = Number(barra.n_barras) || 0;
          const longitud = Number(barra.longitud_perforacion) || 0;

          if (!tipoPerforacion || longitud <= 0 || nFila <= 0) return;

          const claveFila = JSON.stringify([tipoPerforacion, nFila]);
          let item = porFilaTipo.get(claveFila);

          if (!item) {
            item = {
              tipoPerforacion,
              nFila,
              nBarras: 0,
              longBarra: 0,
              taladros: new Set<number>(),
              metraje: 0,
            };
            porFilaTipo.set(claveFila, item);
          }

          item.longBarra = Math.max(item.longBarra, longitud);
          item.nBarras = Math.max(item.nBarras, nBarras);
          if (nTaladro > 0) item.taladros.add(nTaladro);
          item.metraje += longitud;
        });

        // Volcar al resumen global (clave incluye equipo + labor + tipo + fila)
        porFilaTipo.forEach((item) => {
          const clave = JSON.stringify([equipo, labor, item.tipoPerforacion, item.nFila]);
          let fila = resumen.get(clave);

          if (!fila) {
            fila = {
              equipo,
              labor,
              tipoPerforacion: item.tipoPerforacion,
              nFila: item.nFila,
              nBarras: item.nBarras,
              nTaladros: item.taladros.size,
              longBarra: item.longBarra,
              metraje: 0,
            };
            resumen.set(clave, fila);
          }

          fila.nBarras = Math.max(fila.nBarras, item.nBarras);
          fila.nTaladros += item.taladros.size;
          fila.longBarra = Math.max(fila.longBarra, item.longBarra);
          fila.metraje += item.metraje;
        });
      });
    });

    return Array.from(resumen.values())
      .map((fila) => ({
        ...fila,
        longBarra: Number(fila.longBarra.toFixed(2)),
        metraje: Number(fila.metraje.toFixed(2)),
      }))
      .sort((a, b) =>
        a.equipo.localeCompare(b.equipo)
        || a.labor.localeCompare(b.labor)
        || a.tipoPerforacion.localeCompare(b.tipoPerforacion)
        || a.nFila - b.nFila,
      );
  }

  // ==========================================
  // HELPERS DE CÁLCULO
  // ==========================================
  private duracionHoras(horaInicio?: string, horaFinal?: string): number {
    if (!horaInicio || !horaFinal) return 0;
    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaFinal.split(':').map(Number);
    if ([h1, m1, h2, m2].some((n) => isNaN(n))) return 0;
    const inicio = h1 * 60 + m1;
    const fin = h2 * 60 + m2;
    const diff = fin - inicio;
    return diff > 0 ? diff / 60 : 0;
  }

  private resumenBarrasDeOperacion(op: OperacionBaseTLargos): ResumenBarras {
    const res: ResumenBarras = { metros: 0, taladros: 0, barras: 0, porTipo: {} };
    const registros: any[] = (op as any).registros ?? [];

    registros.forEach((r: any) => {
      const barras = r?.operacion?.barras;
      if (!Array.isArray(barras)) return;

      barras.forEach((b: any) => {
        const longitud = Number(b?.longitud_perforacion) || 0;
        const nTaladro = Number(b?.n_taladro) || 0;
        const nBarras = Number(b?.n_barras) || 0;
        const tipo = String(b?.tipo_perforacion || 'SIN TIPO').toUpperCase().trim();

        res.metros += longitud;
        res.taladros += nTaladro;
        res.barras += nBarras;

        if (!res.porTipo[tipo]) {
          res.porTipo[tipo] = { metros: 0, taladros: 0, barras: 0 };
        }
        res.porTipo[tipo].metros += longitud;
        res.porTipo[tipo].taladros += nTaladro;
        res.porTipo[tipo].barras += nBarras;
      });
    });

    return res;
  }

  metrosDeOperacion(op: OperacionBaseTLargos): number {
    return this.resumenBarrasDeOperacion(op).metros;
  }

  private esOperativo(codigo: string): boolean {
    const c = String(codigo || '').trim();
    return ['101', '102', '103', '104', '105', '106', '107', '111'].includes(c);
  }
  private esMantenimiento(codigo: string): boolean {
    const c = String(codigo || '').trim();
    return ['206', '301', '302', '303'].includes(c);
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

  private calcularKpis(ops: OperacionBaseTLargos[]): KpiResumen {
    const res = this.kpisVacios();
    if (!ops.length) return res;

    const equipos = new Set<string>();
    const fechas = new Set<string>();

    res.totalOperaciones = ops.length;

    ops.forEach((op) => {
      if (op.n_equipo) equipos.add(String(op.n_equipo).trim());
      if (op.fecha) fechas.add(String(op.fecha));

      const barras = this.resumenBarrasDeOperacion(op);
      res.totalMetros += barras.metros;
      res.totalTaladros += barras.taladros;
      res.totalBarras += barras.barras;

      const registros: any[] = (op as any).registros ?? [];
      registros.forEach((r: any) => {
        const h = this.duracionHoras(r?.hora_inicio, r?.hora_final);
        if (h <= 0) return;
        const codigo = String(r?.codigo || '').trim();
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

    res.disponibilidad = res.horasTotales > 0 ? ((res.horasTotales - res.horasMtto) / res.horasTotales) * 100 : 0;
    res.utilizacion = (res.horasTotales - res.horasMtto) > 0 ? (res.horasOperativas / (res.horasTotales - res.horasMtto)) * 100 : 0;
    res.rendimiento = res.horasOperativas > 0 ? res.totalMetros / res.horasOperativas : 0;

    return res;
  }

  // ==========================================
  // AGRUPACIONES → BARRAS
  // ==========================================
  private agruparPorEquipo(
    ops: OperacionBaseTLargos[],
    metrica: 'metros' | 'taladros' | 'horasOperativas' | 'disponibilidad' | 'utilizacion' | 'rendimiento',
  ): BarraData[] {
    const mapa = new Map<string, { metros: number; taladros: number; horasTotales: number; horasOp: number; horasMtto: number }>();

    ops.forEach((op) => {
      const key = String(op.n_equipo || 'SIN EQUIPO').trim();
      if (!mapa.has(key)) mapa.set(key, { metros: 0, taladros: 0, horasTotales: 0, horasOp: 0, horasMtto: 0 });
      const item = mapa.get(key)!;

      const barras = this.resumenBarrasDeOperacion(op);
      item.metros += barras.metros;
      item.taladros += barras.taladros;

      const registros: any[] = (op as any).registros ?? [];
      registros.forEach((r: any) => {
        const h = this.duracionHoras(r?.hora_inicio, r?.hora_final);
        if (h <= 0) return;
        const codigo = String(r?.codigo || '').trim();
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
        case 'disponibilidad': valor = v.horasTotales > 0 ? ((v.horasTotales - v.horasMtto) / v.horasTotales) * 100 : 0; break;
        case 'utilizacion': valor = (v.horasTotales - v.horasMtto) > 0 ? (v.horasOp / (v.horasTotales - v.horasMtto)) * 100 : 0; break;
        case 'rendimiento': valor = v.horasOp > 0 ? v.metros / v.horasOp : 0; break;
      }
      arr.push({ label: k, valor: Number(valor.toFixed(2)), porcentaje: 0 });
    });

    arr.sort((a, b) => b.valor - a.valor);
    const max = Math.max(...arr.map((x) => x.valor), 1);
    arr.forEach((x) => (x.porcentaje = (x.valor / max) * 100));
    return arr;
  }

  private agruparPorGuardia(ops: OperacionBaseTLargos[]): BarraData[] {
    const mapa = new Map<string, number>();
    ops.forEach((op) => {
      const key = String(op.seccion || 'SIN GUARDIA').trim();
      mapa.set(key, (mapa.get(key) ?? 0) + this.metrosDeOperacion(op));
    });
    const arr = Array.from(mapa.entries()).map(([label, valor]) => ({
      label, valor: Number(valor.toFixed(2)), porcentaje: 0,
    }));
    arr.sort((a, b) => b.valor - a.valor);
    const max = Math.max(...arr.map((x) => x.valor), 1);
    arr.forEach((x) => (x.porcentaje = (x.valor / max) * 100));
    return arr;
  }

  private agruparPorTipoPerforacion(ops: OperacionBaseTLargos[]): BarraData[] {
    const mapa = new Map<string, { metros: number; taladros: number; barras: number }>();

    ops.forEach((op) => {
      const res = this.resumenBarrasDeOperacion(op);
      Object.entries(res.porTipo).forEach(([tipo, v]) => {
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

  private topOperadoresPorMetros(ops: OperacionBaseTLargos[], top: number): BarraData[] {
    const mapa = new Map<string, number>();
    ops.forEach((op) => {
      const key = String(op.operador || 'SIN OPERADOR').trim();
      mapa.set(key, (mapa.get(key) ?? 0) + this.metrosDeOperacion(op));
    });
    const arr = Array.from(mapa.entries())
      .map(([label, valor]) => ({ label, valor: Number(valor.toFixed(2)), porcentaje: 0 }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, top);
    const max = Math.max(...arr.map((x) => x.valor), 1);
    arr.forEach((x) => (x.porcentaje = (x.valor / max) * 100));
    return arr;
  }

  cerrar(): void {
    // 🔥 Si está en fullscreen, salir antes de cerrar
    if (this.isFullscreen) {
      this.salirFullscreen().finally(() => this.dialogRef.close());
    } else {
      this.dialogRef.close();
    }
  }
}