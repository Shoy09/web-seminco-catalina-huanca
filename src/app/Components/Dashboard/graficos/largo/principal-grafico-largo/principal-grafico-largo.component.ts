import { Component, OnInit } from '@angular/core';
import { FechasPlanMensualService } from '../../../../../services/fechas-plan-mensual.service';
import { OperacionesService } from '../../../../../services/operaciones.service';
import { OperacionBase } from '../../../../../models/OperacionBase.models';
import { PlanMensual } from '../../../../../models/plan-mensual.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResumenComponent } from '../Graficos components/Hoja 1/resumen/resumen.component';
import { DisparosEquipoComponent } from '../Graficos components/Hoja 1/disparos-equipo/disparos-equipo.component';
import { DemorasOperativasComponent } from '../Graficos components/Hoja 1/demoras-operativas/demoras-operativas.component';
import { HorasNoOperativasComponent } from '../Graficos components/Hoja 1/horas-no-operativas/horas-no-operativas.component';
import { HorasDeMantenimientoComponent } from '../Graficos components/Hoja 1/horas-de-mantenimiento/horas-de-mantenimiento.component';
import { MetrosPerforadosDisparoComponent } from '../Graficos components/Hoja 1/metros-perforados-disparo/metros-perforados-disparo.component';
import { PerforadoEquipoComponent } from '../Graficos components/Hoja 1/perforado-equipo/perforado-equipo.component';
import { MhrEquipoComponent } from '../Graficos components/Hoja 1/mhr-equipo/mhr-equipo.component';
import { HorometrosJumbosComponent } from '../Graficos components/Hoja 1/horometros-jumbos/horometros-jumbos.component';
import { TotalHorometrosComponent } from '../Graficos components/Hoja 1/total-horometros/total-horometros.component';
import { HorasPrimeraPerforacionComponent } from '../Graficos components/Hoja 2/horas-primera-perforacion/horas-primera-perforacion.component';
import { AvanceFaseComponent } from '../Graficos components/Hoja 1/avance-fase/avance-fase.component';
import { DetallePerforacionComponent } from '../Graficos components/Hoja 2/detalle-perforacion/detalle-perforacion.component';
import { DisparosTipoPerforacionComponent } from '../Graficos components/Hoja 2/disparos-tipo-perforacion/disparos-tipo-perforacion.component';
import { DetalleDisparosComponent } from '../Graficos components/Hoja 2/detalle-disparos/detalle-disparos.component';
import { MejoresOperadoresComponent } from '../Graficos components/Hoja 2/mejores-operadores/mejores-operadores.component';
import { RankingOperadorComponent } from '../Graficos components/Hoja 2/ranking-operador/ranking-operador.component';
import { ObservacionesComponent } from '../Graficos components/Hoja 2/observaciones/observaciones.component';
import { ScatterTurnosComponent } from '../Graficos components/Hoja 2/scatter-turnos/scatter-turnos.component';
import { ScatterTurnosNocheComponent } from '../Graficos components/Hoja 2/scatter-turnos-noche/scatter-turnos-noche.component';
import { RendimientoEquipoComponent } from '../Graficos components/Hoja 1/rendimiento-equipo/rendimiento-equipo.component';
import { PlanProduccionService } from '../../../../../services/plan-produccion.service';
import { PlanProduccion } from '../../../../../models/plan_produccion.model';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SchedulerComponent } from '../../Linea de tiempo/scheduler/scheduler.component';
import { EstadoService } from '../../../../../services/estado.service';

@Component({
  selector: 'app-principal-grafico-largo',
  imports: [
    CommonModule,
    FormsModule,
    ResumenComponent,
    DisparosEquipoComponent,
    DemorasOperativasComponent,
    HorasNoOperativasComponent,
    HorasDeMantenimientoComponent,
    MetrosPerforadosDisparoComponent,
    PerforadoEquipoComponent,
    MhrEquipoComponent,
    HorometrosJumbosComponent,
    TotalHorometrosComponent,
    HorasPrimeraPerforacionComponent,
    AvanceFaseComponent,
    DetallePerforacionComponent,
    DetalleDisparosComponent,
    MejoresOperadoresComponent,
    RankingOperadorComponent,
    ObservacionesComponent,
    ScatterTurnosComponent,
    ScatterTurnosNocheComponent,
    RendimientoEquipoComponent,
    SchedulerComponent,
  ],
  templateUrl: './principal-grafico-largo.component.html',
  styleUrl: './principal-grafico-largo.component.css',
})
export class PrincipalGraficoLargoComponent implements OnInit {
  anio!: number;
  mes!: string;

  // DATA ORIGINAL (sin filtrar)
  operacionesOriginal: OperacionBase[] = [];
  operacionesFiltradas: OperacionBase[] = [];
  planesMensuales: PlanProduccion[] = [];

  // 🔥 DATA FINAL PARA LOS GRAFICOS
  dataAvanceFase: any[] = [];
  dataDisparosEquipo: any[] = []; // 👈 NUEVO
  dataDisparosDia: any[] = [];
  dataIndicadoresEquipo: any[] = [];
  dataDemorasOperativas: any[] = [];
  dataHorasNoOperativas: any[] = [];
  dataHorasMantenimiento: any[] = [];
  dataMetrosDisparoFR: any[] = [];
  dataMhrEquipo: any[] = [];
  dataHorometrosJumbos: any[] = [];
  dataPromedioPrimeraPerfDiaFR: any[] = [];
  dataPromedioPrimeraPerfDiaFRPorFecha: any[] = [];
  dataPromedioUltimaPerfDiaFR: any[] = [];
  dataPromedioUltimaPerfDiaFRPorFecha: any[] = [];
  dataProcesoLaborFR: any[] = [];
  dataPercusionConMetrosJumbos: any[] = [];
  dataFrPorOperadorTurno: any[] = [];
  dataLaborFRDetallado: any[] = [];
  dataTipoPerforacion: any[] = [];
  datadetalleDisparos: any[] = [];
  dataHorasNumericas: any[] = [];

  // Variables para el filtro de fechas
  fechaInicio: string = '';
  fechaFin: string = '';
  turnoSeleccionado: string = '';
  turnoAplicado: string = '';
  resumen = {
    conteoEquipos: 0,
    metrosPorDisparo: 0,
    nDisparosTL: 0,
    totalMetros: 0,
  };

  actividadesData = [
    // J-14
    { recurso: 'J-14', actividad: 'DES', inicio: 12, fin: 16, label: '' },
    {
      recurso: 'J-14',
      actividad: 'FRENTE COMPLETO',
      inicio: 7,
      fin: 12,
      label: '',
    },
    {
      recurso: 'J-14',
      actividad: 'FRENTE COMPLETO',
      inicio: 16,
      fin: 19,
      label: '',
    },

    // J-19
    {
      recurso: 'J-19',
      actividad: 'FRENTE COMPLETO',
      inicio: 7,
      fin: 10,
      label: '',
    },
    { recurso: 'J-19', actividad: 'BREASTING', inicio: 10, fin: 14, label: '' },
    {
      recurso: 'J-19',
      actividad: 'FRENTE COMPLETO',
      inicio: 14,
      fin: 19,
      label: '',
    },

    // J-20
    {
      recurso: 'J-20',
      actividad: 'DES',
      inicio: 7,
      fin: 9,
      label: 'bombeo de agua',
    },
    {
      recurso: 'J-20',
      actividad: 'FRENTE COMPLETO',
      inicio: 9,
      fin: 13,
      label: '',
    },
    { recurso: 'J-20', actividad: 'BREASTING', inicio: 13, fin: 17, label: '' },
    {
      recurso: 'J-20',
      actividad: 'FRENTE COMPLETO',
      inicio: 17,
      fin: 19,
      label: '',
    },
  ];
  estadosProceso: any[] = [];
  cargandoPDF = false;
  ganttData: any[] = [];
vistaPrincipal: boolean = true;

