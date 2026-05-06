import { Component, OnInit } from '@angular/core';
import { OperacionBase } from '../../../../../models/OperacionBase.models';
import { PlanProduccion } from '../../../../../models/plan_produccion.model';
import { PlanMensualService } from '../../../../../services/plan-mensual.service';
import { FechasPlanMensualService } from '../../../../../services/fechas-plan-mensual.service';
import { OperacionesService } from '../../../../../services/operaciones.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResumenComponent } from '../Graficos components/Hoja 1/resumen/resumen.component';
import { CucharasLaborComponent } from '../Graficos components/Hoja 1/cucharas-labor/cucharas-labor.component';
import { CucharasEquipoComponent } from '../Graficos components/Hoja 1/cucharas-equipo/cucharas-equipo.component';
import { RendimientoEquipoComponent } from '../Graficos components/Hoja 1/rendimiento-equipo/rendimiento-equipo.component';
import { DemorasOperativasComponent } from '../Graficos components/Hoja 1/demoras-operativas/demoras-operativas.component';
import { DemorasInoperativasComponent } from '../Graficos components/Hoja 1/demoras-inoperativas/demoras-inoperativas.component';
import { HorasMantenimientoComponent } from '../Graficos components/Hoja 1/horas-mantenimiento/horas-mantenimiento.component';
import { TonelajeEquipoComponent } from '../Graficos components/Hoja 1/tonelaje-equipo/tonelaje-equipo.component';
import { TnHrEquipoComponent } from '../Graficos components/Hoja 1/tn-hr-equipo/tn-hr-equipo.component';
import { HorometroDieselComponent } from '../Graficos components/Hoja 1/horometro-diesel/horometro-diesel.component';
import { HorometroDieselTotalComponent } from '../../sostenimiento/Graficos components/Hoja 1/horometro-diesel-total/horometro-diesel-total.component';
import { ScatterTurnosComponent } from '../Graficos components/Hoja 2/scatter-turnos/scatter-turnos.component';
import { ScatterTurnosNocheComponent } from '../Graficos components/Hoja 2/scatter-turnos-noche/scatter-turnos-noche.component';
import { HorasPrimerViajeComponent } from '../Graficos components/Hoja 2/horas-primer-viaje/horas-primer-viaje.component';
import { ResumenEquiposComponent } from '../Graficos components/Hoja 2/resumen-equipos/resumen-equipos.component';
import { MejoresOperadoresComponent } from '../Graficos components/Hoja 2/mejores-operadores/mejores-operadores.component';
import { MejoresOperadoresGraficoComponent } from '../Graficos components/Hoja 2/mejores-operadores-grafico/mejores-operadores-grafico.component';
import { ObservacionesComponent } from '../Graficos components/Hoja 2/observaciones/observaciones.component';
import { SchedulerComponent } from '../../Linea de tiempo/scheduler/scheduler.component';
import { EstadoService } from '../../../../../services/estado.service';

@Component({
  selector: 'app-principal-grafico-scoops',
  imports: [
    CommonModule,
    FormsModule,
    ResumenComponent,
    CucharasLaborComponent,
    CucharasEquipoComponent,
    RendimientoEquipoComponent,
    DemorasOperativasComponent,
    DemorasInoperativasComponent,
    HorasMantenimientoComponent,
    TonelajeEquipoComponent,
    TnHrEquipoComponent,
    HorometroDieselComponent,
    HorometroDieselTotalComponent,
    ScatterTurnosComponent,
    ScatterTurnosNocheComponent,
    HorasPrimerViajeComponent,
    ResumenEquiposComponent,
    MejoresOperadoresComponent,
    MejoresOperadoresGraficoComponent,
    ObservacionesComponent,
    SchedulerComponent,
  ],
  templateUrl: './principal-grafico-scoops.component.html',
  styleUrl: './principal-grafico-scoops.component.css',
})
export class PrincipalGraficoScoopsComponent implements OnInit {
  anio!: number;
  mes!: string;

  // DATA ORIGINAL (sin filtrar)
  operacionesOriginal: OperacionBase[] = [];
  operacionesFiltradas: OperacionBase[] = [];
  planesMensuales: PlanProduccion[] = [];

  fechaInicio: string = '';
  fechaFin: string = '';
  turnoSeleccionado: string = '';
  turnoAplicado: string = '';
  cargandoPDF = false;

  //DATA
  resumenSC = {
    SC_Conteo_Equipos: 0,
    totalCucharas: 0,
    ViajesPorEquipo: 0,
    N_labores_limpiadas: 0,
  };
  DataCucharadasLabor: any[] = [];
  DataDMyUTI: any[] = [];
  DataEstadosSOS: any[] = [];
  dataDemoraIno: any[] = [];
  dataHoraMantenimiento: any[] = [];
  dataToneladas: any[] = [];
  dataTn_Hr: any[] = [];
  dataDiferenciaDisel: any[] = [];
  dataDiferenciaDiselTotal: any[] = [];

