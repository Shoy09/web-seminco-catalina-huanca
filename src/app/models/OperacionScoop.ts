export interface OperacionScoop {
  labor_inicio?: string;

  ubicacion_destino_id?: number;
  ubicacion_destino?: string;

  n_cucharas?: number | string;
  num_cucharas?: number | string;

  material?: string;

  observaciones?: string;

  mineral?: string | number;
  desmonte?: string | number;
  relleno?: string | number;
  numero_volquete?: string | number;
  relave?: string | number;
}