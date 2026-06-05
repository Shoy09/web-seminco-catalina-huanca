import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlanMensual } from '../../../../models/plan-mensual.model';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-dialog-diferencia-plan-realidad',
  imports: [CommonModule, ButtonModule, ProgressBarModule, TagModule],
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
