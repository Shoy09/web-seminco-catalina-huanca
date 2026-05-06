import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OperacionBase } from '../../../../../models/OperacionBase.models';
import { EquipoService } from '../../../../../services/equipo.service';
import { SeccionService } from '../../../../../services/seccion.service';
import { UsuarioService } from '../../../../../services/usuario.service';
import { Usuario } from '../../../../../models/Usuario';

@Component({
  selector: 'app-card-operaciones',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './card-operaciones.component.html',
  styleUrls: ['./card-operaciones.component.css']
})
export class CardOperacionesComponent implements OnChanges, OnInit {

  @Input() data!: any;
  @Output() dataChange = new EventEmitter<any>();

  isDirty = false;

  private readonly PROCESO = 'PERFORACIÓN HORIZONTAL';

  formValues: Record<string, any> = {
    fecha: '',
    turno: '',
    equipo: '',
    codigo: '',
    modelo_equipo: '',
    operador: '',
    jefeGuardia: '',
    seccion: '',
  };

  campos = [
    { key: 'turno', options: ['DÍA', 'NOCHE'] },
    { key: 'equipo', options: [] },
    { key: 'codigo', options: [] },
    { key: 'modelo_equipo', options: [] },
    { key: 'jefeGuardia', options: [] }, 
    { key: 'seccion', options: [] },
  ];

  constructor(
    private equipoService: EquipoService,
    private seccionService: SeccionService,
    private usuarioService: UsuarioService
  ) {}

  // 🔥 INIT
  ngOnInit(): void {
    this.cargarEquipos();
    this.cargarSecciones();
    this.cargarJefesGuardia();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']?.currentValue) {
      if (this.isDirty) return;
      this.cargarDatos();
    }
  }

  // 🔹 ===============================
  // 🔹 JEFES DE GUARDIA
  // 🔹 ===============================
  cargarJefesGuardia() {
    this.usuarioService.obtenerJefesGuardia()
      .subscribe({
        next: (usuarios: Usuario[]) => {
          // Combinar apellidos y nombres
          const nombresCompletos = usuarios.map(u => {
            return `${u.nombres} ${u.apellidos}`;
          });
          
          this.mergeOpciones('jefeGuardia', nombresCompletos);
          
          // 🔥 asegurar valor actual si existe en data
          this.ensureCurrentValues();
        },
        error: err => console.error('Error jefes de guardia:', err)
      });
  }
  

  // 🔥 ===============================
  // 🔹 EQUIPOS
  // 🔥 ===============================
  cargarEquipos() {
    this.equipoService.getEquiposByProceso(this.PROCESO)
      .subscribe({
        next: (equipos: any[]) => {

          const nombres = equipos.map(e => e.nombre);
          const codigos = equipos.map(e => e.codigo);
          const modelos = equipos.map(e => e.modelo);

          this.mergeOpciones('equipo', nombres);
          this.mergeOpciones('codigo', codigos);
          this.mergeOpciones('modelo_equipo', modelos);

          // 🔥 asegurar valores actuales si ya hay data
          this.ensureCurrentValues();
        },
        error: err => console.error('Error equipos:', err)
      });
  }

  // 🔥 ===============================
  // 🔹 SECCIONES
  // 🔥 ===============================
  cargarSecciones() {
    this.seccionService.getSeccionesByProceso(this.PROCESO)
      .subscribe({
        next: (secciones: any[]) => {

          const nombres = secciones.map(s => s.nombre);
          this.mergeOpciones('seccion', nombres);

          // 🔥 asegurar valores actuales
          this.ensureCurrentValues();
        },
        error: err => console.error('Error secciones:', err)
      });
  }

  // 🔥 ===============================
  // 🔹 HELPERS PRO
  // 🔥 ===============================

  // 👉 mezcla opciones sin perder las anteriores
  mergeOpciones(key: string, nuevas: string[]) {
    const campo = this.campos.find(c => c.key === key);
    if (!campo) return;

    const actuales = campo.options || [];
    campo.options = [...new Set([...actuales, ...nuevas])];
  }

  // 👉 asegura que lo que viene en data SIEMPRE exista en options
  ensureCurrentValues() {
    if (!this.data) return;

    this.agregarOpcionSiNoExiste('equipo', this.data.equipo);
    this.agregarOpcionSiNoExiste('codigo', this.data.codigo);
    this.agregarOpcionSiNoExiste('modelo_equipo', this.data.modelo_equipo);
    this.agregarOpcionSiNoExiste('seccion', this.data.seccion);
    this.agregarOpcionSiNoExiste('jefeGuardia', this.data.jefeGuardia); 
  }

  onChange() {
    this.isDirty = true;

    console.log('🟡 CARD - formValues actualizado:', this.formValues);

    this.dataChange.emit({
      ...this.formValues
    });
  }

  cargarDatos() {

    // 🔥 primero asegura opciones
    this.ensureCurrentValues();

    this.formValues = {
      fecha: this.data.fecha,
      turno: this.data.turno,
      equipo: this.data.equipo,
      codigo: this.data.codigo,
      modelo_equipo: this.data.modelo_equipo,
      operador: this.data.operador,
      jefeGuardia: this.data.jefeGuardia,
      seccion: this.data.seccion
    };
  }

  agregarOpcionSiNoExiste(key: string, valor: string) {
    if (!valor) return;

    const campo = this.campos.find(c => c.key === key);
    if (!campo) return;

    if (!campo.options.includes(valor)) {
      campo.options = [valor, ...campo.options];
    }
  }

  getCampo(key: string) {
    return this.campos.find(c => c.key === key) || { key, options: [] };
  }

}