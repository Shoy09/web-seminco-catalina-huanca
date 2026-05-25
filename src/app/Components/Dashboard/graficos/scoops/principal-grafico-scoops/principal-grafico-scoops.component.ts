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
import { EstadoService } from '../../../../../services/estado.service';
import { DisponibilidadDiaMesComponent } from '../Graficos components/Disponibilidad/disponibilidad-dia-mes/disponibilidad-dia-mes.component';
import { DisponibilidadEquipoComponent } from '../Graficos components/Disponibilidad/disponibilidad-equipo/disponibilidad-equipo.component';
import { DisponibilidadEstadoComponent } from '../Graficos components/Disponibilidad/disponibilidad-estado/disponibilidad-estado.component';
import { DisponibilidadGuardiaComponent } from '../Graficos components/Disponibilidad/disponibilidad-guardia/disponibilidad-guardia.component';
import { DisponibilidadMesComponent } from '../Graficos components/Disponibilidad/disponibilidad-mes/disponibilidad-mes.component';
import { DisponibilidadSemanaComponent } from '../Graficos components/Disponibilidad/disponibilidad-semana/disponibilidad-semana.component';
import { RendimientoGeneralComponent } from '../Graficos components/Rendimiento/rendimiento-general/rendimiento-general.component';
import { RendimientoGuardiaComponent } from "../Graficos components/Rendimiento/rendimiento-guardia/rendimiento-guardia.component";
import { RendimientoSeccionLaborComponent } from "../Graficos components/Rendimiento/rendimiento-seccion-labor/rendimiento-seccion-labor.component";
import { RendimientoMesAnoComponent } from "../Graficos components/Rendimiento/rendimiento-mes-ano/rendimiento-mes-ano.component";
import { TopEquiposComponent } from "../Graficos components/Rendimiento/top-equipos/top-equipos.component";
import { RendimientoDiaMesComponent } from "../Graficos components/Rendimiento/rendimiento-dia-mes/rendimiento-dia-mes.component";
import { RankingOperadorUtilizacionComponent } from "../Graficos components/Ranking operador/ranking-operador-utilizacion/ranking-operador-utilizacion.component";
import { RankingOperadorRendimientoComponent } from "../Graficos components/Ranking operador/ranking-operador-rendimiento/ranking-operador-rendimiento.component";
import { UtilizacionEquipoComponent } from "../Graficos components/Utilizacion/utilizacion-equipo/utilizacion-equipo.component";
import { UtilizacionSemanaComponent } from "../Graficos components/Utilizacion/utilizacion-semana/utilizacion-semana.component";
import { UtilizacionMesComponent } from "../Graficos components/Utilizacion/utilizacion-mes/utilizacion-mes.component";
import { UtilizacionGuardiaComponent } from "../Graficos components/Utilizacion/utilizacion-guardia/utilizacion-guardia.component";
import { HorasDemoraCodigoComponent } from "../Graficos components/Utilizacion/horas-demora-codigo/horas-demora-codigo.component";
import { UtilizacionDiaMesComponent } from "../Graficos components/Utilizacion/app-utilizacion-dia-mes/app-utilizacion-dia-mes.component";
import { DisponibilidadRankingGuardiaComponent } from "../Graficos components/Ranking Guardia/disponibilidad-guardia/disponibilidad-guardia.component";
import { MineralRankingGuardiaComponent } from "../Graficos components/Ranking Guardia/mineral-guardia/mineral-guardia.component";
import { RendimientoRankingGuardiaComponent } from "../Graficos components/Ranking Guardia/rendimiento-guardia/rendimiento-guardia.component";
import { UtilizacionRankingGuardiaComponent } from "../Graficos components/Ranking Guardia/utilizacion-guardia/utilizacion-guardia.component";
import { PromediosMaterialesEquipoComponent } from "../Graficos components/Ranking Guardia/promedios-materiales-equipo/promedios-materiales-equipo.component";
import { PromedioMaterialGuardiaComponent } from "../Graficos components/Ranking Guardia/promedio-material-guardia/promedio-material-guardia.component";
import { ParetoNoProgramadasComponent } from "../Graficos components/Dis_Pareto_Detalle/pareto-no-programada/pareto-no-programada.component";
import { DiagramaParetoComponent } from "../Graficos components/Util_Pareto_Detalle/diagrama-pareto/diagrama-pareto.component";
import { MtbfEquipoComponent } from '../Graficos components/MTBF-MTTR/MTBF/mtbf-equipo/mtbf-equipo.component';
import { MtbfSemanasComponent } from '../Graficos components/MTBF-MTTR/MTBF/mtbf-semanas/mtbf-semanas.component';
import { MtbfAnoComponent } from '../Graficos components/MTBF-MTTR/MTBF/mtbf-ano/mtbf-ano.component';
import { MtbfMesComponent } from '../Graficos components/MTBF-MTTR/MTBF/mtbf-mes/mtbf-mes.component';
import { MttrEquipoComponent } from "../Graficos components/MTBF-MTTR/MTTR/mttr-equipo/mttr-equipo.component";
import { MttrAnoComponent } from "../Graficos components/MTBF-MTTR/MTTR/mttr-ano/mttr-ano.component";
import { MttrSemanasComponent } from "../Graficos components/MTBF-MTTR/MTTR/mttr-semanas/mttr-semanas.component";
import { MttrMesComponent } from "../Graficos components/MTBF-MTTR/MTTR/mttr-mes/mttr-mes.component";
import { ExcelImportService } from '../../../../../services/subir data/excel-operacion-mapper-scoops.service';
import { EquipoService } from '../../../../../services/equipo.service';
import { Equipo } from '../../../../../models/equipo.model';
import { HorasOperativasDiaComponent } from '../Graficos components/HorasOperativas/horas-operativas-dia/horas-operativas-dia.component';
import { HorasOperativasSemanaComponent } from '../Graficos components/HorasOperativas/horas-operativas-semana/horas-operativas-semana.component';
import { HorasOperativasMesComponent } from '../Graficos components/HorasOperativas/horas-operativas-mes/horas-operativas-mes.component';
import { generarDiasEntreFechas, MESES_CORTOS, obtenerPeriodo, obtenerPeriodoDesdeKey, obtenerRangoSemanaISO, obtenerSemanaISO, parseFechaLocal } from '../../../../../utils/fecha-utils';