  constructor(
    private planMensualService: PlanProduccionService,
    private fechasPlanMensualService: FechasPlanMensualService,
    private operacionesService: OperacionesService,
    private estadoService: EstadoService
  ) {}

  ngOnInit(): void {
    this.obtenerUltimaFecha();

    // 🔥 SETEO AUTOMÁTICO
    const hoy = this.getFechaHoy();
    this.fechaInicio = hoy;
    this.fechaFin = hoy;
    this.turnoSeleccionado = this.getTurnoActual();

    this.cargarOperaciones();
    this.obtenerEstadosPorProceso('PERFORACIÓN TALADROS LARGOS');
  }

  obtenerEstadosPorProceso(proceso: string) {
  this.estadoService.getEstadosByProceso(proceso)
    .subscribe({
      next: (data) => {
        this.estadosProceso = data;
       //console.log('Estados por proceso:', data);

        // 🔥 CLAVE
        this.construirMapaEstados();
      },
      error: (err) => {
        console.error('Error al traer estados por proceso', err);
      }
    });
}

toggleVista() {
  this.vistaPrincipal = !this.vistaPrincipal;
}

construirMapaEstados() {
  this.mapaEstados.clear();

  this.estadosProceso.forEach(e => {
    const codigo = String(e.codigo || '').trim();
    this.mapaEstados.set(codigo, e);
  });

 //console.log('🧩 Mapa de estados construido:', this.mapaEstados.size);
}

mapaEstados: Map<string, any> = new Map();

  private getTurnoActual(): string {
    const hora = new Date().getHours();

    // Día: 07:00 - 18:59
    if (hora >= 7 && hora < 19) {
      return 'DÍA';
    }

    // Noche: 19:00 - 06:59
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
  // 🔥 OPERACIONES
  // =========================================
  cargarOperaciones() {
    const tipo = 'tal_largo';

    this.operacionesService.getAllAprobados(tipo).subscribe({
      next: (resp) => {
        this.operacionesOriginal = resp.data;

        console.log('🔥 DATA OPERACIONES:', this.operacionesOriginal);

        // 🔥 SOLO ESTO
        this.aplicarFiltro();
      },
      error: (err) => {
        //console.error('❌ Error al obtener operaciones:', err);
      },
    });
  }

  // =========================================
  // 🔥 FILTRO POR FECHA
  // =========================================
  aplicarFiltro() {
    this.turnoAplicado = this.turnoSeleccionado; // 🔥 CLAVE

    this.operacionesFiltradas = this.operacionesOriginal.filter((op) => {
      if (this.fechaInicio && op.fecha < this.fechaInicio) return false;
      if (this.fechaFin && op.fecha > this.fechaFin) return false;

      if (this.turnoAplicado && op.turno !== this.turnoAplicado) return false;

      return true;
    });
    console.log('🔥 OPERACIONES FILTRADAS:', this.operacionesFiltradas);

    this.procesarTodo();
  }

  quitarFiltro() {
    this.operacionesFiltradas = [...this.operacionesOriginal];
    this.fechaInicio = '';
    this.fechaFin = '';
    this.turnoAplicado = '';
    this.turnoSeleccionado = '';

    this.procesarTodo();
  }

  async generarPDF() {
    this.cargandoPDF = true;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const todasLasPaginas = document.querySelectorAll('[data-page]');
      const elementosPorPagina = new Map<number, Element[]>();

      todasLasPaginas.forEach((el) => {
        const page = parseInt(el.getAttribute('data-page') || '1');
        if (!elementosPorPagina.has(page)) {
          elementosPorPagina.set(page, []);
        }
        elementosPorPagina.get(page)!.push(el);
      });

      for (const [pageNum, elementos] of Array.from(
        elementosPorPagina.entries(),
      )) {
        if (pageNum > 1) pdf.addPage();

        todasLasPaginas.forEach((el) => {
          (el as HTMLElement).style.display = 'none';
        });

        elementos.forEach((el) => {
          (el as HTMLElement).style.display = 'block';
        });

        await this.delay(300);

        const container = document.querySelector(
          '.graficos-container',
        ) as HTMLElement;

        if (container) {
          const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
          });

          const imgData = canvas.toDataURL('image/png');
          const imgHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
        }
      }

      todasLasPaginas.forEach((el) => {
        (el as HTMLElement).style.display = '';
      });

