import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
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

  private readonly PROCESO = 'SCOOPTRAM';

  formValues: Record<string, any> = {
    fecha: '',
    turno: '',
    equipo: '',
    codigo: '',
    capacidad: '',
    operador: '',
    jefeGuardia: '',
    seccion: '',
    tipo_equipo: '',
    tiposEquipo: { diesel: false, electrico: false }
  };

  campos = [
    { key: 'turno', options: ['DÍA', 'NOCHE'] },
    { key: 'equipo', options: [] },
    { key: 'codigo', options: [] },
    { key: 'capacidad', options: [] },
    { key: 'jefeGuardia', options: [] }, 
    { key: 'seccion', options: [] },
  ];

  tiposEquipo = [
    { label: 'Diesel', value: 'diesel' },
    { label: 'Eléctrico', value: 'electrico' }
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
        console.log('Equipos recibidos:', equipos); // 👈 Debug
        
        const nombres = [...new Set(equipos.map(e => e.nombre))];
        const codigos = [...new Set(equipos.map(e => e.codigo))];
        
        // 🔥 NORMALIZAR a string para evitar duplicados por tipo
        const capacidades = [...new Set(equipos.map(e => String(e.capacidadYd3)))];
        
        console.log('Capacidades únicas:', capacidades); // 👈 Debug

        this.mergeOpciones('equipo', nombres);
        this.mergeOpciones('codigo', codigos);
        this.mergeOpciones('capacidad', capacidades);

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
    this.agregarOpcionSiNoExiste('seccion', this.data.seccion);
    this.agregarOpcionSiNoExiste('jefeGuardia', this.data.jefeGuardia); 
    this.agregarOpcionSiNoExiste('capacidad', this.data.capacidad);
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
      operador: this.data.operador,
      jefeGuardia: this.data.jefeGuardia,
      capacidad: this.data.capacidad,
      seccion: this.data.seccion,
      tipo_equipo: this.data.tipo_equipo || '',
      tiposEquipo: this.mapearTipoEquipo(this.data.tipo_equipo)
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

  mapearTipoEquipo(tipo: any) {
    if (tipo && typeof tipo === 'object') {
      // 🔥 normalizamos claves a minúsculas
      const tipoNormalizado: any = {};

      Object.keys(tipo).forEach(key => {
        tipoNormalizado[key.toLowerCase()] = tipo[key];
      });

      return {
        diesel: !!tipoNormalizado.diesel,
        electrico: !!tipoNormalizado.electrico
      };
    }

    // 🔥 fallback string
    if (typeof tipo === 'string') {
      return {
        diesel: tipo.toLowerCase().includes('diesel'),
        electrico: tipo.toLowerCase().includes('electrico')
      };
    }

    return {
      diesel: false,
      electrico: false
    };
  }

  getCampo(key: string) {
    return this.campos.find(c => c.key === key) || { key, options: [] };
  }
}