@Component({
  selector: 'app-principal-grafico-scoops',
  imports: [
    CommonModule,
    FormsModule,
    DisponibilidadEquipoComponent,
    DisponibilidadSemanaComponent,
    DisponibilidadMesComponent,
    DisponibilidadGuardiaComponent,
    DisponibilidadEstadoComponent,
    DisponibilidadDiaMesComponent,
    RendimientoGeneralComponent,
    RendimientoGuardiaComponent,
    RendimientoSeccionLaborComponent,
    RendimientoMesAnoComponent,
    TopEquiposComponent,
    RendimientoDiaMesComponent,
    RankingOperadorUtilizacionComponent,
    RankingOperadorRendimientoComponent,
    UtilizacionEquipoComponent,
    UtilizacionSemanaComponent,
    UtilizacionMesComponent,
    UtilizacionGuardiaComponent,
    HorasDemoraCodigoComponent,
    UtilizacionDiaMesComponent,
    DisponibilidadRankingGuardiaComponent,
    MineralRankingGuardiaComponent,
    RendimientoRankingGuardiaComponent,
    UtilizacionRankingGuardiaComponent,
    PromediosMaterialesEquipoComponent,
    PromedioMaterialGuardiaComponent,
    ParetoNoProgramadasComponent,
    DiagramaParetoComponent,
    MtbfEquipoComponent,
    MtbfSemanasComponent,
    MtbfMesComponent,
    MtbfAnoComponent,
    MttrEquipoComponent,
    MttrAnoComponent,
    MttrSemanasComponent,
    MttrMesComponent,
    HorasOperativasDiaComponent,
    HorasOperativasSemanaComponent,
    HorasOperativasMesComponent,
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
DataDisponibilidadPorEquipo: any[] = [];
DataDisponibilidadPorSemana: any[] = [];
DataDisponibilidadPorMes: any[] = [];
DataHorasMantenimientoPorCodigo: any[] = [];
DataDisponibilidadPorDiaMes: any[] = [];
DataDisponibilidadPorSeccion: any[] = [];
DataUtilizacionPorEquipo: any[] = [];
DataUtilizacionPorSemana: any[] = [];
DataUtilizacionPorMes: any[] = [];
DataHorasDemoraPorCodigo: any[] = [];
DataUtilizacionPorDia: any[] = [];
DataUtilizacionPorSeccionDetallada: any[] = [];
DataRendimientoPorSeccionDetallado: any[] = [];
DataprocesarEquiposConCapacidad: any[] = [];
DataRendimientoPorMes: any[] = [];
DataRendimientoPorDia: any[] = [];
DataDisponibilidadPorOperador: any[] = [];

DataRendimientoPorOperador: any[] = [];
DataHorasPorObservacion: any[] = [];

DataDisponiblidadPorGuardia: any[] = [];
DataRendimientoPorGuardia: any[] = [];
DataMineralGuardia: any[] = [];
DataUtilizacionGuardia: any[] = [];

dataHorasOperativasDia: any[] = [];
dataHorasOperativasSemana: any[] = [];
dataHorasOperativasMes: any[] = [];

  estadosProceso: any[] = [];
vistaPrincipal: boolean = true;

importandoExcel = false;
equiposProceso: Equipo[] = [];
constructor(
    private planMensualService: PlanMensualService,
    private fechasPlanMensualService: FechasPlanMensualService,
    private operacionesService: OperacionesService,
        private estadoService: EstadoService,
        private excelImportService: ExcelImportService,
        private equipoService: EquipoService
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

  obtenerEquiposPorProceso(proceso: string) {
  this.equipoService.getEquiposByProceso(proceso)
    .subscribe({
      next: (data) => {
        this.equiposProceso = data;

        console.log('Equipos por proceso:', data);
      },
      error: (err) => {
        console.error('Error al traer equipos por proceso', err);
      }
    });
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

  // 🔥 DISPONIBILIDAD
  this.DataDisponibilidadPorEquipo = this.DisponibilidadPorEquipo();
  this.DataDisponibilidadPorSemana = this.DisponibilidadPorSemana();
  this.DataDisponibilidadPorMes = this.DisponibilidadPorMes();
  this.DataHorasMantenimientoPorCodigo = this.HorasMantenimientoPorCodigo();
  this.DataDisponibilidadPorDiaMes = this.DisponibilidadPorDiaMes();
  this.DataDisponibilidadPorSeccion = this.DisponibilidadPorSeccion();
  //UTILIZACION
  this.DataUtilizacionPorEquipo = this.UtilizacionPorEquipo();
  this.DataUtilizacionPorSemana = this.UtilizacionPorSemana();
  this.DataUtilizacionPorMes = this.UtilizacionPorMes();
  this.DataHorasDemoraPorCodigo = this.HorasDemoraPorCodigo();
  this.DataUtilizacionPorDia = this.UtilizacionPorDia();
  this.DataUtilizacionPorSeccionDetallada = this.UtilizacionPorSeccionDetallada();
  //RENDIMIENTO
  this.DataRendimientoPorSeccionDetallado = this.RendimientoPorSeccionDetallado();
  this.DataprocesarEquiposConCapacidad = this.RendimientoPorEquipo();
  this.DataRendimientoPorMes = this.RendimientoPorMes();
  this.DataRendimientoPorDia = this.RendimientoPorDia();
  //RANKING OPERADOR
  this.DataDisponibilidadPorOperador = this.DisponibilidadPorOperador();
  this.DataRendimientoPorOperador = this.RendimientoPorOperador();


  //DIS_PARETO DETALLE
  this.DataHorasPorObservacion = this.HorasPorObservacion();

  // Ranking Guardia
  this.DataDisponiblidadPorGuardia = this.DisponibilidadPorGuardia();
  this.DataRendimientoPorGuardia = this.RendimientoPorGuardia();
  this.DataMineralGuardia = this.MineralGuardia();
  this.DataUtilizacionGuardia = this.UtilizacionGuardia();

  this.dataHorasOperativasDia = this.HorasOperativasPorDia();
  this.dataHorasOperativasSemana = this.HorasOperativasPorSemana();
  this.dataHorasOperativasMes = this.HorasOperativasPorMes();

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
    //console.log('DATA FILTRADA:', this.operacionesFiltradas);
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
//GRAFICO 1 - DISPONIBILIDAD POR EQUIPO
  DisponibilidadPorEquipo() {
  const resultadoMap = new Map<string, any>();

  this.operacionesFiltradas.forEach((op) => {
    const modeloEquipo = `${op.n_equipo}`;
    const HORAS_TOTALES = 12;
    let horasMtto = 0;

    const registrosArray = op.registros;
    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      if (registro.estado !== 'MANTENIMIENTO') continue;
      
      const horas = this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );
      horasMtto += horas;
    }

    horasMtto = Math.min(horasMtto, HORAS_TOTALES);

    if (!resultadoMap.has(modeloEquipo)) {
      resultadoMap.set(modeloEquipo, {
        modeloEquipo,
        horasTotales: 0,
        horasMtto: 0,
        disponibilidad: 0,
        cantidadPartes: 0
      });
    }

    const item = resultadoMap.get(modeloEquipo);
    item.horasTotales += HORAS_TOTALES;
    item.horasMtto += horasMtto;
    item.cantidadPartes += 1;

    // 🔥 CON SI.ERROR - usando try-catch
    try {
      const disponibilidadActual = ((item.horasTotales - item.horasMtto) / item.horasTotales) * 100;
      item.disponibilidad = Number(disponibilidadActual.toFixed(2));
    } catch (error) {
      item.disponibilidad = 0; // 🔥 como el SI.ERROR
    }
  });

  const resultado = Array.from(resultadoMap.values());
  // console.log('📊 DISPONIBILIDAD POR EQUIPO:', resultado);
  return resultado;
}

private calcularDuracionHoras(
  horaInicio: string,
  horaFinal: string
): number {

  if (!horaInicio || !horaFinal) return 0;

  const [h1, m1] = horaInicio.split(':').map(Number);
  const [h2, m2] = horaFinal.split(':').map(Number);

  let inicio = h1 * 60 + m1;
  let fin = h2 * 60 + m2;

  // 🔥 cruza medianoche
  if (fin < inicio) {
    fin += 24 * 60;
  }

  return Number(((fin - inicio) / 60).toFixed(2));
}

//GRAFICO 2 - DISPONIBILIDAD POR SEMANA

DisponibilidadPorSemana() {

  const resultadoMap = new Map<string, any>();

  this.operacionesFiltradas.forEach((op) => {

    const HORAS_TOTALES = 12;

    let horasMtto = 0;

    const registrosArray = op.registros;

    if (!Array.isArray(registrosArray)) return;

    // 🔥 calcular semana desde fecha
    const numeroSemana = this.obtenerNumeroSemana(op.fecha);

    const semanaLabel = `SEM ${numeroSemana}`;

    // 🔥 recorrer registros
    for (const registro of registrosArray) {

      if (registro.estado !== 'MANTENIMIENTO') continue;

      const horas = this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );

      horasMtto += horas;
    }

    horasMtto = Math.min(horasMtto, HORAS_TOTALES);

    // 🔥 crear semana si no existe
    if (!resultadoMap.has(semanaLabel)) {

      resultadoMap.set(semanaLabel, {
        semana: semanaLabel,
        numeroSemana,
        horasTotales: 0,
        horasMtto: 0,
        disponibilidad: 0,
        cantidadPartes: 0
      });
    }

    const item = resultadoMap.get(semanaLabel);

    item.horasTotales += HORAS_TOTALES;
    item.horasMtto += horasMtto;
    item.cantidadPartes += 1;

    // 🔥 tipo SI.ERROR
    const disponibilidadCalculada =
      item.horasTotales > 0
        ? (
            (item.horasTotales - item.horasMtto) /
            item.horasTotales
          )
        : 0;

    item.disponibilidad = Number(
      (disponibilidadCalculada * 100).toFixed(2)
    );
  });

  // 🔥 ordenar semanas
  const resultado = Array.from(resultadoMap.values())
    .sort((a, b) => a.numeroSemana - b.numeroSemana);

  // console.log(
  //   '📊 DISPONIBILIDAD POR SEMANA:',
  //   resultado
  // );

  return resultado;
}

private obtenerNumeroSemana(fecha: string): number {

  const date = new Date(fecha);

  // 🔥 inicio año
  const inicioAnio = new Date(date.getFullYear(), 0, 1);

  // 🔥 días transcurridos
  const dias =
    Math.floor(
      (
        date.getTime() -
        inicioAnio.getTime()
      ) / 86400000
    );

  // 🔥 semana del año
  return Math.ceil((dias + inicioAnio.getDay() + 1) / 7);
}

//GRAFICO 3 - DISPONIBILIDAD POR MES
  DisponibilidadPorMes() {
  const resultadoMap = new Map<string, any>();

  this.operacionesFiltradas.forEach((op) => {
    const HORAS_TOTALES = 12;
    let horasMtto = 0;
    const registrosArray = op.registros;

    if (!Array.isArray(registrosArray) || !op.fecha) return;

    // 🔥 obtener año y mes
    const fecha = new Date(op.fecha);
    const año = fecha.getFullYear();
    const mes = fecha.getMonth() + 1;
    const clave = `${año}-${mes.toString().padStart(2, '0')}`;

    // 🔥 calcular horas mantenimiento
    for (const registro of registrosArray) {
      if (registro.estado !== 'MANTENIMIENTO') continue;
      horasMtto += this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );
    }

    horasMtto = Math.min(horasMtto, HORAS_TOTALES);

    // 🔥 inicializar o actualizar
    if (!resultadoMap.has(clave)) {
      resultadoMap.set(clave, {
        periodo: clave,
        año,
        mes,
        horasTotales: 0,
        horasMtto: 0,
        disponibilidad: 0,
        cantidadPartes: 0
      });
    }

    const item = resultadoMap.get(clave);
    item.horasTotales += HORAS_TOTALES;
    item.horasMtto += horasMtto;
    item.cantidadPartes += 1;

    // 🔥 calcular disponibilidad (SI.ERROR)
    item.disponibilidad = item.horasTotales > 0
      ? Number((((item.horasTotales - item.horasMtto) / item.horasTotales) * 100).toFixed(2))
      : 0;
  });

  const resultado = Array.from(resultadoMap.values())
    .sort((a, b) => {
      if (a.año !== b.año) return a.año - b.año;
      return a.mes - b.mes;
    });

  //console.log('📊 DISPONIBILIDAD POR MES:', resultado);
  return resultado;
}

//GRAFICO 4  FALTA


//GRAFICO 5 horas Estados
HorasMantenimientoPorCodigo() {

  const resultadoMap = new Map<string, any>();

  this.operacionesFiltradas.forEach((op) => {

    const registrosArray = op.registros;

    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {

      // 🔥 SOLO mantenimiento
      if (registro.estado !== 'MANTENIMIENTO')
        continue;

      // 🔥 código
      const codigo =
        registro.codigo || 'SIN_CODIGO';

      // 🔥 horas
      const horas =
        this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final
        );

      // 🔥 crear item
      if (!resultadoMap.has(codigo)) {

        resultadoMap.set(codigo, {
          codigo,
          horas: 0,
          cantidadRegistros: 0
        });
      }

      const item = resultadoMap.get(codigo);

      item.horas += horas;

      item.cantidadRegistros += 1;
    }
  });

  // 🔥 convertir array
  const resultado =
    Array.from(resultadoMap.values())

    // 🔥 ordenar mayor a menor
    .sort((a, b) => b.horas - a.horas)

    // 🔥 redondear
    .map(item => ({
      ...item,
      horas: Number(item.horas.toFixed(2))
    }));

  // console.log(
  //   '📊 HORAS MTTO POR CODIGO:',
  //   resultado
  // );

  return resultado;
}

