import {
  Component, Input, OnChanges, SimpleChanges,
  OnDestroy, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.css'
})
export class SchedulerComponent implements OnChanges, OnDestroy {

  @Input() data: any[] = [];
  @Input() maxHeight: string | null = null;

  // ── Turno base: 06:30 → 06:30 del día siguiente (24 h) ─────────
  shiftStartMin = 6 * 60 + 30;                       // 390  → 06:30
  timelineStart = this.shiftStartMin;                 // 390
  timelineEnd   = this.timelineStart + 24 * 60;       // 1830 → 06:30 +1d

  hours: { label: string; left: number }[] = [];

  groups: any[] = [];

  // ── Tooltip flotante (fixed) ──────────────────────────────────
  tooltip: {
    visible: boolean;
    x: number;
    y: number;
    task: any;
  } = { visible: false, x: 0, y: 0, task: null };

  constructor(private hostRef: ElementRef) {
    this.generateHours();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      if (this.data?.length) {
        this.normalizeData();
        this.setTimelineForShift();   // 👈 fija el rango según el turno
        this.generateHours();
      } else {
        this.groups = [];
      }
    }
  }

  ngOnDestroy(): void {
    this.hideTooltip();
  }

  // ── Tooltip handlers ─────────────────────────────────────────
  showTooltip(event: MouseEvent, task: any): void {
    this.tooltip = { visible: true, x: 0, y: 0, task };
    this.positionTooltip(event);
  }

  moveTooltip(event: MouseEvent): void {
    if (this.tooltip.visible) this.positionTooltip(event);
  }

  hideTooltip(): void {
    this.tooltip.visible = false;
  }

  private positionTooltip(event: MouseEvent): void {
    const TW = 220; // ancho estimado del tooltip
    const TH = 130; // alto estimado
    const MARGIN = 12;

    let x = event.clientX + MARGIN;
    let y = event.clientY - TH / 2;

    // No salirse por la derecha
    if (x + TW > window.innerWidth) x = event.clientX - TW - MARGIN;
    // No salirse por abajo
    if (y + TH > window.innerHeight) y = window.innerHeight - TH - MARGIN;
    // No salirse por arriba
    if (y < MARGIN) y = MARGIN;

    this.tooltip = { ...this.tooltip, x, y };
  }

  // ── Timeline ─────────────────────────────────────────────────
  /**
   * Fija el rango del timeline según el turno.
   * - DÍA:   06:30 → 18:30 (12 h)
   * - NOCHE: 18:30 → 06:30 (+1d) (12 h)
   *
   * Si en `data` vienen varios turnos mezclados, usamos el rango global
   * 06:30 → 06:30 (+1d) para que ambos quepan en la misma línea.
   */
  setTimelineForShift(): void {
    if (!this.groups.length) return;

    // Detectamos si hay más de un turno distinto
    const turnos = new Set(
      this.groups.map(g => (g.turno || '').toUpperCase())
    );

    if (turnos.size > 1) {
      // ── Rango global 24 h para cubrir DÍA y NOCHE ─────────────
      this.timelineStart = 6 * 60 + 30;                       // 06:30 → 390
      this.timelineEnd   = this.timelineStart + 24 * 60;      // 06:30 +1d → 1830
      return;
    }

    const turno = [...turnos][0];

    if (turno === 'DÍA' || turno === 'DIA') {
      // Turno DÍA: 06:30 → 18:30
      this.timelineStart = 6 * 60 + 30;    // 390
      this.timelineEnd   = 18 * 60 + 30;   // 1110
    } else {
      // Turno NOCHE: 18:30 → 06:30 (+1d)
      this.timelineStart = 18 * 60 + 30;   // 1110
      this.timelineEnd   = 6 * 60 + 30 + 1440; // 1830
    }
  }

  /**
   * Genera las etiquetas de hora cada 1 h, respetando los minutos
   * del inicio (06:30, 07:30, 08:30, …).
   */
  generateHours(): void {
    const total = this.timelineEnd - this.timelineStart;
    const ticks = Math.round(total / 60);

    this.hours = Array.from({ length: ticks + 1 }, (_, i) => ({
      label: this.minutesToTime(this.timelineStart + i * 60),
      left:  (i * 60 / total) * 100
    }));
  }

  normalizeData(): void {
    this.groups = this.data.map(fechaItem => {
      const turno = (fechaItem.turno || '').toUpperCase();

      // Rango base del turno
      const baseStart = (turno === 'DÍA' || turno === 'DIA')
        ? 6 * 60 + 30     // 06:30
        : 18 * 60 + 30;   // 18:30

      return {
        fecha:      fechaItem.fecha,
        turno:      fechaItem.turno,
        fechaTurno: `${fechaItem.fecha} — ${fechaItem.turno}`,
        equipos: fechaItem.groups.map((grupo: any) => {
          const tasks: any[] = [];

          grupo.rows.forEach((row: any) => {
            row.tasks.forEach((task: any) => {
              let startMin = this.toMinutes(task.start);
              let endMin   = this.toMinutes(task.end);

              // Si termina antes de empezar → cruzó medianoche
              if (endMin <= startMin) endMin += 1440;

              // Si la tarea empieza antes del inicio del turno,
              // la movemos al día siguiente (sumando 1440)
              if (startMin < baseStart) {
                startMin += 1440;
                endMin   += 1440;
              }

              tasks.push({
                ...task,
                estado_equipo:       row.estado_equipo        || '',
                description: task.description || '',
                tipo_estado: task.tipo_estado || '',
                startMin,
                endMin
              });
            });
          });

          return { equipoCodigo: grupo.equipoCodigo, tasks };
        })
      };
    });
  }

  // ── Estilos y colores ────────────────────────────────────────
  getTaskStyle(task: any): any {
    const total        = this.timelineEnd - this.timelineStart;
    const leftPercent  = ((task.startMin - this.timelineStart) / total) * 100;
    const widthPercent = ((task.endMin   - task.startMin)      / total) * 100;

    return {
      left:       `${Math.max(0, leftPercent)}%`,
      width:      `calc(${Math.min(100, widthPercent)}% - 1px)`,
      background: this.getColor(task.estado)
    };
  }

  getColor(estado: string): string {
    const colors: Record<string, string> = {
      'OPERATIVO':      '#2ECC71',
      'DEMORA':         '#F1C40F',
      'MANTENIMIENTO':  '#E74C3C',
      'RESERVA':        '#E67E22',
      'FUERA DE PLAN':  '#3498DB'
    };
    return colors[estado] ?? '#95a5a6';
  }

  // ── Utilidades ───────────────────────────────────────────────
  trackByEquipo(_: number, item: any) { return item.equipoCodigo; }
  trackByTask(_: number, item: any)   { return `${item.start}${item.end}${item.estado_equipo}`; }

  minutesToTime(min: number): string {
    const m  = ((min % 1440) + 1440) % 1440;
    const hh = Math.floor(m / 60);
    const mm = m % 60;
    return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
  }

  getDuration(task: any): string {
    const mins = task.endMin - task.startMin;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} h`;
    return `${h} h ${m} min`;
  }

  formatearTurno(turno: string): string {
    return turno || '';
  }

  toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
}