  dataHorasNumericas: any[] = [];
  dataViajesSC: any[] = [];
  dataDetalleEquipo: any[] = [];

  dataMejoresOperadores: any[] = [];
  dataLaborFRDetallado: any[] = [];

  estadosProceso: any[] = [];
    ganttData: any[] = [];
vistaPrincipal: boolean = true;

  constructor(
    private planMensualService: PlanMensualService,
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
    this.obtenerEstadosPorProceso('SCOOPTRAM');
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

  cargarOperaciones() {
    const tipo = 'carguio';

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

  procesarTodo() {
    if (!this.operacionesFiltradas.length || !this.planesMensuales.length)
      return;

    this.procesarResumenSC();
    this.DataCucharadasLabor = this.CucharasPorLabor();
    this.DataDMyUTI = this.ProcesarDM_SC_UTI_SC();

    this.DataEstadosSOS = this.procesarDemorasOperativas();
    this.dataDemoraIno = this.procesarDemorasInoperativas();
    this.dataHoraMantenimiento = this.procesarHorasMantenimiento();
    this.dataToneladas = this.ProcesarTonelajeSC();
    this.dataTn_Hr = this.ProcesarTonelajePorHoraSC();
    this.dataDiferenciaDisel = this.ProcesarDiferenciaDiesel();
    this.dataDiferenciaDiselTotal = this.ProcesarDiferenciaDieselTotal();

    this.dataHorasNumericas = this.procesarHorasNumericas();
    this.dataViajesSC = this.ProcesarContViajesSC();
    this.dataDetalleEquipo = this.ProcesarDetalleEquipoSC();
    //Grafico 14
    this.dataMejoresOperadores = this.ProcesarOperadorTurnoSC();
    this.dataLaborFRDetallado = this.procesarLaborFRDetallado();

    this.construirGanttDataNuevo();
    //console.log('🔥 DATA DISPAROS EQUIPO:', this.dataDisparosEquipo);
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
    console.log('DATA FILTRADA:', this.operacionesFiltradas);
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

  //=========================================
  //HOJA 1
  //=========================================

  procesarResumenSC() {
    let totalCucharas = 0;

    const equiposSet = new Set<string>();
    const laboresSet = new Set<string>();

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;
      equiposSet.add(modeloEquipo);

      const registrosArray = op.registros;

      if (!Array.isArray(registrosArray)) return;

      registrosArray.forEach((registro) => {
        if (registro.estado !== 'OPERATIVO') return;

        const opReg = registro.operacion || registro;

        // 🔹 SUMA n_cucharas
        const nCucharas = Number(opReg.n_cucharas) || 0;
        totalCucharas += nCucharas;

        // 🔹 LABOR_INICIO_SC (igual que DAX)
        const tipo = opReg.tipo_labor_inicio || '';
        const labor = opReg.labor_inicio || '';
        const ala = opReg.ala_inicio || '';
        const nivel = opReg.nivel_inicio || '';

        let laborConcat = `${tipo}${labor}`;

        if (ala !== '') {
          laborConcat += `-${ala}`;
        }

        // fallback a nivel si está vacío
        if (!laborConcat || laborConcat.trim() === '') {
          laborConcat = nivel;
        }

        // 🔹 DISTINCTCOUNT (solo válidos)
        if (laborConcat && laborConcat.trim() !== '') {
          laboresSet.add(laborConcat.trim());
        }
      });
    });

    const conteoEquipos = equiposSet.size;

    const viajesPorEquipo =
      conteoEquipos > 0 ? totalCucharas / conteoEquipos : 0;

    this.resumenSC = {
      SC_Conteo_Equipos: conteoEquipos,
      totalCucharas: totalCucharas,
      ViajesPorEquipo: Number(viajesPorEquipo.toFixed(2)),
      N_labores_limpiadas: laboresSet.size,
    };

    //console.log('📊 RESUMEN SC:', this.resumenSC);
  }

  //Grafico 2 y 3

  CucharasPorLabor() {
    const resultadoMap = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;
      const seccion = op.seccion || 'SIN_SECCION';

      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      for (const registro of registrosArray) {
        if (registro.estado !== 'OPERATIVO') continue;

        const opReg = registro.operacion || registro;

        // 🔹 n_cucharas
        const nCucharas = Number(opReg.n_cucharas) || 0;
        if (nCucharas <= 0) continue;

        // 🔹 LABOR_INICIO_SC (igual a DAX)
        const tipo = opReg.tipo_labor_inicio || '';
        const labor = opReg.labor_inicio || '';
        const ala = opReg.ala_inicio || '';
        const nivel = opReg.nivel_inicio || '';

        let laborConcat = `${tipo}${labor}`;

        if (ala !== '') {
          laborConcat += `-${ala}`;
        }

        if (!laborConcat || laborConcat.trim() === '') {
          laborConcat = nivel;
        }

        const laborFinal = laborConcat || 'SIN_LABOR';

        // 🔑 clave (agrupación)
        const key = `${seccion}|${modeloEquipo}|${laborFinal}`;

        if (!resultadoMap.has(key)) {
          resultadoMap.set(key, {
            seccion,
            modeloEquipo,
            labor: laborFinal,
            totalCucharas: 0,
          });
        }

        resultadoMap.get(key).totalCucharas += nCucharas;
      }
    });

