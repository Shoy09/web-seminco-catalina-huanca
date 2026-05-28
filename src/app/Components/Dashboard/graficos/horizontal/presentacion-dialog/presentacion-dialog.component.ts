import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MetrosPerforadosRangoHoraComponent } from "../horas/metros-perforados-rango-hora/metros-perforados-rango-hora.component";
import { TablaMetrosPerforadosEquipoComponent } from "../horas/tabla-metros-perforados-equipo/tabla-metros-perforados-equipo.component";

@Component({
  selector: 'app-presentacion-dialog',
  imports: [CommonModule, MetrosPerforadosRangoHoraComponent, TablaMetrosPerforadosEquipoComponent],
  templateUrl: './presentacion-dialog.component.html',
  styleUrl: './presentacion-dialog.component.css'
})
export class PresentacionHorizontalDialogComponent implements OnInit {
  hojaActual: string = 'hoja1';
  turnoAplicado: string = '';
  
  //DATA
  DataMetrosPerforadosPorHora: any[] = [];
  DataMetrosPerforadosPorLaborYRangoHora: any[] = [];

private equiposProceso: any[] = [];
isFullscreen: boolean = false;

  constructor(
  public dialogRef: MatDialogRef<PresentacionHorizontalDialogComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any
) {
  console.log('Datos recibidos en el diálogo:', data);
  
  // 🔥 Extraer turnoAplicado de los datos recibidos
  this.turnoAplicado = data.turnoAplicado || '';
  
  // Extraer equiposProceso de los datos recibidos
  this.equiposProceso = data.equipos || [];
  //console.log('Equipos proceso:', this.equiposProceso);
}

    ngOnInit(): void {
    this.procesarTodo();
    
    // Escuchar el evento de teclado para ESC
    document.addEventListener('keydown', this.handleEscKey.bind(this));
  }

  ngOnDestroy(): void {
    // Limpiar event listener
    document.removeEventListener('keydown', this.handleEscKey.bind(this));
  }

  // 🔥 FUNCIÓN PARA PANTALLA COMPLETA
  toggleFullscreen(): void {
    const dialogContainer = document.querySelector('.dialog-container');
    
    if (!dialogContainer) return;
    
    if (!this.isFullscreen) {
      // Entrar a pantalla completa
      if (dialogContainer.requestFullscreen) {
        dialogContainer.requestFullscreen();
      }
      this.isFullscreen = true;
    } else {
      // Salir de pantalla completa
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      this.isFullscreen = false;
    }
  }

  // Manejar tecla ESC para salir de pantalla completa
  private handleEscKey(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isFullscreen) {
      this.isFullscreen = false;
    }
  }

  procesarTodo(): void {
    if (!this.data.operaciones?.length) {
      console.warn('No hay operaciones filtradas');
      return;
    }


   this.DataMetrosPerforadosPorHora = this.MetrosPerforadosPorRangoHoraCompleto(this.turnoAplicado) 
   this.DataMetrosPerforadosPorLaborYRangoHora = this.MetrosPerforadosPorLaborYRangoHora(this.turnoAplicado)
    }



  cerrar(): void {
    this.dialogRef.close();
  }

  cambiarHoja(hoja: string): void {
    this.hojaActual = hoja;
    //console.log('Cambiando a hoja:', hoja);
  }



