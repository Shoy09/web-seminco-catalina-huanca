# Indicadores de Scalamin

Pantalla basada en las hojas del Layout de Power BI proporcionado y en los indicadores de `largo`. Utiliza operaciones aprobadas de `scalamin` y el catálogo de estados de `SCALAMIN`.

- Disponibilidad: `(horas registradas - mantenimiento) / horas registradas × 100`.
- Utilización: `horas operativas / (horas registradas - mantenimiento) × 100`.
- MTBF: `(horas registradas - mantenimiento) / intervenciones de mantenimiento`.
- MTTR: `horas de mantenimiento / intervenciones de mantenimiento`.
- Horas operativas: suma de duraciones de registros operativos, siguiendo los gráficos de `largo`.
- Pareto: horas por actividad u observación, ordenadas de mayor a menor, con porcentaje acumulado.

Los estados se reconocen por su nombre y por el catálogo. La duración admite cruce de medianoche; registros abiertos, horas inválidas y duraciones cero no aportan horas. Cada registro válido de mantenimiento cuenta como una intervención, siguiendo el criterio de `largo`. Las razones sin denominador se omiten, en lugar de mostrarse como cero.

El diseño sigue `sostenimiento`: pestañas celestes, encabezados de página, tarjetas, paleta de colores y cuadrícula de tres columnas (dos en tablet y una en móvil). Los gráficos usan el estilo de `indicador-power-bi.component.css` de esa pantalla para mantener una presentación uniforme, incluidos los valores cero. Las barras muestran sus valores encima (a la derecha en rankings horizontales) y las líneas de Pareto muestran el porcentaje sobre cada punto. La pantalla no incluye Gantt.

La hoja YTD muestra la evolución mensual del rango filtrado, siguiendo la pantalla de `largo`. No aplica un filtro anual adicional. Las agrupaciones conservan el año para evitar mezclar meses de distintos años.

Utilización incluye el análisis de turnos de sostenimiento: horas de inicio por equipo, series por fecha y códigos `101`, `102`, `103`, `106`, `111`, `112`, `120`, `201`. El turno aplicado determina si aparece día, noche o ambos; los horarios son 07:00–19:00 y 19:00–07:00. Las horas nocturnas posteriores a medianoche continúan en el mismo eje y mantienen la fecha operativa. Los puntos muestran su hora y el tooltip incluye el código.

Por indicación del usuario, se omiten rendimiento en frentes/día, rankings de frentes, combustible y líneas de metas: el Layout contiene referencias a esas medidas pero no sus fórmulas ni valores. No se infieren frentes a partir de metros lineales ni del número de registros. Se muestran horas totales, como en `largo`; el promedio de horas por equipo del PBIX requiere su fórmula DAX. Las horas y razones implementadas se calculan con los datos actuales; la equivalencia exacta con el PBIX requiere sus medidas DAX.