      pdf.save('grafico_completo_tal_largo.pdf');
    } finally {
      this.cargandoPDF = false;
    }
  }
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // =========================================
  // 🔥 PLAN
  // =========================================
  obtenerUltimaFecha(): void {
    this.fechasPlanMensualService.getUltimaFecha().subscribe({
      next: (ultimaFecha) => {
        const anio: number | undefined = ultimaFecha.fecha_ingreso;
        const mes: string = ultimaFecha.mes;

        if (anio !== undefined) {
          this.anio = anio;
          this.mes = mes.trim().toUpperCase();

          this.obtenerPlanesMensuales(this.anio, this.mes);
        }
      },
      error: (error) => {
        //console.error('❌ Error al obtener la última fecha:', error);
      },
    });
  }

  obtenerPlanesMensuales(anio: number, mes: string): void {
    this.planMensualService.getPlanMensualByYearAndMonth(anio, mes).subscribe({
      next: (planes) => {
        this.planesMensuales = planes;
        console.log('🔥 PLANES MENSUALES:', this.planesMensuales);

        this.procesarTodo();
      },
      error: (error) => {
        //console.error('❌ Error al obtener planes mensuales:', error);
      },
    });
  }

  // =========================================
  // 🔥 PROCESAMIENTO TOTAL
  // =========================================
  procesarTodo() {
    if (!this.operacionesFiltradas.length || !this.planesMensuales.length)
      return;

    this.dataAvanceFase = this.procesarAvanceFase();
    this.dataDisparosEquipo = this.procesarDisparosEquipo(); // 👈 NUEVO
    this.dataDisparosDia = this.procesarDisparosDia();
    this.dataIndicadoresEquipo = this.procesarIndicadoresEquipo();
    this.dataDemorasOperativas = this.procesarDemorasOperativas();
    this.dataHorasNoOperativas = this.procesarHorasNoOperativas();
    this.dataHorasMantenimiento = this.procesarHorasMantenimiento();

    this.dataMetrosDisparoFR = this.procesarMetrosPorDisparoFR();
    this.dataMhrEquipo = this.procesarMhrEquipo();
    this.dataHorometrosJumbos = this.procesarHorometrosJumbos();
    this.dataPromedioPrimeraPerfDiaFR = this.procesarPromedioPrimeraPerfDiaFR();
    this.dataPromedioPrimeraPerfDiaFRPorFecha =
      this.procesarPromedioPrimeraPerfDiaFRPorFecha();
    this.dataPromedioUltimaPerfDiaFR = this.procesarPromedioUltimaPerfDiaFR();
    this.dataPromedioUltimaPerfDiaFRPorFecha =
      this.procesarPromedioUltimaPerfDiaFRPorFecha();
    this.dataProcesoLaborFR = this.procesarLaborFR();
    this.dataPercusionConMetrosJumbos = this.procesarPercusionConMetrosJumbos();
    this.dataFrPorOperadorTurno = this.procesarFrPorOperadorTurno();
    this.dataLaborFRDetallado = this.procesarLaborFRDetallado();
    this.dataTipoPerforacion = this.procesarTipoPerforacion();
    this.datadetalleDisparos = this.procesarDataPerforacionDetallada();
    this.dataHorasNumericas = this.procesarHorasNumericas();
    this.procesarResumen();
    this.construirGanttDataNuevo();

    //console.log('🔥 DATA DISPAROS EQUIPO:', this.dataDisparosEquipo);
  }

  // =========================================
  // 🔥 CALCULO DE FRENTES COMPLETOS
  // =========================================
  contarFrentesCompletos(registrosArray: any[]): number {
    if (!Array.isArray(registrosArray)) return 0;

    let contador = 0;

    for (const registro of registrosArray) {
      if (registro.estado !== 'OPERATIVO') continue;

      const operacion = registro.operacion || registro;

      const tipo = (operacion.tipo_perforacion || '').toUpperCase();

      if (tipo === 'PRODUCCIÓN' || tipo === 'SLOT') {
        contador++;
      }
    }

    return contador;
  }

  // =========================================
  // 🔥 OBTENER SECCION DEL PLAN
  // =========================================

  // =========================================
  // 🔥 DATA PARA GRAFICO DISPAROS EQUIPO
  // =========================================
  procesarDisparosEquipo() {
    const mapaDisparos = new Map<
      string,
      {
        modelo_equipo: string;
        seccion_labor: string; // 👈 Cambiado de 'seccion' a 'seccion_labor'
        seccion: string;
        n_frentes: number;
      }
    >();

    this.operacionesFiltradas.forEach((op) => {
      try {
        const registrosArray = op.registros;

        if (Array.isArray(registrosArray) && registrosArray.length > 0) {
          // Obtener área del primer registro
          const primerRegistro = registrosArray[0];
          const area =
            primerRegistro?.operacion?.area || primerRegistro?.area || '';

          // Obtener sección del plan

          // Contar frentes completos
          const nFrentes = this.contarFrentesCompletos(registrosArray);

          // Usar modelo_equipo como clave única
          const key = op.modelo_equipo || 'SIN_EQUIPO';

          if (mapaDisparos.has(key)) {
            // Acumular frentes si ya existe
            const existing = mapaDisparos.get(key)!;
            existing.n_frentes += nFrentes;
          } else {
            // Crear nueva entrada
            mapaDisparos.set(key, {
              modelo_equipo: op.modelo_equipo || 'SIN_EQUIPO',
              seccion: op.seccion || 'SIN_SECCION', // 👈 Cambiado a 'seccion'
              seccion_labor: 'sin seccion', // 👈 Cambiado a 'seccion_labor'
              n_frentes: nFrentes,
            });
          }
        }
      } catch (error) {
        //console.error('Error procesando operación para disparos equipo:', op.id, error);
      }
    });

    // Convertir el mapa a un array
    return Array.from(mapaDisparos.values());
  }

  // =========================================
  // 🔥 DISPARO POR DIA
  // =========================================

  procesarDisparosDia() {
    const mapa = new Map<string, number>();

    this.operacionesFiltradas.forEach((op) => {
      try {
        const registrosArray = op.registros;

        if (Array.isArray(registrosArray) && registrosArray.length > 0) {
          // 🔥 Fecha directa de la operación
          const fecha = op.fecha || 'SIN_FECHA';

          // 🔥 Contar frentes completos (igual que antes)
          const nFrentes = this.contarFrentesCompletos(registrosArray);

          if (mapa.has(fecha)) {
            mapa.set(fecha, mapa.get(fecha)! + nFrentes);
          } else {
            mapa.set(fecha, nFrentes);
          }
        }
      } catch (error) {
        //console.error('Error procesando operación para disparos día:', op.id, error);
      }
    });

    // 🔥 Convertir a array
    return (
      Array.from(mapa.entries())
        .map(([fecha, n_frentes]) => ({
          fecha,
          n_frentes,
        }))
        // 🔥 OPCIONAL: ordenar por fecha
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
    );
  }

  // =========================================
  // 🔥 CALCULO METROS
  // =========================================
  calcularMetrosPerforados(registrosArray: any[]): number {
    if (!Array.isArray(registrosArray)) {
      return 0;
    }

    let totalMetros = 0;

    for (const registro of registrosArray) {
      if (registro.estado !== 'OPERATIVO') {
        continue;
      }

      try {
        const op = registro.operacion || registro;

        const prod = Number(op.metros_perforados_produccion) || 0;
        const rim = Number(op.metros_perforados_rimados) || 0;
        const rep = Number(op.metros_perforados_repaso) || 0;
        const ali = Number(op.metros_perforados_alivio) || 0;

        const metrosRegistro = prod + rim + rep + ali;

        totalMetros += metrosRegistro;
      } catch (error) {
        console.error(`Error en registro ${registro.numero}:`, error);
      }
    }

    return totalMetros;
  }

  // =========================================
  // 🔥 FILTRAR FASES DEL PLAN
  // =========================================
  private crearMapaPlanes(): Map<string, string> {
    const mapa = new Map<string, string>();

    this.planesMensuales.forEach((p) => {
      const labor_fr = this.construirLaborFR(p.tipo_labor, p.labor, p.ala);

      if (!p.area) return;

      // clave: labor_fr → valor: area
      mapa.set(labor_fr, p.area);
    });

    return mapa;
  }

  // =========================================
  // 🔥 DATA PARA GRAFICO AVANCE FASE
  // =========================================
  procesarAvanceFase() {
    const mapaArea = this.crearMapaPlanes();

    const result: any[] = [];

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      registrosArray.forEach((r) => {
        const operacion = r?.operacion || {};

        const labor_fr = this.construirLaborFR(
          operacion?.tipo_labor,
          operacion?.labor,
          operacion?.ala,
        );

        // 🔥 JOIN con plan
        const area = mapaArea.get(labor_fr);

        if (!area) return; // solo los válidos del plan

        const metros = this.calcularMetrosPerforados([r]);

        result.push({
          modelo_equipo: op.modelo_equipo,
          area,
          labor_fr,
          metros,
        });
      });
    });

    return result;
  }

  private construirLaborFR(tipo_labor: any, labor: any, ala: any): string {
    return `${tipo_labor ?? ''}${labor ?? ''}${ala ?? ''}`.trim();
  }

  // =========================================
  // SEGUNDO GRAFICO - RESUMEN
  // =========================================
  procesarResumen() {
    let totalMetros = 0;
    let nDisparosTL = 0;
    const equiposSet = new Set<string>();

    this.operacionesFiltradas.forEach((op) => {
      if (op.modelo_equipo) {
        equiposSet.add(op.modelo_equipo);
      }

      try {
        const registrosArray = op.registros;

        if (Array.isArray(registrosArray)) {
          for (const registro of registrosArray) {
            if (registro.estado !== 'OPERATIVO') continue;

            const operacion = registro.operacion || registro;

            // 🔹 SUMA DE METROS (nuevo modelo)
            const prod = Number(operacion.metros_perforados_produccion) || 0;
            const rim = Number(operacion.metros_perforados_rimados) || 0;
            const rep = Number(operacion.metros_perforados_repaso) || 0;
            const ali = Number(operacion.metros_perforados_alivio) || 0;

            const metrosRegistro = prod + rim + rep + ali;
            totalMetros += metrosRegistro;

            // 🔹 CONTADOR DE DISPAROS TL
            if (
              operacion.tipo_perforacion === 'PRODUCCIÓN' ||
              operacion.tipo_perforacion === 'SLOT'
            ) {
              nDisparosTL++;
            }
          }
        }
      } catch (error) {
        //console.error('Error procesando operación:', op.id, error);
      }
    });

    const metrosPorDisparo = nDisparosTL > 0 ? totalMetros / nDisparosTL : 0;

    this.resumen = {
      conteoEquipos: equiposSet.size,
      metrosPorDisparo: Number(metrosPorDisparo.toFixed(0)),
      nDisparosTL,
      totalMetros: Number(totalMetros.toFixed(0)),
    };

    //console.log('📊 RESUMEN FINAL:', this.resumen);
  }

  //=========================================
  // 🔥 GRAFICO 5
  // =========================================

  procesarIndicadoresEquipo() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      try {
        const registros = op.registros;
        if (!Array.isArray(registros)) return;

        const key = op.modelo_equipo || 'SIN_EQUIPO';

        const mantenimiento = this.calcularDuracionPorEstado(
          registros,
          'MANTENIMIENTO',
        );
        const demoras206 = this.calcularDuracionPorEstado(
          registros,
          'DEMORA',
          '206',
        );

        const horasMantenimiento = mantenimiento + demoras206;

        const horasTrabajadas = this.calcularHorasTrabajadas(op);

        if (mapa.has(key)) {
          const acc = mapa.get(key);

          acc.n_operaciones += 1;
          acc.horas_mantenimiento += horasMantenimiento;
          acc.horas_trabajadas += horasTrabajadas;
        } else {
          mapa.set(key, {
            modelo_equipo: key,
            seccion: op.seccion || 'SIN_SECCION',

            n_operaciones: 1,
            horas_mantenimiento: horasMantenimiento,
            horas_trabajadas: horasTrabajadas,
          });
        }
      } catch (error) {}
    });

    return Array.from(mapa.values()).map((item) => {
      const horasProgramadas = item.n_operaciones * 10;

      // ✅ DM_FR (como DAX)
      const horasMantenimientoAjustado_dm =
        item.horas_mantenimiento === 0
          ? 0.5 * item.n_operaciones
          : item.horas_mantenimiento;

      const dm_fr =
        horasProgramadas > 0
          ? (horasProgramadas - horasMantenimientoAjustado_dm) /
            horasProgramadas
          : 0;

      // ✅ UTI_FR (como DAX)
      const horasMantenimientoAjustado_uti =
        item.horas_mantenimiento === 0 ? 0.5 : item.horas_mantenimiento;

      const denominador = horasProgramadas - horasMantenimientoAjustado_uti;

      const uti_fr = denominador > 0 ? item.horas_trabajadas / denominador : 0;

      return {
        modelo_equipo: item.modelo_equipo,
        seccion: item.seccion,

        DM_FR: Number(dm_fr.toFixed(3)),
        UTI_FR: Number(uti_fr.toFixed(3)),
      };
    });
  }

  calcularDuracionHoras(horaInicio: string, horaFinal: string): number {
    if (!horaInicio || !horaFinal) return 0;

    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaFinal.split(':').map(Number);

    const inicio = h1 * 60 + m1;
    const fin = h2 * 60 + m2;

    return (fin - inicio) / 60; // en horas
  }

  calcularDuracionPorEstado(
    registros: any[],
    estadoBuscado: string,
    codigo?: string,
  ): number {
    let total = 0;

    for (const r of registros) {
      if (r.estado === estadoBuscado) {
        if (codigo && r.codigo !== codigo) continue;

        total += this.calcularDuracionHoras(r.hora_inicio, r.hora_final);
      }
    }

    return total;
  }

  calcularHorasTrabajadas(op: any): number {
    const diesel = op.horometros?.diesel;
    const electrico = op.horometros?.electrico;

    const difDiesel = diesel ? diesel.final - diesel.inicio : 0;
    const difElectrico = electrico ? electrico.final - electrico.inicio : 0;

    return difDiesel + difElectrico;
  }

  // =========================================
  // Grafico 6
  // =========================================
  procesarDemorasOperativas() {
    const mapa = new Map<string, any>();
    const tiposEstados = this.getTiposEstadosMap();
    const equiposUnicos = new Set<string>();

    // 🔹 RECORRER DATA
    this.operacionesFiltradas.forEach((op) => {
      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      // ✅ DISTINCTCOUNT (como DAX: TODOS los equipos)
      if (op.modelo_equipo) {
        equiposUnicos.add(op.modelo_equipo);
      }

      registros.forEach((r) => {
        const tipo = tiposEstados[r.codigo];
        if (!tipo) return;

        const duracion = this.calcularDuracionHoras(
          r.hora_inicio,
          r.hora_final,
        );

        if (!duracion || duracion <= 0) return;

        if (mapa.has(tipo)) {
          mapa.get(tipo).horas += duracion;
        } else {
          mapa.set(tipo, {
            tipo_estado: tipo,
            horas: duracion,
          });
        }
      });
    });

    const nEquipos = equiposUnicos.size;

    // 🔹 BASE (equivalente a SUMX + DIVIDE)
    let resultado = Array.from(mapa.values())
      .filter((x) => x.horas > 0)
      .map((x) => ({
        tipo_estado: x.tipo_estado,
        horas: x.horas,
        promedio: nEquipos > 0 ? x.horas / nEquipos : 0,
      }));

    // 🔥 ORDEN DESC (RANKX DESC)
    resultado.sort((a, b) => b.horas - a.horas);

    // 🔥 RANK DENSE (igual que DAX)
    let rank = 1;
    resultado = resultado.map((item, index, arr) => {
      if (index > 0 && item.horas < arr[index - 1].horas) {
        rank = index + 1;
      }

      return {
        ...item,
        rank,
      };
    });

    // 🔥 ACUMULADO (Tiempo_Acu_FR)
    let acumulado = 0;
    const totalHoras = resultado.reduce((sum, x) => sum + x.horas, 0);

    resultado = resultado.map((item) => {
      acumulado += item.horas;

      return {
        ...item,
        tiempo_acu: acumulado,
        tiempo_acu_pct: totalHoras > 0 ? acumulado / totalHoras : 0,
      };
    });

    return resultado;
  }

  getTiposEstadosMap(): Record<string, string> {
    return {
      '201': 'Falta de Operador',
      '202': 'MpL - mantenimiento preventivo de labor',
      '203': 'Ingreso - Salida',
      '204': 'Charla',
      '205': 'Traslado al equipo',
      '207': 'Refrigerio',
      '208': 'Traslado de equipo',
      '211': 'Instalación de equipo',
    };
  }

  // =========================================
  //GRAFICO 7
  // =========================================

  procesarHorasNoOperativas() {
    const mapa = new Map<string, any>();
    const tiposEstados = this.getTiposEstadosMapNoOperativa();
    const equiposUnicos = new Set<string>();

    // 🔹 RECORRER DATA
    this.operacionesFiltradas.forEach((op) => {
      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      // ✅ DISTINCTCOUNT (como DAX: TODOS los equipos)
      if (op.modelo_equipo) {
        equiposUnicos.add(op.modelo_equipo);
      }

      registros.forEach((r) => {
        const tipo = tiposEstados[r.codigo];
        if (!tipo) return;

        const duracion = this.calcularDuracionHoras(
          r.hora_inicio,
          r.hora_final,
        );

        if (!duracion || duracion <= 0) return;

        if (mapa.has(tipo)) {
          mapa.get(tipo).horas += duracion;
        } else {
          mapa.set(tipo, {
            tipo_estado: tipo,
            horas: duracion,
          });
        }
      });
    });

    const nEquipos = equiposUnicos.size;

    // 🔹 BASE (equivalente a SUMX + DIVIDE)
    let resultado = Array.from(mapa.values())
      .filter((x) => x.horas > 0)
      .map((x) => ({
        tipo_estado: x.tipo_estado,
        horas: x.horas,
        promedio: nEquipos > 0 ? x.horas / nEquipos : 0,
      }));

    // 🔥 ORDEN DESC (RANKX DESC)
    resultado.sort((a, b) => b.horas - a.horas);

    // 🔥 RANK DENSE (igual que DAX)
    let rank = 1;
    resultado = resultado.map((item, index, arr) => {
      if (index > 0 && item.horas < arr[index - 1].horas) {
        rank = index + 1;
      }

      return {
        ...item,
        rank,
      };
    });

    // 🔥 ACUMULADO (Tiempo_Acu_FR)
    let acumulado = 0;
    const totalHoras = resultado.reduce((sum, x) => sum + x.horas, 0);

    resultado = resultado.map((item) => {
      acumulado += item.horas;

      return {
        ...item,
        tiempo_acu: acumulado,
        tiempo_acu_pct: totalHoras > 0 ? acumulado / totalHoras : 0,
      };
    });

    return resultado;
  }

  getTiposEstadosMapNoOperativa(): Record<string, string> {
    return {
      '209': 'Falta de labor',
      '210': 'Falta de servicios (energía - agua - aire)',
      '212': 'Apoyo en servicios mineros',
      '213': 'Falta de aceros',
      '214': 'Falta de ventilación',
      '215': 'Trabajos varios',
      '216': 'Accidente de equipo',
      '217': 'Recuperación de aceros',
    };
  }

  // =========================================
  //GRAFICO 8
  // =========================================

  procesarHorasMantenimiento() {
    const mapa = new Map<string, any>();
    const tiposEstados = this.getTiposEstadosMantenimiento();
    const equiposUnicos = new Set<string>();

    // 🔹 RECORRER DATA
    this.operacionesFiltradas.forEach((op) => {
      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      // ✅ DISTINCTCOUNT (como DAX: TODOS los equipos)
      if (op.modelo_equipo) {
        equiposUnicos.add(op.modelo_equipo);
      }

      registros.forEach((r) => {
        const tipo = tiposEstados[r.codigo];
        if (!tipo) return;

        const duracion = this.calcularDuracionHoras(
          r.hora_inicio,
          r.hora_final,
        );

        if (!duracion || duracion <= 0) return;

        if (mapa.has(tipo)) {
          mapa.get(tipo).horas += duracion;
        } else {
          mapa.set(tipo, {
            tipo_estado: tipo,
            horas: duracion,
          });
        }
      });
    });

    const nEquipos = equiposUnicos.size;

    // 🔹 BASE (equivalente a SUMX + DIVIDE)
    let resultado = Array.from(mapa.values())
      .filter((x) => x.horas > 0)
      .map((x) => ({
        tipo_estado: x.tipo_estado,
        horas: x.horas,
        promedio: nEquipos > 0 ? x.horas / nEquipos : 0,
      }));

    // 🔥 ORDEN DESC (RANKX DESC)
    resultado.sort((a, b) => b.horas - a.horas);

    // 🔥 RANK DENSE (igual que DAX)
    let rank = 1;
    resultado = resultado.map((item, index, arr) => {
      if (index > 0 && item.horas < arr[index - 1].horas) {
        rank = index + 1;
      }

      return {
        ...item,
        rank,
      };
    });

    // 🔥 ACUMULADO (Tiempo_Acu_FR)
    let acumulado = 0;
    const totalHoras = resultado.reduce((sum, x) => sum + x.horas, 0);

    resultado = resultado.map((item) => {
      acumulado += item.horas;

      return {
        ...item,
        tiempo_acu: acumulado,
        tiempo_acu_pct: totalHoras > 0 ? acumulado / totalHoras : 0,
      };
    });

    return resultado;
  }

  getTiposEstadosMantenimiento(): Record<string, string> {
    return {
      '206': 'Inspección de equipo',
      '301': 'Mp inicial/final',
      '302': 'Mantenimiento programado',
      '303': 'Mantenimiento correctivo',
    };
  }

  // =========================================
  //GRAFICO 9
  // =========================================
  procesarMetrosPorDisparoFR() {
    const mapa = new Map<
      string,
      {
        modelo_equipo: string;
        seccion: string;
        n_frentes: number;
        metros_perforados: number;
        m_disparo_fr: number;
      }
    >();

    this.operacionesFiltradas.forEach((op) => {
      try {
        const registrosArray = op.registros;

        if (!Array.isArray(registrosArray) || registrosArray.length === 0)
          return;

        const key = `${op.modelo_equipo || 'SIN_EQUIPO'}-${op.seccion || 'SIN_SECCION'}`;

        const nFrentes = this.contarFrentesCompletos(registrosArray);
        const metros = this.calcularMetrosPerforados(registrosArray);

        if (mapa.has(key)) {
          const existing = mapa.get(key)!;

          existing.n_frentes += nFrentes;
          existing.metros_perforados += metros;
        } else {
          mapa.set(key, {
            modelo_equipo: op.modelo_equipo || 'SIN_EQUIPO',
            seccion: op.seccion || 'SIN_SECCION',
            n_frentes: nFrentes,
            metros_perforados: metros,
            m_disparo_fr: 0, // se calcula después
          });
        }
      } catch (error) {}
    });

    // 🔥 cálculo FINAL estilo DAX
    for (const item of mapa.values()) {
      item.m_disparo_fr =
        item.n_frentes > 0 ? item.metros_perforados / item.n_frentes : 0;
    }

    return Array.from(mapa.values());
  }

  // =========================================
  // GRAFICO 10
  // =========================================

  procesarMhrEquipo() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      const key = op.modelo_equipo || 'SIN_EQUIPO';

      const operativos = registrosArray.filter((r) => r.estado === 'OPERATIVO');

      const metros = this.calcularMetrosPerforados(operativos);

      // 🔥 FIX AQUÍ
      const perc = (op as any)?.horometros?.percusion;

      const inicio = Number(perc?.inicio);
      const final = Number(perc?.final);

      let difPercusion = 0;

      if (!isNaN(inicio) && !isNaN(final)) {
        difPercusion = final - inicio;
      }

      if (!mapa.has(key)) {
        mapa.set(key, {
          modelo_equipo: key,
          metros_perforados: 0,
          dif_percusion: 0,
          fr_mhr_hp: 0,
        });
      }

      const item = mapa.get(key)!;

      item.metros_perforados += metros;
      item.dif_percusion += difPercusion;
    });

    for (const item of mapa.values()) {
      item.fr_mhr_hp =
        item.dif_percusion > 0
          ? item.metros_perforados / item.dif_percusion
          : 0;
    }

    return Array.from(mapa.values());
  }

  // =========================================
  // 🔥 GRAFICO 11
  // =========================================

  procesarHorometrosJumbos() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const key = op.modelo_equipo || 'SIN_EQUIPO';

      const horo = (op as any)?.horometros;

      const diesel = horo?.diesel;
      const electrico = horo?.electrico;
      const percusion = horo?.percusion;

      const difDiesel =
        !isNaN(Number(diesel?.inicio)) && !isNaN(Number(diesel?.final))
          ? Number(diesel.final) - Number(diesel.inicio)
          : 0;

      const difElectrico =
        !isNaN(Number(electrico?.inicio)) && !isNaN(Number(electrico?.final))
          ? Number(electrico.final) - Number(electrico.inicio)
          : 0;

      const difPercusion =
        !isNaN(Number(percusion?.inicio)) && !isNaN(Number(percusion?.final))
          ? Number(percusion.final) - Number(percusion.inicio)
          : 0;

      if (!mapa.has(key)) {
        mapa.set(key, {
          modelo_equipo: key,
          diesel: 0,
          electrico: 0,
          percusion: 0,
        });
      }

      const item = mapa.get(key)!;

      item.diesel += difDiesel;
      item.electrico += difElectrico;
      item.percusion += difPercusion;
    });

    const result = Array.from(mapa.values());

    return result;
  }

  // =========================================
  // GRAFICO 12
  // =========================================

  procesarPromedioPrimeraPerfDiaFR() {
    const mapa = new Map<string, Map<string, number>>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      const key = op.modelo_equipo || 'SIN_EQUIPO';
      const fecha = op.fecha;

      const operativos = registrosArray.filter((r) => r.estado === 'OPERATIVO');

      let primerasHorasDelDia: number[] = [];

      operativos.forEach((r) => {
        const hora = r?.hora_inicio;
        if (!hora) return;

        const [h, m] = hora.split(':').map(Number);
        const horaDecimal = h + m / 60;

        // 🔥 SOLO 07–19
        if (horaDecimal < 7 || horaDecimal >= 19) return;

        primerasHorasDelDia.push(horaDecimal);
      });

      if (primerasHorasDelDia.length === 0) return;

      const primeraHora = Math.min(...primerasHorasDelDia);

      if (!mapa.has(key)) {
        mapa.set(key, new Map());
      }

      const mapaFechas = mapa.get(key)!;

      // solo 1 valor por día
      mapaFechas.set(fecha, primeraHora);
    });

    // =========================
    // 🔥 PROMEDIO FINAL
    // =========================
    const result: any[] = [];

    for (const [equipo, fechasMap] of mapa.entries()) {
      let suma = 0;
      let dias = 0;

      fechasMap.forEach((hora) => {
        suma += hora;
        dias++;
      });

      const promedio = dias > 0 ? suma / dias : 0;

      //console.log(`\n🔥 ${equipo}`);
      //console.log(`días:`, dias);
      //console.log(`promedio primera perf:`, promedio);

      result.push({
        modelo_equipo: equipo,
        promedio_primera_perf_dia_fr: promedio,
      });
    }

    return result;
  }

  // =========================================
  //Grafico 13
  // =========================================

  procesarPromedioPrimeraPerfDiaFRPorFecha() {
    const mapa = new Map<string, Map<string, number>>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      const key = op.modelo_equipo || 'SIN_EQUIPO';
      const fecha = op.fecha || 'SIN_FECHA';

      const operativos = registrosArray.filter((r) => r.estado === 'OPERATIVO');

      let primerasHorasDelDia: number[] = [];

      operativos.forEach((r) => {
        const hora = r?.hora_inicio;
        if (!hora) return;

        const [h, m] = hora.split(':').map(Number);
        const horaDecimal = h + m / 60;

        // 🔥 SOLO 07–19
        if (horaDecimal < 7 || horaDecimal >= 19) return;

        primerasHorasDelDia.push(horaDecimal);
      });

      if (primerasHorasDelDia.length === 0) return;

      const primeraHora = Math.min(...primerasHorasDelDia);

      // =========================
      // 🔥 MAPA POR EQUIPO
      // =========================
      if (!mapa.has(key)) {
        mapa.set(key, new Map());
      }

      const mapaFechas = mapa.get(key)!;

      // 🔥 1 valor por equipo por fecha
      mapaFechas.set(fecha, primeraHora);
    });

    // =========================
    // 🔥 FORMATO PARA GRÁFICO
    // =========================
    const result: any[] = [];

    for (const [equipo, fechasMap] of mapa.entries()) {
      fechasMap.forEach((hora, fecha) => {
        result.push({
          fecha,
          modelo_equipo: equipo,
          promedio_primera_perf_dia_fr: hora,
        });
      });
    }

    // 🔥 ordenar por fecha (importante para eje X)
    return result.sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  // =========================================
  // Grafico 14
  // =========================================

  procesarPromedioUltimaPerfDiaFR() {
    const mapa = new Map<string, Map<string, number>>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      const key = op.modelo_equipo || 'SIN_EQUIPO';
      const fecha = op.fecha || 'SIN_FECHA';

      const operativos = registrosArray.filter((r) => r.estado === 'OPERATIVO');

      let horasValidas: number[] = [];

      operativos.forEach((r) => {
        const hora = r?.hora_inicio;
        if (!hora) return;

        const [h, m] = hora.split(':').map(Number);
        const horaDecimal = h + m / 60;

        // 🔥 solo 07–19
        if (horaDecimal < 7 || horaDecimal >= 19) return;

        horasValidas.push(horaDecimal);
      });

      if (horasValidas.length === 0) return;

      // 🔥 AQUÍ CAMBIA LA LÓGICA
      const ultimaHora = Math.max(...horasValidas);

      if (!mapa.has(key)) {
        mapa.set(key, new Map());
      }

      const mapaFechas = mapa.get(key)!;

      // 1 valor por día
      mapaFechas.set(fecha, ultimaHora);
    });

    // =========================
    // 🔥 PROMEDIO FINAL
    // =========================
    const result: any[] = [];

    for (const [equipo, fechasMap] of mapa.entries()) {
      let suma = 0;
      let dias = 0;

      fechasMap.forEach((hora) => {
        suma += hora;
        dias++;
      });

      const promedio = dias > 0 ? suma / dias : 0;

      // console.log(`\n🔥 EQUIPO: ${equipo}`);
      // console.log(`días:`, dias);
      // console.log(`promedio última perf:`, promedio);

      result.push({
        modelo_equipo: equipo,
        promedio_ultima_perf_dia_fr: promedio,
      });
    }

    return result;
  }

  // =========================================
  // Grafico 15
  // =========================================

  procesarPromedioUltimaPerfDiaFRPorFecha() {
    const mapa = new Map<string, Map<string, number>>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      const key = op.modelo_equipo || 'SIN_EQUIPO';
      const fecha = op.fecha || 'SIN_FECHA';

      const operativos = registrosArray.filter((r) => r.estado === 'OPERATIVO');

      let horasValidas: number[] = [];

      operativos.forEach((r) => {
        const hora = r?.hora_inicio;
        if (!hora) return;

        const [h, m] = hora.split(':').map(Number);
        const horaDecimal = h + m / 60;

        // 🔥 SOLO 07–19
        if (horaDecimal < 7 || horaDecimal >= 19) return;

        horasValidas.push(horaDecimal);
      });

      if (horasValidas.length === 0) return;

      // 🔥 CAMBIO CLAVE: última perforación
      const ultimaHora = Math.max(...horasValidas);

      if (!mapa.has(key)) {
        mapa.set(key, new Map());
      }

      const mapaFechas = mapa.get(key)!;

      // 1 valor por equipo por fecha
      mapaFechas.set(fecha, ultimaHora);
    });

    // =========================
    // 🔥 FORMATO PARA GRÁFICO
    // =========================
    const result: any[] = [];

    for (const [equipo, fechasMap] of mapa.entries()) {
      fechasMap.forEach((hora, fecha) => {
        result.push({
          fecha,
          modelo_equipo: equipo,
          promedio_ultima_perf_dia_fr: hora,
        });
      });
    }

    return result.sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  //=========================================
  // 🔥 GRAFICO 16
  //=========================================

  procesarLaborFR() {
    const mapa = new Map<string, Map<string, any>>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      const modelo = op.modelo_equipo || 'SIN_EQUIPO';
      const fecha = op.fecha || 'SIN_FECHA';

      const operativos = registrosArray.filter((r) => r.estado === 'OPERATIVO');

      let mejorRegistro: any = null;
      let mejorHora = Infinity;

      operativos.forEach((r) => {
        const hora = r?.hora_inicio;
        if (!hora) return;

        const [h, m] = hora.split(':').map(Number);
        const horaDecimal = h + m / 60;

        // 🔥 buscamos la MÁS TEMPRANA
        if (horaDecimal < mejorHora) {
          mejorHora = horaDecimal;
          mejorRegistro = r;
        }
      });

      if (!mejorRegistro) return;

      const operacion = mejorRegistro?.operacion || mejorRegistro;

      const tipoLabor = operacion?.tipo_labor || '';
      const labor = operacion?.labor || '';
      const ala = operacion?.ala || '';

      const labor_fr = `${tipoLabor}${labor}${ala}`;

      // =========================
      // MAPA por modelo + fecha
      // =========================
      const key = modelo;

      if (!mapa.has(key)) {
        mapa.set(key, new Map());
      }

      const mapaFechas = mapa.get(key)!;

      // solo 1 registro por día (primera labor)
      mapaFechas.set(fecha, {
        modelo_equipo: modelo,
        fecha,
        hora_inicio: mejorRegistro.hora_inicio,
        labor_fr,
      });
    });

    // =========================
    // OUTPUT FINAL
    // =========================
    const result: any[] = [];

    for (const [, fechasMap] of mapa.entries()) {
      fechasMap.forEach((value) => {
        result.push(value);
      });
    }

    return result.sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  // =========================================
  // Grafico 17
  // =========================================
  procesarPercusionConMetrosJumbos() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const key = op.modelo_equipo || 'SIN_EQUIPO';
      const registrosArray = op.registros;

      // =========================
      // 🔥 METROS PERFORADOS
      // =========================
      const metros = Array.isArray(registrosArray)
        ? this.calcularMetrosPerforados(registrosArray)
        : 0;

      // =========================
      // 🔥 PERCUSIÓN
      // =========================
      const horo = (op as any)?.horometros;
      const percusion = horo?.percusion;

      const difPercusion =
        !isNaN(Number(percusion?.inicio)) && !isNaN(Number(percusion?.final))
          ? Number(percusion.final) - Number(percusion.inicio)
          : 0;

      // =========================
      // 🔥 MAPA INIT
      // =========================
      if (!mapa.has(key)) {
        mapa.set(key, {
          modelo_equipo: key,

          metros_perforados: 0,
          percusion: 0,

          // 🔥 acumuladores
          sum_long_barras: 0,
          count_long_barras: 0,

          tal_alivio: 0,
          tal_prod: 0,
          tal_repaso: 0,
          tal_rimados: 0,

          // 🔥 resultados finales
          long_barras: 0,
          fr_mhr_hp: 0,
        });
      }

      const item = mapa.get(key)!;

      item.metros_perforados += metros;
      item.percusion += difPercusion;

      // =========================
      // 🔥 RECORRER REGISTROS
      // =========================
      if (Array.isArray(registrosArray)) {
        registrosArray.forEach((r) => {
          const opData = r?.operacion || r;

          const lb = Number(opData?.long_barras);

          // ✅ SOLO valores válidos
          if (!isNaN(lb) && lb > 0) {
            item.sum_long_barras += lb;
            item.count_long_barras += 1;
          }

          item.tal_alivio += Number(opData?.metros_perforados_alivio) || 0;
          item.tal_prod += Number(opData?.metros_perforados_produccion) || 0;
          item.tal_repaso += Number(opData?.metros_perforados_repaso) || 0;
          item.tal_rimados += Number(opData?.metros_perforados_rimados) || 0;
        });
      }
    });

    // =========================
    // 🔥 CÁLCULOS FINALES
    // =========================
    for (const item of mapa.values()) {
      // 🔥 PROMEDIO LONG_BARRAS
      item.long_barras =
        item.count_long_barras > 0
          ? item.sum_long_barras / item.count_long_barras
          : 0;

      // 🔥 KPI FR
      item.fr_mhr_hp =
        item.percusion > 0 ? item.metros_perforados / item.percusion : 0;

      // 🔥 limpiar basura técnica
      delete item.sum_long_barras;
      delete item.count_long_barras;
    }

    return Array.from(mapa.values());
  }

  // =========================================
  // GRAFICO 18
  // =========================================

  procesarFrPorOperadorTurno() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      const operador = op.operador || 'SIN_OPERADOR';
      const turno = op.turno || 'SIN_TURNO';

      const key = `${operador}-${turno}`;

      // =========================
      // 🔥 METROS PERFORADOS
      // =========================
      const metros = this.calcularMetrosPerforados(registrosArray);

      // =========================
      // 🔥 PERCUSIÓN
      // =========================
      const horo = (op as any)?.horometros;
      const percusion = horo?.percusion;

      const difPercusion =
        !isNaN(Number(percusion?.inicio)) && !isNaN(Number(percusion?.final))
          ? Number(percusion.final) - Number(percusion.inicio)
          : 0;

      // =========================
      // 🔥 MAPA
      // =========================
      if (!mapa.has(key)) {
        mapa.set(key, {
          operador,
          turno,
          metros_perforados: 0,
          dif_percusion: 0,
          fr_mhr_hp: 0,
        });
      }

      const item = mapa.get(key)!;

      item.metros_perforados += metros;
      item.dif_percusion += difPercusion;
    });

    // =========================
    // 🔥 FR FINAL (tipo DAX)
    // =========================
    for (const item of mapa.values()) {
      item.fr_mhr_hp =
        item.dif_percusion > 0
          ? item.metros_perforados / item.dif_percusion
          : 0;
    }

    return Array.from(mapa.values());
  }

  // =========================================
  // GRAFICO 19
  // =========================================

  procesarLaborFRDetallado() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      const modelo = op.modelo_equipo || 'SIN_EQUIPO';
      const operador = op.operador || 'SIN_OPERADOR';

      registrosArray.forEach((r) => {
        const operacion = r?.operacion || {};

        const tipo_labor = operacion?.tipo_labor || '';
        const labor = operacion?.labor || '';
        const ala = operacion?.ala || '';

        const observaciones = operacion?.observaciones;

        // ❌ filtrar observaciones vacías
        if (!observaciones || !observaciones.trim()) return;

        const labor_fr = `${tipo_labor}${labor}${ala}`.trim();

        const key = `${modelo}-${operador}-${labor_fr}`;

        if (!mapa.has(key)) {
          mapa.set(key, {
            modelo_equipo: modelo,
            operador,
            labor_fr,
            observaciones,
            count: 0,
          });
        }

        const item = mapa.get(key)!;

        item.count += 1;
      });
    });

    return Array.from(mapa.values());
  }

  // =========================================
  // grafico 20
  // =========================================
  procesarTipoPerforacion() {
    const tiposValidos = new Set([
      'DESQUINCHE',
      'FRENTE COMPLETO',
      'SELLADA',
      'BREASTING',
    ]);

    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      registrosArray.forEach((r) => {
        const operacion = r?.operacion || {};

        const tipoPerforacion = (operacion?.tipo_perforacion || '')
          .toString()
          .trim()
          .toUpperCase();

        // 🔥 FILTRO DAX
        if (!tiposValidos.has(tipoPerforacion)) return;

        // 🔥 CLAVE (puedes agrupar como quieras)
        const key = `${op.modelo_equipo}-${tipoPerforacion}`;

        if (!mapa.has(key)) {
          mapa.set(key, {
            modelo_equipo: op.modelo_equipo || 'SIN_EQUIPO',
            tipo_perforacion: tipoPerforacion,
            n_disparos: 0,
          });
        }

        const item = mapa.get(key)!;

        // 🔥 COUNTROWS equivalente
        item.n_disparos += 1;
      });
    });

    return Array.from(mapa.values());
  }

  //=========================================
  // GRAFICO 21
  //=========================================

  procesarDataPerforacionDetallada() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const key = op.modelo_equipo || 'SIN_EQUIPO';
      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      registrosArray.forEach((r) => {
        const operacion = r?.operacion || {};

        // =========================
        // 🔥 VALIDACIÓN REAL
        // =========================
        const tipo_perforacion = operacion?.tipo_perforacion;
        if (!tipo_perforacion) return; // ❌ NO enviar basura

        const labor_fr_raw =
          `${operacion?.tipo_labor ?? ''}${operacion?.labor ?? ''}${operacion?.ala ?? ''}`.trim();

        // 🔥 ahora SIEMPRE habrá valor
        const labor_fr = labor_fr_raw || 'SIN LABOR';

        // =========================
        // 🔥 METROS
        // =========================
        const metros = this.calcularMetrosPerforados([r]);

        // =========================
        // 🔥 VALORES OPERACIONALES
        // =========================
        const long_barras = Number(operacion?.long_barras) || 0;
        const tal_alivio = Number(operacion?.metros_perforados_alivio) || 0;
        const tal_prod = Number(operacion?.metros_perforados_produccion) || 0;
        const tal_repaso = Number(operacion?.metros_perforados_repaso) || 0;
        const tal_rimados = Number(operacion?.metros_perforados_rimados) || 0;

        const mapKey = `${key}-${tipo_perforacion}-${labor_fr}`;

        if (!mapa.has(mapKey)) {
          mapa.set(mapKey, {
            modelo_equipo: key,
            tipo_perforacion,
            labor_fr,

            metros_perforados: 0,

            sum_long_barras: 0,
            count_long_barras: 0,

            tal_alivio: 0,
            tal_prod: 0,
            tal_repaso: 0,
            tal_rimados: 0,

            long_barras: 0,
          });
        }

        const item = mapa.get(mapKey)!;

        item.metros_perforados += metros;

        if (long_barras > 0) {
          item.sum_long_barras += long_barras;
          item.count_long_barras++;
        }

        item.tal_alivio += tal_alivio;
        item.tal_prod += tal_prod;
        item.tal_repaso += tal_repaso;
        item.tal_rimados += tal_rimados;
      });
    });

    // =========================
    // 🔥 PROMEDIO FINAL
    // =========================
    for (const item of mapa.values()) {
      item.long_barras =
        item.count_long_barras > 0
          ? item.sum_long_barras / item.count_long_barras
          : 0;
    }

    return Array.from(mapa.values());
  }

  // =========================================
  // GRAFICO 22
  // =========================================

  procesarHorasNumericas() {
    const result: any[] = [];

    this.operacionesFiltradas.forEach((op) => {
      const modelo = op.modelo_equipo || 'SIN_EQUIPO';
      const fecha = op.fecha || 'SIN_FECHA';

      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      registrosArray.forEach((r) => {
        // 🔥 FILTRO POR CODIGO
        const codigo = String(r?.codigo);
        if (codigo !== '101' && codigo !== '111') return;

        const horaStr = r?.hora_inicio;
        if (!horaStr) return;

        // =========================
        // 🔥 PARSE HORA
        // =========================
        const partes = horaStr.split(':').map(Number);

        const h = partes[0] || 0;
        const m = partes[1] || 0;
        const s = partes[2] || 0;

        // =========================
        // 🔥 HORA DECIMAL
        // =========================
        const hora_decimal = h + m / 60 + s / 3600;

        result.push({
          modelo_equipo: modelo,
          fecha,
          hora_inicio: horaStr,
          hora_decimal,
          codigo, // 🔥 opcional pero recomendado
        });
      });
    });

    return result.sort((a, b) => {
      if (a.fecha === b.fecha) {
        return a.hora_decimal - b.hora_decimal;
      }
      return a.fecha.localeCompare(b.fecha);
    });
  }



  //GANTT
