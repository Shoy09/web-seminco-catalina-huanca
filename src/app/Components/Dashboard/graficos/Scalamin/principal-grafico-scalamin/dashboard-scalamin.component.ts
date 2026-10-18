import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperacionBaseScalamin } from 'app/models/OperacionBase.models';
import { Estado } from 'app/models/Estado';
import { GraficoScalaminComponent } from './grafico-scalamin.component';
import { Agrupacion, IndicadorScalamin, PuntoScalamin, indicadoresScalamin, paretoScalamin } from './scalamin-indicadores';
import { AnalisisTurnoScalamin, construirAnalisisTurnosScalamin } from './scalamin-turnos';

interface Grafico { titulo: string; puntos: PuntoScalamin[]; unidad: string; horizontal?: boolean; pareto?: boolean; mensaje?: string; }

@Component({
  selector: 'app-dashboard-scalamin', standalone: true,
  imports: [CommonModule, GraficoScalaminComponent],
  template: `
    <nav aria-label="Páginas de indicadores" class="reporte-tabs">
      <button *ngFor="let hoja of hojas" type="button" [class.active]="pagina === hoja" [attr.aria-pressed]="pagina === hoja" (click)="pagina = hoja">{{ hoja }}</button>
    </nav>
    <section class="reporte-pagina" aria-labelledby="titulo-scalamin">
    <header class="reporte-titulo"><div><h1 id="titulo-scalamin">{{ pagina }}</h1><p>{{ descripciones[pagina] }}</p></div></header>
    <div class="kpis" aria-label="Resumen de operaciones">
      <article><span>Disponibilidad</span><strong>{{ resumen.disponibilidad === null ? '—' : (resumen.disponibilidad | number:'1.1-2') + ' %' }}</strong></article>
      <article><span>Utilización</span><strong>{{ resumen.utilizacion === null ? '—' : (resumen.utilizacion | number:'1.1-2') + ' %' }}</strong></article>
      <article><span>Equipos</span><strong>{{ resumen.equipos }}</strong></article>
      <article><span>Horas operativas</span><strong>{{ resumen.horasOperativas | number:'1.1-2' }} h</strong></article>
    </div>
    <div class="reporte-graficos">
      <ng-container *ngFor="let grafico of graficos[pagina]">
        <app-grafico-scalamin [class.grafico-ancho-completo]="!!grafico.pareto"
          [titulo]="grafico.titulo" [puntos]="grafico.puntos" [unidad]="grafico.unidad" [horizontal]="!!grafico.horizontal" [pareto]="!!grafico.pareto" [showZoom]="showZoom" [mensaje]="grafico.mensaje || ''" />
      </ng-container>
      <ng-container *ngIf="pagina === 'Utilización'">
        <app-grafico-scalamin *ngFor="let analisis of analisisTurnos" class="grafico-ancho-completo"
          [titulo]="'Análisis de turnos — ' + analisis.turno" [turnoAnalisis]="analisis.turno"
          [puntosTurno]="analisis.puntos" [showZoom]="showZoom" />
      </ng-container>
    </div>
    </section>
  `,
  styleUrls: ['../../sostenimiento/principal-grafico-sostenimiento/principal-grafico-sostenimiento.component.css', './dashboard-scalamin.component.css'],
})
export class DashboardScalaminComponent implements OnChanges {
  @Input() operaciones: OperacionBaseScalamin[] = [];
  @Input() estados: Estado[] = [];
  @Input() showZoom = false;
  @Input() turnoAplicado = '';
  analisisTurnos: AnalisisTurnoScalamin[] = [];
  readonly hojas = ['Disponibilidad', 'Utilización', 'Ranking', 'Pareto disponibilidad', 'Pareto utilización', 'MTBF / MTTR', 'YTD', 'Horas operativas'];
  pagina = this.hojas[0];
  readonly descripciones: Record<string, string> = {
    'Disponibilidad': 'Disponibilidad de equipos por día, semana, mes y guardia.',
    'Utilización': 'Uso de las horas disponibles por equipo y período.',
    'Ranking': 'Comparación de disponibilidad y utilización por guardia y operador.',
    'Pareto disponibilidad': 'Actividades y observaciones con mayor tiempo de mantenimiento.',
    'Pareto utilización': 'Actividades y observaciones con mayor tiempo de demora.',
    'MTBF / MTTR': 'Tiempo entre intervenciones y duración del mantenimiento por equipo y período.',
    'YTD': 'Evolución mensual de los indicadores dentro del rango seleccionado.',
    'Horas operativas': 'Horas operativas totales por mes, semana y día.',
  };
  graficos: Record<string, Grafico[]> = {};
  resumen: Pick<IndicadorScalamin, 'disponibilidad' | 'utilizacion' | 'equipos' | 'horasOperativas'> = { disponibilidad: null, utilizacion: null, equipos: 0, horasOperativas: 0 };

