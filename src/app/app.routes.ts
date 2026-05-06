import { Routes } from '@angular/router';
import { LoginComponent } from './Components/Principales/login/login.component';
import { PrincipalComponent } from './Components/Principales/principal/principal.component';
import { HomeComponent } from './Components/Principales/home/home.component';
import { EstadosComponent } from './Components/Estado/estados/estados.component';
import { UsuariosComponent } from './Components/Usuario/usuarios/usuarios.component';
import { CrearDataComponent } from './Components/Crear datos/crear-data/crear-data.component';
import { PlanMensualListComponent } from './Components/Planes mensuales/Plan mensual avance/plan-mensual-list/plan-mensual-list.component';
import { PlanMetrajeListComponent } from './Components/Planes mensuales/Plan mensual metraje/plan-metraje-list/plan-metraje-list.component';
import { PlanProduccionListComponent } from './Components/Planes mensuales/Plan mensual produccion/plan-produccion-list/plan-produccion-list.component';
import { UsuarioComponent } from './Components/Usuario/usuario/usuario.component';
import { AutocadMineroComponent } from './Components/autocad-minero/autocad-minero.component';
import { CheckListListaComponent } from './Components/Crear datos/check list/check-list-lista/check-list-lista.component';
import { ChecklistTelemandoListaComponent } from './Components/Crear datos/check List Carguip/checklist-telemando-lista/checklist-telemando-lista.component';
import { OperacionesListComponent } from './Components/Jefe mina/Tal largo/operaciones-list/operaciones-list.component';
import { EquiposMenuComponent } from './Components/Jefe mina/equipos-menu/equipos-menu.component';
import { OperacionesListHorizontalComponent } from './Components/Jefe mina/Tal horizontal/operaciones-list/operaciones-list.component';
import { OperacionesListScooComponent } from './Components/Jefe mina/SCOOPTRAM/operaciones-list/operaciones-list.component';
import { OperacionesLisScissorComponent } from './Components/Jefe mina/SCISSOR/operaciones-list/operaciones-list.component';
import { OperacionesListScalaminComponent } from './Components/Jefe mina/SCALAMIN/operaciones-list/operaciones-list.component';
import { OperacionesListRompebancosComponent } from './Components/Jefe mina/ROMPEBANCOS/operaciones-list/operaciones-list.component';
import { OperacionesListEmpernadorComponent } from './Components/Jefe mina/Empernador/operaciones-list/operaciones-list.component';
import { OperacionesListDumperComponent } from './Components/Jefe mina/DUMPER/operaciones-list/operaciones-list.component';
import { OperacionesListAnfochaComponent } from './Components/Jefe mina/ANFOCHANGER/operaciones-list/operaciones-list.component';
import { PrincipalTalLargoComponent } from './Components/Jefe mina/aprobaciones/Tal largo/principal/principal.component';
import { PrincipalTalHorizontalComponent } from './Components/Jefe mina/aprobaciones/Tal horizontal/principal/principal.component';
import { PrincipalScoopsComponent } from './Components/Jefe mina/aprobaciones/Scoop/principal/principal.component';
import { PowerBiPublicComponent } from './Components/Dashboard/Pu-PowerBi/power-bi-public/power-bi-public.component';
import { PrincipalSostenimientoComponent } from './Components/Jefe mina/aprobaciones/enpernador/principal/principal.component';
import { PrincipalGraficoHorizontalComponent } from './Components/Dashboard/graficos/horizontal/principal-grafico-horizontal/principal-grafico-horizontal.component';
import { ExplosivosComponent } from './Components/Crear datos/explosivos/explosivos.component';
import { ExplosivosGraficosComponent } from './Components/Dashboard/Explosivos/explosivos-graficos/explosivos-graficos.component';
import { DashboardPruebaComponent } from './Components/Dashboard/sostenimiento/dashboard-prueba/dashboard-prueba.component';
import { PrincipalGraficoLargoComponent } from './Components/Dashboard/graficos/largo/principal-grafico-largo/principal-grafico-largo.component';
import { PrincipalGraficoSostenimientoComponent } from './Components/Dashboard/graficos/sostenimiento/principal-grafico-sostenimiento/principal-grafico-sostenimiento.component';
import { PrincipalGraficoScoopsComponent } from './Components/Dashboard/graficos/scoops/principal-grafico-scoops/principal-grafico-scoops.component';
import { LineaPrincipalComponent } from './Components/Dashboard/graficos/Linea de tiempo/linea.principal/linea.principal.component';
import { PrincipalScissorComponent } from './Components/Jefe mina/aprobaciones/scissor/principal/principal.component';




export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: 'Dashboard',
    component: PrincipalComponent, // Layout principal con menú
    children: [
      { path: 'estados', component: EstadosComponent },
      { path: 'crear-data', component: CrearDataComponent },
      { path: 'plan-avance', component: PlanMensualListComponent },
      { path: 'plan-metraje', component: PlanMetrajeListComponent },
      { path: 'plan-produccion', component: PlanProduccionListComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'perfil', component: UsuarioComponent },
      { path: 'autocad', component: AutocadMineroComponent },
      { path: 'checklist', component: CheckListListaComponent },
      { path: 'checklist-telemando', component: ChecklistTelemandoListaComponent },
      { path: 'jefe-mina', component: EquiposMenuComponent },
      //Procesos
      { path: 'jefe-mina/tal-largo', component: OperacionesListComponent },
      {path:'jefe-mina/tal-largo/operacion/:id', component:PrincipalTalLargoComponent},

      { path: 'jefe-mina/tal-horizontal', component: OperacionesListHorizontalComponent },
      {path:'jefe-mina/tal-horizontal/operacion/:id', component:PrincipalTalHorizontalComponent},

      { path: 'jefe-mina/empernador', component: OperacionesListEmpernadorComponent },
      {path:'jefe-mina/empernador/operacion/:id', component:PrincipalSostenimientoComponent},

      { path: 'jefe-mina/scooptram', component: OperacionesListScooComponent },
      {path:'jefe-mina/scooptram/operacion/:id', component:PrincipalScoopsComponent},
      
      { path: 'jefe-mina/dumper', component: OperacionesListDumperComponent },

      { path: 'jefe-mina/scissor', component: OperacionesLisScissorComponent },
      {path:'jefe-mina/scissor/operacion/:id', component:PrincipalScissorComponent},

      { path: 'jefe-mina/rompebancos', component: OperacionesListRompebancosComponent },
      // {path:'jefe-mina/rompebancos/operacion/:id', component:PrincipalRompebancosComponent},

      
      { path: 'jefe-mina/scalamin', component: OperacionesListScalaminComponent },
      { path: 'jefe-mina/anfochanger', component: OperacionesListAnfochaComponent },
      
{ path: 'power-bi', component: PowerBiPublicComponent },
{ path: 'grafico-horizontal', component: PrincipalGraficoHorizontalComponent },
{ path: 'grafico-tal-largo', component: PrincipalGraficoLargoComponent },
{path: 'grafico-sostenimiento', component: PrincipalGraficoSostenimientoComponent},
{path: 'grafico-scoops', component: PrincipalGraficoScoopsComponent},


{ path: 'explosivos', component: ExplosivosComponent },
{ path: 'explosivos-graficos', component: ExplosivosGraficosComponent },
{ path: 'linea-de-tiempo', component: LineaPrincipalComponent },
    ]
  },

  { path: '**', redirectTo: '/login' },
];
