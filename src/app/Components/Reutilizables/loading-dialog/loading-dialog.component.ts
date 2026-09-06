import { Component, Inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-dialog',
  imports: [MatProgressSpinnerModule, CommonModule],
  templateUrl: './loading-dialog.component.html',
  styleUrl: './loading-dialog.component.css'
})
export class LoadingDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: {
    total: number;
    current: number;
    mensaje?: string;
  }) {}
}