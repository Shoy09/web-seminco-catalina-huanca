import { Component } from '@angular/core';
import { SchedulerComponent } from "../scheduler/scheduler.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstadoService } from '../../../../../services/estado.service';
import { OperacionBase } from '../../../../../models/OperacionBase.models';
import { OperacionesService } from '../../../../../services/operaciones.service';

// Configuración de cada proceso disponible
export interface ProcesoConfig {
  id: string;
  label: string;
  tipo: string;        // tipo para la API
  proceso: string;     // nombre del proceso en los estados
  icon: string;        // icono de Material Icons
  color: string;       // color del badge/acento
}

@Component({
  selector: 'app-linea.principal',
  imports: [CommonModule, FormsModule, SchedulerComponent],
  templateUrl: './linea.principal.component.html',
  styleUrl: './linea.principal.component.css'
})
export class LineaPrincipalComponent {

  // ── Filtros ──────────────────────────────────────────────────
  fechaInicio: string = '';
  fechaFin: string = '';
  turnoSeleccionado: string = '';
  turnoAplicado: string = '';

  // ── Estado de carga ───────────────────────────────────────────
  cargando: boolean = false;

  // ── Catálogo de procesos ──────────────────────────────────────
  procesos: ProcesoConfig[] = [
    {
      id: 'horizontal',
      label: 'Perforación Horizontal',
      tipo: 'tal_horizontal',
      proceso: 'PERFORACIÓN HORIZONTAL',
      icon: 'horizontal_rule',
      color: 'bg-emerald-500'
    },
    {
      id: 'largo',
      label: 'Taladro Largo',
      tipo: 'tal_largo',
      proceso: 'PERFORACIÓN TALADROS LARGOS',
      icon: 'commit',
      color: 'bg-orange-500'
    },
    {
      id: 'empernador',
      label: 'Empernador',
      tipo: 'empernador',
      proceso: 'EMPERNADOR',
      icon: 'construction',
      color: 'bg-purple-500'
    },
    {
      id: 'scooptram',
      label: 'Scooptram',
      tipo: 'carguio',
      proceso: 'SCOOPTRAM',
      icon: 'local_shipping',
      color: 'bg-sky-500'
    }
  ];

  // Proceso activo seleccionado
  procesoActivo: ProcesoConfig = this.procesos[0];

  // ── Datos internos ────────────────────────────────────────────
  estadosProceso: any[] = [];

  // Almacén unificado: id del proceso → datos originales / filtrados / gantt / mapa
  private datosOriginales: Record<string, OperacionBase[]> = {};
  private mapaEstados: Record<string, Map<string, any>> = {};

  ganttActivo: any[] = [];

  constructor(
    private estadoService: EstadoService,
    private operacionesService: OperacionesService
  ) {}

  ngOnInit(): void {
    const hoy = this.getFechaHoy();
    this.fechaInicio = hoy;
    this.fechaFin = hoy;
    this.turnoSeleccionado = this.getTurnoActual();

    // Inicializar almacenes vacíos
    this.procesos.forEach(p => {
      this.datosOriginales[p.id] = [];
      this.mapaEstados[p.id] = new Map();
    });

    this.obtenerTodosLosEstados();
  }

  // ── Cambio de proceso activo ──────────────────────────────────
  seleccionarProceso(proceso: ProcesoConfig): void {
    this.procesoActivo = proceso;
    this.recalcularGanttActivo();
  }

  // ── Carga de estados ──────────────────────────────────────────
  obtenerTodosLosEstados(): void {
    this.cargando = true;
    this.estadoService.getEstados().subscribe({
      next: (data) => {
        this.estadosProceso = data;
        this.separarEstadosPorProceso();
        this.cargarTodasLasOperaciones();
      },
      error: (err) => {
        console.error('Error al traer estados', err);
        this.cargando = false;
      }
    });
  }

  separarEstadosPorProceso(): void {
    // Limpiar mapas
    this.procesos.forEach(p => this.mapaEstados[p.id].clear());

    this.estadosProceso.forEach(estado => {
      const codigo  = String(estado.codigo || '').trim();
      const proceso = estado.proceso || '';

      const proc = this.procesos.find(p => p.proceso === proceso);
      if (proc) {
        this.mapaEstados[proc.id].set(codigo, estado);
      }
    });
  }