//GRAFICO 6
DisponibilidadPorDiaMes() {

  const resultadoMap = new Map<string, any>();

  this.operacionesFiltradas.forEach((op) => {

    if (!op.fecha) return;

    const HORAS_TOTALES = 12;

    let horasMtto = 0;

    const registrosArray = op.registros;

    if (!Array.isArray(registrosArray)) return;

    // =====================================
    // FECHA
    // =====================================

    const fecha = new Date(op.fecha);

    const año = fecha.getFullYear();

    const mesNumero =
      fecha.getMonth() + 1;

    const dia =
      fecha.getDate();

    // 🔥 clave única día
    const clave =
      `${año}-${mesNumero}-${dia}`;

    // =====================================
    // HORAS MTTO
    // =====================================

    for (const registro of registrosArray) {

      if (
        registro.estado !== 'MANTENIMIENTO'
      ) continue;

      horasMtto +=
        this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final
        );
    }

    horasMtto = Math.min(
      horasMtto,
      HORAS_TOTALES
    );

    // =====================================
    // CREAR
    // =====================================

    if (!resultadoMap.has(clave)) {

      resultadoMap.set(clave, {

        año,

        mes: mesNumero,

        dia,

        horasTotales: 0,

        horasMtto: 0,

        disponibilidad: 0,

        cantidadPartes: 0
      });
    }

    const item = resultadoMap.get(clave);

    item.horasTotales += HORAS_TOTALES;

    item.horasMtto += horasMtto;

    item.cantidadPartes += 1;

    // =====================================
    // DISPONIBILIDAD
    // =====================================

    item.disponibilidad =
      item.horasTotales > 0
        ? Number(
            (
              (
                (
                  item.horasTotales -
                  item.horasMtto
                ) /
                item.horasTotales
              ) * 100
            ).toFixed(2)
          )
        : 0;
  });

  // =====================================
  // ARRAY
  // =====================================

  const resultado =
    Array.from(resultadoMap.values())

    .sort((a, b) => {

      const fechaA =
        new Date(
          a.año,
          a.mes - 1,
          a.dia
        ).getTime();

      const fechaB =
        new Date(
          b.año,
          b.mes - 1,
          b.dia
        ).getTime();

      return fechaA - fechaB;
    });

  // console.log(
  //   '📊 DISPONIBILIDAD POR DIA/MES:',
  //   resultado
  // );

  return resultado;
}

DisponibilidadPorSeccion() {
  const resultadoMap = new Map<string, any>();

  this.operacionesFiltradas.forEach((op) => {
    const seccion = op.seccion || 'SIN SECCION';
    const HORAS_TOTALES = 12;
    let horasMtto = 0;

    const registrosArray = op.registros;
    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      if (registro.estado !== 'MANTENIMIENTO') continue;

      const horas = this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );

      horasMtto += horas;
    }

    horasMtto = Math.min(horasMtto, HORAS_TOTALES);

    if (!resultadoMap.has(seccion)) {
      resultadoMap.set(seccion, {
        seccion,
        horasTotales: 0,
        horasMtto: 0,
        disponibilidad: 0,
        cantidadPartes: 0
      });
    }

    const item = resultadoMap.get(seccion);

    item.horasTotales += HORAS_TOTALES;
    item.horasMtto += horasMtto;
    item.cantidadPartes += 1;

    try {
      const disponibilidadActual =
        ((item.horasTotales - item.horasMtto) / item.horasTotales) * 100;

      item.disponibilidad = Number(disponibilidadActual.toFixed(2));
    } catch (error) {
      item.disponibilidad = 0;
    }
  });

  const resultado = Array.from(resultadoMap.values());

   //console.log('📊 DISPONIBILIDAD POR SECCION:', resultado);

  return resultado;
}

//=========================================
//HOJA 2
//=========================================

//GRAFICO 1 - UTILIZACIÓN POR EQUIPO
UtilizacionPorEquipo() {
  const resultadoMap = new Map<string, any>();

  this.operacionesFiltradas.forEach((op) => {
    const modeloEquipo = `${op.equipo}-${op.n_equipo}`;
    const HORAS_TOTALES = 12;
    let horasMtto = 0;
    let horasOperativas = 0;

    const registrosArray = op.registros;
    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      const horas = this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );

      // 🔥 Acumular horas de MANTENIMIENTO
      if (registro.estado === 'MANTENIMIENTO') {
        horasMtto += horas;
      }
      
      // 🔥 Acumular horas de OPERATIVO
      if (registro.estado === 'OPERATIVO') {
        horasOperativas += horas;
      }
    }

    // Limitar horasMtto al total disponible
    horasMtto = Math.min(horasMtto, HORAS_TOTALES);
    // Limitar horasOperativas al total disponible
    horasOperativas = Math.min(horasOperativas, HORAS_TOTALES);

    if (!resultadoMap.has(modeloEquipo)) {
      resultadoMap.set(modeloEquipo, {
        modeloEquipo,
        horasTotales: 0,
        horasMtto: 0,
        horasOperativas: 0,
        utilizacion: 0,
        cantidadPartes: 0
      });
    }

    const item = resultadoMap.get(modeloEquipo);
    item.horasTotales += HORAS_TOTALES;
    item.horasMtto += horasMtto;
    item.horasOperativas += horasOperativas;
    item.cantidadPartes += 1;

    // 🔥 Fórmula: Utilizacion = HRS OPERATIVAS / (HORAS - HRS MTTO)
    // CON SI.ERROR - usando try-catch
    try {
      const denominador = item.horasTotales - item.horasMtto;
      
      if (denominador === 0) {
        item.utilizacion = 0; // 🔥 Evitar división por cero
      } else {
        const utilizacionActual = (item.horasOperativas / denominador) * 100;
        item.utilizacion = Number(utilizacionActual.toFixed(2));
      }
    } catch (error) {
      item.utilizacion = 0; // 🔥 como el SI.ERROR
    }
  });

  const resultado = Array.from(resultadoMap.values());
  // console.log('📊 UTILIZACIÓN POR EQUIPO:', resultado);
  return resultado;
}

//GRAFICO 2 - UTILIZACIÓN POR SEMANA
UtilizacionPorSemana() {

  const resultadoMap = new Map<string, any>();

  this.operacionesFiltradas.forEach((op) => {

    const HORAS_TOTALES = 12;
    let horasMtto = 0;
    let horasOperativas = 0;

    const registrosArray = op.registros;

    if (!Array.isArray(registrosArray)) return;

    // 🔥 calcular semana desde fecha
    const numeroSemana = this.obtenerNumeroSemana(op.fecha);
    const semanaLabel = `SEM ${numeroSemana}`;

    // 🔥 recorrer registros para acumular horas
    for (const registro of registrosArray) {

      const horas = this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );

      // 🔥 Acumular horas de MANTENIMIENTO
      if (registro.estado === 'MANTENIMIENTO') {
        horasMtto += horas;
      }
      
      // 🔥 Acumular horas de OPERATIVO
      if (registro.estado === 'OPERATIVO') {
        horasOperativas += horas;
      }
    }

    // Limitar horas al total disponible
    horasMtto = Math.min(horasMtto, HORAS_TOTALES);
    horasOperativas = Math.min(horasOperativas, HORAS_TOTALES);

    // 🔥 crear semana si no existe
    if (!resultadoMap.has(semanaLabel)) {

      resultadoMap.set(semanaLabel, {
        semana: semanaLabel,
        numeroSemana,
        horasTotales: 0,
        horasMtto: 0,
        horasOperativas: 0,
        utilizacion: 0,
        cantidadPartes: 0
      });
    }

    const item = resultadoMap.get(semanaLabel);

    item.horasTotales += HORAS_TOTALES;
    item.horasMtto += horasMtto;
    item.horasOperativas += horasOperativas;
    item.cantidadPartes += 1;

    // 🔥 Fórmula: Utilizacion = HRS OPERATIVAS / (HORAS TOTALES - HRS MTTO)
    // con tipo SI.ERROR
    let utilizacionCalculada = 0;
    
    const denominador = item.horasTotales - item.horasMtto;
    
    if (denominador > 0) {
      utilizacionCalculada = item.horasOperativas / denominador;
    }

    item.utilizacion = Number(
      (utilizacionCalculada * 100).toFixed(2)
    );
  });

  // 🔥 ordenar semanas
  const resultado = Array.from(resultadoMap.values())
    .sort((a, b) => a.numeroSemana - b.numeroSemana);

  // console.log('📊 UTILIZACIÓN POR SEMANA:', resultado);
  return resultado;
}

