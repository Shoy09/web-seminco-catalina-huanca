import { Component } from '@angular/core';
import { MenuComponent } from "../menu/menu.component";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [MenuComponent, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {

}
