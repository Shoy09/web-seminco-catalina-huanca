import { OperacionJumbo } from './OperacionJumbo';
import { OperacionScoop } from './OperacionScoop';
import { OperacionTLargos } from './OperacionTLargos';

export interface OperacionBase<TOperacion = TipoOperacionRegistro> {
  id?: number;
  fecha: string;
  turno: string;
  operador: string;
  jefe_guardia: string;
  equipo: string;
  n_equipo: string;

  estado?: string;
  envio?: number;
  registros?: Registro<TOperacion>[];

  revisado?: number;
  aprobacion?: number;

  observaciones_jefe?: any;
  observaciones_jefe2?: any; // ✅ nuevo
  observaciones_jefe3?: any; // ✅ nuevo

  // 🔥 opcionales (para todas las variantes)
  seccion?: string;
  modelo_equipo?: string;
  tipo_equipo?: string;
  capacidad?: string;

  horometros?: string;
  condiciones_equipo?: string;
  check_list?: string;
  control_llantas?: string;
  programa_trabajo?: string;
}

export interface Registro<TOperacion = TipoOperacionRegistro> {
  id: number;
  numero: number;
  estado: string;
  codigo: string;
  hora_inicio: string;
  hora_final: string | null;
  operacion: TOperacion;
}
export type TipoOperacionRegistro =
  | OperacionJumbo
  | OperacionScoop
  | OperacionTLargos;

  export type OperacionBaseJumbo = OperacionBase<OperacionJumbo>;
  export type OperacionBaseScoop = OperacionBase<OperacionScoop>;
  export type OperacionBaseTLargos = OperacionBase<OperacionTLargos>;

