import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Estado } from 'app/models/Estado';
import { GraficoUtilitarioComponent } from './grafico-utilitario.component';
import { IndicadorGrafico } from '../../sostenimiento/principal-grafico-sostenimiento/sostenimiento-indicadores.model';
import {
  Agrupacion, IndicadorUtilitario, OperacionUtilitario, construirFilas,
  indicadoresUtilitario, paretoUtilitario, resumenUtilitario,
} from './utilitario-indicadores';

@Component({
  selector: 'app-dashboard-utilitario', standalone: true,
  imports: [CommonModule, GraficoUtilitarioComponent],
  template: `
    <nav aria-label="Páginas de indicadores de Utilitario" class="reporte-tabs">
      <button *ngFor="let hoja of hojas" type="button" [class.active]="pagina === hoja"
        [attr.aria-pressed]="pagina === hoja" (click)="pagina = hoja">{{ hoja }}</button>
    </nav>
    <section class="reporte-pagina" aria-labelledby="titulo-utilitario">
      <header class="reporte-titulo"><div><h1 id="titulo-utilitario">{{ pagina }}</h1>
        <p>{{ descripciones[pagina] }}</p></div></header>
      <div class="kpis" aria-label="Resumen de operaciones">
        <article><span>Disponibilidad</span><strong>{{ resumen.disponibilidad | number:'1.1-2' }} %</strong></article>
        <article><span>Utilización</span><strong>{{ resumen.utilizacion | number:'1.1-2' }} %</strong></article>
        <article><span>Equipos</span><strong>{{ resumen.equipos }}</strong></article>
        <article><span>Horas operativas</span><strong>{{ resumen.horasOperativas | number:'1.1-2' }} h</strong></article>
      </div>
      <p *ngIf="!operaciones.length" class="aviso" role="status">No hay operaciones aprobadas para los filtros seleccionados.</p>
      <p *ngIf="operaciones.length && !filasValidas" class="aviso" role="status">No hay registros con horas completas y válidas para calcular los indicadores.</p>
      <p *ngIf="pagina === 'YTD'" class="nota">Evolución mensual dentro del rango filtrado. Las labores corresponden a la labor de origen de cada registro.</p>
      <p *ngIf="pagina === 'MTBF / MTTR'" class="nota">Cada registro correctivo con duración válida cuenta como una falla; se identifica por el catálogo de estados o el código 303. El mantenimiento preventivo no cuenta como falla.</p>
      <p *ngIf="pagina === 'Disponibilidad' || pagina === 'Utilización'" class="nota">Las metas del reporte Power BI no están disponibles en las operaciones actuales.</p>
      <div class="reporte-graficos" *ngIf="pagina !== 'Ratio de combustible'">
        <app-grafico-utilitario *ngFor="let grafico of graficos[pagina]"
          [class.grafico-ancho-completo]="grafico.tipo === 'pareto'"
          [grafico]="grafico" [showZoom]="showZoom" />
      </div>
      <section *ngIf="mostrarCombustible && pagina === 'Ratio de combustible'" class="combustible-vacio" role="status">
        <span class="material-icons" aria-hidden="true">local_gas_station</span>
        <h2>Consumo de combustible no disponible</h2>
        <p>El ratio necesita combustible consumido y diferencia de horómetro motor (DHM).
          El dato actual es un nivel del tanque, por ejemplo «1/2» o «LLENO»; no representa consumo.</p>
        <p>Esta página podrá calcularse cuando se registre el consumo con su unidad de medida.</p>
      </section>
    </section>
  `,
  styleUrls: ['../../sostenimiento/principal-grafico-sostenimiento/principal-grafico-sostenimiento.component.css', './dashboard-utilitario.component.css'],
})
export class DashboardUtilitarioComponent implements OnChanges {
  @Input() operaciones: OperacionUtilitario[] = [];
  @Input() estados: Estado[] = [];
  @Input() showZoom = false;
  readonly mostrarCombustible = false;
  readonly hojas = ['Disponibilidad', 'Utilización', 'Ranking', 'Pareto disponibilidad', 'Pareto utilización', 'MTBF / MTTR', 'YTD', 'Horas operativas', ...(this.mostrarCombustible ? ['Ratio de combustible'] : [])];
  pagina = this.hojas[0];
  readonly descripciones: Record<string, string> = {
    'Disponibilidad': 'Disponibilidad por equipo, día, semana, mes y guardia.',
    'Utilización': 'Uso de las horas disponibles y principales demoras.',
    'Ranking': 'Comparación por guardia y operador.',
    'Pareto disponibilidad': 'Actividades y observaciones de mantenimiento.',
    'Pareto utilización': 'Actividades y observaciones de demora.',
    'MTBF / MTTR': 'Tiempo entre fallas y tiempo de reparación correctiva.',
    'YTD': 'Evolución mensual de los indicadores del reporte.',
    'Horas operativas': 'Promedio por fecha, equipo y guardia, según la medida del reporte.',
    'Ratio de combustible': 'Consumo por hora de motor.',
  };
  graficos: Record<string, IndicadorGrafico[]> = {};
  resumen = resumenUtilitario([]);
  filasValidas = 0;

