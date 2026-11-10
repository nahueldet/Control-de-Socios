export type EstadoSocio = 'Activo' | 'Moroso' | 'De Baja';

export type EstadoPago = 'Pagado' | 'Parcial' | 'No Pagó' | 'Pendiente';

export interface Socio {
  id: string;
  socioNumero: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
  direccion: string;
  barrio?: string;
  sector: string;
  cobradorId: string; // 'cob-1' | 'cob-2'
  estado: EstadoSocio;
  cuotaVoluntaria: number; // Monto mensual acordado
  fechaAlta: string; // YYYY-MM-DD
  fechaBaja?: string; // YYYY-MM-DD
  motivoBaja?: string;
  notas?: string;
}

export interface Cobrador {
  id: string;
  nombre: string;
  telefono: string;
  sectorPrincipal: string;
  porcentajeComision: number; // Por defecto 25%
  activo: boolean;
}

export interface Pago {
  id: string;
  socioId: string;
  socioNumero: number;
  periodo: string; // YYYY-MM (e.g. 2026-11)
  montoEstimado: number;
  montoCobrado: number;
  fechaCobro: string; // YYYY-MM-DD
  cobradorId: string;
  comisionCalculada: number; // 25% de montoCobrado
  netoInstitucion: number; // 75% de montoCobrado
  estado: EstadoPago;
  codigoBarra: string;
  rendicionId?: string;
  observaciones?: string;
}

export interface RendicionMensual {
  id: string;
  fecha: string; // YYYY-MM-DD
  periodo: string; // YYYY-MM
  cobradorId: string;
  totalRecaudado: number;
  comisionTotal: number; // 25%
  netoEntregado: number; // 75%
  cantidadRecibos: number;
  pagosIds: string[];
  notas?: string;
}

export interface InstitucionConfig {
  nombre: string;
  subtitulo: string;
  cuit: string;
  direccion: string;
  telefono: string;
  cuotaEstimativaAnual: number; // Valor fijado por la comisión directiva a principio de año
  comisionPorcentaje: number; // Porcentaje cobradores (25%)
  sectores: string[];
  cobradores: Cobrador[];
}

export interface ResumenMorosidad {
  socio: Socio;
  mesesAdeudados: number;
  deudaTotalEstimada: number;
  periodosAdeudados: string[];
  nivelGravedad: 'Leve' | 'Moderado' | 'Critico';
}

export interface LiquidacionCobradorMes {
  cobradorId: string;
  cobradorNombre: string;
  periodo: string;
  totalSociosAsignados: number;
  sociosCobrados: number;
  montoBrutoRecaudado: number;
  porcentajeComision: number;
  montoComision25: number;
  netoParaInstitucion: number;
  efectividadPorcentaje: number;
}
