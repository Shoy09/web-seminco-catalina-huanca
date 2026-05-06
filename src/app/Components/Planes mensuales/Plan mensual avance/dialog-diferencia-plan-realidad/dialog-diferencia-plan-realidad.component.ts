import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { PlanMensual } from '../../../../models/plan-mensual.model';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-diferencia-plan-realidad',
  imports: [MatDialogContent, MatDialogActions, MatProgressBarModule, MatButtonModule, CommonModule],
  templateUrl: './dialog-diferencia-plan-realidad.component.html',
  styleUrls: ['./dialog-diferencia-plan-realidad.component.css']
})
export class DialogDiferenciaPlanRealidadComponent implements OnInit {

  labor: string = '';
  sumaAvanceProgramado: number = 0;
  faltanteAvance: number = 0;
  mes: string = '';
  anio: number | undefined;

  constructor(
    public dialogRef: MatDialogRef<DialogDiferenciaPlanRealidadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PlanMensual & { mes: string; anio: number },
  ) {
    const tipo = data.tipo_labor || '';
    const labor = data.labor || '';
    const ala = data.ala || '';
    this.labor = [tipo, labor, ala].filter(v => v && v.trim() !== '').join(' ');
    this.mes = data.mes || '';
    this.anio = data.anio;
  }

  ngOnInit(): void {
  }


  cerrar(): void {
    this.dialogRef.close();
  }
}
