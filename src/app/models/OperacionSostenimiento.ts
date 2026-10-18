export interface PernoSostenimiento {
    tipo_pernos?: string;
    log_pernos?: number | string;
    n_pernos_instalados?: number | string;
    sistematico_puntual?: string;
}

export interface MallaSostenimiento {
    tipo_malla?: string;
    mt52_malla?: number | string;
}

export interface PerforacionSostenimiento {
    tipo_perforacion?: string;
    n_taladros?: number | string;
    longitud_perforacion?: number | string;
}

export interface OperacionSostenimiento {
    nivel?: string;
    tipo_labor?: string;
    labor?: string;
    ala?: string;
    perno?: PernoSostenimiento | PernoSostenimiento[];
    malla?: MallaSostenimiento | MallaSostenimiento[];
    perforacion?: PerforacionSostenimiento | PerforacionSostenimiento[];
    observaciones?: string;

    // Legacy flat fields remain optional while older saved records are in use.
    tipo_pernos?: string;
    log_pernos?: number | string;
    n_pernos_instalados?: number | string;
    tipo_malla?: string;
    mt52_malla?: number | string;
    sistematico_puntual?: string;
}
