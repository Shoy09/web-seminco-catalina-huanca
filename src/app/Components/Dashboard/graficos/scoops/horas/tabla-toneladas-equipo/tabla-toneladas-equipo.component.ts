import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabla-toneladas-equipo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabla-toneladas-equipo.component.html',
  styleUrl: './tabla-toneladas-equipo.component.css'
})
export class TablaToneladasEquipoComponent implements OnChanges {

  @Input() data: any[] = []; // Datos de ToneladasPorLaborYRangoHora
  @Input() turno: string = ''; // 'DÍA' o 'NOCHE'

  // 🔥 Datos para la tabla
  rangosHora: string[] = [];
  laborInicios: string[] = [];
  matrizToneladas: { [rango: string]: { [labor: string]: number } } = {};
  
  // 🔥 Totales por labor y por rango
  totalesPorLabor: { [labor: string]: number } = {};
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

    // 🔥 Definir rangos de hora según el turno (formato original)
    if (this.turno === 'DÍA') {
      this.rangosHora = [
        '06:00 - 07:00', '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00', 
        '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', 
        '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00'
      ];
    } else if (this.turno === 'NOCHE') {
      this.rangosHora = [
        '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00', 
        '22:00 - 23:00', '23:00 - 00:00', '00:00 - 01:00', '01:00 - 02:00', 
        '02:00 - 03:00', '03:00 - 04:00', '04:00 - 05:00', '05:00 - 06:00'
      ];
    } else {
      // Todos los turnos - 24 rangos
      this.rangosHora = [
        '06:00 - 07:00', '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00', 
        '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', 
        '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00',
        '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00', 
        '22:00 - 23:00', '23:00 - 00:00', '00:00 - 01:00', '01:00 - 02:00', 
        '02:00 - 03:00', '03:00 - 04:00', '04:00 - 05:00', '05:00 - 06:00'
      ];
    }

    // 🔥 Obtener lista de labor inicios únicos
    this.laborInicios = this.data.map(item => item.labor).sort();
    
    // 🔥 Inicializar matrices
    this.matrizToneladas = {};
    this.totalesPorLabor = {};
    this.totalesPorRango = {};
    
    // Inicializar totales por labor
    this.laborInicios.forEach(labor => {
      this.totalesPorLabor[labor] = 0;
    });
    
    // Inicializar matriz y totales por rango
    this.rangosHora.forEach(rango => {
      this.matrizToneladas[rango] = {};
      this.totalesPorRango[rango] = 0;
      this.laborInicios.forEach(labor => {
        this.matrizToneladas[rango][labor] = 0;
      });
    });
    
    // 🔥 Llenar matriz con los datos
    this.data.forEach(laborData => {
      const labor = laborData.labor;
      
      if (!laborData.rangos || !Array.isArray(laborData.rangos)) return;
      
      laborData.rangos.forEach((rangoData: any) => {
        const rango = rangoData.rangoHora;
        const total = rangoData.total; // O usa mineral/desmonte según necesites
        
        if (this.matrizToneladas[rango] && this.matrizToneladas[rango][labor] !== undefined) {
          this.matrizToneladas[rango][labor] = total;
          this.totalesPorLabor[labor] += total;
          this.totalesPorRango[rango] += total;
        }
      });
    });
    
    // 🔥 Calcular gran total
    this.granTotal = Object.values(this.totalesPorLabor).reduce((sum, val) => sum + val, 0);
    
    // Redondear todos los valores a 2 decimales
    this.redondearValores();
  }

  limpiarTabla(): void {
    this.rangosHora = [];
    this.laborInicios = [];
    this.matrizToneladas = {};
    this.totalesPorLabor = {};
    this.totalesPorRango = {};
    this.granTotal = 0;
  }

  redondearValores(): void {
    // Redondear totales por labor
    Object.keys(this.totalesPorLabor).forEach(labor => {
      this.totalesPorLabor[labor] = Number(this.totalesPorLabor[labor].toFixed(2));
    });
    
    // Redondear totales por rango
    Object.keys(this.totalesPorRango).forEach(rango => {
      this.totalesPorRango[rango] = Number(this.totalesPorRango[rango].toFixed(2));
    });
    
    // Redondear matriz
    this.rangosHora.forEach(rango => {
      this.laborInicios.forEach(labor => {
        if (this.matrizToneladas[rango] && this.matrizToneladas[rango][labor]) {
          this.matrizToneladas[rango][labor] = Number(this.matrizToneladas[rango][labor].toFixed(2));
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
    return 'bg-blue-50';
  }

  // 🔥 Método para formatear números
  formatNumber(valor: number): string {
    if (valor === 0) return '-';
    return valor.toFixed(1);
  }

  // 🔥 Métodos auxiliares para el template
  getTotalPorLabor(labor: string): number {
    return this.totalesPorLabor[labor] || 0;
  }

  getTotalPorRango(rango: string): number {
    return this.totalesPorRango[rango] || 0;
  }
}