import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface EquipoJEFE {
  nombre: string;
  ruta: string;
  icono?: string;
  color?: string;
}

@Component({
  selector: 'app-equipos-menu',
  imports: [CommonModule ],
  templateUrl: './equipos-menu.component.html',
  styleUrl: './equipos-menu.component.css'
})
export class EquiposMenuComponent {
  equipos: EquipoJEFE[] = [
    { 
      nombre: 'PERFORACIÓN TALADROS LARGOS', 
      ruta: '/Dashboard/jefe-mina/tal-largo',
      icono: 'fas fa-hard-hat',
      color: '#3498db'
    },
    { 
      nombre: 'PERFORACIÓN HORIZONTAL', 
      ruta: '/Dashboard/jefe-mina/tal-horizontal',
      icono: 'fas fa-tachometer-alt',
      color: '#2ecc71'
    },
    { 
      nombre: 'EMPERNADOR', 
      ruta: '/Dashboard/jefe-mina/empernador',
      icono: 'fas fa-wrench',
      color: '#e74c3c'
    },
    { 
      nombre: 'SCISSOR', 
      ruta: '/Dashboard/jefe-mina/scissor',
      icono: 'fas fa-cut',
      color: '#f39c12'
    },
    // { 
    //   nombre: 'SCALAMIN', 
    //   ruta: '/Dashboard/jefe-mina/scalamin',
    //   icono: 'fas fa-chart-line',
    //   color: '#9b59b6'
    // },
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
      icono: 'fas fa-tractor',
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