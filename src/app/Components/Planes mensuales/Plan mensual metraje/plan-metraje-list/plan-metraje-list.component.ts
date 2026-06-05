import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog';
import { PlanMetrajeDetallesDialogComponent } from '../plan-metraje-detalles-dialog/plan-metraje-detalles-dialog.component';
import { PlanMetraje } from '../../../../models/plan_metraje.model';
import { FechasPlanMensualService } from '../../../../services/fechas-plan-mensual.service';
import { PlanMetrajeService } from '../../../../services/plan-metraje.service';
import { LoadingDialogComponent } from '../../../Reutilizables/loading-dialog/loading-dialog.component';
import { EditPlanMetrajeComponent } from '../edit-plan-metraje/edit-plan-metraje.component';
import { CreatePlanMetrajeComponent } from '../create-plan-metraje/create-plan-metraje.component';
import { DialogDiferenciaPlanRealidadComponent } from '../dialog-diferencia-plan-realidad/dialog-diferencia-plan-realidad.component';
import { ToastService } from '../../../../services/toast.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-plan-metraje-list',
  imports: [TableModule, ButtonModule, InputTextModule, FileUploadModule],
  templateUrl: './plan-metraje-list.component.html',
  styleUrls: ['./plan-metraje-list.component.css'],
})
export class PlanMetrajeListComponent implements OnInit {
  planesMetraje: PlanMetraje[] = [];

  constructor(
    private toast: ToastService,
    private planMetrajeService: PlanMetrajeService,
    public dialog: MatDialog,
    private fechasPlanMensualService: FechasPlanMensualService,
  ) {}
  errorMessage: string = '';
  anio: number | undefined;
  mes: string | undefined;

  ngOnInit(): void {
    this.obtenerUltimaFecha();
  }

  cargarArchivoPrime(event: any): void {
    const archivo: File | undefined = event.files?.[0];

    if (!archivo) {
      this.toast.warn(
        'Archivo no seleccionado',
        'Debe seleccionar un archivo Excel para continuar.',
      );
      return;
    }

    this.procesarArchivoExcel(archivo);
  }

  private procesarArchivoExcel(archivo: File): void {
    const reader = new FileReader();

    reader.readAsArrayBuffer(archivo);

    reader.onload = () => {
      const data = new Uint8Array(reader.result as ArrayBuffer);

      // Aquí va tu lógica actual con XLSX
      // const workbook = XLSX.read(data, { type: 'array' });
    };

    reader.onerror = () => {
      this.toast.error('Error de lectura', 'No se pudo leer el archivo Excel.');
    };
  }

  abrirDialogoCrear(): void {
    const dialogRef = this.dialog.open(CreatePlanMetrajeComponent, {
      width: '95vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'create-plan-dialog',
      data: {
        anio: this.anio,
        mes: this.mes,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Si el resultado es `true`, significa que se creó un nuevo plan
        this.obtenerUltimaFecha(); // Llamamos a la función para actualizar la lista
      }
    });
  }

  obtenerUltimaFecha(): void {
    this.fechasPlanMensualService.getUltimaFecha().subscribe(
      (ultimaFecha) => {
        //console.log('Fecha recibida:', ultimaFecha);
        //console.log('Tipo de año:', typeof ultimaFecha.fecha_ingreso);
        //console.log('Tipo de mes:', typeof ultimaFecha.mes);
        //console.log('Valor de mes:', ultimaFecha.mes);

        // Asignar los valores de anio y mes
        const anio: number | undefined = ultimaFecha.fecha_ingreso;
        const mes: string = ultimaFecha.mes;

        // Verificar que 'anio' no sea undefined antes de llamar a la función
        if (anio !== undefined) {
          this.anio = anio;
          this.mes = mes.trim().toUpperCase(); // Asegurar formato consistente
          this.obtenerPlanesMetraje(anio, this.mes);
        } else {
          //console.error('Fecha de ingreso no válida');
        }
      },
      (error) => {
        //console.error('Error al obtener la última fecha:', error);
      },
    );
  }

  obtenerPlanesMetraje(anio: number, mes: string): void {
    this.planMetrajeService.getPlanMensualByYearAndMonth(anio, mes).subscribe(
      (planes) => {
        this.planesMetraje = planes;
      },
      (error) => {
        //console.error('Error al obtener los planes mensuales:', error);
      },
    );
  }

  seleccionarArchivo(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  cargarArchivo(event: any): void {
    const archivo = event.target.files[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = 'PLAN METRAJE TL';
      const sheet = workbook.Sheets[sheetName];

      if (!sheet) {
        this.toast.error(
          `La hoja "${sheetName}" no existe en el archivo.`,
          'Error',
        );
        return;
      }

      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);
      const errores: string[] = [];

      // 1. Filtrar filas válidas (año/mes correctos) y mapear
      const planesValidos: PlanMetraje[] = jsonData
        .filter((fila: any, index: number) => {
          const anioFila = Number(fila['AÑO']);
          const mesFila = String(fila['MES']).trim().toUpperCase();

          if (anioFila !== this.anio || mesFila !== this.mes) {
            errores.push(
              `Fila ${index + 1} ignorada: Año/Mes no coinciden (Año: ${anioFila}, Mes: ${mesFila})`,
            );
            return false; // Excluir esta fila
          }
          return true; // Incluir esta fila
        })
        .map((fila: any) => this.mapearFilaAPlanMetraje(fila));

      // 2. Si NO hay filas válidas, mostrar error y salir
      if (planesValidos.length === 0) {
        this.toast.error(
          'No hay filas válidas para enviar. Verifica el año y mes.',
          'Error',
        );
        return;
      }

      // 3. Si hay filas válidas, enviarlas al servidor
      this.enviarDatosAlServidor(planesValidos);

      // 4. Mostrar advertencia si hubo filas ignoradas
      if (errores.length > 0) {
        this.toast.warn(
          `Se ignoraron ${errores.length} filas por año/mes incorrecto. Verifica la consola para detalles.`,
          'Advertencia',
        );
        //console.warn('Filas ignoradas:', errores);
      }
    };

    reader.readAsArrayBuffer(archivo);
  }