MetrosPerforadosPorRangoHoraCompleto(turno: string = '') {
  const resultadoMap = new Map<string, any>();
  // const codigosPermitidos = ['101', '103'];

  // Set para almacenar todos los tipos de perforación únicos
  const tiposPerforacionSet = new Set<string>();

  // 🔥 Rangos de hora según el turno
  let rangosHora: string[] = [];

  // 🔥 Función reutilizable para obtener rango de hora
  const obtenerRangoHoraBase = (horaStr: string): string => {
    if (!horaStr) return 'SIN HORA';

    let [hora, minutos] = horaStr.split(':').map(Number);

    // 🔥 Si termina exacto en :00
    // pertenece al rango anterior
    if (minutos === 0) {
      hora = hora === 0 ? 23 : hora - 1;
      minutos = 59;
    }

    if (hora >= 6 && hora < 7) return '06:00 - 07:00';
    if (hora >= 7 && hora < 8) return '07:00 - 08:00';
    if (hora >= 8 && hora < 9) return '08:00 - 09:00';
    if (hora >= 9 && hora < 10) return '09:00 - 10:00';
    if (hora >= 10 && hora < 11) return '10:00 - 11:00';
    if (hora >= 11 && hora < 12) return '11:00 - 12:00';
    if (hora >= 12 && hora < 13) return '12:00 - 13:00';
    if (hora >= 13 && hora < 14) return '13:00 - 14:00';
    if (hora >= 14 && hora < 15) return '14:00 - 15:00';
    if (hora >= 15 && hora < 16) return '15:00 - 16:00';
    if (hora >= 16 && hora < 17) return '16:00 - 17:00';
    if (hora >= 17 && hora < 18) return '17:00 - 18:00';
    if (hora >= 18 && hora < 19) return '18:00 - 19:00';
    if (hora >= 19 && hora < 20) return '19:00 - 20:00';
    if (hora >= 20 && hora < 21) return '20:00 - 21:00';
    if (hora >= 21 && hora < 22) return '21:00 - 22:00';
    if (hora >= 22 && hora < 23) return '22:00 - 23:00';
    if (hora >= 23) return '23:00 - 00:00';
    if (hora >= 0 && hora < 1) return '00:00 - 01:00';
    if (hora >= 1 && hora < 2) return '01:00 - 02:00';
    if (hora >= 2 && hora < 3) return '02:00 - 03:00';
    if (hora >= 3 && hora < 4) return '03:00 - 04:00';
    if (hora >= 4 && hora < 5) return '04:00 - 05:00';
    if (hora >= 5 && hora < 6) return '05:00 - 06:00';

    return 'SIN HORA';
  };

  let obtenerRangoHora: (horaStr: string) => string;

  if (turno === 'DÍA') {
    rangosHora = [
      '06:00 - 07:00',
      '07:00 - 08:00',
      '08:00 - 09:00',
      '09:00 - 10:00',
      '10:00 - 11:00',
      '11:00 - 12:00',
      '12:00 - 13:00',
      '13:00 - 14:00',
      '14:00 - 15:00',
      '15:00 - 16:00',
      '16:00 - 17:00',
      '17:00 - 18:00'
    ];

    obtenerRangoHora = obtenerRangoHoraBase;
  }
  else if (turno === 'NOCHE') {
    rangosHora = [
      '18:00 - 19:00',
      '19:00 - 20:00',
      '20:00 - 21:00',
      '21:00 - 22:00',
      '22:00 - 23:00',
      '23:00 - 00:00',
      '00:00 - 01:00',
      '01:00 - 02:00',
      '02:00 - 03:00',
      '03:00 - 04:00',
      '04:00 - 05:00',
      '05:00 - 06:00'
    ];

    obtenerRangoHora = obtenerRangoHoraBase;
  }
  else {
    rangosHora = [
      '06:00 - 07:00',
      '07:00 - 08:00',
      '08:00 - 09:00',
      '09:00 - 10:00',
      '10:00 - 11:00',
      '11:00 - 12:00',
      '12:00 - 13:00',
      '13:00 - 14:00',
      '14:00 - 15:00',
      '15:00 - 16:00',
      '16:00 - 17:00',
      '17:00 - 18:00',
      '18:00 - 19:00',
      '19:00 - 20:00',
      '20:00 - 21:00',
      '21:00 - 22:00',
      '22:00 - 23:00',
      '23:00 - 00:00',
      '00:00 - 01:00',
      '01:00 - 02:00',
      '02:00 - 03:00',
      '03:00 - 04:00',
      '04:00 - 05:00',
      '05:00 - 06:00'
    ];

    obtenerRangoHora = obtenerRangoHoraBase;
  }

  // 🔥 PRIMER PASO: identificar todos los tipos únicos
  this.data.operaciones.forEach((op: any) => {
    if (turno && op.turno !== turno) return;

    const registrosArray = op.registros;

    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      const codigo = registro.codigo?.toString() || '';

      // if (!codigosPermitidos.includes(codigo)) continue;

      if (registro.estado !== 'OPERATIVO') continue;

      const operacionData = registro.operacion || {};
      const tipoPerforacion = operacionData.tipo_perforacion;

      if (tipoPerforacion && typeof tipoPerforacion === 'string') {
        tiposPerforacionSet.add(
          tipoPerforacion.toUpperCase().trim()
        );
      }
    }
  });

  // 🔥 Convertir Set a Array ordenado
  const tiposPerforacion = Array.from(
    tiposPerforacionSet
  ).sort();

  // 🔥 SEGUNDO PASO: procesar y acumular
  this.data.operaciones.forEach((op: any) => {
    if (turno && op.turno !== turno) return;

    const registrosArray = op.registros;

    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      const codigo = registro.codigo?.toString() || '';

      // if (!codigosPermitidos.includes(codigo)) continue;

      if (registro.estado !== 'OPERATIVO') continue;

      const rangoHora = obtenerRangoHora(
        registro.hora_final
      );

      if (!rangosHora.includes(rangoHora)) continue;

      // 🔥 Datos de perforación
      const operacionData = registro.operacion || {};

      const talAlivio =
        Number(operacionData.tal_alivio) || 0;

      const talProd =
        Number(operacionData.tal_prod) || 0;

      const talRimados =
        Number(operacionData.tal_rimados) || 0;

      const longBarras =
        Number(operacionData.long_barras) || 0;

      const tipoPerforacion = (
        operacionData.tipo_perforacion || 'SIN TIPO'
      )
        .toUpperCase()
        .trim();

      // 🔥 Calcular metros perforados
      const sumaTaladros =
        talAlivio + talProd + talRimados;

      const metrosPerforados =
        sumaTaladros * longBarras * 0.3048;

      if (metrosPerforados <= 0) continue;

      // 🔥 Inicializar rango si no existe
      if (!resultadoMap.has(rangoHora)) {
        const nuevoItem: any = {
          rangoHora,
          total: 0,
          cantidadRegistros: 0
        };

        // Inicializar tipos
        tiposPerforacion.forEach(tipo => {
          nuevoItem[tipo] = 0;
        });

        resultadoMap.set(rangoHora, nuevoItem);
      }

      const item = resultadoMap.get(rangoHora);

      // 🔥 Acumular por tipo
      if (item[tipoPerforacion] !== undefined) {
        item[tipoPerforacion] += metrosPerforados;
      } else {
        item[tipoPerforacion] = metrosPerforados;
        tiposPerforacion.push(tipoPerforacion);
      }

      item.total += metrosPerforados;
      item.cantidadRegistros += 1;
    }
  });

  // 🔥 Construir resultado final
  const resultado = Array.from(resultadoMap.values())
    .sort((a, b) => {
      const indexA = rangosHora.indexOf(a.rangoHora);
      const indexB = rangosHora.indexOf(b.rangoHora);

      return indexA - indexB;
    })
    .map(item => {
      tiposPerforacion.forEach(tipo => {
        if (item[tipo] !== undefined) {
          item[tipo] = Number(
            item[tipo].toFixed(2)
          );
        }
      });

      item.total = Number(item.total.toFixed(2));

      return item;
    });

  console.log(
    `📊 METROS PERFORADOS POR RANGO DE HORA (Turno: ${
      turno || 'TODOS'
    }):`,
    resultado
  );

  return resultado;
}

