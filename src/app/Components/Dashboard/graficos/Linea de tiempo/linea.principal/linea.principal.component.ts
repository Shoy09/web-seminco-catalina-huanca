import { Component } from '@angular/core';
import { SchedulerComponent } from "../scheduler/scheduler.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstadoService } from '../../../../../services/estado.service';
import { OperacionBase } from '../../../../../models/OperacionBase.models';
import { OperacionesService } from '../../../../../services/operaciones.service';

@Component({
  selector: 'app-linea.principal',
  imports: [CommonModule, FormsModule, SchedulerComponent],
  templateUrl: './linea.principal.component.html',
  styleUrl: './linea.principal.component.css'
})
export class LineaPrincipalComponent {

  // Variables para el filtro de fechas
  fechaInicio: string = '';
  fechaFin: string = '';
  turnoSeleccionado: string = '';
  turnoAplicado: string = '';

  estadosProceso: any[] = [];

  //DATASSSSSSS
  operacionesOriginalHorizontal: OperacionBase[] = [];
  operacionesFiltradasHorizontal: OperacionBase[] = [];

  operacionesOriginalLargo: OperacionBase[] = [];
  operacionesFiltradasLargo: OperacionBase[] = [];

  operacionesFiltradasEmpernador: OperacionBase[] = [];
  operacionesOriginalEmpernador: OperacionBase[] = [];

  operacionesOriginalScoops: OperacionBase[] = [];
  operacionesFiltradasScoops: OperacionBase[] = [];

  ganttHorizontal: any[] = [];
  ganttLargo: any[] = [];
  ganttEmpernador: any[] = [];
  ganttScoops: any[] = [];

  // Mapas separados para cada proceso
  mapaEstadosHorizontal: Map<string, any> = new Map();
  mapaEstadosLargo: Map<string, any> = new Map();
  mapaEstadosEmpernador: Map<string, any> = new Map();
  mapaEstadosScoop: Map<string, any> = new Map();


  constructor(
    private estadoService: EstadoService,
    private operacionesService: OperacionesService
  ) {}

  ngOnInit(): void {
    const hoy = this.getFechaHoy();
    this.fechaInicio = hoy;
    this.fechaFin = hoy;
    this.turnoSeleccionado = this.getTurnoActual();
    
    // Cargar estados para ambos procesos
    this.obtenerTodosLosEstados();
  }

  //OPERACIONES--------------------
  cargarOperacionesHorizontal() { 
    const tipo = 'tal_horizontal';
    this.operacionesService.getAllAprobados(tipo).subscribe({
      next: (resp) => {
        this.operacionesOriginalHorizontal = resp.data;
        this.aplicarFiltro();
      }
    });
  }

  cargarOperacionesLargo() { 
    const tipo = 'tal_largo';
    this.operacionesService.getAllAprobados(tipo).subscribe({
      next: (resp) => {
        this.operacionesOriginalLargo = resp.data;
        this.aplicarFiltro();
      }
    });
  }

  cargarOperacionesEmpernador() { 
    const tipo = 'empernador';
    this.operacionesService.getAllAprobados(tipo).subscribe({
      next: (resp) => {
        this.operacionesOriginalEmpernador = resp.data;
        this.aplicarFiltro();
      }
    });
  }

  cargarOperacionesScoop() { 
    const tipo = 'carguio';
    this.operacionesService.getAllAprobados(tipo).subscribe({
      next: (resp) => {
        this.operacionesOriginalScoops = resp.data;
        this.aplicarFiltro();
      }
    });
  }


  //----------------------------------
  obtenerTodosLosEstados() {
    this.estadoService.getEstados()
      .subscribe({
        next: (data) => {
          this.estadosProceso = data;
          console.log('Todos los estados:', data);
          
          // Separar los estados por proceso
          this.separarEstadosPorProceso();
          
          // Cargar las operaciones después de tener los estados
          this.cargarOperacionesHorizontal();
          this.cargarOperacionesLargo();
          this.cargarOperacionesEmpernador();
          this.cargarOperacionesScoop();
        },
        error: (err) => {
          console.error('Error al traer estados', err);
        }
      });
  }

  /**
   * Separa los estados según el proceso al que pertenecen
   */
  separarEstadosPorProceso() {
    this.mapaEstadosHorizontal.clear();
    this.mapaEstadosLargo.clear();
    this.mapaEstadosEmpernador.clear();

    this.estadosProceso.forEach(estado => {
      const codigo = String(estado.codigo || '').trim();
      const proceso = estado.proceso || '';
      
      // Clasificar según el proceso
      if (proceso === 'PERFORACIÓN HORIZONTAL') {
        this.mapaEstadosHorizontal.set(codigo, estado);
      } else if (proceso === 'PERFORACIÓN TALADROS LARGOS') {
        this.mapaEstadosLargo.set(codigo, estado);
      }else if (proceso === 'EMPERNADOR') {
        this.mapaEstadosEmpernador.set(codigo, estado);
      }else if (proceso === 'SCOOPTRAM') {
        this.mapaEstadosScoop.set(codigo, estado);
      }
    });

  //   console.log('📊 Estados HORIZONTAL:', this.mapaEstadosHorizontal.size);
  //   console.log('📊 Estados LARGO:', this.mapaEstadosLargo.size);
  //   console.log('Estados Horizontal:', Array.from(this.mapaEstadosHorizontal.values()));
  //   console.log('Estados Largo:', Array.from(this.mapaEstadosLargo.values()));
   }

  private getTurnoActual(): string {
    const hora = new Date().getHours();
    if (hora >= 7 && hora < 19) {
      return 'DÍA';
    }
    return 'NOCHE';
  }

