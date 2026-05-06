import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { PlanMensual } from '../../../../models/plan-mensual.model';

@Component({
  selector: 'app-dialog-diferencia-plan-realidad',
  imports: [MatDialogContent, MatDialogActions],
  templateUrl: './dialog-diferencia-plan-realidad.component.html',
  styleUrls: ['./dialog-diferencia-plan-realidad.component.css']
})
export class DialogDiferenciaPlanRealidadComponent implements OnInit {

  tipoLabor: string = '';
  labor: string = '';
  ala: string = '';

  constructor(
    public dialogRef: MatDialogRef<DialogDiferenciaPlanRealidadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PlanMensual & {  },
  ) {
    this.tipoLabor = data.tipo_labor || '';
    this.labor = data.labor || '';
    this.ala = data.ala || '';
  }

  ngOnInit(): void {
  }


  procesarExploraciones(): void {

  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