    const resultado = Array.from(resultadoMap.values());

    //console.log('📊 DATA GRAFICO SC:', resultado);

    return resultado;
  }

  //Grafico 4
  ProcesarDM_SC_UTI_SC() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;
      const seccion = op.seccion || 'SIN_SECCION';

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      const key = `${modeloEquipo}|${seccion}`;

      if (!mapa.has(key)) {
        mapa.set(key, {
          modeloEquipo,
          seccion,
          n_operaciones: 0,
          horas_mantenimiento: 0,
          horas_demoras_206: 0, // Cambiado: solo demoras 206
          horas_trabajadas: 0,
        });
      }

      const grupo = mapa.get(key);

      // 1. OPERACIONES
      grupo.n_operaciones++;

      // 2. MANTENIMIENTO (todos los mantenimientos)
      const mantenimiento = this.calcularDuracionEstado(
        registros,
        'MANTENIMIENTO',
      );
      grupo.horas_mantenimiento += mantenimiento;

      // 3. DEMORA solo código 206 (igual que Power BI)
      const demoras206 = this.calcularDuracionEstado(
        registros,
        'DEMORA',
        '206',
      );
      grupo.horas_demoras_206 += demoras206;

      // 4. HORAS TRABAJADAS (Diferencia Diesel como en Power BI)
      const horasTrabajadas = this.calcularHorasTrabajadas(op);
      grupo.horas_trabajadas += horasTrabajadas;
    });

    const resultado = Array.from(mapa.values()).map((item) => {
      const HayRegistros = item.n_operaciones > 0;

      // Horas programadas: N_operaciones * 10
      const HorasProgramadas = item.n_operaciones * 10;

      // SC_Duracion_MANTENIMIENTO + SC_Duracion_DEMORAS (solo código 206)
      const HorasMantenimiento =
        item.horas_mantenimiento + item.horas_demoras_206;

      // Ajuste: si HorasMantenimiento = 0, usar 0.5 * n_operaciones
      const HorasMantenimientoAjustado =
        HorasMantenimiento === 0
          ? 0.5 * item.n_operaciones
          : HorasMantenimiento;

      // =========================================================
      // DM_SC (igual que Power BI)
      // =========================================================
      let DM_SC = null;

      if (HayRegistros && HorasProgramadas > 0) {
        DM_SC =
          (HorasProgramadas - HorasMantenimientoAjustado) / HorasProgramadas;
      }

      // =========================================================
      // UTI_SC (igual que Power BI)
      // =========================================================
      const denominador = HorasProgramadas - HorasMantenimientoAjustado;

      let UTI_SC = null;

      if (HayRegistros && denominador > 0) {
        UTI_SC = item.horas_trabajadas / denominador;
      }

      return {
        modeloEquipo: item.modeloEquipo,
        seccion: item.seccion,
        DM_SC: DM_SC !== null ? Number(DM_SC.toFixed(4)) : null,
        UTI_SC: UTI_SC !== null ? Number(UTI_SC.toFixed(4)) : null,
        HorasProgramadas: HorasProgramadas,
        HorasMantenimiento: Number(HorasMantenimiento.toFixed(2)),
        HorasMantenimientoAjustado: Number(
          HorasMantenimientoAjustado.toFixed(2),
        ),
        HorasTrabajadas: Number(item.horas_trabajadas.toFixed(2)),
        Operaciones: item.n_operaciones,
      };
    });

    //console.log('📊 DM_SC + UTI_SC:', resultado);
    return resultado;
  }

  calcularDuracionEstado(registros: any[], estado: string, codigo?: string) {
    let total = 0;

    for (const r of registros) {
      if (r.estado !== estado) continue;

      if (codigo && r.codigo !== codigo) continue;

      const inicio = r.hora_inicio;
      const fin = r.hora_final;

      if (!inicio || !fin) continue;

      const diff = this.calcularHoras(inicio, fin);
      total += diff;
    }

    return total;
  }

  calcularHorasTrabajadas(op: any) {
    // ⚠️ IMPORTANTE: Las horas trabajadas son la diferencia de horometros
    // NO la suma de duraciones de estados OPERATIVOS

    const horometros = op.horometros?.horometro;

    if (!horometros) return 0;

    const inicio = horometros.inicio;
    const fin = horometros.final;

    if (inicio === undefined || fin === undefined) return 0;

    // Diferencia Diesel como en Power BI
    const diferencia = Number((fin - inicio).toFixed(2));

    //console.log('Horas trabajadas (Diferencia Diesel):', diferencia);

    return diferencia;
  }

  calcularHoras(inicio: string, fin: string) {
    const [hi, mi] = inicio.split(':').map(Number);
    const [hf, mf] = fin.split(':').map(Number);

    const diff = (hf * 60 + mf - (hi * 60 + mi)) / 60;

    // Redondear a 2 decimales para mantener consistencia
    return Number(diff.toFixed(2));
  }

  //Grafico 5
  procesarDemorasOperativas() {
    const mapa = new Map<string, any>();
    const tiposEstados = this.getTiposEstadosSOS(); // Obtiene SOLO los 8 estados
    const equiposUnicos = new Set<string>();

    // 🔥 Lista de códigos permitidos (solo estos 8)
    const codigosPermitidos = new Set([
      '201',
      '202',
      '203',
      '204',
      '205',
      '207',
      '208',
      '211',
    ]);

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;

      // DISTINCTCOUNT
      if (modeloEquipo) {
        equiposUnicos.add(modeloEquipo);
      }

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      registros.forEach((r) => {
        // 🔥 FILTRO CRÍTICO: Solo procesar si el código está en la lista permitida
        if (!codigosPermitidos.has(r.codigo)) return;

        const tipo = tiposEstados[r.codigo];
        if (!tipo) return; // Por seguridad, aunque debería existir

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

    // Convertir a array (ya solo contiene los 8 estados filtrados)
    let resultado = Array.from(mapa.values())
      .filter((x) => x.horas > 0)
      .map((x) => ({
        tipo_estado: x.tipo_estado,
        horas: x.horas,
        promedio: nEquipos > 0 ? x.horas / nEquipos : 0,
      }));

    // RANKX DESC (solo entre los 8 estados)
    resultado.sort((a, b) => b.horas - a.horas);

    // RANK DENSE
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

    // ACUMULADO (solo entre los 8 estados)
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

    //console.log('📊 ESTADOS SOS (solo 8 estados):', resultado);
    return resultado;
  }

  // 🔥 MAPPING DE CÓDIGOS A TIPOS DE ESTADOS
  getTiposEstadosSOS(): Record<string, string> {
    return {
      // OPERATIVO
      '101': 'Limpieza de mineral',
      '102': 'Perforación de repaso en mineral',
      '111': 'Perforación en desmonte',
      '112': 'Perforación de repaso en desmonte',
      '120': 'Perforación para sostenimiento',

      // DEMORA
      '201': 'Falta de Operador',
      '202': 'MpL - mantenimiento preventivo de labor',
      '203': 'Ingreso - Salida',
      '204': 'Charla',
      '205': 'Traslado al equipo',
      '206': 'Inspección de equipo',
      '207': 'Refrigerio',
      '208': 'Traslado de equipo',
      '209': 'Falta de labor',
      '210': 'Falta de servicios (energía - agua - aire)',
      '211': 'Instalación de equipo',
      '212': 'Apoyo en servicios mineros',
      '213': 'Falta de aceros',
      '214': 'Falta de ventilación',
      '215': 'Trabajos varios',
      '216': 'Accidente de equipo',
      '217': 'Recuperación de aceros',

      // MANTENIMIENTO
      '301': 'Mp inicial/final',
      '302': 'Mantenimiento programado',
      '303': 'Mantenimiento correctivo',

      // RESERVA
      '401': 'Reserva',

      // FUERA DE PLAN
      '501': 'Fuera De Plan',
    };
  }
  //Grafico 6
  procesarDemorasInoperativas() {
    const mapa = new Map<string, any>();
    const tiposEstados = this.getTiposEstadosSOS(); // Obtiene SOLO los 8 estados
    const equiposUnicos = new Set<string>();

    // 🔥 Lista de códigos permitidos (solo estos 8)
    const codigosPermitidos = new Set([
      '206',
      '209',
      '210',
      '212',
      '213',
      '214',
      '215',
      '216',
    ]);

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;

      // DISTINCTCOUNT
      if (modeloEquipo) {
        equiposUnicos.add(modeloEquipo);
      }

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      registros.forEach((r) => {
        // 🔥 FILTRO CRÍTICO: Solo procesar si el código está en la lista permitida
        if (!codigosPermitidos.has(r.codigo)) return;

        const tipo = tiposEstados[r.codigo];
        if (!tipo) return; // Por seguridad, aunque debería existir

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

    // Convertir a array (ya solo contiene los 8 estados filtrados)
    let resultado = Array.from(mapa.values())
      .filter((x) => x.horas > 0)
      .map((x) => ({
        tipo_estado: x.tipo_estado,
        horas: x.horas,
        promedio: nEquipos > 0 ? x.horas / nEquipos : 0,
      }));

    // RANKX DESC (solo entre los 8 estados)
    resultado.sort((a, b) => b.horas - a.horas);

    // RANK DENSE
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

    // ACUMULADO (solo entre los 8 estados)
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

    //console.log('📊 ESTADOS SOS (solo 8 estados):', resultado);
    return resultado;
  }

  //Grafico 7
  procesarHorasMantenimiento() {
    const mapa = new Map<string, any>();
    const tiposEstados = this.getTiposEstadosSOS(); // Obtiene SOLO los 8 estados
    const equiposUnicos = new Set<string>();

    // 🔥 Lista de códigos permitidos (solo estos 8)
    const codigosPermitidos = new Set(['301', '302', '303', '206']);

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;

      // DISTINCTCOUNT
      if (modeloEquipo) {
        equiposUnicos.add(modeloEquipo);
      }

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      registros.forEach((r) => {
        // 🔥 FILTRO CRÍTICO: Solo procesar si el código está en la lista permitida
        if (!codigosPermitidos.has(r.codigo)) return;

        const tipo = tiposEstados[r.codigo];
        if (!tipo) return; // Por seguridad, aunque debería existir

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

    // Convertir a array (ya solo contiene los 8 estados filtrados)
    let resultado = Array.from(mapa.values())
      .filter((x) => x.horas > 0)
      .map((x) => ({
        tipo_estado: x.tipo_estado,
        horas: x.horas,
        promedio: nEquipos > 0 ? x.horas / nEquipos : 0,
      }));

    // RANKX DESC (solo entre los 8 estados)
    resultado.sort((a, b) => b.horas - a.horas);

    // RANK DENSE
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

    // ACUMULADO (solo entre los 8 estados)
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

    //console.log('📊 ESTADOS SOS (solo 8 estados):', resultado);
    return resultado;
  }

  private calcularDuracionHoras(horaInicio: string, horaFinal: string): number {
    if (!horaInicio || !horaFinal) return 0;

    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaFinal.split(':').map(Number);

    let inicio = h1 * 60 + m1;
    let fin = h2 * 60 + m2;

    // 🔥 si cruza medianoche
    if (fin < inicio) {
      fin += 24 * 60;
    }

    return Number(((fin - inicio) / 60).toFixed(2));
  }
  //Grafico 8
  ProcesarTonelajeSC() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;
      const seccion = op.seccion || 'SIN_SECCION';
      const capacidad = Number(op.capacidad) || 0;

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      const key = `${modeloEquipo}|${seccion}`;

      if (!mapa.has(key)) {
        mapa.set(key, {
          modeloEquipo,
          seccion,
          tonelaje: 0,
          mineral: 0,
          desmonte: 0,
        });
      }

      const grupo = mapa.get(key);

      registros.forEach((r) => {
        if (r.estado !== 'OPERATIVO') return;

        const opReg = r.operacion || r;

        const codigo = r.codigo;
        const nCucharas = Number(opReg.n_cucharas) || 0;

        if (nCucharas <= 0 || capacidad <= 0) return;

        // 🔹 FACTOR BASE
        const base = capacidad * nCucharas * 0.7646;

        // 🔵 MINERAL
        if (['101', '102', '103'].includes(codigo)) {
          const ton = base * 3.8;

          grupo.mineral += ton;
          grupo.tonelaje += ton;
        }

        // 🟤 DESMONTE
        if (['111', '112', '113', '120'].includes(codigo)) {
          const ton = base * 2.7;

          grupo.desmonte += ton;
          grupo.tonelaje += ton;
        }
      });
    });

    const resultado = Array.from(mapa.values()).map((item) => ({
      modeloEquipo: item.modeloEquipo,
      seccion: item.seccion,

      Tonelaje: Number(item.tonelaje.toFixed(2)),
      Mineral: Number(item.mineral.toFixed(2)),
      Desmonte: Number(item.desmonte.toFixed(2)),
    }));

    //console.log('📊 TONELAJE SC:', resultado);

    return resultado;
  }

  //Grafico 9

  ProcesarTonelajePorHoraSC() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;
      const seccion = op.seccion || 'SIN_SECCION';
      const capacidad = Number(op.capacidad) || 0;

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      const key = `${modeloEquipo}|${seccion}`;

      if (!mapa.has(key)) {
        mapa.set(key, {
          modeloEquipo,
          seccion,
          tonelaje: 0,
          horas_operativo: 0,
        });
      }

      const grupo = mapa.get(key);

      registros.forEach((r) => {
        const opReg = r.operacion || r;

        const codigo = String(r.codigo);
        const nCucharas = Number(opReg.n_cucharas) || 0;

        // =====================================================
        // 🔵 1. TONELAJE (igual que ya hiciste)
        // =====================================================
        if (r.estado === 'OPERATIVO' && nCucharas > 0 && capacidad > 0) {
          const base = capacidad * nCucharas * 0.7646;

          // Mineral
          if (['101', '102', '103'].includes(codigo)) {
            grupo.tonelaje += base * 3.8;
          }

          // Desmonte
          if (['111', '112', '113', '120'].includes(codigo)) {
            grupo.tonelaje += base * 2.7;
          }
        }

        // =====================================================
        // 🔴 2. SC_Duracion_OPERATIVO
        // =====================================================
        if (r.estado === 'OPERATIVO') {
          const inicio = r.hora_inicio;
          const fin = r.hora_final;

          if (!inicio || !fin) return;

          const horas = this.calcularHoras(inicio, fin);

          grupo.horas_operativo += horas;
        }
      });
    });

    // 🔥 RESULTADO FINAL
    const resultado = Array.from(mapa.values()).map((item) => {
      const Tn_h_SC =
        item.horas_operativo > 0 ? item.tonelaje / item.horas_operativo : 0;

      return {
        modeloEquipo: item.modeloEquipo,
        seccion: item.seccion,

        Tonelaje: Number(item.tonelaje.toFixed(2)),
        HorasOperativo: Number(item.horas_operativo.toFixed(2)),
        Tn_h_SC: Math.round(Tn_h_SC),
      };
    });

    //console.log('📊 TN/h SC:', resultado);

    return resultado;
  }

  //Grafico 10

  ProcesarDiferenciaDiesel() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;

      const horometro = (op as any).horometros?.horometro;

      const inicio = horometro?.inicio;
      const fin = horometro?.final;

      if (inicio == null || fin == null) return;

      // 🔹 Diferencia Diesel (igual a BI)
      const diferencia = Number((fin - inicio).toFixed(2));

      if (!mapa.has(modeloEquipo)) {
        mapa.set(modeloEquipo, {
          modeloEquipo,
          totalDiferencia: 0,
          operaciones: 0,
        });
      }

      const grupo = mapa.get(modeloEquipo);

      grupo.totalDiferencia += diferencia;
      grupo.operaciones++;
    });

    // 🔥 Resultado final
    const resultado = Array.from(mapa.values()).map((item) => ({
      modeloEquipo: item.modeloEquipo,

      // 🔹 suma total (igual que SUM en BI)
      DiferenciaDiesel: Number(item.totalDiferencia.toFixed(2)),

      // opcional (útil para KPI)
      PromedioPorOperacion: Number(
        (item.totalDiferencia / item.operaciones).toFixed(2),
      ),

      Operaciones: item.operaciones,
    }));

    //console.log('📊 DIFERENCIA DIESEL:', resultado);

    return resultado;
  }

  //Grafico 11
  ProcesarDiferenciaDieselTotal() {
    let totalDiferencia = 0;
    let operaciones = 0;

    this.operacionesFiltradas.forEach((op) => {
      const horometro = (op as any).horometros?.horometro;

      const inicio = horometro?.inicio;
      const fin = horometro?.final;

      if (inicio == null || fin == null) return;

      const diferencia = Number((fin - inicio).toFixed(2));

      totalDiferencia += diferencia;
      operaciones++;
    });

    const resultado = {
      DiferenciaDiesel: Number(totalDiferencia.toFixed(2)),
      PromedioPorOperacion:
        operaciones > 0
          ? Number((totalDiferencia / operaciones).toFixed(2))
          : 0,
      Operaciones: operaciones,
    };

    //console.log('📊 DIFERENCIA DIESEL TOTAL:', resultado);

    // 🔥 AQUÍ EL FIX
    return [resultado];
  }

  //========================================
  //SEGUNDA HOJA
  //==========================================

  //Grafico 11
  procesarHorasNumericas() {
    //const equiposValidos = ['BOLTER-3', 'BOLTER-5'];

    // 🔥 usa lista (más limpio y escalable)
    const codigosValidos = ['101', '103', '111'];

    const result: any[] = [];

    //console.log('🔍 TOTAL operaciones:', this.operacionesFiltradas?.length);

    this.operacionesFiltradas.forEach((op, i) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;
      const fecha = op.fecha || 'SIN_FECHA';

      // console.log(`➡️ OP[${i}]`, {
      //   modeloEquipo,
      //   fecha,
      //   tieneRegistros: Array.isArray(op.registros)
      // });

      // 🔥 FILTRO DE EQUIPO
      // if (!equiposValidos.includes(modeloEquipo)) {
      //   // console.log('⛔ FUERA POR EQUIPO:', modeloEquipo);
      //   return;
      // }

      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) {
        // console.log('⛔ SIN REGISTROS ARRAY');
        return;
      }

      // console.log(`✅ REGISTROS encontrados: ${registrosArray.length}`);

      registrosArray.forEach((r, j) => {
        // 🔥 FIX REAL: limpiar codigo
        const codigo = String(r?.codigo ?? '').trim();

        //console.log(`   📌 REG[${j}] codigo: [${codigo}]`);

        // 🔥 FILTRO CODIGO (ahora correcto)
        if (!codigosValidos.includes(codigo)) {
          //console.log('   ⛔ DESCARTADO POR CODIGO');
          return;
        }

        const horaStr = r?.hora_inicio;

        if (!horaStr || typeof horaStr !== 'string') {
          //console.log('   ⛔ HORA INVALIDA:', horaStr);
          return;
        }

        const partes = horaStr.split(':').map(Number);

        if (partes.length < 2 || isNaN(partes[0]) || isNaN(partes[1])) {
          //console.log('   ⛔ FORMATO HORA MALO:', horaStr);
          return;
        }

        const h = partes[0] || 0;
        const m = partes[1] || 0;
        const s = partes[2] || 0;

        const hora_decimal = Number((h + m / 60 + s / 3600).toFixed(4));

        //console.log('   ✅ OK →', { horaStr, hora_decimal });

        result.push({
          modeloEquipo,
          fecha,
          hora_inicio: horaStr,
          hora_decimal,
          codigo,
        });
      });
    });

    //console.log('📊 RESULTADO FINAL:', result);

    return result.sort((a, b) => {
      if (a.fecha === b.fecha) {
        return a.hora_decimal - b.hora_decimal;
      }
      return a.fecha.localeCompare(b.fecha);
    });
  }

  //Grafico 12
  ProcesarContViajesSC() {
    const resultado: any[] = [];

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;
      const fecha = op.fecha || null;
      const turno = op.turno || 'SIN_TURNO';

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      // 🔥 SOLO EL PRIMER OPERATIVO
      const primerOperativo = registros.find((r) => r.estado === 'OPERATIVO');

      if (!primerOperativo) return;

      const opReg = primerOperativo.operacion || primerOperativo;

      const horaInicio = primerOperativo.hora_inicio || null;

      // 🔹 LABOR_INICIO_SC
      const tipo = opReg.tipo_labor_inicio || '';
      const labor = opReg.labor_inicio || '';
      const ala = opReg.ala_inicio || '';
      const nivel = opReg.nivel_inicio || '';

      let laborConcat = `${tipo}${labor}`;

      if (ala !== '') {
        laborConcat += `-${ala}`;
      }

      if (!laborConcat || laborConcat.trim() === '') {
        laborConcat = nivel;
      }

      const laborFinal =
        laborConcat && laborConcat.trim() !== ''
          ? laborConcat.trim()
          : 'SIN_LABOR';

      resultado.push({
        modeloEquipo,
        fecha,
        turno,
        hora_inicio: horaInicio,
        labor: laborFinal,
      });
    });

    //console.log('📊 PRIMER OPERATIVO SC:', resultado);

    return resultado;
  }

  //Grafico 13

  ProcesarDetalleEquipoSC() {
    const resultado: any[] = [];

    this.operacionesFiltradas.forEach((op) => {
      const modeloEquipo = `${op.equipo}-${op.n_equipo}`;
      const capacidad = Number(op.capacidad) || 0;

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      const horometro = (op as any).horometros?.horometro;

      const inicio = horometro?.inicio;
      const fin = horometro?.final;

      let diferenciaDiesel = 0;

      if (inicio != null && fin != null) {
        diferenciaDiesel = Number((fin - inicio).toFixed(2));
      }

      let tonelaje = 0;
      let horasOperativo = 0;
      let totalCucharas = 0; // 🔥 NUEVO

      registros.forEach((r) => {
        const opReg = r.operacion || r;
        const codigo = String(r.codigo);
        const nCucharas = Number(opReg.n_cucharas) || 0;

        // 🔥 ACUMULAR CUCHARAS
        if (r.estado === 'OPERATIVO' && nCucharas > 0) {
          totalCucharas += nCucharas;
        }

        // 🔵 TONELAJE
        if (r.estado === 'OPERATIVO' && nCucharas > 0 && capacidad > 0) {
          const base = capacidad * nCucharas * 0.7646;

          if (['101', '102', '103'].includes(codigo)) {
            tonelaje += base * 3.8;
          }

          if (['111', '112', '113', '120'].includes(codigo)) {
            tonelaje += base * 2.7;
          }
        }

        // 🔴 HORAS OPERATIVO
        if (r.estado === 'OPERATIVO') {
          const inicio = r.hora_inicio;
          const fin = r.hora_final;

          if (!inicio || !fin) return;

          const horas = this.calcularHoras(inicio, fin);

          if (horas > 0) {
            horasOperativo += horas;
          }
        }
      });

      const tn_h = horasOperativo > 0 ? tonelaje / horasOperativo : 0;

      resultado.push({
        modeloEquipo,

        DiferenciaDiesel: Number(diferenciaDiesel.toFixed(2)),
        Tonelaje: Number(tonelaje.toFixed(2)),
        HorasOperativo: Number(horasOperativo.toFixed(2)),
        Tn_h_SC: Number(tn_h.toFixed(2)),
        TotalCucharas: totalCucharas, // 🔥 NUEVO
      });
    });

    //console.log('📊 DETALLE EQUIPO SC:', resultado);

    return resultado;
  }

  //Grafico 15
  ProcesarOperadorTurnoSC() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const operador = op.operador || 'SIN_OPERADOR';
      const turno = op.turno || 'SIN_TURNO';
      const capacidad = Number(op.capacidad) || 0;

      const registros = op.registros;
      if (!Array.isArray(registros)) return;

      let tonelaje = 0;
      let horasOperativo = 0;

      registros.forEach((r) => {
        const opReg = r.operacion || r;
        const codigo = String(r.codigo);
        const nCucharas = Number(opReg.n_cucharas) || 0;

        // 🔵 TONELAJE
        if (r.estado === 'OPERATIVO' && nCucharas > 0 && capacidad > 0) {
          const base = capacidad * nCucharas * 0.7646;

          if (['101', '102', '103'].includes(codigo)) {
            tonelaje += base * 3.8;
          }

          if (['111', '112', '113', '120'].includes(codigo)) {
            tonelaje += base * 2.7;
          }
        }

        // 🔴 HORAS OPERATIVO
        if (r.estado === 'OPERATIVO') {
          const inicio = r.hora_inicio;
          const fin = r.hora_final;

          if (!inicio || !fin) return;

          const horas = this.calcularHoras(inicio, fin);

          if (horas > 0) {
            horasOperativo += horas;
          }
        }
      });

      // 🔑 clave operador + turno
      const key = `${operador}|${turno}`;

      if (!mapa.has(key)) {
        mapa.set(key, {
          operador,
          turno,
          tonelaje: 0,
          horasOperativo: 0,
        });
      }

      const grupo = mapa.get(key);

      grupo.tonelaje += tonelaje;
      grupo.horasOperativo += horasOperativo;
    });

    // 🔥 RESULTADO FINAL
    const resultado = Array.from(mapa.values()).map((item) => {
      const tn_h =
        item.horasOperativo > 0 ? item.tonelaje / item.horasOperativo : 0;

      return {
        operador: item.operador,
        turno: item.turno,

        Tonelaje: Number(item.tonelaje.toFixed(2)),
        HorasOperativo: Number(item.horasOperativo.toFixed(2)),
        Tn_h_SC: Number(tn_h.toFixed(2)),
      };
    });

    //console.log('📊 OPERADOR + TURNO SC:', resultado);

    return resultado;
  }

  //Grafico 16
  procesarLaborFRDetallado() {
    const mapa = new Map<string, any>();

    this.operacionesFiltradas.forEach((op) => {
      const registrosArray = op.registros;
      if (!Array.isArray(registrosArray)) return;

      const modelo =
        op.equipo && op.n_equipo ? `${op.equipo}-${op.n_equipo}` : 'SIN_EQUIPO';

      const operador = op.operador || 'SIN_OPERADOR';

      registrosArray.forEach((r) => {
        const opReg = r?.operacion || {};

        // 🔥 CAMPOS BI
        const tipo = opReg.tipo_labor_inicio || '';
        const labor = opReg.labor_inicio || '';
        const ala = opReg.ala_inicio || '';
        const nivel = opReg.nivel_inicio || '';

        const observaciones = opReg.observaciones;

        // ❌ filtrar observaciones vacías
        if (!observaciones || !observaciones.trim()) return;

        // =====================================================
        // 🔵 LABOR_INICIO_SC (IGUAL A DAX)
        // =====================================================
        let concat = `${tipo}${labor}`;

        if (ala !== '') {
          concat += `-${ala}`;
        }

        if (!concat || concat.trim() === '') {
          concat = nivel;
        }

        const laborFinal =
          concat && concat.trim() !== '' ? concat.trim() : 'SIN_LABOR';

        // 🔑 clave
        const key = `${modelo}|${operador}|${laborFinal}`;

        if (!mapa.has(key)) {
          mapa.set(key, {
            modelo_equipo: modelo,
            operador,
            labor: laborFinal, // 🔥 actualizado
            observaciones,
            count: 0,
          });
        }

        const item = mapa.get(key)!;

        item.count += 1;
      });
    });

    const resultado = Array.from(mapa.values());

    console.log('📊 LABOR FR DETALLADO:', resultado);

    return resultado;
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
