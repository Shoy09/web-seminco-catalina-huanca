import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardOperacionesComponent } from '../card-operaciones/card-operaciones.component';
import { BotonsComponent } from "../botons/botons.component";
import { TablaComponent } from "../tabla/tabla.component";
import { MenuAccionesComponent } from "../menuAcciones/menuAcciones.component";
import { OperacionesService } from '../../../../../services/operaciones.service';
import { OperacionBase } from '../../../../../models/OperacionBase.models';
import { CommonModule } from '@angular/common';
import { DialogEstadoComponent } from '../../dialog-estado/dialog-estado.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [
    CardOperacionesComponent,
    TablaComponent,
    MenuAccionesComponent,
    CommonModule,
],
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalTalHorizontalComponent implements OnInit {

  tipo: string = 'tal_horizontal';
  operacion!: OperacionBase;
  operacionOriginal!: OperacionBase;
  loading = false;

  // 🔥 DATA MAPEADA PARA CADA COMPONENTE
  cardData: any;
  tablaData: any[] = [];
  horometrosData: any;
  condicionesData: any;
  checkListData: any[] = [];
  llantasData: any;

  constructor(
    private route: ActivatedRoute,
    private operacionesService: OperacionesService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.obtenerOperacion();
  }
  
  onCardChange(data: any) {
  console.log('🟢 PADRE RECIBE CARD:', data);

  this.cardData = data;
}

onMenuChange(event: any) {
  console.log('🟢 PADRE RECIBE MENU:', event);

  switch (event.tipo) {
    case 'horometros':
      this.horometrosData = event.data;
      break;

    case 'condiciones':
      this.condicionesData = event.data;
      break;

    case 'checklist':
      this.checkListData = event.data;
      break;

    case 'llantas':
      this.llantasData = event.data;
      break;
  }
}

onTablaChange(data: any[]) {
  console.log('🟢 TABLA ACTUALIZADA:', data);
  this.tablaData = data;
  
  // Opcional: Marcar que hay cambios pendientes
  // this.hayCambios = true;
}

  obtenerOperacion() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      console.error('No se recibió ID');
      return;
    }

    this.loading = true;

    this.operacionesService.getById(this.tipo, +id).subscribe({
      next: (resp) => {
        this.operacion = resp.data;

        // 🔥 CLON PROFUNDO (IMPORTANTE)
        this.operacionOriginal = structuredClone(resp.data);

        console.log('operacion editable', this.operacion);
        console.log('operacion original', this.operacionOriginal);

        this.mapearDatos();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

validarCambios() {
  const nuevaRaw = this.reconstruirOperacion();
  const original = this.operacionOriginal;

  const nueva = this.parsearNueva(nuevaRaw);

  const hayCambios = JSON.stringify(nueva) !== JSON.stringify(original);

  console.log('🟣 NUEVA (ANTES DE ENVIAR):', nueva);

  if (!hayCambios) {
    console.log('⚪ No hay cambios, no se envía nada');
    return;
  }

  // 🔥 VALIDACIÓN DE LÍMITE
  const revisionActual = this.operacion.revisado ?? 0;

  if (revisionActual >= 3) {
    alert('🚫 Esta operación ya alcanzó el máximo de revisiones');
    return;
  }

  // 🔥 ABRIR DIALOG (NUEVO)
  const dialogRef = this.dialog.open(DialogEstadoComponent, {
    width: '350px'
  });

  dialogRef.afterClosed().subscribe((estadoSeleccionado: number | null) => {

    if (estadoSeleccionado == null) {
      console.log('❌ Cancelado');
      return;
    }

    // 🔥 DEFINIR CAMPO DINÁMICO
    let campoObservacion = '';

    switch (revisionActual) {
      case 0:
        campoObservacion = 'observaciones_jefe';
        break;
      case 1:
        campoObservacion = 'observaciones_jefe2';
        break;
      case 2:
        campoObservacion = 'observaciones_jefe3';
        break;
    }

    // 🔥 PAYLOAD DINÁMICO (SE AGREGA APROBACION)
    const payload: any = {
      ...nuevaRaw,

      [campoObservacion]: JSON.stringify(original),

      revisado: revisionActual + 1,

      // 👇 NUEVO CAMPO
      aprobacion: estadoSeleccionado
    };

    console.log('📦 PAYLOAD FINAL:', payload);

    this.loading = true;

    this.operacionesService.actualizar(this.tipo, this.operacion.id!, payload)
      .subscribe({
        next: (resp) => {
          console.log('🟢 RESPUESTA BACKEND:', resp);

          this.obtenerOperacion();

          alert(`✅ Actualizado (Revisión ${revisionActual + 1})`);
        },
        error: (err) => {
          console.error('🔴 ERROR AL ACTUALIZAR:', err);
          this.loading = false;
          alert('❌ Error al actualizar');
        }
      });

  });
}

 parsearNueva(nueva: any) {
  return {
    ...nueva,
    registros: this.safeParse(nueva.registros),
    horometros: this.safeParse(nueva.horometros),
    condiciones_equipo: this.safeParse(nueva.condiciones_equipo),
    check_list: this.safeParse(nueva.check_list),
    control_llantas: this.safeParse(nueva.control_llantas),
  };
}

// 🔥 Parse seguro (evita que explote si ya es objeto)
 safeParse(valor: any) {
  if (typeof valor === 'string') {
    try {
      return JSON.parse(valor);
    } catch {
      return valor;
    }
  }
  return valor;
}

  reconstruirOperacion(): OperacionBase {
  return {
    ...this.operacionOriginal, // base original

    // 🔥 sobreescribes con lo nuevo
    fecha: this.cardData.fecha,
    turno: this.cardData.turno,
    operador: this.cardData.operador,
    jefe_guardia: this.cardData.jefeGuardia,
    equipo: this.cardData.equipo,
    n_equipo: this.cardData.codigo,
    seccion: this.cardData.seccion,
    tipo_equipo: this.cardData.tipo_equipo,
    modelo_equipo: this.cardData.modelo_equipo,

    registros: JSON.stringify(this.tablaData),

    horometros: JSON.stringify(this.formatearHorometros(this.horometrosData)),

    condiciones_equipo: JSON.stringify({
      aceiteMotor: this.condicionesData.aceiteMotor,
      aceiteHidraulico: this.condicionesData.aceiteHidraulico,
      aceiteTransmision: this.condicionesData.aceiteTransmision,
      combustible: this.condicionesData.combustible,
      descripcion: this.condicionesData.descripcion,
      horaLlenado: this.condicionesData.horaLlenado,
      lugar: this.condicionesData.lugar,
      op: this.condicionesData.operativo,
      noOp: this.condicionesData.noOperativo,
    }),

    check_list: JSON.stringify(
  this.checkListData.map(item => ({
    ...item,
    decision: item.decision ? 1 : 0 // 🔥 conversión clave
  }))
),

    control_llantas: JSON.stringify({
      numero1: this.llantasData.numero1,
      numero2: this.llantasData.numero2,
      numero3: this.llantasData.numero3,
      numero4: this.llantasData.numero4,
    }),
  };
}

formatearHorometros(data: any) {
  if (!data) return null;

  const map = (item: any) => ({
    inicio: Number(item?.inicio ?? 0),
    final: Number(item?.final ?? 0),
    op: !!item?.op,
    inop: !!item?.inop,
  });

  return {
    diesel: data.diesel ? map(data.diesel) : null,
    electrico: data.electrico ? map(data.electrico) : null,
    percusion: data.percusion ? map(data.percusion) : null,
  };
}

  // 🔥 CENTRALIZAS TODOS LOS MAPEOS
  mapearDatos() {
    this.cardData = this.mapearParaCard(this.operacion);
    this.tablaData = this.mapearParaTabla(this.operacion);

    // 🔥 NUEVOS
    this.horometrosData = this.mapearParaHorometros(this.operacion);
    this.condicionesData = this.mapearParaCondiciones(this.operacion);
    this.checkListData = this.mapearParaCheckList(this.operacion);
    this.llantasData = this.mapearParaLlantas(this.operacion);
  }

  // 🔥 MAPEO SOLO PARA CARD
  mapearParaCard(op: OperacionBase) {
    return {
      fecha: op.fecha,
      turno: op.turno,
      operador: op.operador,
      jefeGuardia: op.jefe_guardia,
      equipo: op.equipo,
      codigo: op.n_equipo,
      seccion: op.seccion || '',
      tipo_equipo: op.tipo_equipo || '',
      modelo_equipo: op.modelo_equipo || '',
    };
  }

  mapearParaTabla(op: OperacionBase) {
    if (!op.registros) return [];

    let registros = op.registros;

    // 🔥 si aún viniera como string (por seguridad)
    if (typeof registros === 'string') {
      try {
        registros = JSON.parse(registros);
      } catch {
        return [];
      }
    }

    // 🔥 aseguramos que sea array
    if (!Array.isArray(registros)) return [];

    // 🔥 aquí puedes transformar cada fila si quieres
    return registros.map((item: any) => ({
      ...item,
    }));
  }

  parseSeguro(valor: any) {
    if (!valor) return null;

    if (typeof valor === 'string') {
      try {
        return JSON.parse(valor);
      } catch {
        return null;
      }
    }

    return valor;
  }

  mapearParaHorometros(op: OperacionBase) {
    const h = this.parseSeguro(op.horometros);

    if (!h || typeof h !== 'object') return null;

    return {
      diesel: h.diesel || null,
      electrico: h.electrico || null,
      empernador: h.empernador || null,
      percusion: h.percusion || null,
    };
  }

  mapearParaCondiciones(op: OperacionBase) {
    const c = this.parseSeguro(op.condiciones_equipo);

    if (!c || typeof c !== 'object') return null;

    return {
      aceiteMotor: !!c.aceiteMotor,
      aceiteHidraulico: !!c.aceiteHidraulico,
      aceiteTransmision: !!c.aceiteTransmision,
      combustible: c.combustible || '',
      descripcion: c.descripcion || '',
      horaLlenado: c.horaLlenado || '',
      lugar: c.lugar || '',
      operativo: !!c.op,
      noOperativo: !!c.noOp,
    };
  }

  mapearParaCheckList(op: OperacionBase) {
    let lista = this.parseSeguro(op.check_list);

    if (!Array.isArray(lista)) return [];

    return lista.map((item: any) => ({
      ...item,
    }));
  }

  mapearParaLlantas(op: OperacionBase) {
    const l = this.parseSeguro(op.control_llantas);

    if (!l || typeof l !== 'object') return null;

    return {
      numero1: !!l.numero1,
      numero2: !!l.numero2,
      numero3: !!l.numero3,
      numero4: !!l.numero4,
    };
  }
}
