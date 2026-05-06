import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { PlanProduccion } from '../../../../models/plan_produccion.model';
import { MatProgressBar } from "@angular/material/progress-bar";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dialog-diferencia-plan-realidad',
  imports: [MatDialogContent, MatDialogActions, MatButtonModule, MatProgressBar, CommonModule],
  templateUrl: './dialog-diferencia-plan-realidad.component.html',
  styleUrls: ['./dialog-diferencia-plan-realidad.component.css']
})
export class DialogDiferenciaPlanRealidadComponent implements OnInit {

  tipoLabor: string = '';
  labor: string = '';
  ala: string = '';
  toneladas_plan: number = 0;
  sumaToneladas: number = 0;
  faltanteToneladas: number = 0;
  mes: string = '';
  anio: number | undefined;

  constructor(
    public dialogRef: MatDialogRef<DialogDiferenciaPlanRealidadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PlanProduccion & {  mes: string; anio: number  },
  ) {
    this.tipoLabor = data.tipo_labor || '';
    this.labor = data.labor || '';
    this.ala = data.ala || '';
    this.toneladas_plan = data.cut_off_2 || 0;
    this.mes = data.mes || '';
    this.anio = data.anio;
  }

  ngOnInit(): void {
  }


get laborCompleta(): string {
  return [this.tipoLabor, this.labor, this.ala].filter(val => val).join(' ') || '-';
}


  procesarExploraciones(): void {

  
  }

  calcularToneladasRestantes(): void {

  }

  cerrar(): void {
    this.dialogRef.close();
  }
}