private construirGanttDataNuevo(): void {

  const fechaMap: Record<string, any> = {};

  this.operacionesFiltradas.forEach(op => {

    const fecha = op.fecha || 'SIN_FECHA';
    const turno = op.turno || 'SIN_TURNO';
    const equipoCodigo = `${op.equipo} - ${op.n_equipo}`;

    // 🔥 clave combinada
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

    const registros = Array.isArray(op.registros)
      ? op.registros
      : [];

    registros.forEach((reg: any) => {

      const estado = (reg.estado || 'SIN ESTADO').toUpperCase().trim();
      const codigo = String(reg.codigo || '').trim();

      if (!reg.hora_inicio || !reg.hora_final) return;

      // 🔥 MATCH CONTRA MAPA (igual que tu otro proceso)
      const estadoMatch = this.mapaEstados.get(codigo);

      // 🔥 puedes mantener estado o usar categoría (te dejo listo)
      const labor = estadoMatch?.estado_principal || estado;

      if (!fechaMap[key].equipos[equipoCodigo][labor]) {
        fechaMap[key].equipos[equipoCodigo][labor] = [];
      }

      fechaMap[key].equipos[equipoCodigo][labor].push({
        start: reg.hora_inicio,
        end: reg.hora_final,

        estado,
        description: codigo,

        // 🔥 CAMPOS ENRIQUECIDOS
        tipo_estado: estadoMatch?.tipo_estado || null,
        categoria: estadoMatch?.categoria || null,
        estado_principal: estadoMatch?.estado_principal || null
      });

      // 🔍 debug opcional
      // if (!estadoMatch) {
      //   console.warn('❌ SIN MATCH GANTT:', codigo, reg);
      // }

    });

  });

  // 🔁 NORMALIZACIÓN FINAL
  this.ganttData = Object.values(fechaMap).map((item: any) => ({

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

  console.log('📊 GANTT DATA NUEVO:', this.ganttData);
}
}
