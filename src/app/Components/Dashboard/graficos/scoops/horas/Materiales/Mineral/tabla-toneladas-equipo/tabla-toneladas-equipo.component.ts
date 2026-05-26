import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabla-toneladas-equipo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-toneladas-equipo.component.html',
  styleUrl: './tabla-toneladas-equipo.component.css'
})
export class TablaToneladasEquipoMineralComponent implements OnChanges {

  @Input() data: any[] = []; // Datos de ToneladasPorEquipoYRangoHora
  @Input() turno: string = ''; // 'DÍA' o 'NOCHE'

  // 🔥 Datos para la tabla
  rangosHora: string[] = [];
  equipos: string[] = [];
  matrizToneladas: { [rango: string]: { [equipo: string]: number } } = {};
  
  // 🔥 Totales por equipo y por rango
  totalesPorEquipo: { [equipo: string]: number } = {};
  totalesPorRango: { [rango: string]: number } = {};
  granTotal: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['turno']) {
      this.procesarDatos();
    }
  }

  procesarDatos(): void {
    if (!this.data || this.data.length === 0) {
      this.limpiarTabla();
      return;
    }

    // 🔥 Definir rangos de hora según el turno
    if (this.turno === 'DÍA') {
      this.rangosHora = [
        '06:00 - 07:00', '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
        '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00',
        '17:00 - 18:00', '18:00 - 19:00'
      ];
    } else if (this.turno === 'NOCHE') {
      this.rangosHora = [
        '18:00 - 19:00','19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00', '22:00 - 23:00', '23:00 - 00:00',
        '00:00 - 01:00', '01:00 - 02:00', '02:00 - 03:00', '03:00 - 04:00', '04:00 - 05:00',
        '05:00 - 06:00', '06:00 - 07:00'
      ];
    } else {
      this.rangosHora = [];
    }

    // 🔥 Obtener lista de equipos únicos
    this.equipos = this.data.map(item => item.codigoEquipo).sort();
    
    // 🔥 Inicializar matrices
    this.matrizToneladas = {};
    this.totalesPorEquipo = {};
    this.totalesPorRango = {};
    
    // Inicializar totales por equipo
    this.equipos.forEach(equipo => {
      this.totalesPorEquipo[equipo] = 0;
    });
    
    // Inicializar matriz y totales por rango
    this.rangosHora.forEach(rango => {
      this.matrizToneladas[rango] = {};
      this.totalesPorRango[rango] = 0;
      this.equipos.forEach(equipo => {
        this.matrizToneladas[rango][equipo] = 0;
      });
    });
    
    // 🔥 Llenar matriz con los datos
    this.data.forEach(equipoData => {
      const equipo = equipoData.codigoEquipo;
      
      if (!equipoData.rangos || !Array.isArray(equipoData.rangos)) return;
      
      equipoData.rangos.forEach((rangoData: any) => {
        const rango = rangoData.rangoHora;
        const total = rangoData.total;
        
        if (this.matrizToneladas[rango] && this.matrizToneladas[rango][equipo] !== undefined) {
          this.matrizToneladas[rango][equipo] = total;
          this.totalesPorEquipo[equipo] += total;
          this.totalesPorRango[rango] += total;
        }
      });
    });
    
    // 🔥 Calcular gran total
    this.granTotal = Object.values(this.totalesPorEquipo).reduce((sum, val) => sum + val, 0);
    
    // Redondear todos los valores a 2 decimales
    this.redondearValores();
  }

  limpiarTabla(): void {
    this.rangosHora = [];
    this.equipos = [];
    this.matrizToneladas = {};
    this.totalesPorEquipo = {};
    this.totalesPorRango = {};
    this.granTotal = 0;
  }

  redondearValores(): void {
    // Redondear totales por equipo
    Object.keys(this.totalesPorEquipo).forEach(equipo => {
      this.totalesPorEquipo[equipo] = Number(this.totalesPorEquipo[equipo].toFixed(2));
    });
    
    // Redondear totales por rango
    Object.keys(this.totalesPorRango).forEach(rango => {
      this.totalesPorRango[rango] = Number(this.totalesPorRango[rango].toFixed(2));
    });
    
    // Redondear matriz
    this.rangosHora.forEach(rango => {
      this.equipos.forEach(equipo => {
        if (this.matrizToneladas[rango] && this.matrizToneladas[rango][equipo]) {
          this.matrizToneladas[rango][equipo] = Number(this.matrizToneladas[rango][equipo].toFixed(2));
        }
      });
    });
    
    this.granTotal = Number(this.granTotal.toFixed(2));
  }

  // 🔥 Método para obtener el color de fondo según el valor
  getColorPorValor(valor: number): string {
    if (valor === 0) return '';
    if (valor > 500) return 'bg-red-100';
    if (valor > 300) return 'bg-orange-100';
    if (valor > 150) return 'bg-yellow-50';
    if (valor > 50) return 'bg-green-50';
    return '';
  }

  // 🔥 Método para formatear números
  formatNumber(valor: number): string {
    if (valor === 0) return '-';
    return valor.toFixed(1);
  }
}