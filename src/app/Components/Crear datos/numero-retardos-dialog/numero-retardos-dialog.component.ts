import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ExplosivosUniService } from '../../../services/explosivos-uni.service';

export interface NumeroRetardosDialogData {
  editando: boolean;
  dato?: any; // registro a editar
}

@Component({
  selector: 'app-numero-retardos-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './numero-retardos-dialog.component.html',
})
export class NumeroRetardosDialogComponent implements OnInit {
  form: FormGroup;
  cargando = false;

  private retardos: any[] = [];
  tiposDisponibles: string[] = [];
  longitudesFiltradas: number[] = [];

  get editando(): boolean { return this.data?.editando ?? false; }

  constructor(
    private fb: FormBuilder,
    private explosivosUniService: ExplosivosUniService,
    public dialogRef: MatDialogRef<NumeroRetardosDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NumeroRetardosDialogData,
  ) {
    const d = data?.dato;
    this.form = this.fb.group({
      codigo:      [d?.codigo      ?? '', Validators.required],
      tipo:        [d?.tipo        ?? '', Validators.required],
      longitud:    [{ value: d?.longitud ?? '', disabled: !d?.tipo }, Validators.required],
      enumeracion: [d?.enumeracion ?? '', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.cargarRetardos();
  }

  private cargarRetardos() {
    this.cargando = true;
    this.explosivosUniService.getExplosivos().subscribe({
      next: (data) => {
        this.retardos = data;
        this.tiposDisponibles = [...new Set(data.map((r: any) => r.tipo as string))];
        this.cargando = false;

        // Si estamos editando, precargamos las longitudes del tipo ya seleccionado
        const tipoActual = this.form.get('tipo')?.value;
        if (tipoActual) {
          this.longitudesFiltradas = this.retardos
            .filter(r => r.tipo === tipoActual)
            .map(r => r.dato);
          this.form.get('longitud')?.enable();
        }
      },
      error: (err) => {
        console.error('Error al cargar retardos:', err);
        this.cargando = false;
      },
    });
  }

  onTipoChange(tipo: string) {
    const longitudCtrl = this.form.get('longitud')!;
    longitudCtrl.setValue('');
    this.longitudesFiltradas = this.retardos
      .filter(r => r.tipo === tipo)
      .map(r => r.dato);
    longitudCtrl[this.longitudesFiltradas.length > 0 ? 'enable' : 'disable']();
  }

  guardar() {
    if (this.form.valid) {
      this.dialogRef.close({
        accion: this.editando ? 'editar' : 'crear',
        valores: this.form.getRawValue(),
      });
    }
  }

  cancelar() {
    this.dialogRef.close(null);
  }
}
