import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PresentacionMmtoComponent } from '../../shared/presentacion-mmto/presentacion-mmto.component';
export type { PresentacionMmtoData as PresentacionMmtoEmpernadorData } from '../../shared/presentacion-mmto/presentacion-mmto.component';

@Component({
  selector: 'app-presentacion-mmto-empernador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: '../../shared/presentacion-mmto/presentacion-mmto.component.html',
  styleUrls: ['../../shared/presentacion-guardia-responsive.css', '../../shared/presentacion-mmto/presentacion-mmto.component.css'],
})
export class PresentacionMmtoEmpernadorComponent extends PresentacionMmtoComponent {}
