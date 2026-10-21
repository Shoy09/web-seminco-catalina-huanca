import { MatDialog } from '@angular/material/dialog';
import { TablaComponent } from './tabla.component';

describe('Registros Scissor', () => {
  it('conserva IDs y horas pendientes al editar o eliminar otro registro', () => {
    const component = new TablaComponent({} as MatDialog);
    const operacion = { labor: 'BP_2850', destino: 'BP_3754_W', ducto: '12', cable: '23', tuberia: '2', tipo_labor: 'BREASTING', tipo_labor_id: 105 };
    component.data = [
      { id: 1, numero: 1, estado: 'DEMORA', codigo: '306', hora_inicio: '06:30', hora_final: '06:45' },
      { id: 2, numero: 2, estado: 'OPERATIVO', codigo: '101', hora_inicio: '06:45', hora_final: null, operacion }
    ];
    component.mapearDatos();
    component.datos = component.datos.slice(1);
    component.onExecute(component.datos[0]);
    spyOn(component.dataChange, 'emit');
    component.onGuardarPerforacion({ ...operacion, cable: '24' });
    expect(component.dataChange.emit).toHaveBeenCalledWith([
      { ...component.data[1], operacion: { ...operacion, cable: '24' } }
    ]);
    expect(operacion.cable).toBe('23');
  });
});
