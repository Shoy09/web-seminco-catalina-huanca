import {
  Component, Input, OnChanges, SimpleChanges,
  OnDestroy, HostListener, ElementRef
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

  shiftStartHour = 7;
  timelineStart  = this.shiftStartHour * 60;
  timelineEnd    = this.timelineStart + 24 * 60;

  hours:  string[] = [];
  groups: any[]    = [];

  // ── Tooltip flotante (fixed) ──────────────────────────────────
  tooltip: {
    visible: boolean;
    x: number;
    y: number;
    task: any;
  } = { visible: false, x: 0, y: 0, task: null };

  private tooltipEl: HTMLElement | null = null;

  constructor(private hostRef: ElementRef) {
    this.generateHours();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      if (this.data?.length) {
        this.normalizeData();
        this.calculateTimelineRange();
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
  calculateTimelineRange(): void {
    let minStart = Infinity;
    let maxEnd   = -Infinity;
    this.groups.forEach(fecha =>
      fecha.equipos.forEach((equipo: any) =>
        equipo.tasks.forEach((task: any) => {
          if (task.startMin < minStart) minStart = task.startMin;
          if (task.endMin   > maxEnd)   maxEnd   = task.endMin;
        })
      )
    );
    if (minStart !== Infinity) {
      this.timelineStart = Math.floor(minStart / 60) * 60;
      this.timelineEnd   = Math.ceil(maxEnd   / 60) * 60;
    }
  }

  generateHours(): void {
    const totalHours = (this.timelineEnd - this.timelineStart) / 60;
    this.hours = Array.from({ length: totalHours }, (_, i) => {
      const hour = (this.timelineStart / 60 + i) % 24;
      return `${String(Math.floor(hour)).padStart(2,'0')}:00`;
    });
  }

  normalizeData(): void {
    this.groups = this.data.map(fechaItem => ({
      fecha:      fechaItem.fecha,
      turno:      fechaItem.turno,
      fechaTurno: `${fechaItem.fecha} — ${fechaItem.turno}`,
      equipos: fechaItem.groups.map((grupo: any) => {
        const tasks: any[] = [];
        grupo.rows.forEach((row: any) => {
          row.tasks.forEach((task: any) => {
            let startMin = this.toMinutes(task.start);
            let endMin   = this.toMinutes(task.end);
            if (endMin <= startMin) endMin += 1440;
            const base = this.shiftStartHour * 60;
            if (startMin < base) { startMin += 1440; endMin += 1440; }
            tasks.push({
              ...task,
              labor:       row.labor       || '',
              description: task.description || '',
              tipo_estado: task.tipo_estado || '',
              startMin,
              endMin
            });
          });
        });
        return { equipoCodigo: grupo.equipoCodigo, tasks };
      })
    }));
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
  trackByTask(_: number, item: any)   { return `${item.start}${item.end}${item.labor}`; }

  minutesToTime(min: number): string {
    const m  = min % 1440;
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