//GRAFICO - TONELADAS POR EQUIPO Y RANGO DE HORA
MetrosPerforadosPorLaborYRangoHora(turno: string = '') {
  const resultadoMap = new Map<string, any>();

  // const codigosPermitidos = ['101', '103'];

  // 🔥 Rangos de hora según el turno
  let rangosHora: string[] = [];

  if (turno === 'DÍA') {
    rangosHora = [
      '06:00 - 07:00',
      '07:00 - 08:00',
      '08:00 - 09:00',
      '09:00 - 10:00',
      '10:00 - 11:00',
      '11:00 - 12:00',
      '12:00 - 13:00',
      '13:00 - 14:00',
      '14:00 - 15:00',
      '15:00 - 16:00',
      '16:00 - 17:00',
      '17:00 - 18:00'
    ];
  } else if (turno === 'NOCHE') {
    rangosHora = [
      '18:00 - 19:00',
      '19:00 - 20:00',
      '20:00 - 21:00',
      '21:00 - 22:00',
      '22:00 - 23:00',
      '23:00 - 00:00',
      '00:00 - 01:00',
      '01:00 - 02:00',
      '02:00 - 03:00',
      '03:00 - 04:00',
      '04:00 - 05:00',
      '05:00 - 06:00'
    ];
  } else {
    rangosHora = [
      '06:00 - 07:00',
      '07:00 - 08:00',
      '08:00 - 09:00',
      '09:00 - 10:00',
      '10:00 - 11:00',
      '11:00 - 12:00',
      '12:00 - 13:00',
      '13:00 - 14:00',
      '14:00 - 15:00',
      '15:00 - 16:00',
      '16:00 - 17:00',
      '17:00 - 18:00',
      '18:00 - 19:00',
      '19:00 - 20:00',
      '20:00 - 21:00',
      '21:00 - 22:00',
      '22:00 - 23:00',
      '23:00 - 00:00',
      '00:00 - 01:00',
      '01:00 - 02:00',
      '02:00 - 03:00',
      '03:00 - 04:00',
      '04:00 - 05:00',
      '05:00 - 06:00'
    ];
  }

  // 🔥 Función corregida para manejar horas exactas (:00)
  const obtenerRangoHora = (horaStr: string): string => {
    if (!horaStr) return 'SIN HORA';

    let [hora, minutos] = horaStr.split(':').map(Number);

    // 🔥 Si termina exacto en :00
    // pertenece al rango anterior
    if (minutos === 0) {
      hora = hora === 0 ? 23 : hora - 1;
      minutos = 59;
    }

    // 🔥 DÍA
    if (turno === 'DÍA') {
      if (hora >= 6 && hora < 7) return '06:00 - 07:00';
      if (hora >= 7 && hora < 8) return '07:00 - 08:00';
      if (hora >= 8 && hora < 9) return '08:00 - 09:00';
      if (hora >= 9 && hora < 10) return '09:00 - 10:00';
      if (hora >= 10 && hora < 11) return '10:00 - 11:00';
      if (hora >= 11 && hora < 12) return '11:00 - 12:00';
      if (hora >= 12 && hora < 13) return '12:00 - 13:00';
      if (hora >= 13 && hora < 14) return '13:00 - 14:00';
      if (hora >= 14 && hora < 15) return '14:00 - 15:00';
      if (hora >= 15 && hora < 16) return '15:00 - 16:00';
      if (hora >= 16 && hora < 17) return '16:00 - 17:00';
      if (hora >= 17 && hora < 18) return '17:00 - 18:00';

      return 'SIN HORA';
    }

    // 🔥 NOCHE
    if (turno === 'NOCHE') {
      if (hora >= 18 && hora < 19) return '18:00 - 19:00';
      if (hora >= 19 && hora < 20) return '19:00 - 20:00';
      if (hora >= 20 && hora < 21) return '20:00 - 21:00';
      if (hora >= 21 && hora < 22) return '21:00 - 22:00';
      if (hora >= 22 && hora < 23) return '22:00 - 23:00';
      if (hora >= 23) return '23:00 - 00:00';
      if (hora >= 0 && hora < 1) return '00:00 - 01:00';
      if (hora >= 1 && hora < 2) return '01:00 - 02:00';
      if (hora >= 2 && hora < 3) return '02:00 - 03:00';
      if (hora >= 3 && hora < 4) return '03:00 - 04:00';
      if (hora >= 4 && hora < 5) return '04:00 - 05:00';
      if (hora >= 5 && hora < 6) return '05:00 - 06:00';

      return 'SIN HORA';
    }

    // 🔥 TODOS
    if (hora >= 6 && hora < 7) return '06:00 - 07:00';
    if (hora >= 7 && hora < 8) return '07:00 - 08:00';
    if (hora >= 8 && hora < 9) return '08:00 - 09:00';
    if (hora >= 9 && hora < 10) return '09:00 - 10:00';
    if (hora >= 10 && hora < 11) return '10:00 - 11:00';
    if (hora >= 11 && hora < 12) return '11:00 - 12:00';
    if (hora >= 12 && hora < 13) return '12:00 - 13:00';
    if (hora >= 13 && hora < 14) return '13:00 - 14:00';
    if (hora >= 14 && hora < 15) return '14:00 - 15:00';
    if (hora >= 15 && hora < 16) return '15:00 - 16:00';
    if (hora >= 16 && hora < 17) return '16:00 - 17:00';
    if (hora >= 17 && hora < 18) return '17:00 - 18:00';
    if (hora >= 18 && hora < 19) return '18:00 - 19:00';
    if (hora >= 19 && hora < 20) return '19:00 - 20:00';
    if (hora >= 20 && hora < 21) return '20:00 - 21:00';
    if (hora >= 21 && hora < 22) return '21:00 - 22:00';
    if (hora >= 22 && hora < 23) return '22:00 - 23:00';
    if (hora >= 23) return '23:00 - 00:00';
    if (hora >= 0 && hora < 1) return '00:00 - 01:00';
    if (hora >= 1 && hora < 2) return '01:00 - 02:00';
    if (hora >= 2 && hora < 3) return '02:00 - 03:00';
    if (hora >= 3 && hora < 4) return '03:00 - 04:00';
    if (hora >= 4 && hora < 5) return '04:00 - 05:00';
    if (hora >= 5 && hora < 6) return '05:00 - 06:00';

    return 'SIN HORA';
  };

  this.data.operaciones.forEach((op: any) => {
    // 🔥 Filtrar por turno
    if (turno && op.turno !== turno) return;

    const registrosArray = op.registros;

    if (!Array.isArray(registrosArray)) return;

    for (const registro of registrosArray) {
      const codigo = registro.codigo?.toString() || '';

      // if (!codigosPermitidos.includes(codigo)) continue;

      if (registro.estado !== 'OPERATIVO') continue;

      // 🔥 Obtener labor
      const labor =
        registro.operacion?.labor || 'SIN LABOR';

      const claveLabor =
        labor.trim() === ''
          ? 'SIN LABOR'
          : labor.trim();

      const rangoHora = obtenerRangoHora(
        registro.hora_final
      );

      // 🔥 Validar rango
      if (!rangosHora.includes(rangoHora)) continue;

      // 🔥 Datos perforación
      const operacionData = registro.operacion || {};

      const talAlivio =
        Number(operacionData.tal_alivio) || 0;

      const talProd =
        Number(operacionData.tal_prod) || 0;

      const talRimados =
        Number(operacionData.tal_rimados) || 0;

      const longBarras =
        Number(operacionData.long_barras) || 0;

      // 🔥 Calcular metros perforados
      const sumaTaladros =
        talAlivio + talProd + talRimados;

      const metrosPerforados =
        sumaTaladros * longBarras * 0.3048;

      if (metrosPerforados <= 0) continue;

      // 🔥 Tipo perforación
      const tipoPerforacion = (
        operacionData.tipo_perforacion ||
        'SIN TIPO'
      )
        .toUpperCase()
        .trim();

      // 🔥 Clave compuesta
      const clave = `${claveLabor}|${rangoHora}`;

      if (!resultadoMap.has(clave)) {
        resultadoMap.set(clave, {
          labor: claveLabor,
          rangoHora,
          total: 0,
          cantidadRegistros: 0,
          tipos: {}
        });
      }

      const item = resultadoMap.get(clave);

      // 🔥 Acumular por tipo
      if (!item.tipos[tipoPerforacion]) {
        item.tipos[tipoPerforacion] = 0;
      }

      item.tipos[tipoPerforacion] += metrosPerforados;
      item.total += metrosPerforados;
      item.cantidadRegistros += 1;
    }
  });

  // 🔥 Agrupar por labor
  const resultadoPorLabor = new Map<string, any>();

  Array.from(resultadoMap.values()).forEach(item => {
    const labor = item.labor;

    if (!resultadoPorLabor.has(labor)) {
      resultadoPorLabor.set(labor, {
        labor,
        turno: turno || 'TODOS',
        rangos: []
      });
    }

    const laborItem =
      resultadoPorLabor.get(labor);

    // 🔥 Crear objeto rango
    const rangoObj: any = {
      rangoHora: item.rangoHora,
      total: Number(item.total.toFixed(2)),
      cantidadRegistros: item.cantidadRegistros
    };

    // 🔥 Agregar tipos
    Object.keys(item.tipos).forEach(tipo => {
      rangoObj[tipo] = Number(
        item.tipos[tipo].toFixed(2)
      );
    });

    laborItem.rangos.push(rangoObj);

    // 🔥 Ordenar rangos
    laborItem.rangos.sort((a: any, b: any) => {
      const indexA = rangosHora.indexOf(
        a.rangoHora
      );

      const indexB = rangosHora.indexOf(
        b.rangoHora
      );

      return indexA - indexB;
    });
  });

  // 🔥 Resultado final
  const resultado = Array.from(
    resultadoPorLabor.values()
  ).sort((a, b) =>
    a.labor.localeCompare(b.labor)
  );

  console.log(
    `📊 METROS PERFORADOS POR LABOR Y RANGO DE HORA (Turno: ${
      turno || 'TODOS'
    }):`,
    resultado
  );

  return resultado;
}

}