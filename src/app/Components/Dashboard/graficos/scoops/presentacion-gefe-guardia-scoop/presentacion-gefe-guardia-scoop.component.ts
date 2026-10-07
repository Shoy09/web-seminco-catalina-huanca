import {
  Component, Inject, OnInit, OnDestroy, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OperacionBaseScoop } from '../../../../../models/OperacionBase.models';

export interface PresentacionGefeGuardiaScoopData {
  operaciones: OperacionBaseScoop[];
  turnoAplicado?: string;
  fechaInicio?: string;
  fechaFin?: string;
  equipos?: any[];
  toneladasScoops?: any[];
}

interface KpiResumen {
  totalOperaciones: number;
  totalEquipos: number;
  totalCucharas: number;
  totalToneladas: number;
  totalHorasOperativas: number;
  promedioCucharasDia: number;
  promedioToneladasDia: number;
  promedioToneladasHora: number;
  disponibilidad: number;
  utilizacion: number;
}

interface BarraData {
  label: string;
  valor: number;
  porcentaje: number;
  extra?: string;
}

// 🔥 Interfaz simplificada: solo lo que se muestra en tabla + lo que se usa para KPIs/filtros
interface ResumenLabor {
  equipo: string;
  fecha: string;
  turno: string;
  guardia: string;
  laborInicio: string;
  ubicacionDestino: string;
  material: string;
  nCucharas: number;
  toneladas: number;
  horasOperativas: number;
  rendimiento: number;
  observaciones: string;
}

@Component({
  selector: 'app-presentacion-gefe-guardia-scoop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './presentacion-gefe-guardia-scoop.component.html',
  styleUrl: './presentacion-gefe-guardia-scoop.component.css',
})
export class PresentacionGefeGuardiaScoopComponent implements OnInit, OnDestroy {

  @ViewChild('dialogContainer', { static: true })
  dialogContainer!: ElementRef<HTMLElement>;

  isFullscreen = false;
  private fullscreenChangeHandler = () => this.onFullscreenChange();

  // DATA
  operacionesOriginal: OperacionBaseScoop[] = [];
  operacionesFiltradas: OperacionBaseScoop[] = [];
  equiposProceso: any[] = [];
  toneladasScoops: any[] = [];

  equiposDisponibles: string[] = [];
  nEquipoSeleccionado = '';

  // KPIs
  kpis: KpiResumen = this.kpisVacios();

  // Tabla resumen
  resumenLabores: ResumenLabor[] = [];

  // Códigos operativos (los mismos que usas en el principal)
  private readonly CODIGOS_OPERATIVOS = ['101', '102', '105', '106', '108'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PresentacionGefeGuardiaScoopData,
    private dialogRef: MatDialogRef<PresentacionGefeGuardiaScoopComponent>,
  ) {}

