export interface OperacionTLargos {
  barras: BarrasTLargos[];
  labor: string;
  //long_barras: string;
  observaciones: string;
}

export interface BarrasTLargos {
  //n_taladro: number;
  //n_barras: number;
  n_fila: number;
  longitud_perforacion: number;
  tipo_perforacion: string;
}
