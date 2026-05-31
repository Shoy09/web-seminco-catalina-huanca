export interface OperacionTLargos {
  barras: BarrasTLargos[];
  labor: string;
  long_barras: string;
  observaciones: string;
}

export interface BarrasTLargos {
  n_fila: number;
  n_taladro: number;
  n_barras: number;
  tipo_perforacion: string;
}
