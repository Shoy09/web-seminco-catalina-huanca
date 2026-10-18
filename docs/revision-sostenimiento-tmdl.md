# Revisión de sostenimiento: modelo TMDL y pantalla Angular

Fecha: 18 de octubre de 2026.

Estado posterior a esta revisión: se implementó la corrección de las fórmulas, agrupaciones y Pareto en la pantalla. El contenido siguiente describe el diagnóstico previo; sus referencias a líneas corresponden a esa versión. Las reglas y límites de la implementación vigente están en `src/app/Components/Dashboard/graficos/sostenimiento/principal-grafico-sostenimiento/README.md`.

Revisión estática del modelo `prueba de empernador.SemanticModel`, del Layout entregado y del constructor de indicadores de la pantalla. No se ejecutó el motor de Power BI ni se compararon registros reales del Excel con la API. No se modificaron cálculos de producción.

## Medidas confirmadas

En las siguientes expresiones, H, M, O, C y F representan sumas en el contexto de filtros del gráfico:

- H = `BD_EMPERNADOR[HORAS]`.
- M = `BD_EMPERNADOR[HRS MTTO]`.
- O = `BD_EMPERNADOR[HRS OPERATIVAS]`.
- C = `BD_EMPERNADOR[Hrs. Mtto. Correctivo]`.
- F = `BD_EMPERNADOR[#FALLA]`.

| Indicador | Medida del PB | Diferencia con la pantalla |
|---|---|---|
| Disponibilidad | `DIVIDE(H - M, H, 0)` | La pantalla utiliza 12 horas por operación; un gráfico adicional usa 10 horas y sustituye mantenimiento cero por 0,5 horas por operación. |
| Utilización | `DIVIDE(O, H - M, 0)` | El denominador de los gráficos principales parte de 12 horas y el gráfico adicional utiliza horas de horómetros en el numerador. |
| Rendimiento | `DIVIDE(SUM(N° PERNOS), O, 0)` | La pantalla calcula metros de pernos / horas de percusión. Cambian numerador, denominador y unidad. |
| MTBF | `DIVIDE(H - C, IF(F = 0, 1, F), 0)` | La pantalla sustituye H por horas programadas fijas e infiere F contando registros 303. Los medidores promedian resultados por equipo. |
| MTTR | `DIVIDE(C, F, 0)` | El PB calcula la razón de sumas en el contexto seleccionado; el medidor de la pantalla promedia MTTR por equipo. |
| Horas operativas promedio | Promedio de la suma de O por combinación fecha + EQUIPO + GUARDIA | La pantalla divide horas operativas entre cantidad de operaciones. Las agrupaciones no son equivalentes en general. |
| Equipos utilizados | Promedio por fecha + turno del conteo distinto de EQUIPO con HORAS > 0, excluyendo códigos 308, 309, 410, 409, 201 y 202 | No equivale al conteo distinto de todos los equipos que muestra la tarjeta actual. La tarjeta puede mantenerse como otro indicador, con un nombre explícito. |

Para representar las dos primeras razones en una escala de 0 a 100 en Angular se multiplica por 100. Esto es una conversión de presentación.

Fuentes del modelo: `definition/tables/DISPONIBILIDAD.tmdl:4`, `UTILIZACIÓN.tmdl:71`, `RENDIMIENTO.tmdl:4`, `DAX.tmdl:31`, `DAX.tmdl:36`, `YTD.tmdl:4`, `YTD.tmdl:63`.

## Diferencias prioritarias

### 1. Unificar la base de horas

El PB usa las horas de sus registros, no una constante de duración del turno en esas medidas. La pantalla fija 12 horas en `crearResumen`, recorta por separado horas operativas y no disponibles a 12 y, además, agrega gráficos con una base de 10 horas. No debe mantenerse esa mezcla si el objetivo es reproducir el PB.

Referencias Angular: `sostenimiento-indicadores.builder.ts:140`, `:201`, `:624` y `:625`.

El ejemplo controlado de la revisión anterior, sin mantenimiento registrado, produjo 100 % en el gráfico principal y 95 % en el adicional. No es una comparación con datos reales del PB.

### 2. Separar rendimiento del PB y productividad en metros

El rendimiento del PB es pernos por hora operativa. Los metros por hora de percusión pueden conservarse como indicador adicional de productividad, pero no sustituir esa medida ni compararse con metas de pernos/hora.

Los gráficos adicionales también suman el horómetro completo de la operación por cada registro operativo. Esto duplica el denominador cuando una operación contiene varios registros. Referencias Angular: `:576`, `:686`. El gráfico `M/Hr por equipo` además redondea el resultado a entero en `:671`.

### 3. Agregar los rankings en el mismo contexto del PB

El Layout utiliza GUARDIA para disponibilidad, utilización, rendimiento y frentes. La pantalla usa sección. Son dimensiones diferentes y el tipo actual `TurnoResumen` no conserva guardia.

El ranking operador + equipo debe consolidar los registros del período antes de dividir sumas. Actualmente `resumenes.map(...)` genera una entrada por operación y puede repetir categorías.

Referencias Angular: `:761`, `:852` y `:858`.

### 4. Reconstruir Pareto según cada gráfico

