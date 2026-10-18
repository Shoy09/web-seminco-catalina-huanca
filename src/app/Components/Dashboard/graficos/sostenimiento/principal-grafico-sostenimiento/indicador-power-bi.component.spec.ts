import { SimpleChange } from '@angular/core';
import { IndicadorPowerBiComponent } from './indicador-power-bi.component';
import { IndicadorGrafico } from './sostenimiento-indicadores.model';

describe('Presentación de indicadores de sostenimiento', () => {
  function crear(grafico: IndicadorGrafico): IndicadorPowerBiComponent {
    const componente = new IndicadorPowerBiComponent();
    componente.grafico = grafico;
    componente.ngOnChanges({ grafico: new SimpleChange(undefined, grafico, true) });
    return componente;
  }

  it('ordena rankings sin desalinear categorías ni series y conserva los ceros', () => {
    const grafico: IndicadorGrafico = { titulo: 'Utilización por operador', tipo: 'bar', unidad: '%', categorias: ['Ana', 'Luis', 'Eva'],
      series: [{ nombre: 'Uso', valores: [40, 90, 0] }, { nombre: 'Otra', valores: [4, 9, 0] }] };
    const c = crear(grafico);
    expect(c.opciones.yAxis.data).toEqual(['Luis', 'Ana', 'Eva']);
    expect(c.opciones.series[0].data).toEqual([90, 40, 0]);
    expect(c.opciones.series[1].data).toEqual([9, 4, 0]);
    expect(c.opciones.series[0].label.position).toBe('right');
    expect(c.opciones.series[0].label.formatter({ value: 0 })).toBe('0');
    expect(grafico.categorias).toEqual(['Ana', 'Luis', 'Eva']);
  });

  it('muestra solo cantidades en las etiquetas de barras y líneas de Pareto', () => {
    const c = crear({ titulo: 'Mantenimiento', tipo: 'pareto', unidad: 'h', categorias: ['Motor'],
      series: [{ nombre: 'Horas', valores: [2] }, { nombre: 'Acumulado', tipo: 'line', valores: [100] }] });
    expect(c.opciones.series[0].label.formatter({ value: 2 })).toBe('2');
    expect(c.opciones.series[1].label.formatter({ value: 100 })).toBe('100');
  });

  it('amplía el lienzo para rankings largos y muestra horas nocturnas sobre los puntos', () => {
    const c = crear({ titulo: 'Ranking', tipo: 'bar', categorias: Array.from({ length: 20 }, (_, i) => String(i)), series: [{ nombre: 'Metros', valores: Array(20).fill(1) }] });
    expect(c.altoGrafico).toBeGreaterThan(460);
    const scatter = crear({ titulo: 'Análisis de turnos — noche', tipo: 'scatter', unidad: 'noche', categorias: ['EMP-01'], puntos: [{ x: 25.5, y: 'EMP-01', grupo: '2026-10-18' }] });
    expect(scatter.opciones.series[0].label.formatter({ value: [25.5, 'EMP-01'] })).toBe('01:30');
    expect(scatter.opciones.tooltip.formatter({ seriesName: '2026-10-18', value: [25.5, 'EMP-01'] })).toContain('Hora: 01:30');
  });
});
