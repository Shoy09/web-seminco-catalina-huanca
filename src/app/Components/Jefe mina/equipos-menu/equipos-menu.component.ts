import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

interface EquipoJEFE {
  nombre: string;
  ruta: string;
  icono?: string;
  color?: string;
}

@Component({
  selector: 'app-equipos-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './equipos-menu.component.html',
  styleUrl: './equipos-menu.component.css'
})
export class EquiposMenuComponent {
  equipos: EquipoJEFE[] = [
    { 
      nombre: 'PERFORACIÓN TALADROS LARGOS', 
      ruta: '/Dashboard/jefe-mina/tal-largo',
      icono: 'pi pi-sliders-v',
      color: '#3498db'
    },
    { 
      nombre: 'PERFORACIÓN HORIZONTAL', 
      ruta: '/Dashboard/jefe-mina/tal-horizontal',
      icono: 'pi pi-arrows-h',
      color: '#2ecc71'
    },
    { 
      nombre: 'EMPERNADOR', 
      ruta: '/Dashboard/jefe-mina/empernador',
      icono: 'pi pi-wrench',
      color: '#e74c3c'
    },
    { 
      nombre: 'SCISSOR', 
      ruta: '/Dashboard/jefe-mina/scissor',
      icono: 'pi pi-sort-alt',
      color: '#f39c12'
    },
    { 
      nombre: 'SCALAMIN', 
      ruta: '/Dashboard/jefe-mina/scalamin',
      icono: 'pi pi-cog',
      color: '#9b59b6'
    },
    // { 
    //   nombre: 'ROMPEBANCOS', 
    //   ruta: '/Dashboard/jefe-mina/rompebancos',
    //   icono: 'fas fa-hammer',
    //   color: '#e67e22'
    // },
    // { 
    //   nombre: 'ANFOCHANGER', 
    //   ruta: '/Dashboard/jefe-mina/anfochanger',
    //   icono: 'fas fa-truck',
    //   color: '#1abc9c'
    // },
    { 
      nombre: 'SCOOPTRAM', 
      ruta: '/Dashboard/jefe-mina/scooptram',
      icono: 'pi pi-truck',
      color: '#34495e'
    },
    // { 
    //   nombre: 'DUMPER', 
    //   ruta: '/Dashboard/jefe-mina/dumper',
    //   icono: 'fas fa-dump-truck',
    //   color: '#7f8c8d'
    // }
  ];

  constructor(private router: Router) {}

  navigateToEquipo(ruta: string): void {
    this.router.navigate([ruta]);
  }
}
