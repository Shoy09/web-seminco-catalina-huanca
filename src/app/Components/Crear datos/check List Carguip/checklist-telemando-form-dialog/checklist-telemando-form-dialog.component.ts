import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChecklistTelemandoService } from '../../../../services/checklist-telemando.service';
import { ChecklistTelemando } from '../../../../models/checklist-telemando.model';

@Component({
  selector: 'app-checklist-telemando-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './checklist-telemando-form-dialog.component.html',
  styleUrls: ['./checklist-telemando-form-dialog.component.css']
})
export class ChecklistTelemandoFormDialogComponent implements OnInit {
  form: FormGroup;
  modo: 'crear' | 'editar';
  titulo: string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ChecklistTelemandoFormDialogComponent>,
    private checklistService: ChecklistTelemandoService,
    @Inject(MAT_DIALOG_DATA) public data: { modo: 'crear' | 'editar', checklist?: ChecklistTelemando }
  ) {
    this.modo = data.modo;
    this.titulo = data.modo === 'crear' ? 'Crear Checklist de Telemando' : 'Editar Checklist de Telemando';
    
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    if (this.modo === 'editar' && this.data.checklist) {
      this.form.patchValue({
        nombre: this.data.checklist.nombre
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const checklistData: ChecklistTelemando = {
      id: this.modo === 'editar' ? this.data.checklist!.id : 0,
      nombre: this.form.value.nombre.trim()
    };

    if (this.modo === 'crear') {
      this.checklistService.createChecklist(checklistData).subscribe({
        next: (response) => {
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('Error al crear checklist:', error);
          // Aquí podrías mostrar un mensaje de error
        }
      });
    } else {
      this.checklistService.updateChecklist(this.data.checklist!.id, checklistData).subscribe({
        next: (response) => {
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('Error al actualizar checklist:', error);
          // Aquí podrías mostrar un mensaje de error
        }
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  // Getters para validaciones
  get nombre() { return this.form.get('nombre'); }
  get nombreInvalido() { return this.nombre?.invalid && this.nombre?.touched; }
}