//GRAFICO 3 - UTILIZACIÓN POR MES
UtilizacionPorMes() {
  const resultadoMap = new Map<string, any>();

  this.operacionesFiltradas.forEach((op) => {
    const HORAS_TOTALES = 12;
    let horasMtto = 0;
    let horasOperativas = 0;
    
    const registrosArray = op.registros;

    if (!Array.isArray(registrosArray) || !op.fecha) return;

    // 🔥 obtener año y mes
    const fecha = new Date(op.fecha);
    const año = fecha.getFullYear();
    const mes = fecha.getMonth() + 1;
    const clave = `${año}-${mes.toString().padStart(2, '0')}`;

    // 🔥 calcular horas mantenimiento y operativas
    for (const registro of registrosArray) {
      const horas = this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );
      
      if (registro.estado === 'MANTENIMIENTO') {
        horasMtto += horas;
      }
      
      if (registro.estado === 'OPERATIVO') {
        horasOperativas += horas;
      }
    }

    horasMtto = Math.min(horasMtto, HORAS_TOTALES);
    horasOperativas = Math.min(horasOperativas, HORAS_TOTALES);

    // 🔥 inicializar o actualizar
    if (!resultadoMap.has(clave)) {
      resultadoMap.set(clave, {
        periodo: clave,
        año,
        mes,
        horasTotales: 0,
        horasMtto: 0,
        horasOperativas: 0,
        utilizacion: 0,
        cantidadPartes: 0
      });
    }

    const item = resultadoMap.get(clave);
    item.horasTotales += HORAS_TOTALES;
    item.horasMtto += horasMtto;
    item.horasOperativas += horasOperativas;
    item.cantidadPartes += 1;

    // 🔥 calcular utilización (SI.ERROR)
    // Fórmula: Utilizacion = HRS OPERATIVAS / (HORAS TOTALES - HRS MTTO)
    let utilizacionCalculada = 0;
    const denominador = item.horasTotales - item.horasMtto;
    
    if (denominador > 0) {
      utilizacionCalculada = (item.horasOperativas / denominador) * 100;
    }
    
    item.utilizacion = Number(utilizacionCalculada.toFixed(2));
  });

  const resultado = Array.from(resultadoMap.values())
    .sort((a, b) => {
      if (a.año !== b.año) return a.año - b.año;
      return a.mes - b.mes;
    });

  // console.log('📊 UTILIZACIÓN POR MES:', resultado);
  return resultado;
}

//GRAFICO 4 FALTA

//GRAFICO 5 
//GRAFICO - HORAS DE DEMORA POR CÓDIGO
HorasDemoraPorCodigo() {

  const resultadoMap = new Map<string, any>();
  
  // 🔥 Lista de códigos que representan DEMORAS
  const listaDemoras = [
    '301',
    '302',
    '303',
    '304',
    '305',
    '306',
    '307',
    '308',
    '309',
    '310',
    '311',
    '312'
  ];

  this.operacionesFiltradas.forEach((op) => {
    const HORAS_TOTALES = 12;
    
    const registrosArray = op.registros;
    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      
      // 🔥 Verificar si el código está en la lista de demoras
      const codigo = registro.codigo || 'SIN_CODIGO';
      
      if (!listaDemoras.includes(codigo)) continue;
      
      // 🔥 Calcular horas de demora
      let horasDemora = this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );
      
      // 🔥 Limitar horas al total disponible (máximo 12 por operación)
      horasDemora = Math.min(horasDemora, HORAS_TOTALES);
      
      // 🔥 Crear o actualizar item en el mapa
      if (!resultadoMap.has(codigo)) {
        resultadoMap.set(codigo, {
          codigo,
          horasDemora: 0,
          cantidadRegistros: 0,
          descripcion: this.obtenerDescripcionDemora(codigo)
        });
      }
      
      const item = resultadoMap.get(codigo);
      item.horasDemora += horasDemora;
      item.cantidadRegistros += 1;
    }
  });
  
  // 🔥 Convertir a array, ordenar y redondear
  const resultado = Array.from(resultadoMap.values())
    .sort((a, b) => b.horasDemora - a.horasDemora)
    .map(item => ({
      ...item,
      horasDemora: Number(item.horasDemora.toFixed(2))
    }));
  
  // console.log('📊 HORAS DE DEMORA POR CÓDIGO:', resultado);
  return resultado;
}

// 🔥 Método auxiliar para obtener descripción de cada código
private obtenerDescripcionDemora(codigo: string): string {

  const descripciones: { [key: string]: string } = {

    '301': 'Abastecimiento de Combustible',
    '302': 'Charla/Reparto de guardia/Traslado de personal',
    '303': 'Despeje por Voladura',
    '304': 'Inspección de la Labor',
    '305': 'Lavado de Equipo',
    '306': 'Llenado de Check List del Equipo',
    '307': 'Refrigerio/Almuerzo',
    '308': 'Parada Planta',
    '309': 'Paro Sindical',
    '310': 'Operador No Entrega su Reporte',
    '311': 'Incidente/Accidente personal',
    '312': 'Otros'

  };

  return descripciones[codigo] || 'DEMORA DESCONOCIDA';
}

//GRAFICO 6 - UTILIZACIÓN POR DÍA
UtilizacionPorDia() {

  const resultadoMap = new Map<string, any>();

  this.operacionesFiltradas.forEach((op) => {

    if (!op.fecha) return;

    const HORAS_TOTALES = 12;

    let horasMtto = 0;
    let horasOperativas = 0;

    const registrosArray = op.registros;

    if (!Array.isArray(registrosArray)) return;

    // =====================================
    // FECHA
    // =====================================

    const fecha = new Date(op.fecha);

    const año = fecha.getFullYear();

    const mesNumero = fecha.getMonth() + 1;

    const dia = fecha.getDate();

    // 🔥 clave única día
    const clave = `${año}-${mesNumero}-${dia}`;

    // =====================================
    // HORAS MTTO Y OPERATIVAS
    // =====================================

    for (const registro of registrosArray) {

      const horas = this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );

      if (registro.estado === 'MANTENIMIENTO') {
        horasMtto += horas;
      }

      if (registro.estado === 'OPERATIVO') {
        horasOperativas += horas;
      }
    }

    horasMtto = Math.min(horasMtto, HORAS_TOTALES);
    horasOperativas = Math.min(horasOperativas, HORAS_TOTALES);

    // =====================================
    // CREAR
    // =====================================

    if (!resultadoMap.has(clave)) {

      resultadoMap.set(clave, {
        año,
        mes: mesNumero,
        dia,
        horasTotales: 0,
        horasMtto: 0,
        horasOperativas: 0,
        utilizacion: 0,
        cantidadPartes: 0
      });
    }

    const item = resultadoMap.get(clave);

    item.horasTotales += HORAS_TOTALES;
    item.horasMtto += horasMtto;
    item.horasOperativas += horasOperativas;
    item.cantidadPartes += 1;

    // =====================================
    // UTILIZACIÓN
    // Fórmula: HRS OPERATIVAS / (HORAS TOTALES - HRS MTTO)
    // =====================================

    let utilizacionCalculada = 0;
    const denominador = item.horasTotales - item.horasMtto;

    if (denominador > 0) {
      utilizacionCalculada = (item.horasOperativas / denominador) * 100;
    }

    item.utilizacion = Number(utilizacionCalculada.toFixed(2));
  });

  // =====================================
  // ARRAY ORDENADO POR FECHA
  // =====================================

  const resultado = Array.from(resultadoMap.values())
    .sort((a, b) => {
      const fechaA = new Date(a.año, a.mes - 1, a.dia).getTime();
      const fechaB = new Date(b.año, b.mes - 1, b.dia).getTime();
      return fechaA - fechaB;
    });

  // console.log('📊 UTILIZACIÓN POR DÍA:', resultado);
  return resultado;
}

//GRAFICO - UTILIZACIÓN POR SECCIÓN (CON DETALLES)
UtilizacionPorSeccionDetallada() {
  const resultadoMap = new Map<string, any>();

  this.operacionesFiltradas.forEach((op) => {
    const seccion = op.seccion;
    if (!seccion) return;
    
    const HORAS_TOTALES = 12;
    let horasMtto = 0;
    let horasOperativas = 0;
    let totalCucharas = 0;

    const registrosArray = op.registros;
    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      const horas = this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );

      if (registro.estado === 'MANTENIMIENTO') {
        horasMtto += horas;
      }
      
      if (registro.estado === 'OPERATIVO') {
        horasOperativas += horas;
        
        // 🔥 Contar cucharas operativas
        const n_cucharas = registro.operacion?.n_cucharas;
        if (n_cucharas && !isNaN(Number(n_cucharas))) {
          totalCucharas += Number(n_cucharas);
        }
      }
    }

    horasMtto = Math.min(horasMtto, HORAS_TOTALES);
    horasOperativas = Math.min(horasOperativas, HORAS_TOTALES);

    if (!resultadoMap.has(seccion)) {
      resultadoMap.set(seccion, {
        seccion: seccion,
        horasTotales: 0,
        horasMtto: 0,
        horasOperativas: 0,
        totalCucharas: 0,
        utilizacion: 0,
        cantidadOperaciones: 0,
        cantidadEquipos: new Set() // Para contar equipos únicos
      });
    }

    const item = resultadoMap.get(seccion);
    item.horasTotales += HORAS_TOTALES;
    item.horasMtto += horasMtto;
    item.horasOperativas += horasOperativas;
    item.totalCucharas += totalCucharas;
    item.cantidadOperaciones += 1;
    item.cantidadEquipos.add(`${op.equipo}-${op.n_equipo}`);

    // 🔥 Calcular utilización
    const denominador = item.horasTotales - item.horasMtto;
    if (denominador > 0) {
      item.utilizacion = Number(((item.horasOperativas / denominador) * 100).toFixed(2));
    }
  });

  // 🔥 Convertir Set a número
  const resultado = Array.from(resultadoMap.values())
    .map(item => ({
      ...item,
      cantidadEquipos: item.cantidadEquipos.size
    }))
    .sort((a, b) => a.seccion.localeCompare(b.seccion));

  //console.log('📊 UTILIZACIÓN POR SECCIÓN DETALLADA:', resultado);
  return resultado;
}

//=========================================
//HOJA 3
//|=========================================

