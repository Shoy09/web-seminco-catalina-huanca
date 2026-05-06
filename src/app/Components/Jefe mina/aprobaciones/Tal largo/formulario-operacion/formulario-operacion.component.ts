import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-formulario-operacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-operacion.component.html',
  styleUrl: './formulario-operacion.component.css',
})
export class FormularioOperacionComponent implements OnInit, OnChanges {

  @Input() visible = false;
  @Input() data: any;
  @Input() turno: string = '';

  @Output() cerrarForm = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<any>();

  public codigos: string[] = ['104', '105', '106'];

  // 🔥 TODAS las horas del turno
  public horas: string[] = [];

  public formData = {
    estado: '',
    codigo: '',
    horaInicio: '',
    horaFin: ''
  };

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {

    // 🔥 1. Generar horas según turno
    if (changes['turno'] && this.turno) {
      this.horas = this.generarHoras();
    }

    // 🔥 2. Cargar datos
    if (changes['data'] && this.data) {
      this.formData = {
        estado: this.data.estado || '',
        codigo: this.data.codigo || '',
        horaInicio: this.data.horaInicio || '',
        horaFin: this.data.horaFin || ''
      };

      console.log('🔥 Datos recibidos en formulario:', this.data);

      this.agregarSiNoExiste(this.codigos, this.data.codigo);
    }
  }

  // 🔥 GENERAR HORAS CADA 5 MINUTOS
  generarHoras(): string[] {
    const horas: string[] = [];

    const inicio = this.turno === 'NOCHE' ? 19 : 7;
    const fin = this.turno === 'NOCHE' ? 7 : 19;

    let current = new Date();
    current.setHours(inicio, 0, 0, 0);

    while (true) {
      const h = current.getHours().toString().padStart(2, '0');
      const m = current.getMinutes().toString().padStart(2, '0');

      horas.push(`${h}:${m}`);

      current.setMinutes(current.getMinutes() + 5);

      const ch = current.getHours();
      const cm = current.getMinutes();

      if (this.turno === 'NOCHE') {
        if (ch === fin && cm === 0) {
          horas.push('07:00');
          break;
        }
      } else {
        if (ch === fin && cm === 0) {
          horas.push('19:00');
          break;
        }
      }
    }

    return horas;
  }

  // 🔥 FILTRAR HORAS FIN
  getHorasFin(): string[] {
    if (!this.formData.horaInicio) return this.horas;

    return this.horas.filter(h =>
      this.esHoraMayor(h, this.formData.horaInicio)
    );
  }

  // 🔥 COMPARACIÓN INTELIGENTE (SOPORTA NOCHE)
  esHoraMayor(fin: string, inicio: string): boolean {
    const toMin = (h: string) => {
      const [hh, mm] = h.split(':').map(Number);
      return hh * 60 + mm;
    };

    let finMin = toMin(fin);
    let iniMin = toMin(inicio);

    if (this.turno === 'NOCHE') {
      if (finMin < 720) finMin += 1440;
      if (iniMin < 720) iniMin += 1440;
    }

    return finMin > iniMin;
  }

  // 🔥 RESET CUANDO CAMBIA INICIO
  onHoraInicioChange() {
    this.formData.horaFin = '';
  }

  agregarSiNoExiste(lista: string[], valor: string) {
    if (!valor) return;
    const limpio = valor.trim();
    if (limpio && !lista.includes(limpio)) {
      lista.push(limpio);
    }
  }

  cerrarFormOperacion() {
    this.cerrarForm.emit();
  }

  confirmarOperacion() {
    this.confirmar.emit({ ...this.formData });
  }
}