  ngOnChanges(): void {
    this.analisisTurnos = construirAnalisisTurnosScalamin(this.operaciones, this.turnoAplicado);
    const datos = {} as Record<Agrupacion, IndicadorScalamin[]>;
    for (const por of ['equipo', 'dia', 'semana', 'mes', 'ano', 'guardia', 'operador'] as Agrupacion[]) datos[por] = indicadoresScalamin(this.operaciones, por, this.estados);
    const global = indicadoresScalamin(this.operaciones.map(op => ({ ...op, guardia: 'TOTAL' })), 'guardia', this.estados)[0];
    this.resumen = global || { disponibilidad: null, utilizacion: null, equipos: 0, horasOperativas: 0 };
    const nombres: Record<Agrupacion, string> = { equipo: 'Equipo', dia: 'Día', semana: 'Semana', mes: 'Mes', ano: 'Año', guardia: 'Guardia', operador: 'Operador' };
    const crear = (titulo: string, campo: 'disponibilidad' | 'utilizacion' | 'mtbf' | 'mttr' | 'horasOperativas' | 'equipos', por: Agrupacion, unidad: string, ranking = false): Grafico => {
      const puntos = datos[por].filter(d => d[campo] !== null).map(d => ({ label: d.label, valor: d[campo] as number }));
      if (ranking) puntos.sort((a, b) => b.valor - a.valor);
      return { titulo: `${titulo} · ${nombres[por]}`, puntos, unidad, horizontal: ranking, mensaje: campo === 'mtbf' || campo === 'mttr' ? 'Sin intervenciones de mantenimiento con duración válida.' : undefined };
    };
    const periodos: Agrupacion[] = ['equipo', 'dia', 'semana', 'mes', 'guardia'];
    this.graficos = {
      'Disponibilidad': periodos.map(p => crear('Disponibilidad', 'disponibilidad', p, '%')),
      'Utilización': periodos.map(p => crear('Utilización', 'utilizacion', p, '%')),
      'Ranking': [crear('Disponibilidad', 'disponibilidad', 'guardia', '%', true), crear('Utilización', 'utilizacion', 'guardia', '%', true), crear('Utilización', 'utilizacion', 'operador', '%', true)],
      'Pareto disponibilidad': [ { titulo: 'Mantenimiento por actividad', puntos: paretoScalamin(this.operaciones, this.estados, true), unidad: 'h', pareto: true }, { titulo: 'Mantenimiento por observación', puntos: paretoScalamin(this.operaciones, this.estados, true, true), unidad: 'h', pareto: true } ],
      'Pareto utilización': [ { titulo: 'Demoras por actividad', puntos: paretoScalamin(this.operaciones, this.estados, false), unidad: 'h', pareto: true }, { titulo: 'Demoras por observación', puntos: paretoScalamin(this.operaciones, this.estados, false, true), unidad: 'h', pareto: true } ],
      'MTBF / MTTR': (['mtbf', 'mttr'] as const).flatMap(c => (['equipo', 'semana', 'mes', 'ano'] as Agrupacion[]).map(p => crear(c.toUpperCase(), c, p, 'h'))),
      'YTD': [crear('Disponibilidad', 'disponibilidad', 'mes', '%'), crear('Utilización', 'utilizacion', 'mes', '%'), crear('Equipos utilizados', 'equipos', 'mes', 'equipos'), crear('Horas operativas totales', 'horasOperativas', 'mes', 'h')],
      'Horas operativas': (['mes', 'semana', 'dia'] as Agrupacion[]).map(p => crear('Horas operativas totales', 'horasOperativas', p, 'h')),
    };
  }
}