//GRAFICO - RENDIMIENTO POR SECCIÓN (CON CAPACIDADES PROMEDIO)
RendimientoPorSeccionDetallado() {
  const resultadoMap = new Map<string, any>();

  const codigosPermitidos = ['101', '102', '105', '106', '108'];
  const materialesDesmonte = ['DESMONTE', 'RELAVE', 'RELLENO'];

  this.operacionesFiltradas.forEach((op) => {
    const seccion = op.seccion;
    if (!seccion) return;

    const equipoEncontrado = this.equiposProceso.find(
      equipo => equipo.nombre === op.equipo && equipo.codigo === op.n_equipo
    );

    const capacidadTonelada = Number(equipoEncontrado?.capacidad_tonelada) || 0;
    const capacidadToneladaDesmonte = Number(equipoEncontrado?.capacidad_tonelada_desmonte) || 0;
    const capacidadYd3 = Number(equipoEncontrado?.capacidadYd3) || 0;

    let horasOperativas = 0;
    let toneladasTotales = 0;
    let totalCucharas = 0;
    let toneladasMineral = 0;
    let toneladasDesmonte = 0;

    const registrosArray = op.registros;
    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      const codigo = registro.codigo?.toString() || '';
      if (!codigosPermitidos.includes(codigo)) continue;

      const horas = this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );
      horasOperativas += horas;

      const n_cucharas = registro.operacion?.n_cucharas;
      if (n_cucharas && !isNaN(Number(n_cucharas))) {
        const cucharas = Number(n_cucharas);
        totalCucharas += cucharas;

        const material = (registro.operacion?.material || '').toUpperCase().trim();
        const esDesmonte = materialesDesmonte.includes(material);
        
        const capacidadUsada = esDesmonte ? capacidadToneladaDesmonte : capacidadTonelada;
        const toneladas = cucharas * capacidadUsada;
        
        toneladasTotales += toneladas;
        
        if (esDesmonte) {
          toneladasDesmonte += toneladas;
        } else {
          toneladasMineral += toneladas;
        }
      }
    }

    horasOperativas = Math.min(horasOperativas, 12);

    if (!resultadoMap.has(seccion)) {
      resultadoMap.set(seccion, {
        seccion: seccion,
        horasOperativas: 0,
        totalCucharas: 0,
        totalToneladas: 0,
        toneladasMineral: 0,
        toneladasDesmonte: 0,
        rendimiento: 0,
        rendimientoMineral: 0,
        rendimientoDesmonte: 0,
        cantidadOperaciones: 0,
        cantidadEquipos: new Set()
      });
    }

    const item = resultadoMap.get(seccion);
    item.horasOperativas += horasOperativas;
    item.totalCucharas += totalCucharas;
    item.totalToneladas = Number((item.totalToneladas + toneladasTotales).toFixed(2));
    item.toneladasMineral = Number((item.toneladasMineral + toneladasMineral).toFixed(2));
    item.toneladasDesmonte = Number((item.toneladasDesmonte + toneladasDesmonte).toFixed(2));
    item.cantidadOperaciones += 1;
    item.cantidadEquipos.add(`${op.equipo}-${op.n_equipo}`);

    if (item.horasOperativas > 0) {
      item.rendimiento = Number((item.totalToneladas / item.horasOperativas).toFixed(2));
      item.rendimientoMineral = Number((item.toneladasMineral / item.horasOperativas).toFixed(2));
      item.rendimientoDesmonte = Number((item.toneladasDesmonte / item.horasOperativas).toFixed(2));
    }
  });

  const resultado = Array.from(resultadoMap.values())
    .map(item => ({
      ...item,
      cantidadEquipos: item.cantidadEquipos.size
    }))
    .sort((a, b) => a.seccion.localeCompare(b.seccion));

  //console.log('📊 RENDIMIENTO POR SECCIÓN DETALLADO:', resultado);
  return resultado;
}

RendimientoPorEquipo() {
  const resultadoMap = new Map<string, any>();

  // 🔥 Códigos de actividad permitidos
  const codigosPermitidos = ['101', '102', '105', '106', '108'];

  // 🔥 Materiales que usan capacidad_tonelada_desmonte
  const materialesDesmonte = [
    'DESMONTE', 'RELAVE', 'RELLENO'
  ];

  this.operacionesFiltradas.forEach((op) => {
    const modeloEquipo = `${op.equipo}-${op.n_equipo}`;

    // 🔥 Buscar equipo
    const equipoEncontrado = this.equiposProceso.find(
      equipo =>
        equipo.nombre === op.equipo &&
        equipo.codigo === op.n_equipo
    );

    const capacidadTonelada =
      Number(equipoEncontrado?.capacidad_tonelada) || 0;

    const capacidadToneladaDesmonte =
      Number(equipoEncontrado?.capacidad_tonelada_desmonte) || 0;

    const capacidadYd3 =
      Number(equipoEncontrado?.capacidadYd3) || 0;

    let horasOperativas = 0;
    let toneladasTotales = 0;
    let totalCucharas = 0;

    const registrosArray = op.registros;

    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      const codigo = registro.codigo?.toString() || '';

      // 🔥 Solo códigos permitidos
      if (!codigosPermitidos.includes(codigo)) continue;

      // 🔥 Horas operativas
      const horas = this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );

      horasOperativas += horas;

      // 🔥 Cucharas
      const n_cucharas = registro.operacion?.n_cucharas;

      if (n_cucharas && !isNaN(Number(n_cucharas))) {

        const cucharas = Number(n_cucharas);

        totalCucharas += cucharas;

        // 🔥 Material
        const material = (
          registro.operacion?.material || ''
        ).toUpperCase().trim();

        // 🔥 Elegir capacidad según material
        const capacidadUsada = materialesDesmonte.includes(material)
          ? capacidadToneladaDesmonte
          : capacidadTonelada;

        // 🔥 Calcular toneladas
        toneladasTotales += cucharas * capacidadUsada;
      }
    }

    // 🔥 Máximo 12 horas
    horasOperativas = Math.min(horasOperativas, 12);

    if (!resultadoMap.has(modeloEquipo)) {
      resultadoMap.set(modeloEquipo, {
        modeloEquipo,
        nombre: op.equipo,
        codigo: op.n_equipo,
        capacidadYd3: capacidadYd3,
        capacidadTonelada: capacidadTonelada,
        capacidadToneladaDesmonte: capacidadToneladaDesmonte,
        horasOperativas: 0,
        totalCucharas: 0,
        totalToneladas: 0,
        rendimiento: 0,
        cantidadOperaciones: 0
      });
    }

    const item = resultadoMap.get(modeloEquipo);

    item.horasOperativas += horasOperativas;
    item.totalCucharas += totalCucharas;

    item.totalToneladas = Number(
      (item.totalToneladas + toneladasTotales).toFixed(2)
    );

    item.cantidadOperaciones += 1;

    // 🔥 Rendimiento
    try {
      if (item.horasOperativas > 0) {
        item.rendimiento = Number(
          (
            item.totalToneladas /
            item.horasOperativas
          ).toFixed(2)
        );
      } else {
        item.rendimiento = 0;
      }
    } catch (error) {
      item.rendimiento = 0;
    }
  });

  const resultado = Array.from(resultadoMap.values());
  //console.log('📊 RENDIMIENTO POR EQUIPO:', resultado);
  return resultado;
}

RendimientoPorMes() {
  const resultadoMap = new Map<string, any>();

  // 🔥 Códigos permitidos
  const codigosPermitidos = ['101', '102', '105', '106', '108'];

  // 🔥 Materiales que usan capacidad_tonelada_desmonte
  const materialesDesmonte = [
    'DESMONTE', 'RELAVE', 'RELLENO'
  ];

  // 🔥 Nombres de meses
  const nombresMeses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];

  this.operacionesFiltradas.forEach((op) => {

    if (!op.fecha) return;

    // 🔥 Fecha
    const fecha = new Date(op.fecha);

    const año = fecha.getFullYear();
    const mesNumero = fecha.getMonth() + 1;
    const nombreMes = nombresMeses[mesNumero - 1];

    const clave = `${año}-${mesNumero.toString().padStart(2, '0')}`;

    // 🔥 Buscar equipo
    const equipoEncontrado = this.equiposProceso.find(
      equipo =>
        equipo.nombre === op.equipo &&
        equipo.codigo === op.n_equipo
    );

    const capacidadTonelada =
      Number(equipoEncontrado?.capacidad_tonelada) || 0;

    const capacidadToneladaDesmonte =
      Number(equipoEncontrado?.capacidad_tonelada_desmonte) || 0;

    let horasOperativas = 0;
    let toneladasTotales = 0;
    let totalCucharas = 0;

    const registrosArray = op.registros;

    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {

      const codigo = registro.codigo?.toString() || '';

      // 🔥 Solo códigos válidos
      if (!codigosPermitidos.includes(codigo)) continue;

      // 🔥 Horas operativas
      const horas = this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );

      horasOperativas += horas;

      // 🔥 Cucharas
      const n_cucharas = registro.operacion?.n_cucharas;

      if (n_cucharas && !isNaN(Number(n_cucharas))) {

        const cucharas = Number(n_cucharas);

        totalCucharas += cucharas;

        // 🔥 Material
        const material = (
          registro.operacion?.material || ''
        ).toUpperCase().trim();

        // 🔥 Elegir capacidad correcta
        const capacidadUsada = materialesDesmonte.includes(material)
          ? capacidadToneladaDesmonte
          : capacidadTonelada;

        // 🔥 Calcular toneladas
        toneladasTotales += cucharas * capacidadUsada;
      }
    }

    // 🔥 Máximo 12 horas
    horasOperativas = Math.min(horasOperativas, 12);

    if (!resultadoMap.has(clave)) {

      resultadoMap.set(clave, {

        // 🔥 Datos de fecha
        mes: nombreMes,
        año: año,
        mesNumero: mesNumero,

        // 🔥 Resultado principal
        rendimiento: 0,

        // 🔥 Datos auxiliares
        horasOperativas: 0,
        totalToneladas: 0,
        totalCucharas: 0,
        cantidadOperaciones: 0,

        // 🔥 Capacidades
        capacidadTonelada: capacidadTonelada,
        capacidadToneladaDesmonte: capacidadToneladaDesmonte
      });
    }

    const item = resultadoMap.get(clave);

    item.horasOperativas += horasOperativas;

    item.totalToneladas = Number(
      (item.totalToneladas + toneladasTotales).toFixed(2)
    );

    item.totalCucharas += totalCucharas;

    item.cantidadOperaciones += 1;

    // 🔥 Rendimiento
    if (item.horasOperativas > 0) {

      item.rendimiento = Number(
        (
          item.totalToneladas /
          item.horasOperativas
        ).toFixed(2)
      );
    }
  });

  // 🔥 Ordenar por año y mes
  const resultado = Array.from(resultadoMap.values())
    .sort((a, b) => {

      if (a.año !== b.año) {
        return a.año - b.año;
      }

      return a.mesNumero - b.mesNumero;
    });
    //console.log('📊 RENDIMIENTO POR MES:', resultado);
  return resultado;
}


