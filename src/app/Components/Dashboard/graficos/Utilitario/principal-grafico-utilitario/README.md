# Dashboard de Utilitario

Ruta: `/Dashboard/grafico-utilitario`. Menú: Dashboard → Utilitario.

Se conserva el diseño de Scalamin y se utiliza `getAllAprobados('scissor')`, el catálogo de equipos y el de estados del proceso `SCISSOR`. La estructura de registros sigue `Jefe mina/aprobaciones/scissor`: horas de inicio/final, estado, código y detalle con origen, destino y observaciones. No se reutilizan campos de producción de Scalamin (área, metros).

## Referencias de Power BI

`06. Reporte_UTILITARIO_PBI_2026 V2.SemanticModel/definition/tables`:

- `DISPONIBILIDAD.tmdl`: (horas − mantenimiento) / horas.
- `UTILIZACION.tmdl`: horas operativas / (horas − mantenimiento).
- `DAX.tmdl`: MTBF = (horas − correctivo) / (fallas o 1); MTTR = correctivo / fallas, con alternativo 0.
- `YTD.tmdl`: promedio de horas operativas por fecha/equipo/guardia; promedio de registros con labor por fecha/equipo; equipos utilizados promediados por fecha/turno, excluyendo los códigos 308, 405, 408, 201 y 202.
- `BD_UTILITARIOS.tmdl`: semana lunes con `WEEKNUM(fecha, 2)` y año calendario, sin mezclar períodos de años distintos.

Se agrupan las horas antes de calcular razones; no se promedian porcentajes. Los divisores cero devuelven cero, como las medidas DAX. Los registros abiertos o inválidos y los intervalos de duración cero no aportan horas; se admite cruce de medianoche.

Disponibilidad y Utilización incluyen Pareto Top 10 por actividad. El acumulado usa el total de categorías, antes de recortar el Top 10. Las páginas Pareto incluyen todas las actividades y el detalle por observación. Se respetan empates densos en `ParetoND%` y `ParetoObservacion`; los otros dos acumulados ordenan empates por etiqueta.

## Correspondencias que requieren validación de negocio

Las columnas del Excel del PB (`HRS MTTO`, `Hrs. Mtto. Correctivo`, `#FALLAS`) no incluyen sus fórmulas de origen. Se derivan las horas usando el catálogo de estados. Se conserva el criterio del builder de sostenimiento: cada registro de mantenimiento correctivo válido cuenta como una falla; se reconoce el código 303 o una descripción de catálogo correctiva/no programada. No se cuentan preventivos como correctivos. Estas correspondencias necesitan validarse contra el Excel original para afirmar equivalencia exacta.

`LABOR` se corresponde con `origen_labor`; se cuenta una labor por registro, sin sumar también destino ni contar labores distintas. Se usa `n_equipo` como identificador de equipo para evitar fusionar equipos con el mismo nombre. La fecha es la fecha operativa del reporte, incluso en turnos nocturnos.

El reporte visual referencia `Tabla.EquiposUtilizados` y `DAX.HorasND2`, ausentes en el modelo suministrado. Se utilizan las medidas existentes `YTD.EquiposUtilizados` y horas de mantenimiento respectivamente. No se utiliza `RENDIMIENTO.Rendimiento`, porque referencia `BD_DESATADOR`, ajeno a este modelo.

## Datos no disponibles

No se inventan metas de disponibilidad/utilización ni consumo de combustible. `condiciones_equipo.combustible` es nivel de tanque (ej. «1/2», «LLENO»), no cantidad consumida. La página Ratio de combustible está oculta temporalmente mediante `mostrarCombustible = false`; no muestra un cero ficticio. Para activar sus gráficos se requiere consumo cuantificado con unidad y DHM por operación.

Gantt se retiró del dashboard de Utilitario.

Filtros por fecha inclusiva, turno y equipo, limpieza de filtros, reintentos, zoom, descarga de gráficos y Excel de los registros filtrados y sus indicadores por equipo.

## Validación

La compilación Angular con `ngc -p tsconfig.app.json --noEmit` pasó. La validación inicial pasó en Chrome Headless. Tras retirar Gantt quedan 12 pruebas (9 de cálculo y 3 de carga/filtros). Para repetirlas sin incluir los errores preexistentes de pruebas de otros módulos:

```sh
npm test -- --watch=false --browsers=ChromeHeadless --ts-config=tsconfig.utilitario.spec.json --include="src/app/Components/Dashboard/graficos/Utilitario/**/*.spec.ts"
```
