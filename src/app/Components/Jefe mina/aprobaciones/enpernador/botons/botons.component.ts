import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface BotonStatus {
  label: string;
  icon: string;
  color: string;
  value: string;
}

interface DatosPerforacion {
  ubicacion: { nivel: string; tipoLabor: string; labor: string; ala: string; };
  taladros: { produccion: string; rimados: string; alivio: string; repaso: string; };
  barras: { longitud: string; nBarra: string; };
  pernos: { tipo: string; log: string; nInstalados: string; };
  malla: { tipo: string; mts2: string; sistematicoPuntual: string; };
}

@Component({
  selector: 'app-botons',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './botons.component.html',
  styleUrls: ['./botons.component.css']
})
export class BotonsComponent implements OnInit {

  public botones: BotonStatus[] = [
    { label: 'OPERATIVO', icon: 'fa-check-circle', color: '#4CAF50', value: 'operativo' },
    { label: 'DEMORA', icon: 'fa-clock', color: '#FF9800', value: 'demora' },
    { label: 'MANTENIMIENTO', icon: 'fa-wrench', color: '#2196F3', value: 'mantenimiento' },
    { label: 'RESERVA', icon: 'fa-calendar-check', color: '#9C27B0', value: 'reserva' },
    { label: 'FUERA DE PLAN', icon: 'fa-exclamation-triangle', color: '#F44336', value: 'fuera_plan' }
  ];

  public mostrarFormOperacion = false;
  public mostrarFormPerforacion = false;
  public estadoSeleccionado = '';
  public codigoSeleccionado = ''; // Nueva variable para validación
  public formularioInvalido = false;
  public datosPerforacion: DatosPerforacion = this.getInitDatosPerforacion();

  constructor() { }
  ngOnInit() { }

  accion(value: string) {
    this.estadoSeleccionado = value.toUpperCase();
    this.codigoSeleccionado = ''; // Reseteamos el código al abrir
    this.mostrarFormOperacion = true; 
  }

  cerrarFormOperacion() {
    this.mostrarFormOperacion = false;
  }

  confirmarOperacion() {
    this.mostrarFormOperacion = false;
    this.mostrarFormPerforacion = true; 
  }

  cerrarFormPerforacion() {
    this.mostrarFormPerforacion = false;
  }

  guardarPerforacion() {
    if (this.validarFormulario()) {
      console.log('Datos guardados:', this.datosPerforacion);
      this.mostrarFormPerforacion = false;
      this.formularioInvalido = false;
    } else {
      this.formularioInvalido = true;
    }
  }

  validarFormulario(): boolean {
    const u = this.datosPerforacion.ubicacion;
    return !!(u.nivel && u.tipoLabor && u.labor);
  }

  private getInitDatosPerforacion(): DatosPerforacion {
    return {
      ubicacion: { nivel: '', tipoLabor: '', labor: '', ala: '' },
      taladros: { produccion: '', rimados: '', alivio: '', repaso: '' },
      barras: { longitud: '', nBarra: '' },
      pernos: { tipo: '', log: '', nInstalados: '' },
      malla: { tipo: '', mts2: '', sistematicoPuntual: '' }
    };
  }
}