//GRAFICO - RENDIMIENTO POR DÍA DEL MES
RendimientoPorDia() {
  const resultadoMap = new Map<string, any>();

  // 🔥 Códigos permitidos
  const codigosPermitidos = ['101', '102', '105', '106', '108'];

  // 🔥 Materiales que usan capacidad_tonelada_desmonte
  const materialesDesmonte = [
    'DESMONTE', 'RELAVE', 'RELLENO'
  ];

  // 🔥 Nombres de meses
  const nombresMeses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];

  this.operacionesFiltradas.forEach((op) => {
    if (!op.fecha) return;

    // 🔥 Extraer fecha
    const fecha = new Date(op.fecha);
    const año = fecha.getFullYear();
    const mesNumero = fecha.getMonth() + 1;
    const nombreMes = nombresMeses[mesNumero - 1];
    const dia = fecha.getDate();
    
    // 🔥 Clave única: año-mes-dia
    const clave = `${año}-${mesNumero.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;

    // 🔥 Buscar equipo
    const equipoEncontrado = this.equiposProceso.find(
      equipo =>
        equipo.nombre === op.equipo &&
        equipo.codigo === op.n_equipo
    );

    const capacidadTonelada =
      Number(equipoEncontrado?.capacidad_tonelada) || 0;

    const capacidadToneladaDesmonte =
      Number(equipoEncontrado?.capacidad_tonelada_desmonte) || 0;

    let horasOperativas = 0;
    let toneladasTotales = 0;
    let totalCucharas = 0;

    const registrosArray = op.registros;

    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      const codigo = registro.codigo?.toString() || '';

      // 🔥 Solo códigos válidos
      if (!codigosPermitidos.includes(codigo)) continue;

      // 🔥 Horas operativas
      const horas = this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );

      horasOperativas += horas;

      // 🔥 Cucharas
      const n_cucharas = registro.operacion?.n_cucharas;

      if (n_cucharas && !isNaN(Number(n_cucharas))) {
        const cucharas = Number(n_cucharas);
        totalCucharas += cucharas;

        // 🔥 Material
        const material = (
          registro.operacion?.material || ''
        ).toUpperCase().trim();

        // 🔥 Elegir capacidad según material
        const capacidadUsada = materialesDesmonte.includes(material)
          ? capacidadToneladaDesmonte
          : capacidadTonelada;

        // 🔥 Calcular toneladas
        toneladasTotales += cucharas * capacidadUsada;
      }
    }

    // 🔥 Máximo 12 horas
    horasOperativas = Math.min(horasOperativas, 12);

    if (!resultadoMap.has(clave)) {
      resultadoMap.set(clave, {
        // 🔥 DATOS PARA EL GRÁFICO
        mes: nombreMes,      // "MAYO"
        dia: dia,            // 24
        año: año,            // 2026
        
        // 🔥 Para ordenar
        mesNumero: mesNumero, // 5
        fechaOrden: new Date(año, mesNumero - 1, dia).getTime(), // timestamp
        
        // 🔥 VALOR PRINCIPAL
        rendimiento: 0,      // toneladas/hora
        
        // 🔥 Datos auxiliares para tooltip
        horasOperativas: 0,
        totalToneladas: 0,
        totalCucharas: 0,
        cantidadOperaciones: 0
      });
    }

    const item = resultadoMap.get(clave);
    item.horasOperativas += horasOperativas;
    item.totalToneladas = Number((item.totalToneladas + toneladasTotales).toFixed(2));
    item.totalCucharas += totalCucharas;
    item.cantidadOperaciones += 1;

    // 🔥 Calcular rendimiento (Toneladas / Horas Operativas)
    if (item.horasOperativas > 0) {
      item.rendimiento = Number((item.totalToneladas / item.horasOperativas).toFixed(2));
    }
  });

  // 🔥 Ordenar por fecha
  const resultado = Array.from(resultadoMap.values())
    .sort((a, b) => a.fechaOrden - b.fechaOrden);

  //console.log('📊 RENDIMIENTO POR DÍA:', resultado);
  return resultado;
}
//=========================================
//HOJA 4
//|=========================================
DisponibilidadPorOperador() {
  const resultadoMap = new Map<string, any>();

  this.operacionesFiltradas.forEach((op) => {
    const operador = op.operador || 'SIN OPERADOR';
    const HORAS_TOTALES = 12;
    let horasMtto = 0;

    const registrosArray = op.registros;
    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      if (registro.estado !== 'MANTENIMIENTO') continue;
      const horas = this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );
      horasMtto += horas;
    }

    horasMtto = Math.min(horasMtto, HORAS_TOTALES);

    if (!resultadoMap.has(operador)) {
      resultadoMap.set(operador, {
        operador,
        horasTotales: 0,
        horasMtto: 0,
        disponibilidad: 0,
        cantidadOperaciones: 0
      });
    }

    const item = resultadoMap.get(operador);
    item.horasTotales += HORAS_TOTALES;
    item.horasMtto += horasMtto;
    item.cantidadOperaciones += 1;

    try {
      const disponibilidadActual = ((item.horasTotales - item.horasMtto) / item.horasTotales) * 100;
      item.disponibilidad = Number(disponibilidadActual.toFixed(2));
    } catch (error) {
      item.disponibilidad = 0;
    }
  });

  const resultado = Array.from(resultadoMap.values())
    .sort((a, b) => b.disponibilidad - a.disponibilidad); // Ordenar por mejor disponibilidad

  //console.log('📊 DISPONIBILIDAD POR OPERADOR:', resultado);
  return resultado;
}


//GRAFICO - RENDIMIENTO POR OPERADOR
RendimientoPorOperador() {
  const resultadoMap = new Map<string, any>();

  // 🔥 Códigos de actividad permitidos
  const codigosPermitidos = ['101', '102', '105', '106', '108'];

  // 🔥 Materiales que usan capacidad_tonelada_desmonte
  const materialesDesmonte = [
    'DESMONTE', 'RELAVE', 'RELLENO'
  ];

  this.operacionesFiltradas.forEach((op) => {
    const operador = op.operador || 'SIN OPERADOR';

    // 🔥 Buscar equipo
    const equipoEncontrado = this.equiposProceso.find(
      equipo =>
        equipo.nombre === op.equipo &&
        equipo.codigo === op.n_equipo
    );

    const capacidadTonelada =
      Number(equipoEncontrado?.capacidad_tonelada) || 0;

    const capacidadToneladaDesmonte =
      Number(equipoEncontrado?.capacidad_tonelada_desmonte) || 0;

    let horasOperativas = 0;
    let toneladasTotales = 0;
    let totalCucharas = 0;

    const registrosArray = op.registros;
    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      const codigo = registro.codigo?.toString() || '';

      // 🔥 Solo códigos válidos
      if (!codigosPermitidos.includes(codigo)) continue;

      // 🔥 Horas operativas
      const horas = this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );
      horasOperativas += horas;

      // 🔥 Cucharas
      const n_cucharas = registro.operacion?.n_cucharas;
      if (n_cucharas && !isNaN(Number(n_cucharas))) {
        const cucharas = Number(n_cucharas);
        totalCucharas += cucharas;

        // 🔥 Material
        const material = (
          registro.operacion?.material || ''
        ).toUpperCase().trim();

        // 🔥 Elegir capacidad según material
        const capacidadUsada = materialesDesmonte.includes(material)
          ? capacidadToneladaDesmonte
          : capacidadTonelada;

        // 🔥 Calcular toneladas
        toneladasTotales += cucharas * capacidadUsada;
      }
    }

    // 🔥 Máximo 12 horas
    horasOperativas = Math.min(horasOperativas, 12);

    if (!resultadoMap.has(operador)) {
      resultadoMap.set(operador, {
        operador: operador,
        horasOperativas: 0,
        totalCucharas: 0,
        totalToneladas: 0,
        rendimiento: 0,
        cantidadOperaciones: 0,
        // 🔥 Para tracking de equipos usados por operador
        equiposUsados: new Set()
      });
    }

    const item = resultadoMap.get(operador);
    item.horasOperativas += horasOperativas;
    item.totalCucharas += totalCucharas;
    item.totalToneladas = Number((item.totalToneladas + toneladasTotales).toFixed(2));
    item.cantidadOperaciones += 1;
    item.equiposUsados.add(`${op.equipo}-${op.n_equipo}`);

    // 🔥 Calcular rendimiento (Toneladas / Horas Operativas)
    try {
      if (item.horasOperativas > 0) {
        item.rendimiento = Number((item.totalToneladas / item.horasOperativas).toFixed(2));
      } else {
        item.rendimiento = 0;
      }
    } catch (error) {
      item.rendimiento = 0;
    }
  });

  // 🔥 Convertir Set a número y ordenar por mejor rendimiento
  const resultado = Array.from(resultadoMap.values())
    .map(item => ({
      ...item,
      cantidadEquipos: item.equiposUsados.size
    }))
    .sort((a, b) => b.rendimiento - a.rendimiento); // Ordenar por mejor rendimiento

//console.log('📊 RENDIMIENTO POR OPERADOR:', resultado);
  return resultado;
}

//=========================================
//HOJA 6
//|=========================================

//GRAFICO - HORAS POR OBSERVACIÓN
HorasPorObservacion() {
  const resultadoMap = new Map<string, any>();

  // 🔥 Códigos de actividad permitidos (opcional, puedes quitarlos si quieres todas)
  const codigosPermitidos = [
  '301',
  '302',
  '303',
  '304',
  '305',
  '306',
  '307',
  '308',
  '309',
  '310',
  '311',
  '312'
];
  
  // 🔥 Estados que quieres considerar (puedes ajustar según necesites)
  const estadosPermitidos = ['DEMORA'];

  this.operacionesFiltradas.forEach((op) => {
    const HORAS_TOTALES = 12;
    
    const registrosArray = op.registros;
    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      
      // 🔥 Filtrar por estado si es necesario
      const estado = registro.estado || '';
      if (!estadosPermitidos.includes(estado)) continue;
      
      // 🔥 Filtrar por código si es necesario
      const codigo = registro.codigo || '';
      if (!codigosPermitidos.includes(codigo)) continue;
      
      // 🔥 Obtener la observación de la operación
      const observacion = registro.operacion?.observaciones || 'SIN OBSERVACIÓN';
      
      // 🔥 Si la observación está vacía o es solo espacios, la tratamos como "SIN OBSERVACIÓN"
      const observacionTrim = observacion.trim();
      const claveObservacion = observacionTrim === '' ? 'SIN OBSERVACIÓN' : observacionTrim;
      
      // 🔥 Calcular horas
      let horas = this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );
      
      // 🔥 Limitar horas al total disponible (máximo 12 por operación)
      horas = Math.min(horas, HORAS_TOTALES);
      
      // 🔥 Crear o actualizar item en el mapa
      if (!resultadoMap.has(claveObservacion)) {
        resultadoMap.set(claveObservacion, {
          observacion: claveObservacion,
          horasTotales: 0,
          cantidadRegistros: 0,
          cantidadOperaciones: 0,
          // 🔥 Para tracking adicional
          codigosRelacionados: new Set(),
          estadosRelacionados: new Set()
        });
      }
      
      const item = resultadoMap.get(claveObservacion);
      item.horasTotales += horas;
      item.cantidadRegistros += 1;
      item.codigosRelacionados.add(codigo);
      item.estadosRelacionados.add(estado);
    }
  });
  
  // 🔥 Agregar operaciones únicas al final (contar operaciones distintas)
  // Esto se hace después de procesar todos los registros
  const resultado = Array.from(resultadoMap.values())
    .map(item => ({
      ...item,
      cantidadOperaciones: item.cantidadRegistros, // o podrías calcular operaciones únicas
      codigosRelacionados: Array.from(item.codigosRelacionados),
      estadosRelacionados: Array.from(item.estadosRelacionados)
    }))
    .sort((a, b) => b.horasTotales - a.horasTotales)
    .map(item => ({
      ...item,
      horasTotales: Number(item.horasTotales.toFixed(2))
    }));
  
  console.log('📊 HORAS POR OBSERVACIÓN:', resultado);
  return resultado;
}
DisponibilidadPorGuardia() {
  const resultadoMap = new Map<string, any>();

  this.operacionesFiltradas.forEach((op) => {
    const guardia = op.seccion || 'SIN GUARDIA';
    const key = guardia;

    const registrosArray = op.registros;

    if (!Array.isArray(registrosArray)) return;

    let horasTotalesOperacion = 0;
    let horasMttoOperacion = 0;

    for (const registro of registrosArray) {
      if (!registro.hora_inicio || !registro.hora_final) continue;

      const horas = this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );

      if (!horas || horas <= 0) continue;

      // Suma todas las horas del registro
      horasTotalesOperacion += horas;

      // Solo suma como mantenimiento si el estado es MANTENIMIENTO
      if ((registro.estado || '').trim().toUpperCase() === 'MANTENIMIENTO') {
        horasMttoOperacion += horas;
      }
    }

    if (!resultadoMap.has(key)) {
      resultadoMap.set(key, {
        guardia: key,
        horasTotales: 0,
        horasMtto: 0,
        horasOperativas: 0,
        disponibilidad: 0,
        cantidadOperaciones: 0
      });
    }

    const item = resultadoMap.get(key);

    item.horasTotales += horasTotalesOperacion;
    item.horasMtto += horasMttoOperacion;
    item.horasOperativas = item.horasTotales - item.horasMtto;
    item.cantidadOperaciones += 1;
  });

  const resultado = Array.from(resultadoMap.values()).map((item) => {
    if (item.horasTotales > 0) {
      const disponibilidad =
        ((item.horasTotales - item.horasMtto) / item.horasTotales) * 100;

      item.disponibilidad = Number(disponibilidad.toFixed(2));
      item.horasTotales = Number(item.horasTotales.toFixed(2));
      item.horasMtto = Number(item.horasMtto.toFixed(2));
      item.horasOperativas = Number(item.horasOperativas.toFixed(2));
    } else {
      item.disponibilidad = 0;
    }

    return item;
  });

  resultado.sort((a, b) => b.disponibilidad - a.disponibilidad);

  console.log('📊 DISPONIBILIDAD POR GUARDIA:', resultado);

  return resultado;
}
RendimientoPorGuardia() {
  const resultadoMap = new Map<string, any>();

  const CODIGOS_OPERATIVOS = ['101', '102', '105', '106', '108'];

  this.operacionesFiltradas.forEach((op) => {
    const guardia = op.seccion || 'SIN GUARDIA';
    const key = guardia;

    const registrosArray = op.registros;

    if (!Array.isArray(registrosArray)) return;

    const codigoEquipo = (op.n_equipo || '').trim().toUpperCase();

    const equipoProceso = this.equiposProceso.find((equipo: any) => {
      const codigo = (equipo.codigo || '').trim().toUpperCase();
      const modelo = (equipo.modelo || '').trim().toUpperCase();

      return codigo === codigoEquipo || modelo === codigoEquipo;
    });

    if (!resultadoMap.has(key)) {
      resultadoMap.set(key, {
        guardia: key,
        horasOperativas: 0,
        tnTotalAjustado: 0,
        rendimiento: 0,
        cantidadOperaciones: 0,
        cantidadRegistrosProductivos: 0
      });
    }

    const item = resultadoMap.get(key);

    item.cantidadOperaciones += 1;

    for (const registro of registrosArray) {
      const codigo = String(registro.codigo || '').trim();

      if (!CODIGOS_OPERATIVOS.includes(codigo)) continue;

      const horas = this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );

      if (!horas || horas <= 0) continue;

      item.horasOperativas += horas;
      item.cantidadRegistrosProductivos += 1;

      const operacion = registro.operacion || {};

      const nCucharas = Number(
        operacion.n_cucharas ??
        operacion.num_cucharas ??
        0
      );

      const material = String(operacion.material || '')
        .trim()
        .toUpperCase();

      let toneladasPorCuchara = 0;

      if (equipoProceso) {
        if (material === 'MINERAL') {
          toneladasPorCuchara = Number(equipoProceso.capacidad_tonelada || 0);
        } else if (material === 'DESMONTE') {
          toneladasPorCuchara = Number(equipoProceso.capacidad_tonelada_desmonte || 0);
        }
      }

      const tnAjustado = nCucharas * toneladasPorCuchara;

      item.tnTotalAjustado += tnAjustado;
    }
  });

  const resultado = Array.from(resultadoMap.values()).map((item) => {
    if (item.horasOperativas > 0) {
      const rendimiento = item.tnTotalAjustado / item.horasOperativas;

      item.rendimiento = Number(rendimiento.toFixed(2));
      item.horasOperativas = Number(item.horasOperativas.toFixed(2));
      item.tnTotalAjustado = Number(item.tnTotalAjustado.toFixed(2));
    } else {
      item.rendimiento = 0;
      item.horasOperativas = 0;
      item.tnTotalAjustado = Number(item.tnTotalAjustado.toFixed(2));
    }

    return item;
  });

  resultado.sort((a, b) => b.rendimiento - a.rendimiento);

  console.log('📊 RENDIMIENTO POR GUARDIA:', resultado);

  return resultado;
}

MineralGuardia() {
  const resultadoMap = new Map<string, any>();

  const CODIGOS_OPERATIVOS = ['101', '102', '105', '106', '108'];

  this.operacionesFiltradas.forEach((op) => {
    const guardia = op.seccion || 'SIN GUARDIA';

    const key = guardia;

    const registrosArray = op.registros;

    if (!Array.isArray(registrosArray)) return;

    const codigoEquipo = String(op.n_equipo || '')
      .trim()
      .toUpperCase();

    const modeloEquipo = String(op.modelo_equipo || '')
      .trim()
      .toUpperCase();

    const equipoProceso = this.equiposProceso.find((equipo: any) => {
      const codigo = String(equipo.codigo || '').trim().toUpperCase();
      const modelo = String(equipo.modelo || '').trim().toUpperCase();

      return (
        codigo === codigoEquipo ||
        modelo === codigoEquipo ||
        modelo === modeloEquipo
      );
    });

    if (!resultadoMap.has(key)) {
      resultadoMap.set(key, {
        guardia,
        tnMineralAjustado: 0,
        horasOperativasMineral: 0,
        cantidadCucharasMineral: 0,
        cantidadOperaciones: 0,
        cantidadRegistrosMineral: 0
      });
    }

    const item = resultadoMap.get(key);

    item.cantidadOperaciones += 1;

    for (const registro of registrosArray) {
      const codigo = String(registro.codigo || '').trim();

      if (!CODIGOS_OPERATIVOS.includes(codigo)) continue;

      const operacion = registro.operacion || {};

      const material = String(operacion.material || '')
        .trim()
        .toUpperCase();

      if (material !== 'MINERAL') continue;

      const horas = this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );

      if (!horas || horas <= 0) continue;

      const nCucharas = Number(
        operacion.n_cucharas ??
        operacion.num_cucharas ??
        0
      );

      let toneladasPorCuchara = 0;

      if (equipoProceso) {
        toneladasPorCuchara = Number(equipoProceso.capacidad_tonelada || 0);
      }

      const tnMineral = nCucharas * toneladasPorCuchara;

      item.tnMineralAjustado += tnMineral;
      item.horasOperativasMineral += horas;
      item.cantidadCucharasMineral += nCucharas;
      item.cantidadRegistrosMineral += 1;
    }
  });

  const resultado = Array.from(resultadoMap.values()).map((item) => {
    item.tnMineralAjustado = Number(item.tnMineralAjustado.toFixed(2));
    item.horasOperativasMineral = Number(item.horasOperativasMineral.toFixed(2));

    if (item.horasOperativasMineral > 0) {
      item.rendimientoMineral = Number(
        (item.tnMineralAjustado / item.horasOperativasMineral).toFixed(2)
      );
    } else {
      item.rendimientoMineral = 0;
    }

    return item;
  });

  resultado.sort((a, b) => b.tnMineralAjustado - a.tnMineralAjustado);

  console.log('📊 MINERAL POR GUARDIA:', resultado);

  return resultado;
}

UtilizacionGuardia() {
  const resultadoMap = new Map<string, any>();

  const CODIGOS_OPERATIVOS = ['101', '102', '105', '106', '108'];

  this.operacionesFiltradas.forEach((op) => {
    const guardia = op.seccion || 'SIN GUARDIA';

    const key = guardia;

    const registrosArray = op.registros;

    if (!Array.isArray(registrosArray)) return;

    if (!resultadoMap.has(key)) {
      resultadoMap.set(key, {
        guardia,
        horasTotales: 0,
        horasMtto: 0,
        horasDisponibles: 0,
        horasOperativas: 0,
        utilizacion: 0,
        cantidadOperaciones: 0,
        cantidadRegistrosOperativos: 0,
        cantidadRegistrosMtto: 0
      });
    }

    const item = resultadoMap.get(key);

    item.cantidadOperaciones += 1;

    for (const registro of registrosArray) {
      if (!registro.hora_inicio || !registro.hora_final) continue;

      const horas = this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );

      if (!horas || horas <= 0) continue;

      const estado = String(registro.estado || '')
        .trim()
        .toUpperCase();

      const codigo = String(registro.codigo || '')
        .trim();

      // SUMA(HORAS): todas las horas de todos los registros
      item.horasTotales += horas;

      // SUMA(HRS MANTENIMIENTO)
      if (estado === 'MANTENIMIENTO') {
        item.horasMtto += horas;
        item.cantidadRegistrosMtto += 1;
      }

      // SUMA(HRS OPERATIVAS): solo códigos productivos
      if (CODIGOS_OPERATIVOS.includes(codigo)) {
        item.horasOperativas += horas;
        item.cantidadRegistrosOperativos += 1;
      }
    }
  });

  const resultado = Array.from(resultadoMap.values()).map((item) => {
    item.horasDisponibles = item.horasTotales - item.horasMtto;

    if (item.horasDisponibles > 0) {
      const utilizacion =
        (item.horasOperativas / item.horasDisponibles) * 100;

      item.utilizacion = Number(utilizacion.toFixed(2));
    } else {
      item.utilizacion = 0;
    }

    item.horasTotales = Number(item.horasTotales.toFixed(2));
    item.horasMtto = Number(item.horasMtto.toFixed(2));
    item.horasDisponibles = Number(item.horasDisponibles.toFixed(2));
    item.horasOperativas = Number(item.horasOperativas.toFixed(2));

    return item;
  });

  resultado.sort((a, b) => b.utilizacion - a.utilizacion);

  return resultado;
}

//
private readonly CODIGOS_OPERATIVOS = ['101', '102', '105', '106', '108'];

HorasOperativasPorDia() {
  return this.calcularHorasOperativasPorPeriodo('DIA');
}

HorasOperativasPorSemana() {
  return this.calcularHorasOperativasPorPeriodo('SEMANA');
}

HorasOperativasPorMes() {
  return this.calcularHorasOperativasPorPeriodo('MES');
}

private calcularHorasOperativasPorPeriodo(tipo: 'DIA' | 'SEMANA' | 'MES') {
  const datosPorDia = this.calcularHorasOperativasBasePorDia();

  if (tipo === 'DIA') {
    return datosPorDia;
  }

  const resultadoMap = new Map<string, any>();

  datosPorDia.forEach((dia) => {
    const periodo = obtenerPeriodoDesdeKey(dia.key, tipo);

    if (!periodo) return;

    if (!resultadoMap.has(periodo.key)) {
      resultadoMap.set(periodo.key, {
        key: periodo.key,
        periodo: periodo.label,
        fechaInicio: periodo.fechaInicio || null,
        fechaFin: periodo.fechaFin || null,
        sumaHorasOperativas: 0,
        horasOperativas: 0,
        cantidadDias: 0,
        cantidadOperaciones: 0,
        cantidadRegistrosOperativos: 0
      });
    }

    const item = resultadoMap.get(periodo.key);

    item.sumaHorasOperativas += Number(dia.horasOperativas || 0);
    item.cantidadDias += 1;
    item.cantidadOperaciones += Number(dia.cantidadOperaciones || 0);
    item.cantidadRegistrosOperativos += Number(dia.cantidadRegistrosOperativos || 0);
  });

  const resultado = Array.from(resultadoMap.values()).map((item) => {
    item.horasOperativas = item.cantidadDias > 0
      ? Number((item.sumaHorasOperativas / item.cantidadDias).toFixed(2))
      : 0;

    item.sumaHorasOperativas = Number(item.sumaHorasOperativas.toFixed(2));

    return item;
  });

  resultado.sort((a, b) => a.key.localeCompare(b.key));

  return resultado;
}

private calcularHorasOperativasBasePorDia() {
  const resultadoMap = new Map<string, any>();

  // Crear todos los días del rango con 0
  if (this.fechaInicio && this.fechaFin) {
    const diasRango = generarDiasEntreFechas(this.fechaInicio, this.fechaFin);

    diasRango.forEach((dia) => {
      resultadoMap.set(dia.key, {
        key: dia.key,
        periodo: dia.label,

        // suma total de horas operativas del día
        sumaHorasOperativas: 0,

        // promedio final que se mostrará en el gráfico
        horasOperativas: 0,

        cantidadOperaciones: 0,
        cantidadRegistrosOperativos: 0
      });
    });
  }

  this.operacionesFiltradas.forEach((op) => {
    const registrosArray = op.registros;

    if (!Array.isArray(registrosArray)) return;

    const fecha = op.fecha;

    if (!fecha) return;

    const periodo = obtenerPeriodo(fecha, 'DIA');

    if (!periodo) return;

    if (!resultadoMap.has(periodo.key)) {
      resultadoMap.set(periodo.key, {
        key: periodo.key,
        periodo: periodo.label,
        sumaHorasOperativas: 0,
        horasOperativas: 0,
        cantidadOperaciones: 0,
        cantidadRegistrosOperativos: 0
      });
    }

    const item = resultadoMap.get(periodo.key);

    let horasOperativasOperacion = 0;
    let tieneHorasOperativas = false;

    for (const registro of registrosArray) {
      const codigo = String(registro.codigo || '').trim();

      if (!this.CODIGOS_OPERATIVOS.includes(codigo)) continue;

      const horas = this.calcularDuracionHoras(
        registro.hora_inicio,
        registro.hora_final
      );

      if (!horas || horas <= 0) continue;

      horasOperativasOperacion += horas;
      item.cantidadRegistrosOperativos += 1;
      tieneHorasOperativas = true;
    }

    // Solo cuenta la operación si tuvo horas operativas reales
    if (tieneHorasOperativas) {
      item.sumaHorasOperativas += horasOperativasOperacion;
      item.cantidadOperaciones += 1;
    }
  });

  const resultado = Array.from(resultadoMap.values()).map((item) => {
    if (item.cantidadOperaciones > 0) {
      item.horasOperativas = Number(
        (item.sumaHorasOperativas / item.cantidadOperaciones).toFixed(2)
      );
    } else {
      item.horasOperativas = 0;
    }

    item.sumaHorasOperativas = Number(item.sumaHorasOperativas.toFixed(2));

    return item;
  });

  resultado.sort((a, b) => a.key.localeCompare(b.key));

  return resultado;
}


//IMPORTAR EXCEL:
async ImportarExcel() {

  const input = document.createElement('input');

  input.type = 'file';

  input.accept = '.xlsx,.xls';

  input.onchange = async (event: any) => {

    const file = event.target.files[0];

    if (!file) return;

    try {

      this.importandoExcel = true;

      // 🔥 LEER Y MAPEAR
      const jsonFinal = await this.excelImportService.leerExcel(file);

      console.log('📦 JSON FINAL:', jsonFinal);

      // 🔥 ENVIAR
      this.operacionesService
        .crear('carguio', jsonFinal)
        .subscribe({

          next: (resp) => {

            console.log('✅ Importación exitosa', resp);

            alert('Excel importado correctamente');

            this.cargarOperaciones();

            this.importandoExcel = false;
          },

          error: (err) => {

            console.error('❌ Error importando', err);

            alert('Error al importar Excel');

            this.importandoExcel = false;
          }
        });

    } catch (error) {

      console.error('❌ Error leyendo Excel', error);

      alert('Error leyendo Excel');

      this.importandoExcel = false;
    }
  };

  input.click();
}

}
