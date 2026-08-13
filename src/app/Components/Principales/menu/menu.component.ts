import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenuModule,
    RippleModule,
    TooltipModule,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent {
  rolUsuario: string = '';

  userMenuItems: MenuItem[] = [
    {
      label: 'Editar perfil',
      icon: 'pi pi-user-edit',
      command: () => {
        this.router.navigate(['/Dashboard/perfil']);
      },
    },
    { separator: true },
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      command: () => {
        this.cerrarSesion();
      },
    },
  ];

  menus: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-chart-bar',
      items: [
        { label: 'Perforación Tal. Largo',   routerLink: ['/Dashboard/grafico-tal-largo'] },
        { label: 'Perforación Horizontal',    routerLink: ['/Dashboard/grafico-horizontal'] },
        { label: 'Perforación Sostenimiento', routerLink: ['/Dashboard/grafico-sostenimiento'] },
        { label: 'Carguío',                   routerLink: ['/Dashboard/grafico-scoops'] },
        { label: 'Acarreo',                   routerLink: ['/Dashboard/grafico-acarreo'] },
        { label: 'Explosivos',                routerLink: ['/Dashboard/explosivos-graficos'] },
        { label: 'Línea de tiempo',           routerLink: ['/Dashboard/linea-de-tiempo'] },
      ],
    },
    {
      label: 'Validaciones',
      icon: 'pi pi-check-circle',
      items: [
        { label: 'Mina', routerLink: ['/Dashboard/jefe-mina'] },
      ],
    },
    {
      label: 'Planes',
      icon: 'pi pi-calendar',
      items: [
        { label: 'Plan de Avance',    routerLink: ['/Dashboard/plan-avance'] },
        { label: 'Plan de Metraje',   routerLink: ['/Dashboard/plan-metraje'] },
        { label: 'Plan de Producción',routerLink: ['/Dashboard/plan-produccion'] },
      ],
    },
    {
      label: 'Carga de Datos',
      icon: 'pi pi-database',
      items: [
        { label: 'Estados',           routerLink: ['/Dashboard/estados'] },
        { label: 'Crear Data',        routerLink: ['/Dashboard/crear-data'] },
        { label: 'Checklist',         routerLink: ['/Dashboard/checklist'] },
        { label: 'Checklist Carguío', routerLink: ['/Dashboard/checklist-telemando'] },
        { label: 'Explosivos',        routerLink: ['/Dashboard/explosivos'] },
      ],
    },
    {
      label: 'Roles',
      icon: 'pi pi-users',
      items: [
        { label: 'Usuarios', routerLink: ['/Dashboard/usuarios'] },
        { label: 'Perfil',   routerLink: ['/Dashboard/perfil'] },
      ],
    },
    {
      label: 'Notificaciones',
      icon: 'pi pi-envelope',
      items: [
        { label: 'Enviar correo', routerLink: ['/Dashboard/notificaciones-email'] },
      ],
    },
  ];

  menuOpenIndex: number | null = null;
  menuColapsado = false;
  menuMovilAbierto = false;
  mostrarCerrarSesion = false;

  constructor(private router: Router) {
    this.rolUsuario = localStorage.getItem('rol') || '';
  }

  isMenuPadreActivo(menu: any): boolean {
    if (!menu?.items?.length) return false;
    return menu.items.some((subItem: any) => {
      if (!subItem.routerLink) return false;
      const urlTree = this.router.createUrlTree(
        Array.isArray(subItem.routerLink) ? subItem.routerLink : [subItem.routerLink]
      );
      return this.router.isActive(urlTree, {
        paths: 'exact',
        queryParams: 'ignored',
        fragment: 'ignored',
        matrixParams: 'ignored',
      });
    });
  }

  onMenuPrincipalClick(index: number, menu: any): void {
    if (this.menuColapsado) {
      const primerSubItem = menu.items?.[0];
      if (primerSubItem?.routerLink) {
        this.router.navigate(primerSubItem.routerLink);
      }
      return;
    }
    this.menuOpenIndex = this.menuOpenIndex === index ? null : index;
  }

  toggleMenuMovil(): void {
    this.menuMovilAbierto = !this.menuMovilAbierto;
  }

  cerrarMenuMovil(): void {
    this.menuMovilAbierto = false;
  }

  colapsarMenu(): void {
    this.menuColapsado = !this.menuColapsado;
  }

  cerrarSesion(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
