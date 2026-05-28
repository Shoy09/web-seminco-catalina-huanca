export const CHART_COLORS = {
  // Core colour
  catalinaGreen: '#00A064',

  // Supporting colours
  dustyGreen: '#78C67B',
  forestGreen: '#145A52',
  grey: '#333333',
  highlightOrange: '#FF9132',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  axis: '#666666',
  grid: '#CCCCCC',
  backgroundBar: 'rgba(180,180,180,0.10)',

  // Status
  success: '#00A064',
  warning: '#FF9132',
  danger: '#E74C3C',
};

export const CHART_TINTS = {
  catalinaGreen: {
    100: '#00A064',
    75: '#40B88B',
    50: '#80D0B2',
    25: '#BFE7D8',
  },

  dustyGreen: {
    100: '#78C67B',
    75: '#9AD49C',
    50: '#BCE3BD',
    25: '#DDF1DE',
  },

  forestGreen: {
    100: '#145A52',
    75: '#4F837D',
    50: '#8AADA8',
    25: '#C4D6D4',
  },

  grey: {
    100: '#333333',
    75: '#666666',
    50: '#999999',
    25: '#CCCCCC',
  },

  highlightOrange: {
    100: '#FF9132',
    75: '#FFAD65',
    50: '#FFC899',
    25: '#FFE4CC',
  },
};

export const CHART_PALETTE = [
  CHART_COLORS.catalinaGreen,
  CHART_COLORS.dustyGreen,
  CHART_COLORS.forestGreen,
  CHART_COLORS.highlightOrange,
  CHART_TINTS.catalinaGreen[75],
  CHART_TINTS.forestGreen[75],
  CHART_TINTS.dustyGreen[75],
  CHART_TINTS.grey[75],
];

export const CHART_PARETO = {
  bar: CHART_COLORS.catalinaGreen,
  line: CHART_COLORS.black,
  symbol: CHART_COLORS.black,
};

export const CHART_KPI_COLORS = {
  disponibilidad: CHART_COLORS.catalinaGreen,
  utilizacion: CHART_COLORS.forestGreen,
  rendimiento: CHART_COLORS.dustyGreen,
  mttr: CHART_COLORS.highlightOrange,
  mtbf: CHART_COLORS.catalinaGreen,
};

export function colorPorDisponibilidad(valor: number): string {
  if (valor >= 90) return CHART_TINTS.catalinaGreen[100];
  if (valor >= 75) return CHART_TINTS.catalinaGreen[75];
  if (valor >= 50) return CHART_TINTS.catalinaGreen[50];
  return CHART_TINTS.catalinaGreen[25];
}

export function colorPorUtilizacion(valor: number): string {
  if (valor >= 90) return CHART_TINTS.catalinaGreen[100];
  if (valor >= 75) return CHART_TINTS.catalinaGreen[75];
  if (valor >= 50) return CHART_TINTS.catalinaGreen[50];
  return CHART_TINTS.catalinaGreen[25];
}

export function colorPorRendimiento(valor: number): string {
  if (valor >= 100) return CHART_TINTS.catalinaGreen[100];
  if (valor >= 70) return CHART_TINTS.catalinaGreen[75];
  if (valor >= 40) return CHART_TINTS.catalinaGreen[50];
  return CHART_TINTS.catalinaGreen[25];
}

export function colorPorMTTR(valor: number): string {
  if (valor >= 100) return CHART_TINTS.highlightOrange[100];
  if (valor >= 75) return CHART_TINTS.highlightOrange[75];
  if (valor >= 50) return CHART_TINTS.highlightOrange[50];
  return CHART_TINTS.highlightOrange[25];
}

export function colorPorMTBF(valor: number): string {
  if (valor >= 100) return CHART_TINTS.forestGreen[100];
  if (valor >= 75) return CHART_TINTS.forestGreen[75];
  if (valor >= 50) return CHART_TINTS.forestGreen[50];
  return CHART_TINTS.forestGreen[25];
}

export const CHART_TEXT_STYLE = {
  fontFamily: 'Arial',
  color: CHART_COLORS.grey,
};

export const CHART_TITLE_STYLE = {
  fontSize: 14,
  fontWeight: 'bold',
  color: CHART_COLORS.grey,
  fontFamily: 'Arial',
};

export const CHART_AXIS_LABEL = {
  fontSize: 10,
  color: CHART_COLORS.grey,
  fontFamily: 'Arial',
};

export const CHART_SPLIT_LINE = {
  lineStyle: {
    type: 'dashed',
    color: CHART_COLORS.grid,
  },
};

export const CHART_BAR_SHADOW = {
  shadowColor: 'rgba(0,0,0,0.20)',
  shadowBlur: 6,
  shadowOffsetY: 2,
};

export const CHART_BACKGROUND_BAR = {
  color: CHART_COLORS.backgroundBar,
  borderRadius: 5,
};

export const CHART_GRID_VERTICAL = {
  left: '8%',
  right: '5%',
  top: '20%',
  bottom: '25%',
  containLabel: true,
};

export const CHART_GRID_HORIZONTAL = {
  left: '30%',
  right: '12%',
  top: '18%',
  bottom: '18%',
  containLabel: true,
};