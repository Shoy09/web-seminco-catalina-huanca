import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scheduler.component.html',
  styleUrl: './scheduler.component.css'
})
export class SchedulerComponent implements OnChanges {

  @Input() data: any[] = [];

  // ================= TURNO CONFIG =================
  shiftStartHour = 7;                 // 07:00 AM
  timelineStart = this.shiftStartHour * 60;   // 420
  timelineEnd   = this.timelineStart + 24 * 60; // 1860 (por defecto)

  hours: string[] = [];
  groups: any[] = [];

  constructor() {
    this.generateHours();
  }

  // ================= LIFECYCLE =================
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data?.length) {
      this.normalizeData();
      this.calculateTimelineRange();
      this.generateHours();
    }
  }

  // ================= CALCULAR RANGO REAL =================
  calculateTimelineRange(): void {
    let minStart = Infinity;
    let maxEnd = -Infinity;

    this.groups.forEach(fecha => {
      fecha.equipos.forEach((equipo: any) => {
        equipo.tasks.forEach((task: any) => {
          if (task.startMin < minStart) minStart = task.startMin;
          if (task.endMin > maxEnd) maxEnd = task.endMin;
        });
      });
    });

    if (minStart !== Infinity && maxEnd !== -Infinity) {
      this.timelineStart = Math.floor(minStart / 60) * 60;
      this.timelineEnd = Math.ceil(maxEnd / 60) * 60;
    }
  }

  // ================= HOURS HEADER =================
  generateHours(): void {
    const totalHours = (this.timelineEnd - this.timelineStart) / 60;
    this.hours = Array.from({ length: totalHours }, (_, i) => {
      const hour = (this.timelineStart / 60 + i) % 24;
      const hourInt = Math.floor(hour);
      const minutePart = Math.round((hour % 1) * 60);
      return `${String(hourInt).padStart(2, '0')}:${String(minutePart).padStart(2, '0')}`;
    });
  }

  // ================= NORMALIZE =================
  normalizeData(): void {
    this.groups = this.data.map(fechaItem => {
      const fechaTurno = `${fechaItem.fecha} - ${this.formatearTurno(fechaItem.turno)}`;
      
      return {
        fecha: fechaItem.fecha,
        turno: fechaItem.turno,
        fechaTurno: fechaTurno,
        equipos: fechaItem.groups.map((grupo: any) => {
          const tasks: any[] = [];

          grupo.rows.forEach((row: any) => {
            row.tasks.forEach((task: any) => {

              let startMin = this.toMinutes(task.start);
              let endMin   = this.toMinutes(task.end);

              if (endMin <= startMin) {
                endMin += 1440;
              }

              const baseStart = this.shiftStartHour * 60;
              if (startMin < baseStart) {
                startMin += 1440;
                endMin   += 1440;
              }

              tasks.push({
                ...task,
                labor: row.labor || '',
                description: task.description || '',  // Aseguramos que description existe
                tipo_estado: task.tipo_estado || '',  // Aseguramos que tipo_estado existe
                startMin,
                endMin
              });
            });
          });

          return {
            equipoCodigo: grupo.equipoCodigo,
            tasks
          };
        })
      };
    });

    console.log('NORMALIZED SHIFT DATA:', this.groups);
  }

  // ================= Formatear turno =================
  formatearTurno(turno: string): string {
    const turnosMap: { [key: string]: string } = {
      'DÍA': 'DÍA',
      'NOCHE': 'NOCHE',
      'MAÑANA': 'MAÑANA',
      'TARDE': 'TARDE'
    };
    return turnosMap[turno] || turno;
  }

  // ================= TIME UTILS =================
  toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  // ================= STYLE =================
  getTaskStyle(task: any): any {
    const total = this.timelineEnd - this.timelineStart;
    const duration = task.endMin - task.startMin;

    const leftPercent = ((task.startMin - this.timelineStart) / total) * 100;
    const widthPercent = (duration / total) * 100;

    return {
      left: `${Math.max(0, leftPercent)}%`,
      width: `calc(${Math.min(100, widthPercent)}% - 1px)`,
      background: this.getColor(task.estado)
    };
  }

  // ================= COLORS =================
  getColor(estado: string): string {
    const colors: any = {
      OPERATIVO: "#2ECC71",
      DEMORA: "#F1C40F",
      MANTENIMIENTO: "#E74C3C",
      RESERVA: "#E67E22",
      "FUERA DE PLAN": "#3498DB"
    };
    return colors[estado] || '#95a5a6';
  }

  // ================= TRACK BY =================
  trackByEquipo(_: number, item: any) {
    return item.equipoCodigo;
  }

  trackByTask(_: number, item: any) {
    return item.start + item.end + item.labor + item.description + item.tipo_estado;
  }

  minutesToTime(min: number): string {
    const m = min % 1440;
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }

  // ================= TOOLTIP MEJORADO =================
  getTaskTooltip(task: any): string {
    const inicio = this.minutesToTime(task.startMin);
    const fin = this.minutesToTime(task.endMin);
    
    let tooltip = `Labor: ${task.labor}\n`;
    tooltip += `Inicio: ${inicio}\n`;
    tooltip += `Fin: ${fin}\n`;
    tooltip += `Estado: ${task.estado || 'N/A'}\n`;
    
    if (task.description && task.description !== '') {
      tooltip += `Descripción: ${task.description}\n`;
    }
    
    if (task.tipo_estado && task.tipo_estado !== '') {
      tooltip += `Tipo Estado: ${task.tipo_estado}`;
    }
    
    return tooltip;
  }
  
}