  cargarTodasLasOperaciones(): void {
    let pendientes = this.procesos.length;

    this.procesos.forEach(proc => {
      this.operacionesService.getAllAprobados(proc.tipo).subscribe({
        next: (resp) => {
          this.datosOriginales[proc.id] = resp.data ?? [];
          pendientes--;
          if (pendientes === 0) {
            this.cargando = false;
            this.aplicarFiltro();
          }
        },
        error: () => {
          pendientes--;
          if (pendientes === 0) {
            this.cargando = false;
            this.aplicarFiltro();
          }
        }
      });
    });
  }

  // ── Filtros ───────────────────────────────────────────────────
  aplicarFiltro(): void {
    this.turnoAplicado = this.turnoSeleccionado;
    this.recalcularGanttActivo();
  }

  quitarFiltro(): void {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.turnoAplicado = '';
    this.turnoSeleccionado = '';
    this.recalcularGanttActivo();
  }

  private recalcularGanttActivo(): void {
    const id = this.procesoActivo.id;
    const originales = this.datosOriginales[id] ?? [];

    const filtradas = originales.filter(op => {
      if (this.fechaInicio && op.fecha < this.fechaInicio) return false;
      if (this.fechaFin   && op.fecha > this.fechaFin)    return false;
      if (this.turnoAplicado && op.turno !== this.turnoAplicado) return false;
      return true;
    });

    this.ganttActivo = this.construirGanttData(filtradas, this.mapaEstados[id]);
  }

  // ── Helpers de fecha/turno ────────────────────────────────────
  private getTurnoActual(): string {
    const hora = new Date().getHours();
    return (hora >= 7 && hora < 19) ? 'DÍA' : 'NOCHE';
  }

  private getFechaHoy(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
  }

  // ── Construcción de datos Gantt ───────────────────────────────
  private construirGanttData(data: OperacionBase[], mapaEst: Map<string, any>): any[] {
    const fechaMap: Record<string, any> = {};

    data.forEach(op => {
      const fecha = op.fecha || 'SIN_FECHA';
      const turno = op.turno || 'SIN_TURNO';
      const equipoCodigo = `${op.equipo} - ${op.n_equipo}`;
      const key = `${fecha}|${turno}`;

      if (!fechaMap[key]) fechaMap[key] = { fecha, turno, equipos: {} };
      if (!fechaMap[key].equipos[equipoCodigo]) fechaMap[key].equipos[equipoCodigo] = {};

      const registros = Array.isArray(op.registros) ? op.registros : [];

      registros.forEach((reg: any) => {
        const estado = (reg.estado || 'SIN ESTADO').toUpperCase().trim();
        const codigo = String(reg.codigo || '').trim();
        if (!reg.hora_inicio || !reg.hora_final) return;

        const estadoMatch = mapaEst.get(codigo);
        const labor = estadoMatch?.estado_principal || estado;

        if (!fechaMap[key].equipos[equipoCodigo][labor]) {
          fechaMap[key].equipos[equipoCodigo][labor] = [];
        }

        fechaMap[key].equipos[equipoCodigo][labor].push({
          start: reg.hora_inicio,
          end: reg.hora_final,
          estado,
          description: codigo,
          tipo_estado:     estadoMatch?.tipo_estado     || null,
          categoria:       estadoMatch?.categoria       || null,
          estado_principal:estadoMatch?.estado_principal|| null,
          proceso:         estadoMatch?.proceso         || null
        });
      });
    });

    return Object.values(fechaMap).map((item: any) => ({
      fecha: item.fecha,
      turno: item.turno,
      groups: Object.entries(item.equipos).map(([equipoCodigo, labores]: any) => ({
        equipoCodigo,
        rows: Object.entries(labores).map(([labor, tasks]: any) => ({
          labor,
          tasks: (tasks as any[]).sort((a, b) => a.start.localeCompare(b.start))
        }))
      }))
    }));
  }

  // ── Utilidades para el template ───────────────────────────────
  get totalRegistros(): number {
    return (this.datosOriginales[this.procesoActivo.id] ?? []).length;
  }

  get totalEquipos(): number {
    const equipos = new Set<string>();
    (this.datosOriginales[this.procesoActivo.id] ?? []).forEach(op =>
      equipos.add(`${op.equipo}-${op.n_equipo}`)
    );
    return equipos.size;
  }
}