  private getFechaHoy(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // =========================================
  // 🔥 FILTRO POR FECHA
  // =========================================
  aplicarFiltro() {
    this.turnoAplicado = this.turnoSeleccionado;

    // 🔹 HORIZONTAL
    this.operacionesFiltradasHorizontal = this.operacionesOriginalHorizontal.filter(op => {
      if (this.fechaInicio && op.fecha < this.fechaInicio) return false;
      if (this.fechaFin && op.fecha > this.fechaFin) return false;
      if (this.turnoAplicado && op.turno !== this.turnoAplicado) return false;
      return true;
    });

    // 🔹 LARGO
    this.operacionesFiltradasLargo = this.operacionesOriginalLargo.filter(op => {
      if (this.fechaInicio && op.fecha < this.fechaInicio) return false;
      if (this.fechaFin && op.fecha > this.fechaFin) return false;
      if (this.turnoAplicado && op.turno !== this.turnoAplicado) return false;
      return true;
    });

    // 🔹 EMPERNADOR
    this.operacionesFiltradasEmpernador = this.operacionesOriginalEmpernador.filter(op => {
      if (this.fechaInicio && op.fecha < this.fechaInicio) return false;
      if (this.fechaFin && op.fecha > this.fechaFin) return false;
      if (this.turnoAplicado && op.turno !== this.turnoAplicado) return false;
      return true;
    });

    // 🔹 SCOOPS
    this.operacionesFiltradasScoops = this.operacionesOriginalScoops.filter(op => {
      if (this.fechaInicio && op.fecha < this.fechaInicio) return false;
      if (this.fechaFin && op.fecha > this.fechaFin) return false;
      if (this.turnoAplicado && op.turno !== this.turnoAplicado) return false;
      return true;
    });

    this.procesarTodo();
  }

  quitarFiltro() {
    // 🔹 Restaurar datos originales
    this.operacionesFiltradasHorizontal = [...this.operacionesOriginalHorizontal];
    this.operacionesFiltradasLargo = [...this.operacionesOriginalLargo];
    this.operacionesFiltradasEmpernador = [...this.operacionesOriginalEmpernador];
    this.operacionesFiltradasScoops = [...this.operacionesOriginalScoops];

    // 🔹 Limpiar filtros
    this.fechaInicio = '';
    this.fechaFin = '';
    this.turnoAplicado = '';
    this.turnoSeleccionado = '';

    this.procesarTodo();
  }

  procesarTodo() {
    // Pasar el mapa correspondiente a cada construcción
    this.ganttHorizontal = this.construirGanttData(
      this.operacionesFiltradasHorizontal, 
      this.mapaEstadosHorizontal  // Solo estados de horizontal
    );
    
    this.ganttLargo = this.construirGanttData(
      this.operacionesFiltradasLargo, 
      this.mapaEstadosLargo  // Solo estados de largo
    );

    this.ganttEmpernador = this.construirGanttData(
      this.operacionesFiltradasEmpernador, 
      this.mapaEstadosEmpernador  // Solo estados de largo
    );

    this.ganttScoops = this.construirGanttData(
      this.operacionesFiltradasScoops, 
      this.mapaEstadosScoop  // Solo estados de largo
    );
  }

  //GANTT - Ahora recibe el mapa de estados específico
  private construirGanttData(data: OperacionBase[], mapaEstados: Map<string, any>): any[] {
    const fechaMap: Record<string, any> = {};

    data.forEach(op => {
      const fecha = op.fecha || 'SIN_FECHA';
      const turno = op.turno || 'SIN_TURNO';
      const equipoCodigo = `${op.equipo} - ${op.n_equipo}`;
      const key = `${fecha}|${turno}`;

      if (!fechaMap[key]) {
        fechaMap[key] = {
          fecha,
          turno,
          equipos: {}
        };
      }

      if (!fechaMap[key].equipos[equipoCodigo]) {
        fechaMap[key].equipos[equipoCodigo] = {};
      }

      const registros = Array.isArray(op.registros) ? op.registros : [];

      registros.forEach((reg: any) => {
        const estado = (reg.estado || 'SIN ESTADO').toUpperCase().trim();
        const codigo = String(reg.codigo || '').trim();

        if (!reg.hora_inicio || !reg.hora_final) return;

        // Usar el mapa de estados específico del proceso
        const estadoMatch = mapaEstados.get(codigo);
        const labor = estadoMatch?.estado_principal || estado;

        if (!fechaMap[key].equipos[equipoCodigo][labor]) {
          fechaMap[key].equipos[equipoCodigo][labor] = [];
        }

        fechaMap[key].equipos[equipoCodigo][labor].push({
          start: reg.hora_inicio,
          end: reg.hora_final,
          estado,
          description: codigo,
          tipo_estado: estadoMatch?.tipo_estado || null,
          categoria: estadoMatch?.categoria || null,
          estado_principal: estadoMatch?.estado_principal || null,
          proceso: estadoMatch?.proceso || null  // Agregado para debug
        });
      });
    });

    return Object.values(fechaMap).map((item: any) => ({
      fecha: item.fecha,
      turno: item.turno,
      groups: Object.entries(item.equipos).map(
        ([equipoCodigo, labores]: any) => ({
          equipoCodigo,
          rows: Object.entries(labores).map(
            ([labor, tasks]: any) => ({
              labor,
              tasks: tasks.sort((a: any, b: any) =>
                a.start.localeCompare(b.start)
              )
            })
          )
        })
      )
    }));
  }
}