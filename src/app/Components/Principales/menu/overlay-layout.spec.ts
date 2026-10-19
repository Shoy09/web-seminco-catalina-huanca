import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { of } from 'rxjs';
import { MenuComponent } from './menu.component';
import { UsuarioService } from 'app/services/usuario.service';

@Component({ standalone: true, imports: [MatDialogModule], template: '<h2 mat-dialog-title>Prueba de diálogo</h2><mat-dialog-content>Contenido</mat-dialog-content>' })
class DialogoPrueba {}

@Component({ standalone: true, template: '<div style="width:120px;height:32px">Opciones</div>' })
class OpcionesPrueba {}

@Component({ standalone: true, imports: [MenuComponent], template: `
  <app-menu>
    <button id="overlay-anchor" style="position:fixed;left:400px;top:180px">Abrir opciones</button>
    <div class="app-content-overlay" id="inline-overlay" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none">
      <div style="width:300px;height:100px">Ventana de la página</div>
    </div>
  </app-menu>` })
class PantallaPrueba {}

describe('Área de contenido de los overlays', () => {
  let fixture: ComponentFixture<PantallaPrueba>;
  let menu: MenuComponent;
  let dialog: MatDialog;
  const esperarLayout = () => new Promise(resolve => setTimeout(resolve, 350));
  const offset = () => window.innerWidth >= 768 ? (menu.menuColapsado ? 84 : 280) : 0;
  const comprobar = (rect: DOMRect, margen = 0) => {
    expect(rect.left).toBeGreaterThanOrEqual(offset() + margen - 1);
    expect(rect.top).toBeGreaterThanOrEqual(64 + margen - 1);
    expect(rect.right).toBeLessThanOrEqual(document.documentElement.clientWidth + 1);
    expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight + 1);
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PantallaPrueba], providers: [
      provideRouter([]), provideNoopAnimations(),
      { provide: UsuarioService, useValue: { obtenerPerfil: () => of({ nombres: 'Usuario', apellidos: 'Prueba', rol: 'Administrador' }) } },
    ] }).compileComponents();
    fixture = TestBed.createComponent(PantallaPrueba); fixture.detectChanges();
    menu = fixture.debugElement.query(By.directive(MenuComponent)).componentInstance;
    menu.menuColapsado = false; fixture.detectChanges();
    dialog = TestBed.inject(MatDialog);
    await esperarLayout();
  });
  afterEach(() => { dialog.closeAll(); fixture.destroy(); });

  it('centra y limita un diálogo grande dentro del contenido con menú abierto', async () => {
    const ref = dialog.open(DialogoPrueba, { width: '1800px', maxWidth: '100vw' });
    await esperarLayout();
    const pane = document.querySelector<HTMLElement>('.cdk-overlay-pane')!;
    const wrapper = pane.parentElement!;
    comprobar(wrapper.getBoundingClientRect());
    comprobar(pane.getBoundingClientRect());
    const surface = pane.querySelector<HTMLElement>('.mat-mdc-dialog-surface')!.getBoundingClientRect();
    expect(surface.width).toBeCloseTo(pane.getBoundingClientRect().width, 0);
    expect(surface.left).toBeCloseTo(pane.getBoundingClientRect().left, 0);
    const fondo = document.querySelector<HTMLElement>('.cdk-overlay-backdrop')!.getBoundingClientRect();
    expect(fondo.left).toBeCloseTo(offset(), 0);
    expect(fondo.top).toBe(64);
    ref.close();
  });

  it('reubica un diálogo abierto y la ventana de la página al contraer el menú', async () => {
    dialog.open(DialogoPrueba, { width: '300px' }); await esperarLayout();
    menu.colapsarMenu(); fixture.detectChanges(); await esperarLayout();
    const wrapper = document.querySelector<HTMLElement>('.cdk-global-overlay-wrapper')!.getBoundingClientRect();
    expect(wrapper.left).toBeCloseTo(offset(), 0);
    const inline = fixture.nativeElement.querySelector('#inline-overlay').getBoundingClientRect();
    expect(inline.left).toBeCloseTo(offset(), 0);
    comprobar(inline);
    const pane = document.querySelector<HTMLElement>('.cdk-overlay-pane')!.getBoundingClientRect();
    expect(pane.left + pane.width / 2).toBeCloseTo(wrapper.left + wrapper.width / 2, 0);
    const surface = document.querySelector<HTMLElement>('.mat-mdc-dialog-surface')!.getBoundingClientRect();
    expect(surface.left + surface.width / 2).toBeCloseTo(wrapper.left + wrapper.width / 2, 0);
  });

  it('conserva las coordenadas de los desplegables junto a su control', async () => {
    const anchor = fixture.nativeElement.querySelector('#overlay-anchor') as HTMLElement;
    const overlay = TestBed.inject(Overlay);
    const ref = overlay.create({ positionStrategy: overlay.position().flexibleConnectedTo(anchor).withPositions([
      { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
    ]) });
    try {
      ref.attach(new ComponentPortal(OpcionesPrueba)); await esperarLayout();
      expect(ref.overlayElement.getBoundingClientRect().left).toBeCloseTo(anchor.getBoundingClientRect().left, 0);
    } finally { ref.dispose(); }
  });

  it('restaura el ancho completo al salir de la pantalla con menú', async () => {
    fixture.destroy(); fixture.nativeElement.remove(); await esperarLayout();
    dialog.open(DialogoPrueba, { width: '300px' }); await esperarLayout();
    const wrapper = document.querySelector<HTMLElement>('.cdk-global-overlay-wrapper')!.getBoundingClientRect();
    expect(wrapper.left).toBe(0);
    expect(wrapper.top).toBe(0);
  });

  it('usa el ancho disponible completo en móvil aunque el menú esté expandido', async () => {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:390px;height:700px;border:0;position:fixed;left:0;top:0';
    document.body.appendChild(iframe);
    try {
      const css = Array.from(document.styleSheets).map(sheet => {
        try { return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n'); }
        catch { return ''; }
      }).join('\n');
      const doc = iframe.contentDocument!;
      doc.open();
      doc.write(`<html><head><style>${css}</style></head><body>
        <app-menu><div class="layout-shell"><div id="mobile-overlay" class="app-content-overlay" style="position:fixed;inset:0"></div></div></app-menu>
        <div class="cdk-overlay-container"><div class="cdk-overlay-backdrop"></div><div class="cdk-global-overlay-wrapper"><div class="cdk-overlay-pane"><div class="mat-mdc-dialog-container"></div></div></div></div>
      </body></html>`);
      doc.close(); await esperarLayout();
      const ventana = doc.querySelector<HTMLElement>('#mobile-overlay')!.getBoundingClientRect();
      const material = doc.querySelector<HTMLElement>('.cdk-global-overlay-wrapper')!.getBoundingClientRect();
      expect(ventana.left).toBe(0);
      expect(ventana.width).toBe(doc.documentElement.clientWidth);
      expect(ventana.top).toBe(64);
      expect(material.left).toBe(0);
      expect(material.width).toBe(doc.documentElement.clientWidth);
    } finally { iframe.remove(); }
  });

  it('mantiene el cierre de sesión visible al abrir submenús en teléfonos y horizontal', async () => {
    menu.menuColapsado = true;
    menu.toggleMenuMovil();
    menu.menuOpenIndex = 0;
    fixture.detectChanges();
    expect(menu.sidebarCompacto).toBeFalse();
    const css = Array.from(document.styleSheets).map(sheet => {
      try { return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n'); }
      catch { return ''; }
    }).join('\n');
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    try {
      for (const [width, height] of [[390, 600], [320, 480], [667, 320]]) {
        iframe.style.cssText = `width:${width}px;height:${height}px;border:0;position:fixed;left:0;top:0`;
        const doc = iframe.contentDocument!;
        doc.open();
        doc.write(`<html><head><style>${css}</style></head><body>${fixture.nativeElement.outerHTML}</body></html>`);
        doc.close(); await esperarLayout();
        const sidebar = doc.querySelector<HTMLElement>('.app-sidebar')!;
        const nav = doc.querySelector<HTMLElement>('.sidebar-nav')!;
        const logout = doc.querySelector<HTMLElement>('.logout-button')!;
        const close = doc.querySelector<HTMLElement>('.sidebar-close')!;
        const rect = logout.getBoundingClientRect();
        expect(sidebar.getBoundingClientRect().height).toBe(height);
        expect(rect.bottom).toBeLessThanOrEqual(height);
        expect(rect.top).toBeGreaterThanOrEqual(0);
        expect(logout.textContent).toContain('Cerrar sesión');
        expect(getComputedStyle(close).display).not.toBe('none');
        expect(nav.scrollHeight).toBeGreaterThan(nav.clientHeight);
        const before = rect.top;
        nav.scrollTop = nav.scrollHeight;
        expect(logout.getBoundingClientRect().top).toBe(before);
      }
    } finally { iframe.remove(); }
  });

  it('abre los grupos completos en móvil aunque el menú de escritorio estuviera contraído', () => {
    menu.menuColapsado = true;
    menu.toggleMenuMovil();
    menu.onMenuPrincipalClick(0, menu.menus[0]);
    fixture.detectChanges();
    expect(menu.menuOpenIndex).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('.nav-children a').length).toBeGreaterThan(1);
    fixture.nativeElement.querySelector('.sidebar-close').click();
    fixture.detectChanges();
    expect(menu.menuMovilAbierto).toBeFalse();
    expect(menu.sidebarCompacto).toBeTrue();
  });

  it('muestra el menú móvil por encima de un diálogo y lo recupera al cerrar el menú', async () => {
    dialog.open(DialogoPrueba, { width: '340px', height: '500px' });
    menu.toggleMenuMovil(); fixture.detectChanges(); await esperarLayout();
    const css = Array.from(document.styleSheets).map(sheet => {
      try { return Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n'); }
      catch { return ''; }
    }).join('\n');
    const overlayHtml = document.querySelector('.cdk-overlay-container')!.outerHTML;
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:390px;height:700px;border:0;position:fixed;left:0;top:0;z-index:2000';
    document.body.appendChild(iframe);
    try {
      const doc = iframe.contentDocument!;
      doc.open();
      doc.write(`<html><head><style>${css}</style></head><body>${fixture.nativeElement.outerHTML}${overlayHtml}</body></html>`);
      doc.close(); await esperarLayout();
      expect(doc.elementFromPoint(100, 200)?.closest('.app-sidebar')).not.toBeNull();
      expect(doc.elementFromPoint(350, 200)?.classList.contains('sidebar-backdrop')).toBeTrue();
      const customOverlay = doc.createElement('div');
      customOverlay.className = 'app-content-overlay';
      customOverlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:white';
      doc.body.appendChild(customOverlay);
      expect(doc.elementFromPoint(100, 200)?.closest('.app-sidebar')).not.toBeNull();
      expect(doc.elementFromPoint(350, 200)?.classList.contains('sidebar-backdrop')).toBeTrue();
      customOverlay.remove();
      doc.querySelector('.layout-shell')!.classList.remove('sidebar-mobile-open');
      doc.querySelector('.app-sidebar')!.classList.remove('is-mobile-open');
      doc.querySelector('.sidebar-backdrop')!.remove();
      await esperarLayout();
      expect(doc.elementFromPoint(100, 200)?.closest('.mat-mdc-dialog-container')).not.toBeNull();
      expect(doc.querySelectorAll('.mat-mdc-dialog-container').length).toBe(1);
    } finally { iframe.remove(); }
  });
});
