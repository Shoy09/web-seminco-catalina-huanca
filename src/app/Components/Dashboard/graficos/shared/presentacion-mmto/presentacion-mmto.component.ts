import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OperacionBase } from '../../../../../models/OperacionBase.models';
import { duracionSegundos, formatearTiempo } from './tiempo-mmto';

export interface PresentacionMmtoData {
  operaciones: OperacionBase<{ observaciones?: string }>[];
  proceso?: string;
  turnoAplicado?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

interface FilaMmto {
  equipo: string;
  estado: string;
  codigo: string;
  inicio: string;
  final: string | null;
  segundos: number | null;
  observaciones: string;
}

interface GrupoMmto {
  equipo: string;
  fecha: string;
  turno: string;
  filas: FilaMmto[];
  total: number;
  pendientes: number;
}

@Component({
  selector: 'app-presentacion-mmto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './presentacion-mmto.component.html',
  styleUrls: ['../presentacion-guardia-responsive.css', './presentacion-mmto.component.css'],
})
export class PresentacionMmtoComponent implements OnInit, OnDestroy {
  @ViewChild('dialogContainer', { static: true }) dialogContainer!: ElementRef<HTMLElement>;
  equipoSeleccionado = '';
  equipos: string[] = [];
  grupos: GrupoMmto[] = [];
  private gruposOriginales: GrupoMmto[] = [];
  isFullscreen = false;
  readonly formatearTiempo = formatearTiempo;
  private readonly fullscreenChange = () => {
    this.isFullscreen = document.fullscreenElement === this.dialogContainer.nativeElement;
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PresentacionMmtoData,
    private dialogRef: MatDialogRef<PresentacionMmtoComponent>,
  ) {}

  ngOnInit(): void {
    const grupos = new Map<string, GrupoMmto>();
    for (const op of this.data.operaciones ?? []) {
      const equipo = String(op.n_equipo || op.equipo || 'Sin equipo').trim();
      for (const registro of op.registros ?? []) {
        const codigo = String(registro.codigo ?? '').trim();
        if (!/^2\d{2}$/.test(codigo)) continue;
        const clave = JSON.stringify([equipo, op.fecha, op.turno]);
        let grupo = grupos.get(clave);
        if (!grupo) {
          grupo = { equipo, fecha: op.fecha, turno: op.turno, filas: [], total: 0, pendientes: 0 };
          grupos.set(clave, grupo);
        }
        const segundos = duracionSegundos(registro.hora_inicio, registro.hora_final);
        grupo.filas.push({
          equipo, codigo, segundos,
          estado: registro.estado?.trim() || 'Sin estado',
          inicio: registro.hora_inicio,
          final: registro.hora_final,
          observaciones: registro.operacion?.observaciones?.trim() || 'Sin observaciones',
        });
        if (segundos === null) grupo.pendientes++;
        else grupo.total += segundos;
      }
    }
    this.gruposOriginales = [...grupos.values()].sort((a, b) =>
      a.equipo.localeCompare(b.equipo, 'es', { numeric: true })
      || a.fecha.localeCompare(b.fecha) || a.turno.localeCompare(b.turno));
    this.equipos = [...new Set(this.gruposOriginales.map(g => g.equipo))];
    this.aplicarFiltro();
    document.addEventListener('fullscreenchange', this.fullscreenChange);
  }

  aplicarFiltro(): void {
    this.grupos = this.gruposOriginales.filter(g => !this.equipoSeleccionado || g.equipo === this.equipoSeleccionado);
  }

  limpiarFiltro(): void {
    this.equipoSeleccionado = '';
    this.aplicarFiltro();
  }

  get cantidadRegistros(): number { return this.grupos.reduce((n, g) => n + g.filas.length, 0); }
  get totalSegundos(): number { return this.grupos.reduce((n, g) => n + g.total, 0); }
  get totalPendientes(): number { return this.grupos.reduce((n, g) => n + g.pendientes, 0); }

  async toggleFullscreen(): Promise<void> {
    const el = this.dialogContainer.nativeElement;
    if (document.fullscreenElement === el) await document.exitFullscreen();
    else if (el.requestFullscreen) await el.requestFullscreen().catch(() => {});
    else this.isFullscreen = !this.isFullscreen;
  }

  cerrar(): void { this.dialogRef.close(); }

  ngOnDestroy(): void {
    document.removeEventListener('fullscreenchange', this.fullscreenChange);
    if (document.fullscreenElement === this.dialogContainer.nativeElement) {
      document.exitFullscreen().catch(() => {});
    }
  }
}
