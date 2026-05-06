import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent {

  rolUsuario: string = '';

  // 🔥 MENÚ ORIGINAL (con nuevas rutas al final)
  menus = [
    {
      title: 'Dashboard',
      icon: 'das.svg',
      subItems: [
        { title: 'Perforacion Tal.Largo', path: 'grafico-tal-largo' },
         { title: 'Perforacion Horizontal', path: 'grafico-horizontal' },
        { title: 'Perforacion Sostenimiento', path: 'grafico-sostenimiento' },
        {title: 'Carguío', path: 'grafico-scoops'},
         { title: 'Explosivos', path: 'explosivos-graficos' },
        { title: 'Linea de tiempo', path: 'linea-de-tiempo' },
      ],
    },
    {
      title: 'Validaciones',
      icon: 'vota-si.svg',
      subItems: [
        {title: "Mina", path: 'jefe-mina'},
      ],
    },
    {
      title: 'Planes',
      icon: 'plan.svg',
      subItems: [
        { title: 'Plan de Avance', path: 'plan-avance' },
        { title: 'Plan de Metraje', path: 'plan-metraje' },
        { title: 'Plan de Producción', path: 'plan-produccion' },

      ],
    },
    {
      title: 'Carga de Datos',
      icon: 'data.svg',
      subItems: [
        { title: 'Estados', path: 'estados' },
        { title: 'Crear Data', path: 'crear-data' },
        { title: 'Checklist', path: 'checklist' },
        { title: 'Checklist Carguio', path: 'checklist-telemando' },
        { title: 'Explosivos', path: 'explosivos' },
      ],
    },
    {
      title: 'Roles',
      icon: 'usuario.png',
      subItems: [
        { title: 'Usuarios', path: 'usuarios' },
        { title: 'Perfil', path: 'perfil' },
      ],
    },

  ];

  menuOpenIndex: number | null = null;
  selectedSubItemIndex: number | null = null;
  selectedSubItem: string | null = null;

  mostrarCerrarSesion = false;
  menuColapsado = false;

  constructor(private router: Router) {

    // 🔥 Leer rol guardado en login
    this.rolUsuario = localStorage.getItem('rol') || '';

    // 🔥 Filtrar según rol
    this.filtrarMenusPorRol();

    if (this.router.url === '/' || this.router.url === '/Dashboard') {
      this.router.navigate(['/Dashboard/crear-data']);
    }
  }

  // 🔐 FILTRO POR ROL (solo afecta subItems con propiedad roles)
  filtrarMenusPorRol() {

    this.menus = this.menus.map(menu => {

      const subItemsFiltrados = menu.subItems.filter((subItem: any) => {

        // Si NO tiene roles → visible para todos
        if (!subItem.roles) return true;

        // Si tiene roles → validar
        return subItem.roles.includes(this.rolUsuario);
      });

      return {
        ...menu,
        subItems: subItemsFiltrados
      };

    });
  }

  AbrirCerrar(index: number, menu: any) {
    if (menu.title === 'Home') {
      this.router.navigate(['/Dashboard/crear-data']);
    } else if (this.menuColapsado) {
      if (menu.subItems && menu.subItems.length > 0) {
        const ruta = `/Dashboard/${menu.subItems[0].path}`;
        this.router.navigate([ruta]);
        this.selectedSubItemIndex = 0;
        this.selectedSubItem = menu.subItems[0].path;
      }
    } else {
      this.menuOpenIndex = this.menuOpenIndex === index ? null : index;
    }
  }

  selectSubItem(index: number, subItem: any) {
    this.selectedSubItemIndex = index;
    this.selectedSubItem = subItem.path;

    const ruta = `/Dashboard/${subItem.path}`;
    this.router.navigate([ruta]);
  }

  convertirRuta(subItem: string): string {
    return subItem.toLowerCase().replace(/ /g, '-');
  }

  toggleMenu() {
    this.menuColapsado = !this.menuColapsado;
  }

  toggleCerrarSesion() {
    this.mostrarCerrarSesion = !this.mostrarCerrarSesion;
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}