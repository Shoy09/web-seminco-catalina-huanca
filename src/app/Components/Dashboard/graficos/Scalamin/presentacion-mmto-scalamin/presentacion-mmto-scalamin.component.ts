import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PresentacionMmtoComponent } from '../../shared/presentacion-mmto/presentacion-mmto.component';
export type { PresentacionMmtoData as PresentacionMmtoScalaminData } from '../../shared/presentacion-mmto/presentacion-mmto.component';

@Component({
  selector: 'app-presentacion-mmto-scalamin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: '../../shared/presentacion-mmto/presentacion-mmto.component.html',
  styleUrls: ['../../shared/presentacion-guardia-responsive.css', '../../shared/presentacion-mmto/presentacion-mmto.component.css'],
})
export class PresentacionMmtoScalaminComponent extends PresentacionMmtoComponent {}
