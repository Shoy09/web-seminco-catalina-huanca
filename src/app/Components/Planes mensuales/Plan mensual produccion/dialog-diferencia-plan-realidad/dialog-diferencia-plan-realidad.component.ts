import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PlanProduccion } from '../../../../models/plan_produccion.model';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-dialog-diferencia-plan-realidad',
  imports: [CommonModule, ButtonModule, ProgressBarModule, TagModule],
  templateUrl: './dialog-diferencia-plan-realidad.component.html',
  styleUrls: ['./dialog-diferencia-plan-realidad.component.css'],
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
    @Inject(MAT_DIALOG_DATA)
    public data: PlanProduccion & { mes: string; anio: number },
  ) {
    this.tipoLabor = data.tipo_labor || '';
    this.labor = data.labor || '';
    this.ala = data.ala || '';
    this.toneladas_plan = data.cut_off_2 || 0;
    this.mes = data.mes || '';
    this.anio = data.anio;
  }

  ngOnInit(): void {}

  get laborCompleta(): string {
    return (
      [this.tipoLabor, this.labor, this.ala].filter((val) => val).join(' ') ||
      '-'
    );
  }

  procesarExploraciones(): void {}

  calcularToneladasRestantes(): void {}

  cerrar(): void {
    this.dialogRef.close();
  }
}
