export type IndicadorGraficoTipo =
  | 'line'
  | 'bar'
  | 'combo'
  | 'pareto'
  | 'gauge'
  | 'table'
  | 'pie'
  | 'scatter'
  | 'summary';

export interface IndicadorGraficoSerie {
  nombre: string;
  valores: number[];
  tipo?: 'line' | 'bar' | 'scatter';
  ejeSecundario?: boolean;
}

export interface IndicadorGraficoPunto {
  x: number;
  y: string;
  detalle?: string;
  grupo?: string;
}

export interface IndicadorGrafico {
  horizontal?: boolean;
  titulo: string;
  tipo: IndicadorGraficoTipo;
  unidad?: string;
  categorias?: string[];
  series?: IndicadorGraficoSerie[];
  valor?: number;
  maximo?: number;
  unidadSecundaria?: string;
  columnas?: string[];
  filas?: Record<string, string | number>[];
  puntos?: IndicadorGraficoPunto[];
  resumen?: { nombre: string; valor: number; unidad?: string }[];
}

export interface IndicadorPagina {
  nombre: string;
  descripcion: string;
  graficos: IndicadorGrafico[];
}