  mapearFilaAPlanMetraje(fila: any): PlanMetraje {
    return {
      anio: fila['AÑO'],
      mes: fila['MES'],
      semana: fila['SEMANA'],
      mina: fila['MINA'],
      zona: fila['ZONA'],
      area: fila['AREA'],
      fase: fila['FASE'],
      minado_tipo: fila['MINADO/TIPO'],
      tipo_labor: fila['TIPO LABOR'],
      tipo_mineral: fila['TIPO DE MINERAL'],
      estructura_veta: fila['ESTRUCTURA/VETA'],
      nivel: fila['NIVEL'],
      block: fila['BLOCK'],
      labor: fila['LABOR'],
      ala: fila['ALA'],
      ancho_veta: fila['ANCHO DE VETA (m)'], // Revisa que este nombre coincida
      ancho_minado_sem: fila['ANCHO DE MINADO SEM (m)'], // Revisa que este nombre coincida
      ancho_minado_mes: fila['ANCHO DE MINADO MES (m)'], // Revisa que este nombre coincida
      burden: fila['BURDEN (m)'], // Revisa que este nombre coincida
      espaciamiento: fila['METRAJE (m)'], // Revisa que este nombre coincida
      longitud_perforacion: fila['LONGITUD DE PERFORACIÓN (m)'], // Revisa que este nombre coincida
      // Mapeo dinámico de columnas 1A - 28B
      ...Object.fromEntries(
        Array.from({ length: 28 }, (_, i) => [
          `col_${i + 1}A`,
          fila[`${i + 1}A`] !== undefined
            ? fila[`${i + 1}A`].toString().trim()
            : null,
        ]),
      ),
      ...Object.fromEntries(
        Array.from({ length: 28 }, (_, i) => [
          `col_${i + 1}B`,
          fila[`${i + 1}B`] !== undefined
            ? fila[`${i + 1}B`].toString().trim()
            : null,
        ]),
      ),
    };
  }

  async enviarDatosAlServidor(planes: PlanMetraje[]): Promise<void> {
    //console.log('Iniciando envío de datos de metraje. Total planes:', planes.length);
    this.mostrarPantallaCarga();

    let enviados = 0;
    let errores = 0;

    // Enviar registros uno por uno
    for (const [index, plan] of planes.entries()) {
      try {
        //console.log(`Enviando plan de metraje ${index + 1}/${planes.length}`);
        const response = await this.planMetrajeService
          .createPlanMetraje(plan)
          .toPromise();
        //console.log(`Plan de metraje ${index + 1} enviado con éxito`, response);
        enviados++;
      } catch (error) {
        //console.error(`Error al enviar plan de metraje ${index + 1}:`, error);
        errores++;
        // Opcional: puedes agregar lógica adicional de manejo de errores aquí
      }
    }

    this.verificarCargaCompleta(planes.length, enviados, errores);
  }

  verificarCargaCompleta(
    total: number,
    enviados: number,
    errores: number,
  ): void {
    if (enviados + errores === total) {
      this.dialog.closeAll(); // Cerrar la pantalla de carga
      this.obtenerUltimaFecha(); // Recargar la tabla con los nuevos datos

      // Mostrar una notificación de éxito si todo salió correctamente
      if (errores === 0) {
        this.toast.success(
          'Los datos se cargaron correctamente',
          'Carga exitosa',
        );
      } else {
        this.toast.error(
          `Hubo ${errores} errores durante la carga`,
          'Error en la carga',
        );
      }
    }
  }

  mostrarPantallaCarga() {
    this.dialog.open(LoadingDialogComponent, {
      disableClose: true,
    });
  }

  editarPlan(plan: PlanMetraje): void {
    const dialogRef = this.dialog.open(EditPlanMetrajeComponent, {
      width: '95vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'plan-avance-dialog',
      data: { ...plan },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Solo actualizamos si la API confirmó los cambios

        // Aquí puedes actualizar la lista localmente si es necesario
        this.obtenerUltimaFecha(); // Ejemplo: Recargar la lista de planes desde la API
      }
    });
  }

  eliminarPlan(plan: any): void {
    if (confirm(`¿Está seguro de eliminar el plan del mes ${plan.mes}?`)) {
      // Llamar al servicio para eliminar el plan
    }
  }

  verPlan(plan: any): void {
    this.dialog.open(PlanMetrajeDetallesDialogComponent, {
      width: '95vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'plan-metraje-detalle-dialog',
      data: plan,
    });
  }

  verDiferencias(plan: PlanMetraje): void {
    this.dialog.open(DialogDiferenciaPlanRealidadComponent, {
      width: '95vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'diferencia-plan-dialog',
      data: {
        tipo_labor: plan.tipo_labor,
        labor: plan.labor,
        ala: plan.ala,
      },
    });
  }
}
