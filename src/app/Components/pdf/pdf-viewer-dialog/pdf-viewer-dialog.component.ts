import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SafeUrlPipe } from "../safe-url.pipe";

@Component({
  selector: 'app-pdf-viewer-dialog',
  imports: [MatDialogModule, MatIconModule, SafeUrlPipe],
  templateUrl: './pdf-viewer-dialog.component.html',
  styleUrl: './pdf-viewer-dialog.component.css'
})
export class PdfViewerDialogComponent {
constructor(@Inject(MAT_DIALOG_DATA) public data: { url: string }) {}
}