  ngOnChanges(): void {
    const filas = construirFilas(this.operaciones, this.estados);
    this.filasValidas = filas.filter(f => f.horas > 0).length;
    this.resumen = resumenUtilitario(filas);
    const datos = {} as Record<Agrupacion, IndicadorUtilitario[]>;
    for (const por of ['equipo', 'dia', 'semana', 'mes', 'ano', 'guardia', 'operador'] as Agrupacion[]) {
      datos[por] = indicadoresUtilitario(filas, por);
    }
    const nombres: Record<Agrupacion, string> = { equipo: 'Equipo', dia: 'Día', semana: 'Semana', mes: 'Mes', ano: 'Año', guardia: 'Guardia', operador: 'Operador' };
    const crear = (titulo: string, campo: keyof Omit<IndicadorUtilitario, 'label'>, por: Agrupacion, unidad: string, ranking = false): IndicadorGrafico => {
      const puntos = [...datos[por]];
      if (ranking) puntos.sort((a, b) => b[campo] - a[campo] || a.label.localeCompare(b.label));
      return { titulo: `${titulo} · ${nombres[por]}`, tipo: 'bar', unidad, horizontal: ranking,
        categorias: puntos.map(p => p.label), series: [{ nombre: titulo, valores: puntos.map(p => p[campo]) }] };
    };
    const pareto = (mantenimiento: boolean, detalle = false, top?: number): IndicadorGrafico => {
      const puntos = paretoUtilitario(filas, mantenimiento, detalle).slice(0, top);
      return { titulo: `${mantenimiento ? 'Mantenimiento' : 'Demoras'} por ${detalle ? 'observación' : 'actividad'}${top ? ' · Top 10' : ''}`,
        tipo: 'pareto', unidad: 'h', categorias: puntos.map(p => p.label), series: [
          { nombre: 'Horas', tipo: 'bar', valores: puntos.map(p => p.valor) },
          { nombre: 'Acumulado %', tipo: 'line', ejeSecundario: true, valores: puntos.map(p => p.acumulado || 0) },
        ] };
    };
    const fiabilidad = (campo: 'mtbf' | 'mttr', por: 'semana' | 'mes'): IndicadorGrafico => ({
      titulo: `${campo.toUpperCase()} y horas registradas · ${nombres[por]}`, tipo: 'combo', unidad: 'h', unidadSecundaria: 'h',
      categorias: datos[por].map(p => p.label), series: [
        { nombre: 'Horas registradas', tipo: 'bar', valores: datos[por].map(p => p.horasTotales) },
        { nombre: campo.toUpperCase(), tipo: 'line', ejeSecundario: true, valores: datos[por].map(p => p[campo]) },
      ],
    });
    const tablaFiabilidad = (campo: 'mtbf' | 'mttr'): IndicadorGrafico => ({
      titulo: `${campo.toUpperCase()} por equipo`, tipo: 'table',
      columnas: ['Equipo', 'Fallas', 'Horas correctivas', `${campo.toUpperCase()} (h)`],
      filas: datos.equipo.map(p => ({ Equipo: p.label, Fallas: p.fallas,
        'Horas correctivas': p.horasCorrectivas, [`${campo.toUpperCase()} (h)`]: p[campo] })),
    });
    const periodos: Agrupacion[] = ['equipo', 'dia', 'semana', 'mes', 'guardia'];
    this.graficos = {
      'Disponibilidad': [...periodos.map(p => crear('Disponibilidad', 'disponibilidad', p, '%')), pareto(true, false, 10)],
      'Utilización': [...periodos.map(p => crear('Utilización', 'utilizacion', p, '%')), pareto(false, false, 10)],
      'Ranking': [crear('Disponibilidad', 'disponibilidad', 'guardia', '%', true), crear('Utilización', 'utilizacion', 'guardia', '%', true), crear('Utilización', 'utilizacion', 'operador', '%', true)],
      'Pareto disponibilidad': [pareto(true), pareto(true, true)],
      'Pareto utilización': [pareto(false), pareto(false, true)],
      'MTBF / MTTR': (['mtbf', 'mttr'] as const).flatMap(c => [
        { titulo: c.toUpperCase(), tipo: 'gauge', valor: this.resumen[c], unidad: 'h' } as IndicadorGrafico,
        tablaFiabilidad(c), fiabilidad(c, 'mes'), fiabilidad(c, 'semana'),
      ]),
      'YTD': [crear('Disponibilidad', 'disponibilidad', 'mes', '%'), crear('Utilización', 'utilizacion', 'mes', '%'),
        crear('Equipos utilizados · promedio por fecha y turno', 'equiposUtilizados', 'mes', 'equipos'),
        crear('Promedio de horas operativas', 'promedioHoras', 'mes', 'h'),
        crear('Promedio de registros con labor de origen', 'promedioLabores', 'mes', 'registros'),
        { titulo: 'Resumen del rango', tipo: 'summary', resumen: [
          { nombre: 'Equipos utilizados por fecha y turno', valor: this.resumen.equiposUtilizados },
          { nombre: 'Promedio de horas operativas', valor: this.resumen.promedioHoras, unidad: 'h' },
          { nombre: 'Promedio de registros con labor de origen', valor: this.resumen.promedioLabores },
        ] }],
      'Horas operativas': (['mes', 'semana', 'dia'] as Agrupacion[]).map(p => crear('Promedio de horas operativas', 'promedioHoras', p, 'h')),
    };
  }
}
