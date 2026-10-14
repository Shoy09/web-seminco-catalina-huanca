import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PresentacionMmtoComponent } from '../../shared/presentacion-mmto/presentacion-mmto.component';
export type { PresentacionMmtoData as PresentacionMmtoTlData } from '../../shared/presentacion-mmto/presentacion-mmto.component';

@Component({
  selector: 'app-presentacion-mmto-tl',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: '../../shared/presentacion-mmto/presentacion-mmto.component.html',
  styleUrls: ['../../shared/presentacion-guardia-responsive.css', '../../shared/presentacion-mmto/presentacion-mmto.component.css'],
})
export class PresentacionMmtoTlComponent extends PresentacionMmtoComponent {}
