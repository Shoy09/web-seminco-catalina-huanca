export interface CheckListItem {
  id?: number; // Opcional para creación
  proceso: string;
  categoria: string;
  nombre: string;
  aplica_todos_equipos?: boolean;
  equipo_ids?: number[];
  equipos?: CheckListEquipo[];
}

export interface CheckListEquipo {
  id: number;
  nombre: string;
  codigo: string;
  proceso: string;
}