  ngOnInit(): void {
    this.operacionesOriginal = this.data?.operaciones ?? [];
    this.operacionesFiltradas = [...this.operacionesOriginal];
    this.equiposProceso = this.data?.equipos ?? [];
    this.toneladasScoops = this.data?.toneladasScoops ?? [];

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
  get totalCucharasResumen(): number {
    return this.resumenLabores.reduce((acc, f) => acc + f.nCucharas, 0);
  }

  get totalToneladasResumen(): number {
    return this.resumenLabores.reduce((acc, f) => acc + f.toneladas, 0);
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

  private buscarEquipo(op: OperacionBaseScoop): any {
    return this.equiposProceso.find(
      (equipo: any) =>
        equipo.nombre === op.equipo && equipo.codigo === op.n_equipo,
    );
  }

  private calcularCapacidadPorMaterial(material: string, equipo: any): number {
    const mat = String(material || '').toUpperCase().trim();
    const esDesmonte = ['DESMONTE', 'RELAVE', 'RELLENO'].includes(mat);

    return esDesmonte
      ? Number(equipo?.capacidad_tonelada_desmonte) || 0
      : Number(equipo?.capacidad_tonelada) || 0;
  }

  // ==========================================
  // AGRUPAR RESUMEN DE LABORES
  // ==========================================
  private agruparResumenLabores(ops: OperacionBaseScoop[]): ResumenLabor[] {
    const filas: ResumenLabor[] = [];

    ops.forEach((op) => {
      const equipo = String(op.n_equipo || 'SIN EQUIPO').trim();
      const fecha = String(op.fecha || '');
      const turno = String(op.turno || '');
      const guardia = String(op.seccion || 'SIN GUARDIA');

      const equipoEncontrado = this.buscarEquipo(op);

      const registrosArray: any[] = (op as any).registros ?? [];
      if (!Array.isArray(registrosArray)) return;

      // Agrupar por labor_inicio + material + ubicacion_destino dentro de la operación
      const porLabor = new Map<string, {
        laborInicio: string;
        material: string;
        ubicacionDestino: string;
        nCucharas: number;
        horasOperativas: number;
        observaciones: string;
      }>();

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();

        if (!this.CODIGOS_OPERATIVOS.includes(codigo)) continue;

        const operacionDetalle = registro.operacion || {};

        const laborInicio = String(operacionDetalle.labor_inicio || '').trim() || '—';
        const material = String(operacionDetalle.material || '').trim().toUpperCase() || '—';
        const ubicacionDestino = String(operacionDetalle.ubicacion_destino || '').trim() || '—';
        const observaciones = String(operacionDetalle.observaciones || '').trim();

        const nCucharas = Number(operacionDetalle.n_cucharas) || 0;

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        const clave = JSON.stringify([laborInicio, material, ubicacionDestino]);
        let item = porLabor.get(clave);

        if (!item) {
          item = {
            laborInicio,
            material,
            ubicacionDestino,
            nCucharas: 0,
            horasOperativas: 0,
            observaciones,
          };
          porLabor.set(clave, item);
        }

        item.nCucharas += nCucharas;
        item.horasOperativas += horas;

        if (!item.observaciones && observaciones) {
          item.observaciones = observaciones;
        }
      }

      // Convertir el sub-agrupado a filas
      porLabor.forEach((item) => {
        const capacidad = this.calcularCapacidadPorMaterial(item.material, equipoEncontrado);
        const toneladas = Number((item.nCucharas * capacidad).toFixed(2));

        const rendimiento = item.horasOperativas > 0
          ? Number((toneladas / item.horasOperativas).toFixed(2))
          : 0;

        filas.push({
          equipo,
          fecha,
          turno,
          guardia,
          laborInicio: item.laborInicio,
          ubicacionDestino: item.ubicacionDestino,
          material: item.material,
          nCucharas: item.nCucharas,
          toneladas,
          horasOperativas: Number(item.horasOperativas.toFixed(2)),
          rendimiento,
          observaciones: item.observaciones || '—',
        });
      });
    });

    // 🔥 Filtrar filas sin información útil
    const filasValidas = filas.filter((f) => {
      const tieneLabor = f.laborInicio && f.laborInicio !== '—';
      const tieneMaterial = f.material && f.material !== '—';
      const tieneUbicacion = f.ubicacionDestino && f.ubicacionDestino !== '—';
      const tieneCucharas = f.nCucharas > 0;

      return tieneLabor || tieneMaterial || tieneUbicacion || tieneCucharas;
    });

    return filasValidas.sort((a, b) => {
      const f = a.fecha.localeCompare(b.fecha);
      if (f !== 0) return f;
      const e = a.equipo.localeCompare(b.equipo);
      if (e !== 0) return e;
      const l = a.laborInicio.localeCompare(b.laborInicio);
      if (l !== 0) return l;
      return a.material.localeCompare(b.material);
    });
  }

  // ==========================================
  // KPIs
  // ==========================================
  private kpisVacios(): KpiResumen {
    return {
      totalOperaciones: 0,
      totalEquipos: 0,
      totalCucharas: 0,
      totalToneladas: 0,
      totalHorasOperativas: 0,
      promedioCucharasDia: 0,
      promedioToneladasDia: 0,
      promedioToneladasHora: 0,
      disponibilidad: 0,
      utilizacion: 0,
    };
  }

  private calcularKpis(ops: OperacionBaseScoop[]): KpiResumen {
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

      const equipoEncontrado = this.buscarEquipo(op);

      const registrosArray: any[] = (op as any).registros ?? [];
      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        const codigo = String(registro.codigo || '').trim();
        const estado = String(registro.estado || '').trim().toUpperCase();

        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final,
        );

        if (!horas || horas <= 0) continue;

        horasTotales += horas;

        if (estado === 'MANTENIMIENTO') horasMtto += horas;

        // Solo contar si es código operativo
        if (this.CODIGOS_OPERATIVOS.includes(codigo)) {
          res.totalHorasOperativas += horas;

          const operacionDetalle = registro.operacion || {};
          const material = String(operacionDetalle.material || '').trim().toUpperCase();
          const nCucharas = Number(operacionDetalle.n_cucharas) || 0;

          const capacidad = this.calcularCapacidadPorMaterial(material, equipoEncontrado);

          res.totalCucharas += nCucharas;
          res.totalToneladas += nCucharas * capacidad;
        }
      }
    });

    res.totalEquipos = equipos.size;
    const dias = fechas.size || 1;

    res.totalToneladas = Number(res.totalToneladas.toFixed(2));
    res.totalHorasOperativas = Number(res.totalHorasOperativas.toFixed(2));

    res.promedioCucharasDia = Number((res.totalCucharas / dias).toFixed(2));
    res.promedioToneladasDia = Number((res.totalToneladas / dias).toFixed(2));
    res.promedioToneladasHora = res.totalHorasOperativas > 0
      ? Number((res.totalToneladas / res.totalHorasOperativas).toFixed(2))
      : 0;

    res.disponibilidad = horasTotales > 0
      ? Number((((horasTotales - horasMtto) / horasTotales) * 100).toFixed(2))
      : 0;

    res.utilizacion = (horasTotales - horasMtto) > 0
      ? Number(((res.totalHorasOperativas / (horasTotales - horasMtto)) * 100).toFixed(2))
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