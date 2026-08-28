import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface PdfChartComponent {
  getChartImage: (options?: PdfExportOptions) => string | null;
  getChartTitle?: () => string;
}

export interface PdfExportOptions {
  pixelRatio?: number;
  exportWidth?: number;
  exportHeight?: number;
  gridTop?: string;
  gridBottom?: string;
  gridLeft?: string;
  gridRight?: string;
}

export interface PdfHeaderContext {
  fechaInicio?: string | Date | null;
  fechaFin?: string | Date | null;
  turno?: string | null;
  tipoOperacion?: string | null;
  fechaGeneracion?: Date;
}

export interface PdfTableConfig {
  columnas: { header: string; dataKey: string }[];
  filas: Record<string, any>[];
  startY?: number;
  titulo?: string;
  fontSize?: number;
}

// ─── Estado interno del módulo ────────────────────────────────────────────────

let _headerContext: PdfHeaderContext = {};

// ─── Captura de gráfico ECharts ───────────────────────────────────────────────

/**
 * Captura la instancia de ECharts como imagen JPEG base64.
 * Redimensiona temporalmente el chart al tamaño de exportación,
 * ajusta el grid, obtiene el dataURL y luego restaura el estado original.
 */
export function exportarImagenChart(
  chartInstance: any,
  options: PdfExportOptions = {}
): string | null {
  if (!chartInstance) return null;

  const {
    pixelRatio = 2,
    exportWidth = 900,
    exportHeight = 500,
    gridTop = '10%',
    gridBottom = '8%',
    gridLeft = '6%',
    gridRight = '6%',
  } = options;

  try {
    // Guardar tamaño original
    const domEl = chartInstance.getDom ? chartInstance.getDom() : null;
    const originalWidth  = domEl ? domEl.clientWidth  : exportWidth;
    const originalHeight = domEl ? domEl.clientHeight : exportHeight;

    // Guardar grid original
    const currentOption = chartInstance.getOption();
    const originalGrid = currentOption?.grid ?? null;

    // Redimensionar temporalmente
    chartInstance.resize({ width: exportWidth, height: exportHeight });

    // Ajustar márgenes del grid
    chartInstance.setOption({
      grid: { top: gridTop, bottom: gridBottom, left: gridLeft, right: gridRight },
    });

    // Capturar imagen
    const imgData: string = chartInstance.getDataURL({
      type: 'jpeg',
      pixelRatio,
      backgroundColor: '#FFFFFF',
      excludeComponents: ['toolbox', 'dataZoom'],
    });

    // Restaurar tamaño y grid originales
    chartInstance.resize({ width: originalWidth, height: originalHeight });
    if (originalGrid !== null) {
      chartInstance.setOption({ grid: originalGrid });
    }

    return imgData;
  } catch (e) {
    console.warn('[config-pdf] Error capturando gráfico ECharts:', e);
    return null;
  }
}

/**
 * Captura múltiples gráficos en batch.
 * Retorna array de strings base64 (null si falló la captura).
 */
export function convertirChartsAImagenes(
  charts: (PdfChartComponent | null)[],
  options?: PdfExportOptions
): (string | null)[] {
  return charts.map((c) => (c ? c.getChartImage(options) : null));
}

// ─── Configuración de cabecera ────────────────────────────────────────────────

/**
 * Guarda el contexto de filtros para usarlo en las cabeceras del PDF.
 * Llamar antes de crear el jsPDF.
 */
export function configurarCabeceraPDF(context: PdfHeaderContext): void {
  _headerContext = {
    ...context,
    fechaGeneracion: context.fechaGeneracion ?? new Date(),
  };
}

// ─── Cabecera visual del PDF ──────────────────────────────────────────────────

/**
 * Dibuja la cabecera en la página actual del PDF.
 * Incluye: título, filtros activos (fechas, turno, tipo) y fecha de generación.
 * Retorna el Y final (mm) donde terminó la cabecera, para continuar debajo.
 */
