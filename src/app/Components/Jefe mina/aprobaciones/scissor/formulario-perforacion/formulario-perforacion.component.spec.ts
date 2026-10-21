import { FormularioPerforacionComponent } from './formulario-perforacion.component';

describe('Detalle de operaci?n Scissor', () => {
  it('carga y guarda el formato recibido sin perder el ID de tipo de labor', () => {
    const component = new FormularioPerforacionComponent();
    const operacion = { labor: 'BP_2850', destino: 'BP_3754_W', tipo_labor: 'BREASTING', tipo_labor_id: 105, ducto: '12', cable: '23', tuberia: '2', observaciones: '' };
    component.cargarDatosOperacion(operacion);
    expect(component.datosPerforacion).toEqual(operacion);
    spyOn(component.guardar, 'emit');
    component.datosPerforacion.cable = '24';
    component.guardarPerforacion();
    expect(component.guardar.emit).toHaveBeenCalledWith({ ...operacion, cable: '24' });
    expect(operacion.cable).toBe('23');
  });

  it('acepta JSON y limpia los campos al abrir un registro vac?o', () => {
    const component = new FormularioPerforacionComponent();
    component.cargarDatosOperacion(JSON.stringify({ labor: 'BP_2850', tipo_labor_id: 105 }));
    expect(component.datosPerforacion.labor).toBe('BP_2850');
    component.cargarDatosOperacion(null);
    expect(component.datosPerforacion.labor).toBe('');
    expect(component.datosPerforacion.tipo_labor_id).toBeUndefined();
  });
});
