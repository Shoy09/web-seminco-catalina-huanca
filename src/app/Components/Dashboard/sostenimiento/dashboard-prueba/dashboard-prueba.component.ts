import { Component, OnInit, HostListener, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OperacionesService } from '../../../../services/operaciones.service';

@Component({
  selector: 'app-dashboard-prueba',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-prueba.component.html',
  styleUrls: ['./dashboard-prueba.component.css']
})
export class DashboardPruebaComponent implements OnInit, AfterViewInit {

  @ViewChild('barChartEquipoCanvas') barChartEquipoCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartLaborCanvas') barChartLaborCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartDMUTICanvas') barChartDMUTICanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartDemorasOperativasCanvas') barChartDemorasOperativasCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartDemorasInoperativasCanvas') barChartDemorasInoperativasCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartHorasMantenimientoCanvas') barChartHorasMantenimientoCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChartPernosCanvas') pieChartPernosCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartMhrCanvas') barChartMhrCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartMetrosCanvas') barChartMetrosCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChartHorometrosCanvas') barChartHorometrosCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartPrimeraPerfCanvas') lineChartPrimeraPerfCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartUltimaPerfCanvas') lineChartUltimaPerfCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartHistorialInicioCanvas') lineChartHistorialInicioCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChartHistorialTerminoCanvas') lineChartHistorialTerminoCanvas!: ElementRef<HTMLCanvasElement>;

  datosOriginales: any[] = [];
  datosFiltrados: any[] = [];
  
  datosDetalle: any[] = [];
  datosMejoresOperadores: any[] = [];
  
  columnasDetalle: string[] = ['Equipo', 'Horas Percutadas', 'N° Pernos', 'Long. Pernos', 'N° Labores Sostenidas', 'N° Pernos/Labor', 'M/Hr', 'Metros Perforados'];
  columnasMejoresOperadores: string[] = ['Operador', 'Turno', 'M/Hr', 'Metros Perforados'];

  anios: number[] = [];
  meses: { numero: number; nombre: string }[] = [];
  dias: number[] = [];
  turnos: string[] = [];

  aniosSeleccionados: number[] = [];
  mesesSeleccionados: number[] = [];
  diasSeleccionados: number[] = [];
  turnosSeleccionados: string[] = [];

  abrirAnio = false;
  abrirMes = false;
  abrirDia = false;
  abrirTurno = false;

  cantidadEquiposUnicos: number = 0;
  totalMetrosPerforados: number = 0;
  totalLaboresSostenidas: number = 0;
  totalPernos: number = 0;
  pernosPorDia: number = 0;
  cargando: boolean = true;
  error: string | null = null;

  datosGraficoEquipo: { modelo: string; seccion: string; valor: number }[] = [];
  datosGraficoLabor: { labor_sos: string; seccion: string; pernos: number }[] = [];
  datosGraficoDMUTI: { modelo: string; dm: number; uti: number }[] = [];
  datosGraficoMhr: { modelo: string; valor: number }[] = [];
  datosGraficoMetros: { modelo: string; valor: number }[] = [];
  datosGraficoHorometros: { modelo: string; diesel: number; electrico: number; percusion: number }[] = [];
  datosGraficoPrimeraPerf: { modelo: string; promedioHoras: number; etiqueta: string }[] = [];
  datosGraficoUltimaPerf: { modelo: string; promedioHoras: number; etiqueta: string }[] = [];
  datosHistorialInicio: { fecha: string; valores: { modelo: string; horaDecimal: number; etiqueta: string }[] }[] = [];
  datosHistorialTermino: { fecha: string; valores: { modelo: string; horaDecimal: number; etiqueta: string }[] }[] = [];

  tipoEstados: { estado: string; codigo: string; tipoEstado: string }[] = [
    { estado: "OPERATIVO", codigo: "101", tipoEstado: "Limpieza de mineral" },
    { estado: "OPERATIVO", codigo: "102", tipoEstado: "Perforación de repaso en mineral" },
    { estado: "OPERATIVO", codigo: "111", tipoEstado: "Perforación en desmonte" },
    { estado: "OPERATIVO", codigo: "112", tipoEstado: "Perforación de repaso en desmonte" },
    { estado: "OPERATIVO", codigo: "120", tipoEstado: "Perforación para sostenimiento" },
    { estado: "DEMORA", codigo: "201", tipoEstado: "Falta de Operador" },
    { estado: "DEMORA", codigo: "202", tipoEstado: "MpL - mantenimiento preventivo de labor" },
    { estado: "DEMORA", codigo: "203", tipoEstado: "Ingreso - Salida" },
    { estado: "DEMORA", codigo: "204", tipoEstado: "Charla" },
    { estado: "DEMORA", codigo: "205", tipoEstado: "Traslado al equipo" },
    { estado: "DEMORA", codigo: "206", tipoEstado: "Inspección de equipo" },
    { estado: "DEMORA", codigo: "207", tipoEstado: "Refrigerio" },
    { estado: "DEMORA", codigo: "208", tipoEstado: "Traslado de equipo" },
    { estado: "DEMORA", codigo: "209", tipoEstado: "Falta de labor" },
    { estado: "DEMORA", codigo: "210", tipoEstado: "Falta de servicios (energía - agua - aire)" },
    { estado: "DEMORA", codigo: "211", tipoEstado: "Instalación de equipo" },
    { estado: "DEMORA", codigo: "212", tipoEstado: "Apoyo en servicios mineros" },
    { estado: "DEMORA", codigo: "213", tipoEstado: "Falta de aceros" },
    { estado: "DEMORA", codigo: "214", tipoEstado: "Falta de ventilación" },
    { estado: "DEMORA", codigo: "215", tipoEstado: "Trabajos varios" },
    { estado: "DEMORA", codigo: "216", tipoEstado: "Accidente de equipo" },
    { estado: "DEMORA", codigo: "217", tipoEstado: "Recuperación de aceros" },
    { estado: "MANTENIMIENTO", codigo: "301", tipoEstado: "Mp inicial/final" },
    { estado: "MANTENIMIENTO", codigo: "302", tipoEstado: "Mantenimiento programado" },
    { estado: "MANTENIMIENTO", codigo: "303", tipoEstado: "Mantenimiento correctivo" },
    { estado: "RESERVA", codigo: "401", tipoEstado: "Reserva" },
    { estado: "FUERA DE PLAN", codigo: "501", tipoEstado: "Fuera De Plan" }
  ];

  datosGraficoDemorasOperativas: { tipoEstado: string; duracionProm: number; acumPorcentaje: number }[] = [];
  datosGraficoDemorasInoperativas: { tipoEstado: string; duracionProm: number; acumPorcentaje: number }[] = [];
  datosGraficoHorasMantenimiento: { tipoEstado: string; duracionProm: number; acumPorcentaje: number }[] = [];
  datosPiePernos: { tipo: string; valor: number }[] = [];

  private codigosOperativas = ['201', '202', '203', '204', '205', '207', '208', '211'];
  private codigosInoperativas = ['209', '210', '212', '213', '214', '215', '216', '217'];
  private codigosMantenimiento = ['301', '302', '303'];
  private coloresPie = ['#051E41', '#E1C233', '#0E5050', '#999999'];
  private coloresLineas = ['#1E88E5', '#FFC107', '#E65100', '#D32F2F', '#8E24AA', '#00ACC1', '#43A047', '#F06292', '#6D4C41', '#78909C'];

  constructor(private operacionesService: OperacionesService) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {}

  private parseFecha(fechaStr: string): { year: number; month: number; day: number } | null {
    if (!fechaStr) return null;
    const partes = fechaStr.split('-');
    if (partes.length === 3) {
      const year = parseInt(partes[0], 10);
      const month = parseInt(partes[1], 10);
      const day = parseInt(partes[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) return { year, month, day };
    }
    return null;
  }

  private timeToMinutes(horaStr: string): number {
    if (!horaStr) return 0;
    const partes = horaStr.split(':');
    if (partes.length === 2) {
      const horas = parseInt(partes[0], 10);
      const minutos = parseInt(partes[1], 10);
      return horas * 60 + minutos;
    }
    return 0;
  }

  private duracionHoras(horaInicio: string, horaFinal: string): number {
    const inicio = this.timeToMinutes(horaInicio);
    const fin = this.timeToMinutes(horaFinal);
    if (fin > inicio) return (fin - inicio) / 60;
    else if (fin < inicio) return (fin + 1440 - inicio) / 60;
    return 0;
  }

  private eliminarDuplicadosPorMenorId<T extends { id?: number; [key: string]: any }>(items: T[]): T[] {
    const mapa = new Map<string, T>();
    for (const item of items) {
      const { id, ...claveObj } = item;
      const clave = JSON.stringify(claveObj, Object.keys(claveObj).sort());
      if (!mapa.has(clave) || (id !== undefined && mapa.get(clave)!.id! > id!)) {
        mapa.set(clave, item);
      }
    }
    return Array.from(mapa.values());
  }

  cargarDatos(): void {
    this.cargando = true;
    this.operacionesService.getAll('empernador').subscribe({
      next: (resp: any) => {
        let datosBase = resp.data.filter((item: any) => 
          item.estado === 'cerrado' && item.envio === 0
        );
        datosBase = this.eliminarDuplicadosPorMenorId(datosBase);
        this.datosOriginales = datosBase;
        this.extraerOpcionesFiltro();
        // Seleccionar automáticamente la fecha más reciente
        this.seleccionarFechaMasReciente();
        this.aplicarFiltros();
        this.cargando = false;
        setTimeout(() => {
          this.dibujarGraficoEquipo();
          this.dibujarGraficoLabor();
          this.dibujarGraficoDMUTI();
          this.dibujarGraficoDemorasOperativas();
          this.dibujarGraficoDemorasInoperativas();
          this.dibujarGraficoHorasMantenimiento();
          this.dibujarPiePernos();
          this.dibujarGraficoMhr();
          this.dibujarGraficoMetros();
          this.dibujarGraficoHorometros();
          this.dibujarGraficoPrimeraPerf();
          this.dibujarGraficoUltimaPerf();
          this.dibujarGraficoHistorialInicio();
          this.dibujarGraficoHistorialTermino();
        }, 200);
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudieron cargar los datos.';
        this.cargando = false;
      }
    });
  }

  extraerOpcionesFiltro(): void {
    const aniosSet = new Set<number>();
    const mesesSet = new Set<number>();
    const diasSet = new Set<number>();
    const turnosSet = new Set<string>();

    this.datosOriginales.forEach(item => {
      const fechaObj = this.parseFecha(item.fecha);
      if (fechaObj) {
        aniosSet.add(fechaObj.year);
        mesesSet.add(fechaObj.month);
        diasSet.add(fechaObj.day);
      }
      if (item.turno) turnosSet.add(item.turno);
    });

    this.anios = Array.from(aniosSet).sort((a,b)=>a-b);
    const mesesNumeros = Array.from(mesesSet).sort((a,b)=>a-b);
    this.meses = mesesNumeros.map(num => ({
      numero: num,
      nombre: this.obtenerNombreMes(num)
    }));
    this.dias = Array.from(diasSet).sort((a,b)=>a-b);
    this.turnos = Array.from(turnosSet);
  }

  seleccionarFechaMasReciente(): void {
    if (this.datosOriginales.length === 0) return;
    const fechas = this.datosOriginales.map(item => item.fecha).filter(f => f);
    if (fechas.length === 0) return;
    const fechaMax = fechas.reduce((max, curr) => curr > max ? curr : max, fechas[0]);
    const fechaObj = this.parseFecha(fechaMax);
    if (fechaObj) {
      this.aniosSeleccionados = [fechaObj.year];
      this.mesesSeleccionados = [fechaObj.month];
      this.diasSeleccionados = [fechaObj.day];
      this.turnosSeleccionados = [];
    }
  }

  obtenerNombreMes(numero: number): string {
    const nombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return nombres[numero - 1] || String(numero);
  }

  toggleAnio(event: MouseEvent): void { event.stopPropagation(); this.abrirAnio = !this.abrirAnio; this.cerrarOtros('anio'); }
  toggleMes(event: MouseEvent): void { event.stopPropagation(); this.abrirMes = !this.abrirMes; this.cerrarOtros('mes'); }
  toggleDia(event: MouseEvent): void { event.stopPropagation(); this.abrirDia = !this.abrirDia; this.cerrarOtros('dia'); }
  toggleTurno(event: MouseEvent): void { event.stopPropagation(); this.abrirTurno = !this.abrirTurno; this.cerrarOtros('turno'); }

  cerrarOtros(actual: string): void {
    if (actual !== 'anio') this.abrirAnio = false;
    if (actual !== 'mes') this.abrirMes = false;
    if (actual !== 'dia') this.abrirDia = false;
    if (actual !== 'turno') this.abrirTurno = false;
  }

  @HostListener('document:click', ['$event'])
  cerrarMenus(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.filtro-grupo')) {
      this.abrirAnio = false;
      this.abrirMes = false;
      this.abrirDia = false;
      this.abrirTurno = false;
    }
  }

  onAnioChange(anio: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) { if (!this.aniosSeleccionados.includes(anio)) this.aniosSeleccionados.push(anio); }
    else { this.aniosSeleccionados = this.aniosSeleccionados.filter(a => a !== anio); }
    this.aplicarFiltros();
  }
  onMesChange(mesNumero: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) { if (!this.mesesSeleccionados.includes(mesNumero)) this.mesesSeleccionados.push(mesNumero); }
    else { this.mesesSeleccionados = this.mesesSeleccionados.filter(m => m !== mesNumero); }
    this.aplicarFiltros();
  }
  onDiaChange(dia: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) { if (!this.diasSeleccionados.includes(dia)) this.diasSeleccionados.push(dia); }
    else { this.diasSeleccionados = this.diasSeleccionados.filter(d => d !== dia); }
    this.aplicarFiltros();
  }
  onTurnoChange(turno: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) { if (!this.turnosSeleccionados.includes(turno)) this.turnosSeleccionados.push(turno); }
    else { this.turnosSeleccionados = this.turnosSeleccionados.filter(t => t !== turno); }
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    this.datosFiltrados = this.datosOriginales.filter(item => {
      let cumple = true;
      const fechaObj = this.parseFecha(item.fecha);
      const fechaValida = fechaObj !== null;
      if (this.aniosSeleccionados.length > 0 && fechaValida && !this.aniosSeleccionados.includes(fechaObj!.year)) cumple = false;
      if (cumple && this.mesesSeleccionados.length > 0 && fechaValida && !this.mesesSeleccionados.includes(fechaObj!.month)) cumple = false;
      if (cumple && this.diasSeleccionados.length > 0 && fechaValida && !this.diasSeleccionados.includes(fechaObj!.day)) cumple = false;
      if (cumple && this.turnosSeleccionados.length > 0 && !this.turnosSeleccionados.includes(item.turno)) cumple = false;
      return cumple;
    });
    this.calcularMetricas();
    this.prepararDatosGraficoEquipo();
    this.prepararDatosGraficoLabor();
    this.prepararDatosGraficoDMUTI();
    this.prepararDatosGraficoDemoras(this.codigosOperativas, 'operativas');
    this.prepararDatosGraficoDemoras(this.codigosInoperativas, 'inoperativas');
    this.prepararDatosGraficoDemoras(this.codigosMantenimiento, 'mantenimiento');
    this.prepararDatosPiePernos();
    this.prepararDatosGraficoMhr();
    this.prepararDatosGraficoMetros();
    this.prepararDatosGraficoHorometros();
    this.prepararDatosGraficoPrimeraPerf();
    this.prepararDatosGraficoUltimaPerf();
    this.prepararDatosHistorialInicio();
    this.prepararDatosHistorialTermino();
    this.prepararDatosDetalle();
    this.prepararDatosMejoresOperadores();
    this.dibujarGraficoEquipo();
    this.dibujarGraficoLabor();
    this.dibujarGraficoDMUTI();
    this.dibujarGraficoDemorasOperativas();
    this.dibujarGraficoDemorasInoperativas();
    this.dibujarGraficoHorasMantenimiento();
    this.dibujarPiePernos();
    this.dibujarGraficoMhr();
    this.dibujarGraficoMetros();
    this.dibujarGraficoHorometros();
    this.dibujarGraficoPrimeraPerf();
    this.dibujarGraficoUltimaPerf();
    this.dibujarGraficoHistorialInicio();
    this.dibujarGraficoHistorialTermino();
  }

  calcularMetricas(): void {
    const modelosUnicos = new Set<string>();
    let sumaMetros = 0;
    let laboresContadas = 0;
    let sumaPernos = 0;
    const fechasUnicas = new Set<string>();
    this.datosFiltrados.forEach(equipo => {
      const modelo = `${equipo.equipo}-${equipo.n_equipo}`;
      modelosUnicos.add(modelo);
      if (equipo.fecha) fechasUnicas.add(equipo.fecha);
      if (equipo.registros && Array.isArray(equipo.registros)) {
        equipo.registros.forEach((registro: any) => {
          if (registro.operacion) {
            const n_pernos = parseFloat(registro.operacion.n_pernos_instalados);
            const log_pernos = parseFloat(registro.operacion.log_pernos);
            const metros = n_pernos * log_pernos * 0.3048;
            if (!isNaN(metros)) {
              sumaMetros += metros;
              sumaPernos += isNaN(n_pernos) ? 0 : n_pernos;
              const laborSos = `${registro.operacion.tipo_labor || ''}${registro.operacion.labor || ''}${registro.operacion.ala || ''}`;
              if (metros > 0 && laborSos.trim() !== '') laboresContadas++;
            }
          }
        });
      }
    });
    this.cantidadEquiposUnicos = modelosUnicos.size;
    this.totalMetrosPerforados = Math.round(sumaMetros);
    this.totalLaboresSostenidas = laboresContadas;
    this.totalPernos = Math.round(sumaPernos);
    const diasUnicos = fechasUnicas.size;
    this.pernosPorDia = diasUnicos > 0 ? Math.round(this.totalPernos / diasUnicos) : 0;
  }

  prepararDatosGraficoEquipo(): void {
    const mapa = new Map<string, { modelo: string; seccion: string; valor: number }>();
    this.datosFiltrados.forEach(equipo => {
      const modeloEquipo = `${equipo.equipo}-${equipo.n_equipo}`;
      const seccion = equipo.seccion || 'Sin sección';
      let suma = 0;
      if (equipo.registros && Array.isArray(equipo.registros)) {
        equipo.registros.forEach((registro: any) => {
          if (registro.operacion && registro.operacion.n_pernos_instalados) {
            suma += parseFloat(registro.operacion.n_pernos_instalados) || 0;
          }
        });
      }
      const clave = `${modeloEquipo}|${seccion}`;
      const prev = mapa.get(clave);
      if (prev) prev.valor += suma;
      else mapa.set(clave, { modelo: modeloEquipo, seccion, valor: suma });
    });
    this.datosGraficoEquipo = Array.from(mapa.values()).sort((a, b) => a.modelo.localeCompare(b.modelo));
  }

  prepararDatosGraficoLabor(): void {
    const laborMap = new Map<string, Map<string, number>>();
    this.datosFiltrados.forEach(equipo => {
      const seccion = equipo.seccion || 'Sin sección';
      if (equipo.registros && Array.isArray(equipo.registros)) {
        equipo.registros.forEach((registro: any) => {
          if (registro.operacion && registro.operacion.n_pernos_instalados) {
            const labor_sos = `${registro.operacion.tipo_labor || ''}${registro.operacion.labor || ''}${registro.operacion.ala || ''}`;
            if (labor_sos.trim() !== '') {
              const pernos = parseFloat(registro.operacion.n_pernos_instalados) || 0;
              if (!laborMap.has(labor_sos)) laborMap.set(labor_sos, new Map<string, number>());
              const seccionMap = laborMap.get(labor_sos)!;
              seccionMap.set(seccion, (seccionMap.get(seccion) || 0) + pernos);
            }
          }
        });
      }
    });
    this.datosGraficoLabor = [];
    for (const [labor_sos, seccionMap] of laborMap.entries()) {
      for (const [seccion, pernos] of seccionMap.entries()) {
        this.datosGraficoLabor.push({ labor_sos, seccion, pernos });
      }
    }
  }

  prepararDatosGraficoDMUTI(): void {
    const mapa = new Map<string, { nOperaciones: number, sumaHorasMantenimiento: number, sumaHorasDemora206: number, sumaHorasTrabajadas: number }>();
    for (const equipo of this.datosFiltrados) {
      const modelo = `${equipo.equipo}-${equipo.n_equipo}`;
      if (!mapa.has(modelo)) mapa.set(modelo, { nOperaciones: 0, sumaHorasMantenimiento: 0, sumaHorasDemora206: 0, sumaHorasTrabajadas: 0 });
      const acc = mapa.get(modelo)!;
      acc.nOperaciones++;
      const dieselDiff = (equipo.horometros?.diesel?.final || 0) - (equipo.horometros?.diesel?.inicio || 0);
      const electricoDiff = (equipo.horometros?.electrico?.final || 0) - (equipo.horometros?.electrico?.inicio || 0);
      acc.sumaHorasTrabajadas += Math.max(0, dieselDiff) + Math.max(0, electricoDiff);
      if (equipo.registros && Array.isArray(equipo.registros)) {
        for (const registro of equipo.registros) {
          const duracion = this.duracionHoras(registro.hora_inicio, registro.hora_final);
          if (registro.estado === 'MANTENIMIENTO') acc.sumaHorasMantenimiento += duracion;
          else if (registro.estado === 'DEMORA' && registro.codigo === '206') acc.sumaHorasDemora206 += duracion;
        }
      }
    }
    this.datosGraficoDMUTI = [];
    for (const [modelo, data] of mapa.entries()) {
      const n = data.nOperaciones;
      const horasProgramadas = n * 10;
      const horasMantenimiento = data.sumaHorasMantenimiento + data.sumaHorasDemora206;
      const horasMantenimientoAjustado = horasMantenimiento === 0 ? 0.5 * n : horasMantenimiento;
      let dm = 0;
      if (horasProgramadas > 0) dm = ((horasProgramadas - horasMantenimientoAjustado) / horasProgramadas) * 100;
      dm = Math.round(dm * 10) / 10;
      const denominador = horasProgramadas - horasMantenimientoAjustado;
      let uti = 0;
      if (denominador > 0) uti = (data.sumaHorasTrabajadas / denominador) * 100;
      uti = Math.round(uti * 10) / 10;
      this.datosGraficoDMUTI.push({ modelo, dm, uti });
    }
    this.datosGraficoDMUTI.sort((a,b) => a.modelo.localeCompare(b.modelo));
  }

  prepararDatosGraficoDemoras(codigosPermitidos: string[], tipo: string): void {
    const duracionPorCodigo = new Map<string, number>();
    for (const equipo of this.datosFiltrados) {
      if (equipo.registros && Array.isArray(equipo.registros)) {
        for (const registro of equipo.registros) {
          const duracion = this.duracionHoras(registro.hora_inicio, registro.hora_final);
          if (duracion > 0 && registro.codigo && codigosPermitidos.includes(registro.codigo)) {
            duracionPorCodigo.set(registro.codigo, (duracionPorCodigo.get(registro.codigo) || 0) + duracion);
          }
        }
      }
    }
    const equiposUnicos = new Set<string>();
    for (const equipo of this.datosFiltrados) equiposUnicos.add(`${equipo.equipo}-${equipo.n_equipo}`);
    const nEquipos = equiposUnicos.size || 1;
    const datos: { tipoEstado: string; duracionTotal: number; duracionProm: number }[] = [];
    for (const te of this.tipoEstados) {
      if (codigosPermitidos.includes(te.codigo)) {
        const duracionTotal = duracionPorCodigo.get(te.codigo) || 0;
        if (duracionTotal > 0) datos.push({ tipoEstado: te.tipoEstado, duracionTotal, duracionProm: duracionTotal / nEquipos });
      }
    }
    datos.sort((a,b) => b.duracionTotal - a.duracionTotal);
    let sumaTotal = datos.reduce((acc, d) => acc + d.duracionTotal, 0);
    let acumulado = 0;
    const resultado = [];
    for (const d of datos) {
      acumulado += d.duracionTotal;
      resultado.push({ tipoEstado: d.tipoEstado, duracionProm: d.duracionProm, acumPorcentaje: (acumulado / sumaTotal) * 100 });
    }
    if (tipo === 'operativas') this.datosGraficoDemorasOperativas = resultado;
    else if (tipo === 'inoperativas') this.datosGraficoDemorasInoperativas = resultado;
    else if (tipo === 'mantenimiento') this.datosGraficoHorasMantenimiento = resultado;
  }

  prepararDatosPiePernos(): void {
    const mapa = new Map<string, number>();
    for (const equipo of this.datosFiltrados) {
      if (equipo.registros && Array.isArray(equipo.registros)) {
        for (const registro of equipo.registros) {
          if (registro.operacion && registro.operacion.n_pernos_instalados) {
            const tipo = registro.operacion.tipo_pernos || 'Sin especificar';
            const pernos = parseFloat(registro.operacion.n_pernos_instalados) || 0;
            mapa.set(tipo, (mapa.get(tipo) || 0) + pernos);
          }
        }
      }
    }
    this.datosPiePernos = Array.from(mapa.entries()).map(([tipo, valor]) => ({ tipo, valor })).sort((a,b) => b.valor - a.valor);
  }

  prepararDatosGraficoMhr(): void {
    const mapa = new Map<string, { sumaMetros: number; sumaPercusion: number }>();
    for (const equipo of this.datosFiltrados) {
      const modelo = `${equipo.equipo}-${equipo.n_equipo}`;
      if (!mapa.has(modelo)) mapa.set(modelo, { sumaMetros: 0, sumaPercusion: 0 });
      const acc = mapa.get(modelo)!;
      if (equipo.registros && Array.isArray(equipo.registros)) {
        for (const registro of equipo.registros) {
          if (registro.operacion) {
            const n_pernos = parseFloat(registro.operacion.n_pernos_instalados);
            const log_pernos = parseFloat(registro.operacion.log_pernos);
            const metros = n_pernos * log_pernos * 0.3048;
            if (!isNaN(metros)) acc.sumaMetros += metros;
          }
        }
      }
      const percusionDiff = (equipo.horometros?.percusion?.final || 0) - (equipo.horometros?.percusion?.inicio || 0);
      if (percusionDiff > 0) acc.sumaPercusion += percusionDiff;
    }
    this.datosGraficoMhr = [];
    for (const [modelo, data] of mapa.entries()) {
      const valor = data.sumaPercusion > 0 ? data.sumaMetros / data.sumaPercusion : 0;
      this.datosGraficoMhr.push({ modelo, valor: Math.round(valor * 100) / 100 });
    }
    this.datosGraficoMhr.sort((a,b) => a.modelo.localeCompare(b.modelo));
  }

  prepararDatosGraficoMetros(): void {
    const mapa = new Map<string, number>();
    for (const equipo of this.datosFiltrados) {
      const modelo = `${equipo.equipo}-${equipo.n_equipo}`;
      let sumaMetros = 0;
      if (equipo.registros && Array.isArray(equipo.registros)) {
        for (const registro of equipo.registros) {
          if (registro.operacion) {
            const n_pernos = parseFloat(registro.operacion.n_pernos_instalados);
            const log_pernos = parseFloat(registro.operacion.log_pernos);
            const metros = n_pernos * log_pernos * 0.3048;
            if (!isNaN(metros)) sumaMetros += metros;
          }
        }
      }
      mapa.set(modelo, (mapa.get(modelo) || 0) + sumaMetros);
    }
    this.datosGraficoMetros = [];
    for (const [modelo, valor] of mapa.entries()) {
      this.datosGraficoMetros.push({ modelo, valor: Math.round(valor * 100) / 100 });
    }
    this.datosGraficoMetros.sort((a,b) => a.modelo.localeCompare(b.modelo));
  }

  prepararDatosGraficoHorometros(): void {
    const mapa = new Map<string, { diesel: number; electrico: number; percusion: number }>();
    for (const equipo of this.datosFiltrados) {
      const modelo = `${equipo.equipo}-${equipo.n_equipo}`;
      if (!mapa.has(modelo)) mapa.set(modelo, { diesel: 0, electrico: 0, percusion: 0 });
      const acc = mapa.get(modelo)!;
      const dieselDiff = (equipo.horometros?.diesel?.final || 0) - (equipo.horometros?.diesel?.inicio || 0);
      const electricoDiff = (equipo.horometros?.electrico?.final || 0) - (equipo.horometros?.electrico?.inicio || 0);
      const percusionDiff = (equipo.horometros?.percusion?.final || 0) - (equipo.horometros?.percusion?.inicio || 0);
      if (dieselDiff > 0) acc.diesel += dieselDiff;
      if (electricoDiff > 0) acc.electrico += electricoDiff;
      if (percusionDiff > 0) acc.percusion += percusionDiff;
    }
    this.datosGraficoHorometros = [];
    for (const [modelo, values] of mapa.entries()) {
      this.datosGraficoHorometros.push({
        modelo,
        diesel: Math.round(values.diesel * 100) / 100,
        electrico: Math.round(values.electrico * 100) / 100,
        percusion: Math.round(values.percusion * 100) / 100
      });
    }
    this.datosGraficoHorometros.sort((a,b) => a.modelo.localeCompare(b.modelo));
  }

  prepararDatosGraficoPrimeraPerf(): void {
    const equiposMap = new Map<string, Map<string, number[]>>();
    for (const equipo of this.datosFiltrados) {
      const modelo = `${equipo.equipo}-${equipo.n_equipo}`;
      if (!equiposMap.has(modelo)) equiposMap.set(modelo, new Map<string, number[]>());
      const fechasMap = equiposMap.get(modelo)!;
      if (equipo.registros && Array.isArray(equipo.registros)) {
        for (const registro of equipo.registros) {
          if (registro.operacion && registro.operacion.n_pernos_instalados && parseFloat(registro.operacion.n_pernos_instalados) > 0) {
            const horaInicio = registro.hora_inicio;
            if (horaInicio) {
              const partes = horaInicio.split(':');
              const hora = parseInt(partes[0], 10);
              if (hora >= 7 && hora < 19) {
                const fecha = registro.fecha || equipo.fecha;
                if (fecha) {
                  const minutos = this.timeToMinutes(horaInicio);
                  if (!fechasMap.has(fecha)) fechasMap.set(fecha, []);
                  fechasMap.get(fecha)!.push(minutos);
                }
              }
            }
          }
        }
      }
    }
    this.datosGraficoPrimeraPerf = [];
    for (const [modelo, fechasMap] of equiposMap.entries()) {
      let sumaPrimerasHoras = 0;
      let countDias = 0;
      for (const [fecha, minutosArray] of fechasMap.entries()) {
        if (minutosArray.length > 0) {
          minutosArray.sort((a,b) => a - b);
          const primeraHora = minutosArray[0];
          sumaPrimerasHoras += primeraHora;
          countDias++;
        }
      }
      if (countDias > 0) {
        const promedioMinutos = sumaPrimerasHoras / countDias;
        const promedioHoras = promedioMinutos / 60;
        const horasInt = Math.floor(promedioHoras);
        const minutosInt = Math.round((promedioHoras - horasInt) * 60);
        const etiqueta = `${horasInt.toString().padStart(2,'0')}:${minutosInt.toString().padStart(2,'0')}`;
        this.datosGraficoPrimeraPerf.push({ modelo, promedioHoras, etiqueta });
      }
    }
    this.datosGraficoPrimeraPerf.sort((a,b) => a.modelo.localeCompare(b.modelo));
  }

  prepararDatosGraficoUltimaPerf(): void {
    const equiposMap = new Map<string, Map<string, number[]>>();
    for (const equipo of this.datosFiltrados) {
      const modelo = `${equipo.equipo}-${equipo.n_equipo}`;
      if (!equiposMap.has(modelo)) equiposMap.set(modelo, new Map<string, number[]>());
      const fechasMap = equiposMap.get(modelo)!;
      if (equipo.registros && Array.isArray(equipo.registros)) {
        for (const registro of equipo.registros) {
          if (registro.operacion && registro.operacion.n_pernos_instalados && parseFloat(registro.operacion.n_pernos_instalados) > 0) {
            const horaInicio = registro.hora_inicio;
            if (horaInicio) {
              const partes = horaInicio.split(':');
              const hora = parseInt(partes[0], 10);
              if (hora >= 7 && hora < 19) {
                const fecha = registro.fecha || equipo.fecha;
                if (fecha) {
                  const minutos = this.timeToMinutes(horaInicio);
                  if (!fechasMap.has(fecha)) fechasMap.set(fecha, []);
                  fechasMap.get(fecha)!.push(minutos);
                }
              }
            }
          }
        }
      }
    }
    this.datosGraficoUltimaPerf = [];
    for (const [modelo, fechasMap] of equiposMap.entries()) {
      let sumaUltimasHoras = 0;
      let countDias = 0;
      for (const [fecha, minutosArray] of fechasMap.entries()) {
        if (minutosArray.length > 0) {
          minutosArray.sort((a,b) => a - b);
          const ultimaHora = minutosArray[minutosArray.length - 1];
          sumaUltimasHoras += ultimaHora;
          countDias++;
        }
      }
      if (countDias > 0) {
        const promedioMinutos = sumaUltimasHoras / countDias;
        const promedioHoras = promedioMinutos / 60;
        const horasInt = Math.floor(promedioHoras);
        const minutosInt = Math.round((promedioHoras - horasInt) * 60);
        const etiqueta = `${horasInt.toString().padStart(2,'0')}:${minutosInt.toString().padStart(2,'0')}`;
        this.datosGraficoUltimaPerf.push({ modelo, promedioHoras, etiqueta });
      }
    }
    this.datosGraficoUltimaPerf.sort((a,b) => a.modelo.localeCompare(b.modelo));
  }

  prepararDatosHistorialInicio(): void {
    const mapaPorFecha = new Map<string, Map<string, number>>();
    for (const equipo of this.datosFiltrados) {
      const modelo = `${equipo.equipo}-${equipo.n_equipo}`;
      if (equipo.registros && Array.isArray(equipo.registros)) {
        const registrosPorDia = new Map<string, number[]>();
        for (const registro of equipo.registros) {
          if (registro.operacion && registro.operacion.n_pernos_instalados && parseFloat(registro.operacion.n_pernos_instalados) > 0) {
            const horaInicio = registro.hora_inicio;
            if (horaInicio) {
              const partes = horaInicio.split(':');
              const hora = parseInt(partes[0], 10);
              if (hora >= 7 && hora < 19) {
                const fecha = registro.fecha || equipo.fecha;
                if (fecha) {
                  const minutos = this.timeToMinutes(horaInicio);
                  if (!registrosPorDia.has(fecha)) registrosPorDia.set(fecha, []);
                  registrosPorDia.get(fecha)!.push(minutos);
                }
              }
            }
          }
        }
        for (const [fecha, minutosArray] of registrosPorDia.entries()) {
          if (minutosArray.length > 0) {
            minutosArray.sort((a,b) => a - b);
            const primeraHora = minutosArray[0] / 60;
            if (!mapaPorFecha.has(fecha)) mapaPorFecha.set(fecha, new Map<string, number>());
            mapaPorFecha.get(fecha)!.set(modelo, primeraHora);
          }
        }
      }
    }
    const fechasOrdenadas = Array.from(mapaPorFecha.keys()).sort();
    this.datosHistorialInicio = [];
    for (const fecha of fechasOrdenadas) {
      const modeloMap = mapaPorFecha.get(fecha)!;
      const valores = Array.from(modeloMap.entries()).map(([modelo, horaDecimal]) => {
        const horas = Math.floor(horaDecimal);
        const minutos = Math.round((horaDecimal - horas) * 60);
        return { modelo, horaDecimal, etiqueta: `${horas.toString().padStart(2,'0')}:${minutos.toString().padStart(2,'0')}` };
      });
      valores.sort((a,b) => a.modelo.localeCompare(b.modelo));
      this.datosHistorialInicio.push({ fecha, valores });
    }
  }

  prepararDatosHistorialTermino(): void {
    const mapaPorFecha = new Map<string, Map<string, number>>();
    for (const equipo of this.datosFiltrados) {
      const modelo = `${equipo.equipo}-${equipo.n_equipo}`;
      if (equipo.registros && Array.isArray(equipo.registros)) {
        const registrosPorDia = new Map<string, number[]>();
        for (const registro of equipo.registros) {
          if (registro.operacion && registro.operacion.n_pernos_instalados && parseFloat(registro.operacion.n_pernos_instalados) > 0) {
            const horaInicio = registro.hora_inicio;
            if (horaInicio) {
              const partes = horaInicio.split(':');
              const hora = parseInt(partes[0], 10);
              if (hora >= 7 && hora < 19) {
                const fecha = registro.fecha || equipo.fecha;
                if (fecha) {
                  const minutos = this.timeToMinutes(horaInicio);
                  if (!registrosPorDia.has(fecha)) registrosPorDia.set(fecha, []);
                  registrosPorDia.get(fecha)!.push(minutos);
                }
              }
            }
          }
        }
        for (const [fecha, minutosArray] of registrosPorDia.entries()) {
          if (minutosArray.length > 0) {
            minutosArray.sort((a,b) => a - b);
            const ultimaHora = minutosArray[minutosArray.length - 1] / 60;
            if (!mapaPorFecha.has(fecha)) mapaPorFecha.set(fecha, new Map<string, number>());
            mapaPorFecha.get(fecha)!.set(modelo, ultimaHora);
          }
        }
      }
    }
    const fechasOrdenadas = Array.from(mapaPorFecha.keys()).sort();
    this.datosHistorialTermino = [];
    for (const fecha of fechasOrdenadas) {
      const modeloMap = mapaPorFecha.get(fecha)!;
      const valores = Array.from(modeloMap.entries()).map(([modelo, horaDecimal]) => {
        const horas = Math.floor(horaDecimal);
        const minutos = Math.round((horaDecimal - horas) * 60);
        return { modelo, horaDecimal, etiqueta: `${horas.toString().padStart(2,'0')}:${minutos.toString().padStart(2,'0')}` };
      });
      valores.sort((a,b) => a.modelo.localeCompare(b.modelo));
      this.datosHistorialTermino.push({ fecha, valores });
    }
  }

  prepararDatosDetalle(): void {
    const mapa = new Map<string, any>();
    for (const equipo of this.datosFiltrados) {
      const modelo = `${equipo.equipo}-${equipo.n_equipo}`;
      if (!mapa.has(modelo)) mapa.set(modelo, { sumaPercusion: 0, sumaPernos: 0, sumaLongPernos: 0, countLongPernos: 0, labores: new Set<string>(), sumaMetros: 0 });
      const acc = mapa.get(modelo)!;
      const percusionDiff = (equipo.horometros?.percusion?.final || 0) - (equipo.horometros?.percusion?.inicio || 0);
      if (percusionDiff > 0) acc.sumaPercusion += percusionDiff;
      if (equipo.registros && Array.isArray(equipo.registros)) {
        for (const registro of equipo.registros) {
          const oper = registro.operacion;
          if (oper) {
            const n_pernos = parseFloat(oper.n_pernos_instalados) || 0;
            const log_pernos = parseFloat(oper.log_pernos) || 0;
            const metros = n_pernos * log_pernos * 0.3048;
            if (n_pernos > 0) {
              acc.sumaPernos += n_pernos;
              if (log_pernos > 0) { acc.sumaLongPernos += log_pernos; acc.countLongPernos++; }
              acc.sumaMetros += metros;
              const labor = `${oper.tipo_labor || ''}${oper.labor || ''}${oper.ala || ''}`;
              if (labor.trim() !== '') acc.labores.add(labor);
            }
          }
        }
      }
    }
    this.datosDetalle = [];
    for (const [modelo, acc] of mapa.entries()) {
      const mhr = acc.sumaPercusion > 0 ? acc.sumaMetros / acc.sumaPercusion : 0;
      const promedioLong = acc.countLongPernos > 0 ? acc.sumaLongPernos / acc.countLongPernos : 0;
      const pernosPorLabor = acc.labores.size > 0 ? acc.sumaPernos / acc.labores.size : 0;
      this.datosDetalle.push({
        Equipo: modelo,
        HorasPercutadas: Math.round(acc.sumaPercusion * 100) / 100,
        N_Pernos: Math.round(acc.sumaPernos),
        LongPernos: Math.round(promedioLong * 100) / 100,
        NLaboresSostenidas: acc.labores.size,
        PernosPorLabor: Math.round(pernosPorLabor * 100) / 100,
        Mhr: Math.round(mhr * 100) / 100,
        MetrosPerforados: Math.round(acc.sumaMetros * 100) / 100
      });
    }
    this.datosDetalle.sort((a,b) => a.Equipo.localeCompare(b.Equipo));
  }

  prepararDatosMejoresOperadores(): void {
    const mapa = new Map<string, { turno: string; sumaMetros: number; sumaPercusion: number }>();
    for (const equipo of this.datosFiltrados) {
      if (equipo.turno !== 'DÍA') continue;
      const operador = equipo.operador;
      if (!operador) continue;
      if (!mapa.has(operador)) mapa.set(operador, { turno: equipo.turno, sumaMetros: 0, sumaPercusion: 0 });
      const acc = mapa.get(operador)!;
      const percusionDiff = (equipo.horometros?.percusion?.final || 0) - (equipo.horometros?.percusion?.inicio || 0);
      if (percusionDiff > 0) acc.sumaPercusion += percusionDiff;
      if (equipo.registros && Array.isArray(equipo.registros)) {
        for (const registro of equipo.registros) {
          const oper = registro.operacion;
          if (oper) {
            const n_pernos = parseFloat(oper.n_pernos_instalados) || 0;
            const log_pernos = parseFloat(oper.log_pernos) || 0;
            const metros = n_pernos * log_pernos * 0.3048;
            if (!isNaN(metros)) acc.sumaMetros += metros;
          }
        }
      }
    }
    this.datosMejoresOperadores = [];
    for (const [operador, data] of mapa.entries()) {
      const mhr = data.sumaPercusion > 0 ? data.sumaMetros / data.sumaPercusion : 0;
      this.datosMejoresOperadores.push({
        Operador: operador,
        Turno: data.turno,
        Mhr: Math.round(mhr * 100) / 100,
        MetrosPerforados: Math.round(data.sumaMetros * 100) / 100
      });
    }
    this.datosMejoresOperadores.sort((a,b) => b.Mhr - a.Mhr);
  }

  getColorClassForMetros(valor: number, lista: any[], campo: string = 'MetrosPerforados'): string {
    if (!lista.length) return '';
    const valores = lista.map(item => item[campo]).sort((a,b) => a - b);
    const tercil = Math.ceil(valores.length / 3);
    const tercilBajo = valores[tercil - 1];
    const tercilAlto = valores[valores.length - tercil];
    if (valor >= tercilAlto) return 'color-verde';
    if (valor <= tercilBajo) return 'color-rojo';
    return 'color-amarillo';
  }

  getColorClassForMetrosDetalle(valor: number): string {
    return this.getColorClassForMetros(valor, this.datosDetalle, 'MetrosPerforados');
  }

  getColorClassForMetrosOperador(valor: number): string {
    return this.getColorClassForMetros(valor, this.datosMejoresOperadores, 'MetrosPerforados');
  }

  // ===================== MÉTODOS DE DIBUJO =====================

  dibujarGraficoEquipo(): void {
    if (!this.barChartEquipoCanvas) return;
    const canvas = this.barChartEquipoCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    if (!this.datosGraficoEquipo.length) return;

    const margenIzquierdo = 60;
    const margenDerecho = 40;
    const margenSuperior = 30;
    const margenInferior = 60;
    const anchoBarra = 50;
    const espacioEntreBarras = 20;

    const totalBarras = this.datosGraficoEquipo.length;
    const anchoTotalBarras = totalBarras * anchoBarra + (totalBarras - 1) * espacioEntreBarras;
    const espacioDisponible = width - margenIzquierdo - margenDerecho;
    let inicioX = margenIzquierdo;
    if (anchoTotalBarras < espacioDisponible) {
      inicioX = margenIzquierdo + (espacioDisponible - anchoTotalBarras) / 2;
    }

    const maxY = height - margenInferior;
    const minY = margenSuperior;
    const valores = this.datosGraficoEquipo.map(d => d.valor);
    const maxValor = Math.max(...valores, 1);
    const escalaY = (maxY - minY) / maxValor;

    for (let i = 0; i < totalBarras; i++) {
      const dato = this.datosGraficoEquipo[i];
      const x = inicioX + i * (anchoBarra + espacioEntreBarras);
      const altura = dato.valor * escalaY;
      const y = maxY - altura;

      ctx.fillStyle = '#051E41';
      ctx.fillRect(x, y, anchoBarra, altura);

      ctx.fillStyle = '#000';
      ctx.font = 'bold 10px Times New Roman';
      const valorTexto = Math.round(dato.valor).toString();
      const textoWidth = ctx.measureText(valorTexto).width;
      ctx.fillText(valorTexto, x + (anchoBarra / 2) - (textoWidth / 2), y - 5);

      ctx.fillStyle = '#000';
      ctx.font = '9px Times New Roman';
      const centroX = x + anchoBarra / 2;
      ctx.fillText(dato.modelo, centroX - ctx.measureText(dato.modelo).width / 2, maxY + 15);
      ctx.fillText(dato.seccion, centroX - ctx.measureText(dato.seccion).width / 2, maxY + 25);
    }

    ctx.beginPath();
    ctx.moveTo(margenIzquierdo - 5, minY);
    ctx.lineTo(margenIzquierdo - 5, maxY);
    ctx.lineTo(width - margenDerecho, maxY);
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = '9px Times New Roman';
    for (let i = 0; i <= 5; i++) {
      const valor = (maxValor / 5) * i;
      const y = maxY - valor * escalaY;
      ctx.fillText(Math.round(valor).toString(), margenIzquierdo - 22, y + 3);
      ctx.beginPath();
      ctx.moveTo(margenIzquierdo - 5, y);
      ctx.lineTo(margenIzquierdo, y);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(18, minY + (maxY - minY) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('N° Pernos Instalados', 0, 0);
    ctx.restore();
  }

  dibujarGraficoLabor(): void {
    if (!this.barChartLaborCanvas) return;
    const canvas = this.barChartLaborCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    const laborMap = new Map<string, Map<string, number>>();
    for (const item of this.datosGraficoLabor) {
      if (!laborMap.has(item.labor_sos)) {
        laborMap.set(item.labor_sos, new Map<string, number>());
      }
      const seccionMap = laborMap.get(item.labor_sos)!;
      seccionMap.set(item.seccion, (seccionMap.get(item.seccion) || 0) + item.pernos);
    }

    const labores = Array.from(laborMap.keys()).sort();
    if (labores.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '12px Times New Roman';
      ctx.fillText('No hay datos para mostrar', width/2 - 80, height/2);
      return;
    }

    const allSeccionesSet = new Set<string>();
    for (const seccionMap of laborMap.values()) {
      for (const seccion of seccionMap.keys()) {
        allSeccionesSet.add(seccion);
      }
    }
    const allSecciones = Array.from(allSeccionesSet).sort();
    const numSecciones = allSecciones.length;

    const margenIzquierdo = 50;
    const margenDerecho = 30;
    const margenSuperior = 25;
    const margenInferior = 55;
    const espacioParaLeyenda = 30;
    const heightGrafico = height - margenSuperior - margenInferior - espacioParaLeyenda;
    if (heightGrafico <= 0) return;

    const anchoDisponible = width - margenIzquierdo - margenDerecho;
    let anchoGrupo = anchoDisponible / labores.length;
    if (anchoGrupo < 60) anchoGrupo = 60;
    if (anchoGrupo > 100) anchoGrupo = 100;

    const anchoBarra = (anchoGrupo / numSecciones) * 0.7;
    const espacioEntreBarras = (anchoGrupo - (anchoBarra * numSecciones)) / (numSecciones + 1);
    if (anchoBarra < 5) return;

    const totalGrupos = labores.length;
    const anchoTotalGrupos = totalGrupos * anchoGrupo;
    let inicioX = margenIzquierdo;
    if (anchoTotalGrupos < anchoDisponible) {
      inicioX = margenIzquierdo + (anchoDisponible - anchoTotalGrupos) / 2;
    }

    const maxY = height - margenInferior - espacioParaLeyenda;
    const minY = margenSuperior;

    let maxValor = 0;
    for (const seccionMap of laborMap.values()) {
      for (const pernos of seccionMap.values()) {
        if (pernos > maxValor) maxValor = pernos;
      }
    }
    maxValor = Math.max(maxValor, 1);
    const escalaY = (maxY - minY) / maxValor;

    const colores = ['#0E5050', '#1E7A7A', '#2E9E9E', '#3EC2C2', '#4EE6E6', '#5F9EA0', '#4682B4', '#5F9F9F'];

    for (let i = 0; i < labores.length; i++) {
      const labor = labores[i];
      const seccionMap = laborMap.get(labor)!;
      const xBase = inicioX + i * anchoGrupo;

      for (let j = 0; j < allSecciones.length; j++) {
        const seccion = allSecciones[j];
        const pernos = seccionMap.get(seccion) || 0;
        const altura = pernos * escalaY;
        const x = xBase + espacioEntreBarras + j * (anchoBarra + espacioEntreBarras);
        const y = maxY - altura;

        ctx.fillStyle = colores[j % colores.length];
        ctx.fillRect(x, y, anchoBarra, altura);

        if (pernos > 0) {
          ctx.fillStyle = '#000';
          ctx.font = 'bold 9px Times New Roman';
          const valorTexto = Math.round(pernos).toString();
          const textoWidth = ctx.measureText(valorTexto).width;
          ctx.fillText(valorTexto, x + anchoBarra/2 - textoWidth/2, y - 3);
        }
      }

      ctx.fillStyle = '#000';
      ctx.font = '9px Times New Roman';
      const textoLabor = labor.length > 20 ? labor.substring(0, 18) + '...' : labor;
      ctx.fillText(textoLabor, xBase + anchoGrupo/2 - ctx.measureText(textoLabor).width/2, maxY + 15);
    }

    const leyendaY = maxY + 30;
    let leyendaX = margenIzquierdo;
    ctx.font = '9px Times New Roman';
    for (let j = 0; j < allSecciones.length; j++) {
      const seccion = allSecciones[j];
      ctx.fillStyle = colores[j % colores.length];
      ctx.fillRect(leyendaX, leyendaY, 10, 10);
      ctx.fillStyle = '#000';
      ctx.fillText(seccion, leyendaX + 14, leyendaY + 8);
      leyendaX += ctx.measureText(seccion).width + 30;
      if (leyendaX > width - 50) break;
    }

    ctx.beginPath();
    ctx.moveTo(margenIzquierdo - 5, minY);
    ctx.lineTo(margenIzquierdo - 5, maxY);
    ctx.lineTo(width - margenDerecho, maxY);
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = '9px Times New Roman';
    for (let i = 0; i <= 5; i++) {
      const valor = (maxValor / 5) * i;
      const y = maxY - valor * escalaY;
      ctx.fillText(Math.round(valor).toString(), margenIzquierdo - 22, y + 3);
      ctx.beginPath();
      ctx.moveTo(margenIzquierdo - 5, y);
      ctx.lineTo(margenIzquierdo, y);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(18, minY + (maxY - minY) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('N° Pernos Instalados', 0, 0);
    ctx.restore();
  }

  dibujarGraficoDMUTI(): void {
    if (!this.barChartDMUTICanvas) return;
    const canvas = this.barChartDMUTICanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    if (this.datosGraficoDMUTI.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '12px Times New Roman';
      ctx.fillText('No hay datos para mostrar', width/2 - 80, height/2);
      return;
    }

    const margenIzquierdo = 60;
    const margenDerecho = 50;
    const margenSuperior = 30;
    const margenInferior = 60;
    const espacioParaLeyenda = 30;
    const heightGrafico = height - margenSuperior - margenInferior - espacioParaLeyenda;
    if (heightGrafico <= 0) return;

    const grupos = this.datosGraficoDMUTI.length;
    const anchoDisponible = width - margenIzquierdo - margenDerecho;
    let anchoGrupo = anchoDisponible / grupos;
    if (anchoGrupo < 60) anchoGrupo = 60;
    if (anchoGrupo > 100) anchoGrupo = 100;

    const numSeries = 2;
    const anchoBarra = (anchoGrupo / numSeries) * 0.7;
    const espacioEntreBarras = (anchoGrupo - (anchoBarra * numSeries)) / (numSeries + 1);
    if (anchoBarra < 5) return;

    const totalGrupos = grupos;
    const anchoTotalGrupos = totalGrupos * anchoGrupo;
    let inicioX = margenIzquierdo;
    if (anchoTotalGrupos < anchoDisponible) {
      inicioX = margenIzquierdo + (anchoDisponible - anchoTotalGrupos) / 2;
    }

    const maxY = height - margenInferior - espacioParaLeyenda;
    const minY = margenSuperior;

    let maxValor = 0;
    for (const item of this.datosGraficoDMUTI) {
      if (item.dm > maxValor) maxValor = item.dm;
      if (item.uti > maxValor) maxValor = item.uti;
    }
    maxValor = Math.max(maxValor, 1);
    const escalaY = (maxY - minY) / maxValor;

    const colores = ['#051E41', '#B3B3B3'];

    for (let i = 0; i < grupos; i++) {
      const item = this.datosGraficoDMUTI[i];
      const xBase = inicioX + i * anchoGrupo;

      for (let s = 0; s < numSeries; s++) {
        const valor = s === 0 ? item.dm : item.uti;
        const altura = valor * escalaY;
        const x = xBase + espacioEntreBarras + s * (anchoBarra + espacioEntreBarras);
        const y = maxY - altura;
        ctx.fillStyle = colores[s];
        ctx.fillRect(x, y, anchoBarra, altura);

        if (valor > 0) {
          ctx.fillStyle = '#000';
          ctx.font = 'bold 9px Times New Roman';
          const textoValor = valor.toFixed(1) + '%';
          const textoWidth = ctx.measureText(textoValor).width;
          ctx.fillText(textoValor, x + anchoBarra/2 - textoWidth/2, y - 3);
        }
      }

      ctx.fillStyle = '#000';
      ctx.font = '9px Times New Roman';
      const textoModelo = item.modelo.length > 20 ? item.modelo.substring(0,18)+'...' : item.modelo;
      ctx.fillText(textoModelo, xBase + anchoGrupo/2 - ctx.measureText(textoModelo).width/2, maxY + 15);
    }

    const leyendaY = maxY + 30;
    let leyendaX = margenIzquierdo;
    ctx.font = '9px Times New Roman';
    const nombresSerie = ['DM %', 'UTI %'];
    for (let s = 0; s < numSeries; s++) {
      ctx.fillStyle = colores[s];
      ctx.fillRect(leyendaX, leyendaY, 10, 10);
      ctx.fillStyle = '#000';
      ctx.fillText(nombresSerie[s], leyendaX + 14, leyendaY + 8);
      leyendaX += ctx.measureText(nombresSerie[s]).width + 30;
    }

    ctx.beginPath();
    ctx.moveTo(margenIzquierdo - 5, minY);
    ctx.lineTo(margenIzquierdo - 5, maxY);
    ctx.lineTo(width - margenDerecho, maxY);
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = '9px Times New Roman';
    for (let i = 0; i <= 5; i++) {
      const valor = (maxValor / 5) * i;
      const y = maxY - valor * escalaY;
      ctx.fillText(Math.round(valor).toString(), margenIzquierdo - 22, y + 3);
      ctx.beginPath();
      ctx.moveTo(margenIzquierdo - 5, y);
      ctx.lineTo(margenIzquierdo, y);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(18, minY + (maxY - minY) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Porcentaje (%)', 0, 0);
    ctx.restore();
  }

  dibujarPareto(canvas: HTMLCanvasElement, datos: { tipoEstado: string; duracionProm: number; acumPorcentaje: number }[], titulo: string): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    if (datos.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '12px Times New Roman';
      ctx.fillText('No hay datos para mostrar', width/2 - 80, height/2);
      return;
    }

    const margenIzquierdo = 70;
    const margenDerecho = 40;
    const margenSuperior = 30;
    const margenInferior = 80;
    const espacioParaLeyenda = 30;
    const heightGrafico = height - margenSuperior - margenInferior - espacioParaLeyenda;
    if (heightGrafico <= 0) return;

    const nBarras = datos.length;
    const anchoDisponible = width - margenIzquierdo - margenDerecho;
    const anchoBarra = Math.min(40, (anchoDisponible / nBarras) * 0.7);
    const espacioEntreBarras = (anchoDisponible - nBarras * anchoBarra) / (nBarras + 1);
    if (anchoBarra < 3) return;

    let inicioX = margenIzquierdo + espacioEntreBarras;

    const maxYBarra = height - margenInferior - espacioParaLeyenda;
    const minY = margenSuperior;

    const maxDuracionFijo = 9;
    const escalaYBarra = (maxYBarra - minY) / maxDuracionFijo;

    const minYLineaValor = 0.3;
    const maxYLineaValor = 1.0;
    const rangoLineaValor = maxYLineaValor - minYLineaValor;

    for (let i = 0; i < nBarras; i++) {
      const d = datos[i];
      const x = inicioX + i * (anchoBarra + espacioEntreBarras);
      const altura = Math.min(d.duracionProm, maxDuracionFijo) * escalaYBarra;
      const y = maxYBarra - altura;

      let colorBarra = '#051E41';
      if (d.acumPorcentaje >= 80) {
        colorBarra = '#3A5E91';
      } else if (d.acumPorcentaje >= 50) {
        colorBarra = '#0E2E5A';
      }
      ctx.fillStyle = colorBarra;
      ctx.fillRect(x, y, anchoBarra, altura);

      if (d.duracionProm > 0) {
        ctx.fillStyle = '#000';
        ctx.font = 'bold 8px Times New Roman';
        const textoValor = d.duracionProm.toFixed(1) + ' h';
        const textoWidth = ctx.measureText(textoValor).width;
        ctx.fillText(textoValor, x + anchoBarra/2 - textoWidth/2, y - 3);
      }
    }

    ctx.beginPath();
    ctx.strokeStyle = '#B3B3B3';
    ctx.lineWidth = 2;
    let firstPoint = true;
    const puntos: { x: number; y: number; porcentaje: number }[] = [];
    for (let i = 0; i < nBarras; i++) {
      const d = datos[i];
      const x = inicioX + i * (anchoBarra + espacioEntreBarras) + anchoBarra / 2;
      const valorLineal = minYLineaValor + (d.acumPorcentaje / 100) * rangoLineaValor;
      let yCanvas = maxYBarra - ((valorLineal - minYLineaValor) / rangoLineaValor) * (maxYBarra - minY);
      yCanvas = Math.min(maxYBarra, Math.max(minY, yCanvas));
      puntos.push({ x, y: yCanvas, porcentaje: d.acumPorcentaje });
      if (firstPoint) {
        ctx.moveTo(x, yCanvas);
        firstPoint = false;
      } else {
        ctx.lineTo(x, yCanvas);
      }
    }
    ctx.stroke();

    ctx.fillStyle = '#B3B3B3';
    for (const p of puntos) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#B3B3B3';
      ctx.font = 'bold 9px Times New Roman';
      const textoPorc = p.porcentaje.toFixed(1) + '%';
      const textoWidth = ctx.measureText(textoPorc).width;
      ctx.fillText(textoPorc, p.x - textoWidth/2, p.y - 8);
    }

    ctx.fillStyle = '#000';
    ctx.font = '10px Times New Roman';
    for (let i = 0; i < nBarras; i++) {
      const d = datos[i];
      const x = inicioX + i * (anchoBarra + espacioEntreBarras) + anchoBarra / 2;
      let texto = d.tipoEstado;
      let lineas: string[] = [];
      if (texto.length > 12) {
        let splitIndex = texto.indexOf(' ', 6);
        if (splitIndex === -1) splitIndex = 12;
        lineas = [texto.substring(0, splitIndex), texto.substring(splitIndex)];
      } else {
        lineas = [texto];
      }
      ctx.save();
      ctx.translate(x, maxYBarra + 10);
      ctx.textAlign = 'center';
      for (let l = 0; l < lineas.length; l++) {
        ctx.fillText(lineas[l], 0, l * 12);
      }
      ctx.restore();
    }

    ctx.beginPath();
    ctx.moveTo(margenIzquierdo - 5, minY);
    ctx.lineTo(margenIzquierdo - 5, maxYBarra);
    ctx.lineTo(width - margenDerecho, maxYBarra);
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = '9px Times New Roman';
    for (let i = 0; i <= 5; i++) {
      const valor = (maxDuracionFijo / 5) * i;
      const y = maxYBarra - valor * escalaYBarra;
      ctx.fillText(valor.toFixed(1), margenIzquierdo - 25, y + 3);
      ctx.beginPath();
      ctx.moveTo(margenIzquierdo - 5, y);
      ctx.lineTo(margenIzquierdo, y);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(18, minY + (maxYBarra - minY) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px Times New Roman';
    ctx.fillText('Duración promedio (horas)', 0, 0);
    ctx.restore();

    const leyendaY = maxYBarra + 45;
    let leyendaX = margenIzquierdo;
    ctx.font = '9px Times New Roman';
    ctx.fillStyle = '#051E41';
    ctx.fillRect(leyendaX, leyendaY, 10, 10);
    ctx.fillStyle = '#000';
    ctx.fillText('Duración promedio', leyendaX + 14, leyendaY + 8);
    leyendaX += 130;
    ctx.fillStyle = '#B3B3B3';
    ctx.fillRect(leyendaX, leyendaY, 10, 10);
    ctx.fillStyle = '#000';
    ctx.fillText('Porcentaje acumulado', leyendaX + 14, leyendaY + 8);
  }

  dibujarGraficoDemorasOperativas(): void {
    if (!this.barChartDemorasOperativasCanvas) return;
    this.dibujarPareto(this.barChartDemorasOperativasCanvas.nativeElement, this.datosGraficoDemorasOperativas, 'DEMORAS OPERATIVAS');
  }

  dibujarGraficoDemorasInoperativas(): void {
    if (!this.barChartDemorasInoperativasCanvas) return;
    this.dibujarPareto(this.barChartDemorasInoperativasCanvas.nativeElement, this.datosGraficoDemorasInoperativas, 'DEMORAS INOPERATIVAS');
  }

  dibujarGraficoHorasMantenimiento(): void {
    if (!this.barChartHorasMantenimientoCanvas) return;
    this.dibujarPareto(this.barChartHorasMantenimientoCanvas.nativeElement, this.datosGraficoHorasMantenimiento, 'HORAS MANTENIMIENTO');
  }

  dibujarPiePernos(): void {
    if (!this.pieChartPernosCanvas) return;
    const canvas = this.pieChartPernosCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    if (this.datosPiePernos.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '12px Times New Roman';
      ctx.fillText('No hay datos para mostrar', width/2 - 80, height/2);
      return;
    }

    const total = this.datosPiePernos.reduce((sum, d) => sum + d.valor, 0);
    if (total === 0) return;

    const centroX = width / 2;
    const centroY = height / 2 - 20;
    const radio = Math.min(width, height) * 0.35;

    let anguloInicio = -Math.PI / 2;
    const anguloTotal = Math.PI * 2;

    const leyendaY = centroY + radio + 30;
    let leyendaX = (width - (this.datosPiePernos.length * 120)) / 2;
    if (leyendaX < 10) leyendaX = 10;

    for (let i = 0; i < this.datosPiePernos.length; i++) {
      const d = this.datosPiePernos[i];
      const angulo = (d.valor / total) * anguloTotal;
      const anguloFin = anguloInicio + angulo;
      const color = this.coloresPie[i % this.coloresPie.length];

      ctx.beginPath();
      ctx.moveTo(centroX, centroY);
      ctx.arc(centroX, centroY, radio, anguloInicio, anguloFin);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();

      const anguloMedio = anguloInicio + angulo / 2;
      const radioTexto = radio * 0.7;
      const xTexto = centroX + Math.cos(anguloMedio) * radioTexto;
      const yTexto = centroY + Math.sin(anguloMedio) * radioTexto;
      const porcentaje = (d.valor / total) * 100;
      if (porcentaje > 5) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Times New Roman';
        ctx.fillText(porcentaje.toFixed(1) + '%', xTexto - 10, yTexto);
      }

      ctx.fillStyle = color;
      ctx.fillRect(leyendaX + i * 120, leyendaY, 12, 12);
      ctx.fillStyle = '#000';
      ctx.font = '9px Times New Roman';
      ctx.fillText(d.tipo, leyendaX + i * 120 + 16, leyendaY + 10);

      anguloInicio = anguloFin;
    }
  }

  dibujarGraficoMhr(): void {
    if (!this.barChartMhrCanvas) return;
    const canvas = this.barChartMhrCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    if (this.datosGraficoMhr.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '12px Times New Roman';
      ctx.fillText('No hay datos para mostrar', width/2 - 80, height/2);
      return;
    }

    const margenIzquierdo = 70;
    const margenDerecho = 50;
    const margenSuperior = 40;
    const margenInferior = 60;
    const heightGrafico = height - margenSuperior - margenInferior;
    if (heightGrafico <= 0) return;

    const nBarras = this.datosGraficoMhr.length;
    const anchoDisponible = width - margenIzquierdo - margenDerecho;
    const anchoBarra = Math.min(50, (anchoDisponible / nBarras) * 0.7);
    const espacioEntreBarras = (anchoDisponible - nBarras * anchoBarra) / (nBarras + 1);
    if (anchoBarra < 3) return;

    let inicioX = margenIzquierdo + espacioEntreBarras;
    const maxY = height - margenInferior;
    const minY = margenSuperior;

    const valores = this.datosGraficoMhr.map(d => d.valor);
    const maxValor = Math.max(...valores, 0.01);
    const escalaY = (maxY - minY) / maxValor;

    for (let i = 0; i < nBarras; i++) {
      const d = this.datosGraficoMhr[i];
      const x = inicioX + i * (anchoBarra + espacioEntreBarras);
      const altura = d.valor * escalaY;
      const y = maxY - altura;

      ctx.fillStyle = '#051E41';
      ctx.fillRect(x, y, anchoBarra, altura);

      ctx.fillStyle = '#000';
      ctx.font = 'bold 9px Times New Roman';
      const textoValor = d.valor.toFixed(1);
      const textoWidth = ctx.measureText(textoValor).width;
      ctx.fillText(textoValor, x + anchoBarra/2 - textoWidth/2, y - 5);

      ctx.fillStyle = '#000';
      ctx.font = '9px Times New Roman';
      const centroX = x + anchoBarra / 2;
      const modeloTexto = d.modelo.length > 20 ? d.modelo.substring(0,18)+'...' : d.modelo;
      ctx.fillText(modeloTexto, centroX - ctx.measureText(modeloTexto).width/2, maxY + 15);
    }

    ctx.beginPath();
    ctx.moveTo(margenIzquierdo - 5, minY);
    ctx.lineTo(margenIzquierdo - 5, maxY);
    ctx.lineTo(width - margenDerecho, maxY);
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = '9px Times New Roman';
    for (let i = 0; i <= 5; i++) {
      const valor = (maxValor / 5) * i;
      const y = maxY - valor * escalaY;
      ctx.fillText(valor.toFixed(1), margenIzquierdo - 25, y + 3);
      ctx.beginPath();
      ctx.moveTo(margenIzquierdo - 5, y);
      ctx.lineTo(margenIzquierdo, y);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(18, minY + (maxY - minY) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px Times New Roman';
    ctx.fillText('Metros / Hora Percusión', 0, 0);
    ctx.restore();
  }

  dibujarGraficoMetros(): void {
    if (!this.barChartMetrosCanvas) return;
    const canvas = this.barChartMetrosCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    if (this.datosGraficoMetros.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '12px Times New Roman';
      ctx.fillText('No hay datos para mostrar', width/2 - 80, height/2);
      return;
    }

    const margenIzquierdo = 70;
    const margenDerecho = 50;
    const margenSuperior = 40;
    const margenInferior = 60;
    const heightGrafico = height - margenSuperior - margenInferior;
    if (heightGrafico <= 0) return;

    const nBarras = this.datosGraficoMetros.length;
    const anchoDisponible = width - margenIzquierdo - margenDerecho;
    const anchoBarra = Math.min(50, (anchoDisponible / nBarras) * 0.7);
    const espacioEntreBarras = (anchoDisponible - nBarras * anchoBarra) / (nBarras + 1);
    if (anchoBarra < 3) return;

    let inicioX = margenIzquierdo + espacioEntreBarras;
    const maxY = height - margenInferior;
    const minY = margenSuperior;

    const valores = this.datosGraficoMetros.map(d => d.valor);
    const maxValor = Math.max(...valores, 0.01);
    const escalaY = (maxY - minY) / maxValor;

    for (let i = 0; i < nBarras; i++) {
      const d = this.datosGraficoMetros[i];
      const x = inicioX + i * (anchoBarra + espacioEntreBarras);
      const altura = d.valor * escalaY;
      const y = maxY - altura;

      ctx.fillStyle = '#051E41';
      ctx.fillRect(x, y, anchoBarra, altura);

      ctx.fillStyle = '#000';
      ctx.font = 'bold 9px Times New Roman';
      const textoValor = d.valor.toFixed(1);
      const textoWidth = ctx.measureText(textoValor).width;
      ctx.fillText(textoValor, x + anchoBarra/2 - textoWidth/2, y - 5);

      ctx.fillStyle = '#000';
      ctx.font = '9px Times New Roman';
      const centroX = x + anchoBarra / 2;
      const modeloTexto = d.modelo.length > 20 ? d.modelo.substring(0,18)+'...' : d.modelo;
      ctx.fillText(modeloTexto, centroX - ctx.measureText(modeloTexto).width/2, maxY + 15);
    }

    ctx.beginPath();
    ctx.moveTo(margenIzquierdo - 5, minY);
    ctx.lineTo(margenIzquierdo - 5, maxY);
    ctx.lineTo(width - margenDerecho, maxY);
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = '9px Times New Roman';
    for (let i = 0; i <= 5; i++) {
      const valor = (maxValor / 5) * i;
      const y = maxY - valor * escalaY;
      ctx.fillText(valor.toFixed(1), margenIzquierdo - 25, y + 3);
      ctx.beginPath();
      ctx.moveTo(margenIzquierdo - 5, y);
      ctx.lineTo(margenIzquierdo, y);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(18, minY + (maxY - minY) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px Times New Roman';
    ctx.fillText('Metros Perforados', 0, 0);
    ctx.restore();
  }

  dibujarGraficoHorometros(): void {
    if (!this.barChartHorometrosCanvas) return;
    const canvas = this.barChartHorometrosCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    if (this.datosGraficoHorometros.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '12px Times New Roman';
      ctx.fillText('No hay datos para mostrar', width/2 - 80, height/2);
      return;
    }

    const margenIzquierdo = 70;
    const margenDerecho = 50;
    const margenSuperior = 40;
    const margenInferior = 70;
    const heightGrafico = height - margenSuperior - margenInferior;
    if (heightGrafico <= 0) return;

    const nBarras = this.datosGraficoHorometros.length;
    const anchoDisponible = width - margenIzquierdo - margenDerecho;
    const numSeries = 3;
    const anchoGrupo = (anchoDisponible / nBarras) * 0.85;
    const anchoBarra = (anchoGrupo / numSeries) * 0.9;
    const espacioEfectivo = Math.max(0, (anchoGrupo - (anchoBarra * numSeries)) / (numSeries + 1));

    const inicioX = margenIzquierdo + (anchoDisponible - (nBarras * anchoGrupo)) / 2;
    const maxY = height - margenInferior;
    const minY = margenSuperior;

    let maxValor = 0;
    for (const d of this.datosGraficoHorometros) {
      maxValor = Math.max(maxValor, d.diesel, d.electrico, d.percusion);
    }
    maxValor = Math.max(maxValor, 0.01);
    const escalaY = (maxY - minY) / maxValor;

    const colores = ['#051E41', '#E1C233', '#E66C37'];
    const nombresSeries = ['Diesel', 'Eléctrico', 'Percusión'];

    for (let i = 0; i < nBarras; i++) {
      const d = this.datosGraficoHorometros[i];
      const xBase = inicioX + i * anchoGrupo;

      for (let s = 0; s < numSeries; s++) {
        let valor = 0;
        if (s === 0) valor = d.diesel;
        else if (s === 1) valor = d.electrico;
        else valor = d.percusion;
        const altura = valor * escalaY;
        const x = xBase + espacioEfectivo + s * (anchoBarra + espacioEfectivo);
        const y = maxY - altura;
        ctx.fillStyle = colores[s];
        ctx.fillRect(x, y, anchoBarra, altura);

        if (valor > 0) {
          ctx.fillStyle = '#000';
          ctx.font = 'bold 8px Times New Roman';
          const textoValor = valor.toFixed(1);
          const textoWidth = ctx.measureText(textoValor).width;
          ctx.fillText(textoValor, x + anchoBarra/2 - textoWidth/2, y - 3);
        }
      }

      ctx.fillStyle = '#000';
      ctx.font = '9px Times New Roman';
      const modeloTexto = d.modelo.length > 20 ? d.modelo.substring(0,18)+'...' : d.modelo;
      ctx.fillText(modeloTexto, xBase + anchoGrupo/2 - ctx.measureText(modeloTexto).width/2, maxY + 15);
    }

    ctx.beginPath();
    ctx.moveTo(margenIzquierdo - 5, minY);
    ctx.lineTo(margenIzquierdo - 5, maxY);
    ctx.lineTo(width - margenDerecho, maxY);
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = '9px Times New Roman';
    for (let i = 0; i <= 5; i++) {
      const valor = (maxValor / 5) * i;
      const y = maxY - valor * escalaY;
      ctx.fillText(valor.toFixed(1), margenIzquierdo - 25, y + 3);
      ctx.beginPath();
      ctx.moveTo(margenIzquierdo - 5, y);
      ctx.lineTo(margenIzquierdo, y);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(18, minY + (maxY - minY) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px Times New Roman';
    ctx.fillText('Horómetros (horas)', 0, 0);
    ctx.restore();

    const leyendaY = maxY + 40;
    let leyendaX = margenIzquierdo;
    ctx.font = '9px Times New Roman';
    for (let s = 0; s < numSeries; s++) {
      ctx.fillStyle = colores[s];
      ctx.fillRect(leyendaX, leyendaY, 12, 12);
      ctx.fillStyle = '#000';
      ctx.fillText(nombresSeries[s], leyendaX + 16, leyendaY + 10);
      leyendaX += ctx.measureText(nombresSeries[s]).width + 40;
    }
  }

  dibujarGraficoLinea(canvas: HTMLCanvasElement, datos: { modelo: string; promedioHoras: number; etiqueta: string }[]): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    if (datos.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '12px Times New Roman';
      ctx.fillText('No hay datos para mostrar', width/2 - 80, height/2);
      return;
    }

    const margenIzquierdo = 70;
    const margenDerecho = 50;
    const margenSuperior = 40;
    const margenInferior = 60;
    const heightGrafico = height - margenSuperior - margenInferior;
    if (heightGrafico <= 0) return;

    const nPuntos = datos.length;
    const anchoDisponible = width - margenIzquierdo - margenDerecho;
    const pasoX = anchoDisponible / (nPuntos - 1);

    let minYValor = Infinity;
    let maxYValor = -Infinity;
    for (const d of datos) {
      if (d.promedioHoras < minYValor) minYValor = d.promedioHoras;
      if (d.promedioHoras > maxYValor) maxYValor = d.promedioHoras;
    }
    if (minYValor === maxYValor) {
      minYValor -= 0.5;
      maxYValor += 0.5;
    }
    const rangoY = maxYValor - minYValor;
    const escalaY = heightGrafico / rangoY;

    const puntos: { x: number; y: number; etiqueta: string }[] = [];
    for (let i = 0; i < nPuntos; i++) {
      const d = datos[i];
      const x = margenIzquierdo + i * pasoX;
      const y = margenSuperior + (maxYValor - d.promedioHoras) * escalaY;
      puntos.push({ x, y, etiqueta: d.etiqueta });
    }

    ctx.beginPath();
    ctx.strokeStyle = '#0E5050';
    ctx.lineWidth = 2;
    ctx.moveTo(puntos[0].x, puntos[0].y);
    for (let i = 1; i < puntos.length; i++) {
      ctx.lineTo(puntos[i].x, puntos[i].y);
    }
    ctx.stroke();

    ctx.fillStyle = '#0E5050';
    for (const p of puntos) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 9px Times New Roman';
      ctx.fillText(p.etiqueta, p.x - 15, p.y - 6);
    }

    ctx.fillStyle = '#000';
    ctx.font = '9px Times New Roman';
    for (let i = 0; i < nPuntos; i++) {
      const d = datos[i];
      const x = margenIzquierdo + i * pasoX;
      const modeloTexto = d.modelo.length > 20 ? d.modelo.substring(0,18)+'...' : d.modelo;
      ctx.fillText(modeloTexto, x - ctx.measureText(modeloTexto).width/2, margenSuperior + heightGrafico + 15);
    }

    ctx.beginPath();
    ctx.moveTo(margenIzquierdo - 5, margenSuperior);
    ctx.lineTo(margenIzquierdo - 5, margenSuperior + heightGrafico);
    ctx.lineTo(width - margenDerecho, margenSuperior + heightGrafico);
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = '9px Times New Roman';
    for (let i = 0; i <= 5; i++) {
      const valor = minYValor + (rangoY / 5) * i;
      const y = margenSuperior + (maxYValor - valor) * escalaY;
      const horas = Math.floor(valor);
      const minutos = Math.round((valor - horas) * 60);
      const etiquetaY = `${horas.toString().padStart(2,'0')}:${minutos.toString().padStart(2,'0')}`;
      ctx.fillText(etiquetaY, margenIzquierdo - 35, y + 3);
      ctx.beginPath();
      ctx.moveTo(margenIzquierdo - 5, y);
      ctx.lineTo(margenIzquierdo, y);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(18, margenSuperior + heightGrafico / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px Times New Roman';
    ctx.fillText('Hora (promedio)', 0, 0);
    ctx.restore();
  }

  dibujarGraficoPrimeraPerf(): void {
    if (!this.lineChartPrimeraPerfCanvas) return;
    this.dibujarGraficoLinea(this.lineChartPrimeraPerfCanvas.nativeElement, this.datosGraficoPrimeraPerf);
  }

  dibujarGraficoUltimaPerf(): void {
    if (!this.lineChartUltimaPerfCanvas) return;
    this.dibujarGraficoLinea(this.lineChartUltimaPerfCanvas.nativeElement, this.datosGraficoUltimaPerf);
  }

  dibujarGraficoHistorialInicio(): void {
    if (!this.lineChartHistorialInicioCanvas) return;
    const canvas = this.lineChartHistorialInicioCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    if (this.datosHistorialInicio.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '12px Times New Roman';
      ctx.fillText('No hay datos para mostrar', width/2 - 80, height/2);
      return;
    }

    const fechas = this.datosHistorialInicio.map(d => d.fecha);
    const nPuntos = fechas.length;
    if (nPuntos < 2) {
      ctx.fillStyle = '#999';
      ctx.font = '12px Times New Roman';
      ctx.fillText('Se necesitan al menos dos fechas para mostrar la línea', width/2 - 150, height/2);
      return;
    }

    const modelosSet = new Set<string>();
    for (const item of this.datosHistorialInicio) {
      for (const val of item.valores) {
        modelosSet.add(val.modelo);
      }
    }
    const modelos = Array.from(modelosSet).sort();

    const margenIzquierdo = 70;
    const margenDerecho = 50;
    const margenSuperior = 40;
    const margenInferior = 60;
    const heightGrafico = height - margenSuperior - margenInferior;
    if (heightGrafico <= 0) return;

    const anchoDisponible = width - margenIzquierdo - margenDerecho;
    const pasoX = anchoDisponible / (nPuntos - 1);

    let minYValor = 24;
    let maxYValor = 0;
    for (const item of this.datosHistorialInicio) {
      for (const val of item.valores) {
        if (val.horaDecimal < minYValor) minYValor = val.horaDecimal;
        if (val.horaDecimal > maxYValor) maxYValor = val.horaDecimal;
      }
    }
    if (minYValor === maxYValor) {
      minYValor = Math.max(0, minYValor - 1);
      maxYValor = Math.min(24, maxYValor + 1);
    }
    const rangoY = maxYValor - minYValor;
    const escalaY = heightGrafico / rangoY;

    const lineasPorModelo: { modelo: string; puntos: { x: number; y: number; etiqueta: string }[] }[] = [];
    for (let mIdx = 0; mIdx < modelos.length; mIdx++) {
      const modelo = modelos[mIdx];
      const puntos: { x: number; y: number; etiqueta: string }[] = [];
      for (let i = 0; i < nPuntos; i++) {
        const fechaItem = this.datosHistorialInicio[i];
        const valorEncontrado = fechaItem.valores.find(v => v.modelo === modelo);
        if (valorEncontrado) {
          const x = margenIzquierdo + i * pasoX;
          const y = margenSuperior + (maxYValor - valorEncontrado.horaDecimal) * escalaY;
          puntos.push({ x, y, etiqueta: valorEncontrado.etiqueta });
        } else {
          puntos.push({ x: -1, y: -1, etiqueta: '' });
        }
      }
      lineasPorModelo.push({ modelo, puntos });
    }

    for (let idx = 0; idx < lineasPorModelo.length; idx++) {
      const linea = lineasPorModelo[idx];
      const color = this.coloresLineas[idx % this.coloresLineas.length];
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      let firstValid = true;
      for (let i = 0; i < linea.puntos.length; i++) {
        const p = linea.puntos[i];
        if (p.x !== -1) {
          if (firstValid) {
            ctx.moveTo(p.x, p.y);
            firstValid = false;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        } else {
          firstValid = true;
          ctx.stroke();
          ctx.beginPath();
        }
      }
      ctx.stroke();
    }

    for (let idx = 0; idx < lineasPorModelo.length; idx++) {
      const linea = lineasPorModelo[idx];
      const color = this.coloresLineas[idx % this.coloresLineas.length];
      ctx.fillStyle = color;
      for (const p of linea.puntos) {
        if (p.x !== -1) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#000';
          ctx.font = 'bold 9px Times New Roman';
          ctx.fillText(p.etiqueta, p.x - 15, p.y - 6);
          ctx.fillStyle = color;
        }
      }
    }

    ctx.fillStyle = '#000';
    ctx.font = '10px Times New Roman';
    for (let i = 0; i < nPuntos; i++) {
      const fechaStr = fechas[i];
      const partes = fechaStr.split('-');
      const fechaFormateada = `${partes[2]}/${partes[1]}`;
      const x = margenIzquierdo + i * pasoX;
      const anchoTexto = ctx.measureText(fechaFormateada).width;
      ctx.fillText(fechaFormateada, x - anchoTexto / 2, margenSuperior + heightGrafico + 15);
    }

    ctx.beginPath();
    ctx.strokeStyle = '#000000';
    ctx.moveTo(margenIzquierdo - 5, margenSuperior);
    ctx.lineTo(margenIzquierdo - 5, margenSuperior + heightGrafico);
    ctx.lineTo(width - margenDerecho, margenSuperior + heightGrafico);
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = '9px Times New Roman';
    for (let i = 0; i <= 5; i++) {
      const valor = minYValor + (rangoY / 5) * i;
      const y = margenSuperior + (maxYValor - valor) * escalaY;
      const horas = Math.floor(valor);
      const minutos = Math.round((valor - horas) * 60);
      const etiquetaY = `${horas.toString().padStart(2,'0')}:${minutos.toString().padStart(2,'0')}`;
      ctx.fillText(etiquetaY, margenIzquierdo - 35, y + 3);
      ctx.beginPath();
      ctx.moveTo(margenIzquierdo - 5, y);
      ctx.lineTo(margenIzquierdo, y);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(18, margenSuperior + heightGrafico / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px Times New Roman';
    ctx.fillText('Hora (promedio)', 0, 0);
    ctx.restore();

    const leyendaY = margenSuperior + heightGrafico + 40;
    let leyendaX = margenIzquierdo;
    ctx.font = '9px Times New Roman';
    for (let idx = 0; idx < modelos.length; idx++) {
      const modelo = modelos[idx];
      const color = this.coloresLineas[idx % this.coloresLineas.length];
      ctx.fillStyle = color;
      ctx.fillRect(leyendaX, leyendaY, 12, 12);
      ctx.fillStyle = '#000';
      ctx.fillText(modelo, leyendaX + 16, leyendaY + 10);
      leyendaX += ctx.measureText(modelo).width + 40;
      if (leyendaX > width - 50) {
        leyendaX = margenIzquierdo;
      }
    }
  }

  dibujarGraficoHistorialTermino(): void {
    if (!this.lineChartHistorialTerminoCanvas) return;
    const canvas = this.lineChartHistorialTerminoCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    if (this.datosHistorialTermino.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '12px Times New Roman';
      ctx.fillText('No hay datos para mostrar', width/2 - 80, height/2);
      return;
    }

    const fechas = this.datosHistorialTermino.map(d => d.fecha);
    const nPuntos = fechas.length;
    if (nPuntos < 2) {
      ctx.fillStyle = '#999';
      ctx.font = '12px Times New Roman';
      ctx.fillText('Se necesitan al menos dos fechas para mostrar la línea', width/2 - 150, height/2);
      return;
    }

    const modelosSet = new Set<string>();
    for (const item of this.datosHistorialTermino) {
      for (const val of item.valores) {
        modelosSet.add(val.modelo);
      }
    }
    const modelos = Array.from(modelosSet).sort();

    const margenIzquierdo = 70;
    const margenDerecho = 50;
    const margenSuperior = 40;
    const margenInferior = 60;
    const heightGrafico = height - margenSuperior - margenInferior;
    if (heightGrafico <= 0) return;

    const anchoDisponible = width - margenIzquierdo - margenDerecho;
    const pasoX = anchoDisponible / (nPuntos - 1);

    let minYValor = 24;
    let maxYValor = 0;
    for (const item of this.datosHistorialTermino) {
      for (const val of item.valores) {
        if (val.horaDecimal < minYValor) minYValor = val.horaDecimal;
        if (val.horaDecimal > maxYValor) maxYValor = val.horaDecimal;
      }
    }
    if (minYValor === maxYValor) {
      minYValor = Math.max(0, minYValor - 1);
      maxYValor = Math.min(24, maxYValor + 1);
    }
    const rangoY = maxYValor - minYValor;
    const escalaY = heightGrafico / rangoY;

    const lineasPorModelo: { modelo: string; puntos: { x: number; y: number; etiqueta: string }[] }[] = [];
    for (let mIdx = 0; mIdx < modelos.length; mIdx++) {
      const modelo = modelos[mIdx];
      const puntos: { x: number; y: number; etiqueta: string }[] = [];
      for (let i = 0; i < nPuntos; i++) {
        const fechaItem = this.datosHistorialTermino[i];
        const valorEncontrado = fechaItem.valores.find(v => v.modelo === modelo);
        if (valorEncontrado) {
          const x = margenIzquierdo + i * pasoX;
          const y = margenSuperior + (maxYValor - valorEncontrado.horaDecimal) * escalaY;
          puntos.push({ x, y, etiqueta: valorEncontrado.etiqueta });
        } else {
          puntos.push({ x: -1, y: -1, etiqueta: '' });
        }
      }
      lineasPorModelo.push({ modelo, puntos });
    }

    for (let idx = 0; idx < lineasPorModelo.length; idx++) {
      const linea = lineasPorModelo[idx];
      const color = this.coloresLineas[idx % this.coloresLineas.length];
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      let firstValid = true;
      for (let i = 0; i < linea.puntos.length; i++) {
        const p = linea.puntos[i];
        if (p.x !== -1) {
          if (firstValid) {
            ctx.moveTo(p.x, p.y);
            firstValid = false;
          } else {
            ctx.lineTo(p.x, p.y);
          }
        } else {
          firstValid = true;
          ctx.stroke();
          ctx.beginPath();
        }
      }
      ctx.stroke();
    }

    for (let idx = 0; idx < lineasPorModelo.length; idx++) {
      const linea = lineasPorModelo[idx];
      const color = this.coloresLineas[idx % this.coloresLineas.length];
      ctx.fillStyle = color;
      for (const p of linea.puntos) {
        if (p.x !== -1) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#000';
          ctx.font = 'bold 9px Times New Roman';
          ctx.fillText(p.etiqueta, p.x - 15, p.y - 6);
          ctx.fillStyle = color;
        }
      }
    }

    ctx.fillStyle = '#000';
    ctx.font = '10px Times New Roman';
    for (let i = 0; i < nPuntos; i++) {
      const fechaStr = fechas[i];
      const partes = fechaStr.split('-');
      const fechaFormateada = `${partes[2]}/${partes[1]}`;
      const x = margenIzquierdo + i * pasoX;
      const anchoTexto = ctx.measureText(fechaFormateada).width;
      ctx.fillText(fechaFormateada, x - anchoTexto / 2, margenSuperior + heightGrafico + 15);
    }

    ctx.beginPath();
    ctx.strokeStyle = '#000000';
    ctx.moveTo(margenIzquierdo - 5, margenSuperior);
    ctx.lineTo(margenIzquierdo - 5, margenSuperior + heightGrafico);
    ctx.lineTo(width - margenDerecho, margenSuperior + heightGrafico);
    ctx.stroke();

    ctx.fillStyle = '#000';
    ctx.font = '9px Times New Roman';
    for (let i = 0; i <= 5; i++) {
      const valor = minYValor + (rangoY / 5) * i;
      const y = margenSuperior + (maxYValor - valor) * escalaY;
      const horas = Math.floor(valor);
      const minutos = Math.round((valor - horas) * 60);
      const etiquetaY = `${horas.toString().padStart(2,'0')}:${minutos.toString().padStart(2,'0')}`;
      ctx.fillText(etiquetaY, margenIzquierdo - 35, y + 3);
      ctx.beginPath();
      ctx.moveTo(margenIzquierdo - 5, y);
      ctx.lineTo(margenIzquierdo, y);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(18, margenSuperior + heightGrafico / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px Times New Roman';
    ctx.fillText('Hora (promedio)', 0, 0);
    ctx.restore();

    const leyendaY = margenSuperior + heightGrafico + 40;
    let leyendaX = margenIzquierdo;
    ctx.font = '9px Times New Roman';
    for (let idx = 0; idx < modelos.length; idx++) {
      const modelo = modelos[idx];
      const color = this.coloresLineas[idx % this.coloresLineas.length];
      ctx.fillStyle = color;
      ctx.fillRect(leyendaX, leyendaY, 12, 12);
      ctx.fillStyle = '#000';
      ctx.fillText(modelo, leyendaX + 16, leyendaY + 10);
      leyendaX += ctx.measureText(modelo).width + 40;
      if (leyendaX > width - 50) {
        leyendaX = margenIzquierdo;
      }
    }
  }

  limpiarFiltros(): void {
    this.aniosSeleccionados = [];
    this.mesesSeleccionados = [];
    this.diasSeleccionados = [];
    this.turnosSeleccionados = [];
    this.aplicarFiltros();
  }

  textoResumen(lista: any[], tipo: string): string {
    if (lista.length === 0) return tipo;
    if (lista.length === 1) {
      if (tipo === 'Mes' && typeof lista[0] === 'number') {
        return this.obtenerNombreMes(lista[0]);
      }
      return `${lista[0]}`;
    }
    return `${lista.length} selec.`;
  }
}