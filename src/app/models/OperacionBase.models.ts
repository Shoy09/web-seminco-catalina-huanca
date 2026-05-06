export interface OperacionBase {
  id?: number;
  fecha: string;
  turno: string;
  operador: string;
  jefe_guardia: string;
  equipo: string;
  n_equipo: string;

  estado?: string;
  envio?: number;
  registros?: string;

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