export function agregarCabeceraPDF(pdf: jsPDF, titulo: string): number {
  const W = pdf.internal.pageSize.getWidth();
  const margin = 8;

  // Fondo del banner
  pdf.setFillColor(11, 31, 58); // azul oscuro corporativo
  pdf.rect(0, 0, W, 18, 'F');

  // Título principal
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(titulo, margin, 11);

  // Fecha de generación (derecha)
  const fechaGen = _headerContext.fechaGeneracion ?? new Date();
  const fechaStr = fechaGen.toLocaleDateString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  pdf.setFontSize(7.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generado: ${fechaStr}`, W - margin, 11, { align: 'right' });

  // Línea separadora
  pdf.setDrawColor(56, 189, 248); // azul claro
  pdf.setLineWidth(0.4);
  pdf.line(0, 18, W, 18);

  // Filtros aplicados
  const filtros: string[] = [];
  if (_headerContext.fechaInicio)
    filtros.push(`Desde: ${formatFecha(_headerContext.fechaInicio)}`);
  if (_headerContext.fechaFin)
    filtros.push(`Hasta: ${formatFecha(_headerContext.fechaFin)}`);
  if (_headerContext.turno)
    filtros.push(`Turno: ${_headerContext.turno}`);
  if (_headerContext.tipoOperacion)
    filtros.push(`Operación: ${_headerContext.tipoOperacion}`);

  if (filtros.length > 0) {
    pdf.setTextColor(60, 80, 110);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.text(filtros.join('   |   '), margin, 23);
    return 26;
  }

  return 21;
}

function formatFecha(fecha: string | Date | null | undefined): string {
  if (!fecha) return '';
  if (typeof fecha === 'string') return fecha;
  return fecha.toLocaleDateString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

// ─── Inserción de gráficos ────────────────────────────────────────────────────

/**
 * Inserta un gráfico ECharts (base64) en la posición dada, sin ajuste de aspecto.
 */
export function agregarGraficoEchartsPDF(
  pdf: jsPDF,
  img: string | null,
  titulo: string,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  if (!img) return;

  // Etiqueta del gráfico
  if (titulo) {
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(40, 60, 90);
    pdf.text(titulo, x + w / 2, y - 1.5, { align: 'center' });
  }

  pdf.addImage(img, 'JPEG', x, y, w, h, undefined, 'MEDIUM');
}

/**
 * Inserta un gráfico ECharts con aspect ratio preservado y compresión MEDIUM.
 * Si la imagen es más alta que el espacio disponible, la escala para que quepa.
 *
 * @param modoAjuste  'fit' (cabe en el alto máximo) | 'fill' (llena el ancho)
 * @param zoom        factor adicional de escala (default 1)
 * @param padding     espacio interior en mm (default 2)
 */
export function agregarGraficoEchartsPDFProporcional(
  pdf: jsPDF,
  img: string | null,
  titulo: string,
  x: number,
  y: number,
  w: number,
  h: number,
  padding = 2,
  modoAjuste: 'fit' | 'fill' = 'fit',
  zoom = 1
): void {
  if (!img) return;

  const tituloH = titulo ? 5 : 0;
  const innerX = x + padding;
  const innerY = y + tituloH + padding;
  const maxW   = w - padding * 2;
  const maxH   = h - tituloH - padding * 2;

  // Calcular dimensiones proporcionales
  // La imagen viene en JPEG; estimamos aspecto desde la cadena base64
  // (Para ECharts con exportWidth/Height conocidos, calculamos directamente)
  let drawW = maxW * zoom;
  let drawH = maxH * zoom;

  if (modoAjuste === 'fit') {
    // Escalar para que quepa dentro de maxW × maxH
    const scaleW = maxW / drawW;
    const scaleH = maxH / drawH;
    const scale  = Math.min(scaleW, scaleH, 1) * zoom;
    drawW = maxW * scale;
    drawH = maxH * scale;
  }

  // Título del gráfico
  if (titulo) {
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(40, 60, 90);
    pdf.text(titulo, x + w / 2, y + 3.5, { align: 'center' });
  }

  pdf.addImage(img, 'JPEG', innerX, innerY, maxW, maxH, undefined, 'MEDIUM');
}

// ─── Layouts de páginas de gráficos ──────────────────────────────────────────

const A4L = { w: 297, h: 210 };  // landscape mm
const HEADER_H = 28;              // mm reservados para la cabecera

/**
 * Agrega una nueva página landscape con 2 gráficos en 1×2 (lado a lado).
 */
export function agregarPaginaGraficos1x2(
  pdf: jsPDF,
  titulo: string,
  graficos: { img: string | null; titulo: string }[]
): void {
  pdf.addPage([A4L.w, A4L.h], 'landscape');
  const startY = agregarCabeceraPDF(pdf, titulo);
  const margin = 6;
  const gap    = 4;
  const cols   = 2;
  const W      = A4L.w - margin * 2;
  const H      = A4L.h - startY - margin;
  const cw     = (W - gap * (cols - 1)) / cols;

  for (let i = 0; i < Math.min(graficos.length, cols); i++) {
    const gx = margin + i * (cw + gap);
    agregarGraficoEchartsPDFProporcional(
      pdf, graficos[i].img, graficos[i].titulo,
      gx, startY, cw, H
    );
  }
}

/**
 * Agrega una nueva página landscape con 4 gráficos en 2×2.
 */
export function agregarPaginaGraficos2x2(
  pdf: jsPDF,
  titulo: string,
  graficos: { img: string | null; titulo: string }[]
): void {
  pdf.addPage([A4L.w, A4L.h], 'landscape');
  const startY = agregarCabeceraPDF(pdf, titulo);
  const margin = 6;
  const gap    = 4;
  const cols   = 2;
  const rows   = 2;
  const W      = A4L.w - margin * 2;
  const H      = A4L.h - startY - margin;
  const cw     = (W - gap * (cols - 1)) / cols;
  const rh     = (H - gap * (rows - 1)) / rows;

  for (let i = 0; i < Math.min(graficos.length, cols * rows); i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const gx  = margin + col * (cw + gap);
    const gy  = startY + row * (rh + gap);
    agregarGraficoEchartsPDFProporcional(
      pdf, graficos[i].img, graficos[i].titulo,
      gx, gy, cw, rh
    );
  }
}

/**
 * Agrega una nueva página landscape con 6 gráficos en 2 filas × 3 columnas.
 */
export function agregarPaginaGraficos2x3(
  pdf: jsPDF,
  titulo: string,
  graficos: { img: string | null; titulo: string }[]
): void {
  pdf.addPage([A4L.w, A4L.h], 'landscape');
  const startY = agregarCabeceraPDF(pdf, titulo);
  const margin = 6;
  const gap    = 4;
  const cols   = 3;
  const rows   = 2;
  const W      = A4L.w - margin * 2;
  const H      = A4L.h - startY - margin;
  const cw     = (W - gap * (cols - 1)) / cols;
  const rh     = (H - gap * (rows - 1)) / rows;

  for (let i = 0; i < Math.min(graficos.length, cols * rows); i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const gx  = margin + col * (cw + gap);
    const gy  = startY + row * (rh + gap);
    agregarGraficoEchartsPDFProporcional(
      pdf, graficos[i].img, graficos[i].titulo,
      gx, gy, cw, rh
    );
  }
}

/**
 * Agrega una nueva página landscape con 6 gráficos en 3 filas × 2 columnas.
 */
export function agregarPaginaGraficos3x2(
  pdf: jsPDF,
  titulo: string,
  graficos: { img: string | null; titulo: string }[]
): void {
  pdf.addPage([A4L.w, A4L.h], 'landscape');
  const startY = agregarCabeceraPDF(pdf, titulo);
  const margin = 6;
  const gap    = 4;
  const cols   = 2;
  const rows   = 3;
  const W      = A4L.w - margin * 2;
  const H      = A4L.h - startY - margin;
  const cw     = (W - gap * (cols - 1)) / cols;
  const rh     = (H - gap * (rows - 1)) / rows;

  for (let i = 0; i < Math.min(graficos.length, cols * rows); i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const gx  = margin + col * (cw + gap);
    const gy  = startY + row * (rh + gap);
    agregarGraficoEchartsPDFProporcional(
      pdf, graficos[i].img, graficos[i].titulo,
      gx, gy, cw, rh
    );
  }
}

/**
 * Agrega una nueva página landscape con 1 gráfico que ocupa toda el área útil.
 */
export function agregarPaginaGraficoCompleto(
  pdf: jsPDF,
  titulo: string,
  img: string | null,
  tituloGrafico = ''
): void {
  pdf.addPage([A4L.w, A4L.h], 'landscape');
  const startY = agregarCabeceraPDF(pdf, titulo);
  const margin = 6;
  agregarGraficoEchartsPDFProporcional(
    pdf, img, tituloGrafico,
    margin, startY,
    A4L.w - margin * 2,
    A4L.h - startY - margin
  );
}

// ─── Tablas ───────────────────────────────────────────────────────────────────

/**
 * Inserta una tabla en la posición actual de la página.
 * La tabla pagina automáticamente; en cada nueva página redibuja la cabecera.
 *
 * @param tituloCabecera  Título para la cabecera en páginas nuevas
 */
export function agregarTablaContinuaPDF(
  pdf: jsPDF,
  config: PdfTableConfig,
  tituloCabecera = ''
): void {
  const { columnas, filas, startY, titulo, fontSize = 7.5 } = config;
  const margin = 8;

  if (titulo) {
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(11, 31, 58);
    pdf.text(titulo, margin, (startY ?? 30) - 3);
  }

  autoTable(pdf, {
    columns: columnas,
    body: filas,
    startY: startY ?? 30,
    margin: { left: margin, right: margin },
    styles: {
      fontSize,
      cellPadding: 2,
      overflow: 'linebreak',
      lineColor: [220, 227, 235],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [11, 31, 58],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: fontSize + 0.5,
    },
    alternateRowStyles: {
      fillColor: [245, 248, 252],
    },
    didDrawPage: (data) => {
      // Redibujar cabecera corporativa en cada página nueva
      if (data.pageNumber > 1 && tituloCabecera) {
        agregarCabeceraPDF(pdf, tituloCabecera);
      }
    },
  });
}

/**
 * Agrega una nueva página portrait y dibuja una tabla completa con cabecera.
 */
export function agregarPaginaTablaPDF(
  pdf: jsPDF,
  config: PdfTableConfig,
  tituloCabecera = ''
): void {
  pdf.addPage([210, 297], 'portrait');
  const startY = agregarCabeceraPDF(pdf, tituloCabecera);
  agregarTablaContinuaPDF(pdf, { ...config, startY }, tituloCabecera);
}