- El Pareto de detalle de disponibilidad del Layout agrupa por `Observacion` y filtra la actividad `Mantenimiento No Programado`.
- El Pareto de detalle de utilización agrupa por `Observacion`. Su medida HorasDemora conserva las familias DEMORAS OPERATIVAS y DEMORAS NO OPERATIVAS, intersectadas con los filtros del gráfico.
- El Pareto de utilización de la primera hoja tiene además un filtro de familia DEMORAS OPERATIVAS y un Top 10. Ese filtro de familia no es el mismo que el del detalle.
- La pantalla construye los dos Pareto de detalle por actividad e incorpora otros gráficos con familias diferentes. Además, algunos adicionales dividen las horas entre todos los equipos, mientras otros muestran horas totales.
- Los empates tampoco se acumulan siempre igual: `ParetoObservacion` y `Pareto Disp%` usan ranking denso; `Pareto Disp% Obs.` deshace empates por observación y `ParetoAct%` por actividad con tolerancia numérica. Un acumulado secuencial genérico no reproduce todos estos casos.

Referencias Angular: `:366`, `:608`, `:697`, `:828`. Fuentes del modelo: `UTILIZACIÓN.tmdl:4`, `:50`, `:77`; `DISPONIBILIDAD.tmdl:8`, `:42`; `DAX.tmdl:23`. Los filtros visuales proceden del Layout.

### 5. Calcular MTBF y MTTR globales desde las sumas

Las medidas DAX se recalculan con las sumas del contexto. Los medidores actuales promedian valores por equipo y no son equivalentes cuando las fallas y horas difieren entre equipos.

El caso sin fallas está definido expresamente en el PB: MTBF devuelve H - C, porque sustituye el número de fallas por 1; MTTR devuelve 0. No corresponde cambiar ese comportamiento por ausencia de datos si se busca fidelidad al modelo.

Referencia Angular: `:397`, `:904`, `:907`.

## Aclaración sobre labores y frentes

La revisión anterior consideró que repetir una labor podía inflar el conteo. El modelo permite precisar esa observación:

- `Prom_frentes` usa `COUNT(LABOR)` por fecha + EQUIPO y luego promedia.
- `Prom_frentes_guardia` usa `COUNT(LABOR)` por fecha + GUARDIA y luego promedia.
- Ninguna de esas dos medidas utiliza DISTINCTCOUNT de labor.

Por tanto, no hay base para imponer labores únicas como corrección del PB. Lo que sí difiere es mostrar un conteo total de registros productivos en una tarjeta en lugar del promedio definido por las medidas. Esa tarjeta puede mantenerse si se desea como indicador distinto y se nombra de acuerdo con lo que realmente cuenta.

Fuente: `YTD.tmdl:28`, `:45`. Referencia Angular: `:569`, `:717`, `:886`.

## Qué falta para establecer equivalencia completa

Las columnas HRS MTTO, HRS OPERATIVAS, Hrs. Mtto. Correctivo, #FALLA, N° PERNOS, HORAS, familias y tipos de actividad se importan del Excel. En el TMDL aparecen como `sourceColumn`; la consulta M cambia sus tipos, pero no contiene las fórmulas originales del libro.

Esto impide confirmar únicamente con TMDL:

- Si la inspección de equipo, código 206, pertenece a HRS MTTO.
- Si cada registro 303 representa una falla, o hay reglas para consolidar una misma avería.
- Si todas las duraciones de registros OPERATIVO aportan a HRS OPERATIVAS o existen exclusiones.
- Cómo se forma N° PERNOS y si incluye exactamente los mismos tipos de perno que suma la API.
- Qué identifica EQUIPO frente a COD_EQUIPO y cómo corresponde a equipo/n_equipo de la aplicación.
- Cómo se calcula SEMANA en el Excel: la pantalla utiliza semana ISO y el modelo importa SEMANA como texto.

Se necesitan las fórmulas o reglas del Excel y una muestra comparable de registros para cerrar estas equivalencias. No se encontró un Excel dentro de la carpeta de exportación proporcionada. No se accedió a la ruta de red del origen.

## Observaciones del propio PB

- `Objetivo Año` es una constante de 201506; los objetivos mensuales están escritos en la medida y suman esa cifra. No están parametrizados por año.
- `ObjetivoSemana` busca por Semana y usa `MAX(Total de pernos) × 7`; no filtra expresamente por año. Es necesario verificar el significado y el contenido de esa tabla antes de trasladarlo a otros años o a semanas parciales.
- OBJETIVOS tiene su propio calendario automático. No aparece una relación directa con BD_EMPERNADOR; la medida semanal realiza su búsqueda explícita.
- `FinDT` forma fecha + hora final sin sumar un día al cruzar medianoche. Para un registro 23:00–01:00 con una sola fecha, `DuracionMin` resultaría negativa. Afecta esas columnas y el Gantt del PB; no prueba que la columna importada HORAS esté mal.
- La consulta `Errores en BD_EMPERNADOR` conserva filas con errores de tipo. Su existencia no demuestra que existan errores en los datos actuales.
- El Layout entregado y el TMDL tienen referencias que no coinciden: por ejemplo `DAX.Disponibilidad` frente a `DISPONIBILIDAD.Disponibilidad`, `DAX.HorasGeneral` frente a `DAX[Horas General]`, y `Tabla.EquiposUtilizados` frente a `YTD.EquiposUtilizados`. Esto sugiere versiones diferentes del reporte; conviene usar el reporte exportado junto a este modelo como referencia definitiva para filtros y enlaces a medidas.

## Orden recomendado

1. Confirmar el mapeo de columnas importadas a registros de la API.
2. Unificar disponibilidad/utilización con las sumas de horas e implementar rendimiento en pernos/hora.
3. Eliminar los denominadores ficticios y la repetición de horómetros.
4. Corregir agrupaciones por guardia, rankings consolidados y Pareto por observación.
5. Recalcular medidores MTBF/MTTR con razones globales y reproducir los promedios de YTD.
6. Verificar una fecha, un equipo y un turno contra ambos sistemas con los mismos filtros antes de extender la comparación al mes completo.
