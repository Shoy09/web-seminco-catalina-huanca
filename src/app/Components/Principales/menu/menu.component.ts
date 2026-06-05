import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { PanelMenuModule } from 'primeng/panelmenu';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenuModule,
    RippleModule,
    PanelMenuModule,
    TooltipModule,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent {
  userMenuItems: MenuItem[] = [
    {
      label: 'Editar perfil',
      icon: 'pi pi-user-edit',
      command: () => {
        this.router.navigate(['/perfil']);
      },
    },
    {
      separator: true,
    },
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      styleClass: 'text-danger',
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
        {
          label: 'Perforación Tal. Largo',
          routerLink: ['/dashboard/grafico-tal-largo'],
        },
        {
          label: 'Perforación Horizontal',
          routerLink: ['/dashboard/grafico-horizontal'],
        },
        {
          label: 'Perforación Sostenimiento',
          routerLink: ['/dashboard/grafico-sostenimiento'],
        },
        { label: 'Carguío', routerLink: ['/dashboard/grafico-scoops'] },
        { label: 'Acarreo', routerLink: ['/dashboard/grafico-acarreo'] },
        { label: 'Explosivos', routerLink: ['/dashboard/explosivos-graficos'] },
        {
          label: 'Línea de tiempo',
          routerLink: ['/dashboard/linea-de-tiempo'],
        },
      ],
    },
    {
      label: 'Validaciones',
      icon: 'pi pi-check-circle',
      items: [{ label: 'Mina', routerLink: ['/validaciones/jefe-mina'] }],
    },
    {
      label: 'Planes',
      icon: 'pi pi-calendar',
      items: [
        { label: 'Plan de Avance', routerLink: ['/planes/plan-avance'] },
        { label: 'Plan de Metraje', routerLink: ['/planes/plan-metraje'] },
        {
          label: 'Plan de Producción',
          routerLink: ['/planes/plan-produccion'],
        },
      ],
    },
    {
      label: 'Carga de Datos',
      icon: 'pi pi-database',
      items: [
        { label: 'Estados', routerLink: ['/carga/estados'] },
        { label: 'Crear Data', routerLink: ['/carga/crear-data'] },
        { label: 'Checklist', routerLink: ['/carga/checklist'] },
        {
          label: 'Checklist Carguío',
          routerLink: ['/carga/checklist-telemando'],
        },
        { label: 'Explosivos', routerLink: ['/carga/explosivos'] },
      ],
    },
    {
      label: 'Roles',
      icon: 'pi pi-users',
      items: [{ label: 'Usuarios', routerLink: ['/roles/usuarios'] }],
    },
  ];

  menuOpenIndex: number | null = null;
  menuColapsado = false;
  menuMovilAbierto = false;

  constructor(private router: Router) {}
  ngOnInit(): void {}

  isMenuPadreActivo(menu: any): boolean {
    if (!menu?.items?.length) return false;

    return menu.items.some((subItem: any) => {
      if (!subItem.routerLink) return false;

      const urlTree = this.router.createUrlTree(
        Array.isArray(subItem.routerLink)
          ? subItem.routerLink
          : [subItem.routerLink],
      );

      return this.router.isActive(urlTree, {
        paths: 'exact',
        queryParams: 'ignored',
        fragment: 'ignored',
        matrixParams: 'ignored',
      });
    });
  }

  toggleMenuMovil(): void {
    this.menuMovilAbierto = !this.menuMovilAbierto;
  }

  onMenuPrincipalClick(index: number, menu: any): void {
    // Si el menú está colapsado, ir al primer subitem
    if (this.menuColapsado) {
      const primerSubItem = menu.items?.[0];

      if (primerSubItem?.routerLink) {
        this.router.navigate(primerSubItem.routerLink);
      }

      return;
    }

    // Si NO está colapsado, solo abre/cierra submenu
    this.toggleMenu(index);
  }

  cerrarMenuMovil(): void {
    this.menuMovilAbierto = false;
  }

  colapsarMenu() {
    this.menuColapsado = !this.menuColapsado;
  }
  toggleMenu(index: number) {
    // Si el menú ya está abierto, lo cierra. Si no, abre el seleccionado.
    if (this.menuOpenIndex === index) {
      this.menuOpenIndex = null;
    } else {
      this.menuOpenIndex = index;
    }
  }
  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  private isMobile(): boolean {
    return window.innerWidth < 768; // md breakpoint de Tailwind
  }
}
