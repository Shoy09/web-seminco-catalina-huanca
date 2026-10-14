import { categoriasChecklist, leerFilasChecklist } from './checklist-utils';

describe('Ingreso de checklist desde Excel', () => {
  it('acepta columnas en distinto orden y categorías con espacios o acentos', () => {
    const result = leerFilasChecklist([['Nombre', 'Categoría'], ['Revisar aceite', ' antes '], ['', '']], categoriasChecklist('SCALAMIN'));
    expect(result.errores).toEqual([]);
    expect(result.filas).toEqual([{ categoria: 'ANTES', nombre: 'Revisar aceite' }]);
  });
  it('no ignora columnas de equipos o proceso', () => {
    expect(leerFilasChecklist([['Categoria', 'Nombre', 'Equipo'], ['ANTES', 'Aceite', 1]], ['ANTES']).errores.length).toBe(1);
  });
  it('rechaza categorías incorrectas, nombres vacíos y duplicados en lugar de omitirlos', () => {
    const result = leerFilasChecklist([
      ['Categoria', 'Nombre'], ['ANTES', 'Aceite'], ['ANTES', ' aceite '], ['NO EXISTE', 'Filtros'], ['ANTES', ''],
    ], ['ANTES']);
    expect(result.filas.length).toBe(1);
    expect(result.errores.length).toBe(3);
  });
  it('rechaza encabezados duplicados y archivos vacíos', () => {
    expect(leerFilasChecklist([['Categoria', 'Nombre', 'Nombre']], ['ANTES']).errores.length).toBe(1);
    expect(leerFilasChecklist([['Categoria', 'Nombre']], ['ANTES']).errores.length).toBe(1);
  });
  it('usa las categorías de Scooptram y Dumper', () => {
    expect(categoriasChecklist('SCOOPTRAM')).toEqual(['ANTES', 'DESPUES', 'MPI']);
    expect(categoriasChecklist('DUMPER')).not.toContain('MPF');
  });
});
