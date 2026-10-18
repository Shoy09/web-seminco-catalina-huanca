# Indicadores de sostenimiento

El constructor usa las medidas del modelo `prueba de empernador.SemanticModel`, compartido el 18 de octubre de 2026. Los gráficos conservan etiquetas numéricas y los rankings se consolidan antes de ordenarse.

## Fórmulas

- Disponibilidad: `(SUM(horas) - SUM(mantenimiento)) / SUM(horas) × 100`.
- Utilización: `SUM(operativas) / (SUM(horas) - SUM(mantenimiento)) × 100`.
- Rendimiento: `SUM(pernos) / SUM(operativas)`, en pernos/hora. Los metros y horómetros son indicadores separados.
- MTBF: `(SUM(horas) - SUM(correctivo)) / (SUM(fallas) || 1)`.
- MTTR: `SUM(correctivo) / SUM(fallas)`; si no hay fallas devuelve cero.
- Los medidores globales recalculan la razón de sumas, sin promediar razones por equipo.
- Horas operativas promedio: agrupar por fecha, equipo y guardia, sumar horas operativas de cada grupo y promediar los grupos.
- Frentes promedio por guardia: contar registros de labor por fecha y guardia y promediar esos grupos. No se cuentan labores distintas.

No se imputan turnos de 10/12 horas ni mantenimiento ficticio. Las horas proceden de las duraciones de todos los registros cerrados. Se admiten cruces de medianoche y se omiten horas inválidas. Los registros abiertos no aportan horas. Los pernos registrados se conservan aunque no haya duración; la división entre cero devuelve cero, como DIVIDE en las medidas suministradas.

## Clasificación de columnas de la API

El TMDL importa desde Excel las columnas HRS MTTO, HRS OPERATIVAS, Hrs. Mtto. Correctivo y #FALLA sin sus fórmulas de origen. Para los registros actuales:

1. Se utiliza el catálogo de estados EMPERNADOR para reconocer familias de actividad.
2. Sin clasificación del catálogo, se utiliza el estado del registro: OPERATIVO, MANTENIMIENTO o DEMORA. Para separar demoras sin catálogo se conserva la clasificación por códigos del proyecto.
3. El mantenimiento correctivo se reconoce por código 303 o por la descripción del catálogo «correctivo»/«no programado». Un registro correctivo con duración positiva representa una falla. La equivalencia con el Excel debe validarse con sus reglas de #FALLA.
4. La inspección 206 no se descuenta automáticamente como mantenimiento: depende del catálogo.
5. Por equivalencia confirmada por el usuario, `seccion` de la API representa GUARDIA del PB. Se prioriza ese campo; `guardia` queda como respaldo para datos anteriores y, si ambos faltan, se muestra SIN_GUARDIA. El jefe de guardia no se utiliza como sustituto.
6. `n_equipo` identifica al equipo en los gráficos; si falta, se utiliza `equipo`.

La fórmula DAX está trasladada; la equivalencia exacta de las columnas importadas depende de que su clasificación en Excel coincida con la API. No se ha realizado una conciliación con registros reales de ese Excel.

## Pareto

- Disponibilidad por actividad: mantenimiento, horas totales, acumulación por ranking denso.
- Detalle de disponibilidad: mantenimiento no programado por observación; los empates se ordenan por nombre.
- Utilización por actividad: demoras operativas, Top 10; denominador con el total de esa familia y desempate por nombre con tolerancia de 1e-6.
- Detalle de utilización: demoras operativas y no operativas por observación, filtro mayor a una hora del Layout; acumulación por ranking denso.

No se dividen las horas de Pareto entre el número de equipos.

## Objetivos y otros detalles

Los objetivos diarios y mensuales se trasladaron de DAX.ObjetivoMes y DAX.ObjetivoDia. Son las constantes del modelo compartido y no una nueva planificación anual. El medidor de pernos usa el objetivo anual 201506 como escala mínima.

No se calcula ObjetivoSemana: requiere los registros de la tabla OBJETIVOS que el TMDL referencia en Excel pero no contiene. Tampoco se infieren metas porcentuales ni combustible sin los datos correspondientes.

Los horómetros se suman una vez por operación, admitiendo objetos y cadenas JSON. Los metros conservan decimales. La agrupación semanal de la API sigue la semana ISO existente; SEMANA en el PB es una columna importada y requiere validar su correspondencia con el calendario del Excel.

El análisis de turnos mantiene los mismos códigos y franjas horarias del ejemplo existente. Las tablas operativas y presentaciones conservan sus métricas propias; no sustituyen los indicadores globales del constructor.
