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
    MttrMesComponent
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
DataUtilizacionPorEquipo: any[] = [];
DataUtilizacionPorSemana: any[] = [];
DataUtilizacionPorMes: any[] = [];
DataHorasDemoraPorCodigo: any[] = [];
DataUtilizacionPorDia: any[] = [];
DataprocesarEquiposConCapacidad: any[] = [];
DataRendimientoPorMes: any[] = [];
DataDisponibilidadPorOperador: any[] = [];

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
    this.obtenerEquiposPorProceso('SCOOPTRAM');
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
  //UTILIZACION
  this.DataUtilizacionPorEquipo = this.UtilizacionPorEquipo();
  this.DataUtilizacionPorSemana = this.UtilizacionPorSemana();
  this.DataUtilizacionPorMes = this.UtilizacionPorMes();
  this.DataHorasDemoraPorCodigo = this.HorasDemoraPorCodigo();
  this.DataUtilizacionPorDia = this.UtilizacionPorDia();
  //RENDIMIENTO
  this.DataprocesarEquiposConCapacidad = this.RendimientoPorEquipo();
  this.DataRendimientoPorMes = this.RendimientoPorMes();



  this.DataDisponibilidadPorOperador = this.DisponibilidadPorOperador();

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
//GRAFICO 1 - DISPONIBILIDAD POR EQUIPO
  DisponibilidadPorEquipo() {
  const resultadoMap = new Map<string, any>();

  this.operacionesFiltradas.forEach((op) => {
    const modeloEquipo = `${op.equipo}-${op.n_equipo}`;
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

//=========================================
//HOJA 3
//|=========================================
//GRAFICO 7 - RENDIMIENTO POR EQUIPO (SOLO CÓDIGOS ESPECÍFICOS)
RendimientoPorEquipo() {
  const resultadoMap = new Map<string, any>();

  // 🔥 Códigos de actividad permitidos
  const codigosPermitidos = ['101', '102', '105', '106', '108'];

  this.operacionesFiltradas.forEach((op) => {
    const modeloEquipo = `${op.equipo}-${op.n_equipo}`;
    
    // 🔥 Buscar capacidad del equipo
    const equipoEncontrado = this.equiposProceso.find(
      equipo => equipo.nombre === op.equipo && equipo.codigo === op.n_equipo
    );
    
    const capacidadTonelada = equipoEncontrado?.capacidad_tonelada || 0;
    const capacidadYd3 = equipoEncontrado?.capacidadYd3 || 0;

    let horasOperativas = 0;
    let toneladasTotales = 0;
    let totalCucharas = 0;

    const registrosArray = op.registros;
    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      const codigo = registro.codigo?.toString() || '';
      
      // 🔥 Solo procesar si el código está en la lista permitida
      if (codigosPermitidos.includes(codigo)) {
        
        // 🔥 Calcular horas operativas
        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final
        );
        horasOperativas += horas;
        
        // 🔥 Calcular cucharas y toneladas
        const n_cucharas = registro.operacion?.n_cucharas;
        if (n_cucharas && !isNaN(Number(n_cucharas))) {
          const cucharas = Number(n_cucharas);
          totalCucharas += cucharas;
          toneladasTotales += cucharas * capacidadTonelada;
        }
      }
    }

    // Limitar horas operativas a 12 (jornada máxima)
    horasOperativas = Math.min(horasOperativas, 12);

    if (!resultadoMap.has(modeloEquipo)) {
      resultadoMap.set(modeloEquipo, {
        modeloEquipo,
        nombre: op.equipo,
        codigo: op.n_equipo,
        capacidadYd3: capacidadYd3,
        capacidadTonelada: capacidadTonelada,
        horasOperativas: 0,
        totalCucharas: 0,
        totalToneladas: 0,
        rendimiento: 0,  // 🔥 Toneladas por hora operativa
        cantidadOperaciones: 0
      });
    }

    const item = resultadoMap.get(modeloEquipo);
    item.horasOperativas += horasOperativas;
    item.totalCucharas += totalCucharas;
    item.totalToneladas = Number((item.totalToneladas + toneladasTotales).toFixed(2));
    item.cantidadOperaciones += 1;

    // 🔥 Calcular rendimiento: Toneladas / Horas Operativas
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

  const resultado = Array.from(resultadoMap.values());
  console.log('📊 RENDIMIENTO POR EQUIPO (códigos 101,102,105,106,108):', resultado);
  return resultado;
}

RendimientoPorMes() {
  const resultadoMap = new Map<string, any>();
  
  // 🔥 Códigos de actividad permitidos
  const codigosPermitidos = ['101', '102', '105', '106', '108'];
  
  // 🔥 Nombres de meses en español
  const nombresMeses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ];

  this.operacionesFiltradas.forEach((op) => {
    if (!op.fecha) return;
    
    // 🔥 Extraer año y mes de la fecha
    const fecha = new Date(op.fecha);
    const año = fecha.getFullYear();
    const mesNumero = fecha.getMonth() + 1;
    const nombreMes = nombresMeses[mesNumero - 1];
    const clave = `${año}-${mesNumero.toString().padStart(2, '0')}`;
    
    // 🔥 Buscar capacidad del equipo
    const equipoEncontrado = this.equiposProceso.find(
      equipo => equipo.nombre === op.equipo && equipo.codigo === op.n_equipo
    );
    
    const capacidadTonelada = equipoEncontrado?.capacidad_tonelada || 0;

    let horasOperativas = 0;
    let toneladasTotales = 0;

    const registrosArray = op.registros;
    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      const codigo = registro.codigo?.toString() || '';
      
      // 🔥 Solo procesar si el código está en la lista permitida
      if (codigosPermitidos.includes(codigo)) {
        
        // 🔥 Calcular horas operativas
        const horas = this.calcularDuracionHoras(
          registro.hora_inicio,
          registro.hora_final
        );
        horasOperativas += horas;
        
        // 🔥 Calcular toneladas
        const n_cucharas = registro.operacion?.n_cucharas;
        if (n_cucharas && !isNaN(Number(n_cucharas))) {
          toneladasTotales += Number(n_cucharas) * capacidadTonelada;
        }
      }
    }

    // Limitar horas operativas a 12 (jornada máxima)
    horasOperativas = Math.min(horasOperativas, 12);

    if (!resultadoMap.has(clave)) {
      resultadoMap.set(clave, {
        // 🔥 CAMPOS SEPARADOS PARA EL GRÁFICO
        mes: nombreMes,      // "MAYO"
        año: año,            // 2026
        mesNumero: mesNumero, // 5 (para ordenar)
        
        // 🔥 VALOR PRINCIPAL
        rendimiento: 0,      // toneladas/hora
        
        // 🔥 Datos adicionales para tooltip
        horasOperativas: 0,
        totalToneladas: 0,
        totalCucharas: 0,
        cantidadOperaciones: 0,
        capacidadTonelada: capacidadTonelada
      });
    }

    const item = resultadoMap.get(clave);
    item.horasOperativas += horasOperativas;
    item.totalToneladas = Number((item.totalToneladas + toneladasTotales).toFixed(2));
    item.cantidadOperaciones += 1;
    
    // 🔥 Acumular cucharas
    if (capacidadTonelada > 0) {
      item.totalCucharas += toneladasTotales / capacidadTonelada;
    }

    // 🔥 CALCULAR RENDIMIENTO (Toneladas / Horas Operativas)
    if (item.horasOperativas > 0) {
      item.rendimiento = Number((item.totalToneladas / item.horasOperativas).toFixed(2));
    }
  });

  // 🔥 Ordenar por año y mes
  const resultado = Array.from(resultadoMap.values())
    .sort((a, b) => {
      if (a.año !== b.año) return a.año - b.año;
      return a.mesNumero - b.mesNumero;
    });

  console.log('📊 RENDIMIENTO POR MES:', resultado);
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


//=========================================
//HOJA 6
//|=========================================



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
