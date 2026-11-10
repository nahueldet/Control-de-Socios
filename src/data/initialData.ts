import { Cobrador, InstitucionConfig, Pago, RendicionMensual, Socio } from '../types';

export const INITIAL_CONFIG: InstitucionConfig = {
  nombre: 'Taller Protegido de Producción',
  subtitulo: 'Taller Protegido de Producción para Personas con Discapacidad · Personería Jurídica Nº 1842/89',
  cuit: '30-64219875-4',
  direccion: 'Av. San Martín 840, Buenos Aires',
  telefono: '(011) 4567-8900',
  cuotaEstimativaAnual: 5000,
  comisionPorcentaje: 25,
  sectores: [
    'Sector 1 - Centro / Casco Histórico',
    'Sector 2 - Norte / Barrio Jardín',
    'Sector 3 - Sur / Barrio Estación',
    'Sector 4 - Oeste / Los Álamos',
  ],
  cobradores: [
    {
      id: 'cob-1',
      nombre: 'Marcos Almada',
      telefono: '11-4455-8899',
      sectorPrincipal: 'Sector 1 - Centro / Casco Histórico',
      porcentajeComision: 25,
      activo: true,
    },
    {
      id: 'cob-2',
      nombre: 'Esteban Roldán',
      telefono: '11-6677-2233',
      sectorPrincipal: 'Sector 3 - Sur / Barrio Estación',
      porcentajeComision: 25,
      activo: true,
    },
  ],
};

export const INITIAL_SOCIOS: Socio[] = [
  {
    id: 'soc-1',
    socioNumero: 101,
    nombre: 'Roberto',
    apellido: 'Fernández',
    dni: '24.891.204',
    telefono: '11-3456-7890',
    email: 'roberto.fernandez@email.com',
    direccion: 'Belgrano 412',
    barrio: 'Centro',
    sector: 'Sector 1 - Centro / Casco Histórico',
    cobradorId: 'cob-1',
    estado: 'Activo',
    cuotaVoluntaria: 5000,
    fechaAlta: '2024-03-15',
    notas: 'Socio activo desde 2024. Cuota estimativa estándar.',
  },
  {
    id: 'soc-2',
    socioNumero: 102,
    nombre: 'Elena',
    apellido: 'Suárez',
    dni: '18.442.910',
    telefono: '11-4567-8901',
    email: 'elena.suarez@email.com',
    direccion: 'Mitre 835',
    barrio: 'Centro',
    sector: 'Sector 1 - Centro / Casco Histórico',
    cobradorId: 'cob-1',
    estado: 'Activo',
    cuotaVoluntaria: 3500, // A voluntad reducida jubilada
    fechaAlta: '2023-05-10',
    notas: 'Jubilada. Cuota a voluntad acordada en $3.500.',
  },
  {
    id: 'soc-3',
    socioNumero: 103,
    nombre: 'Mariano',
    apellido: 'Castillo',
    dni: '32.110.844',
    telefono: '11-5678-9012',
    email: 'mariano.castillo@email.com',
    direccion: 'Sarmiento 1240',
    barrio: 'Norte',
    sector: 'Sector 2 - Norte / Barrio Jardín',
    cobradorId: 'cob-1',
    estado: 'Activo',
    cuotaVoluntaria: 7000, // A voluntad benefactor
    fechaAlta: '2024-01-20',
    notas: 'Socio protector aportante voluntario.',
  },
  {
    id: 'soc-4',
    socioNumero: 104,
    nombre: 'Lucía',
    apellido: 'Domínguez',
    dni: '38.992.311',
    telefono: '11-6789-0123',
    email: 'lucia.dominguez@email.com',
    direccion: 'Rivadavia 520',
    barrio: 'Centro',
    sector: 'Sector 1 - Centro / Casco Histórico',
    cobradorId: 'cob-1',
    estado: 'Moroso',
    cuotaVoluntaria: 5000,
    fechaAlta: '2025-02-10',
    notas: 'Adeuda últimos meses por viaje laboral.',
  },
  {
    id: 'soc-5',
    socioNumero: 105,
    nombre: 'Carlos',
    apellido: 'Benítez',
    dni: '29.330.123',
    telefono: '11-7890-1234',
    email: 'carlos.benitez@email.com',
    direccion: 'San Martín 910',
    barrio: 'Centro',
    sector: 'Sector 1 - Centro / Casco Histórico',
    cobradorId: 'cob-1',
    estado: 'Activo',
    cuotaVoluntaria: 5000,
    fechaAlta: '2025-06-01',
  },
  {
    id: 'soc-6',
    socioNumero: 106,
    nombre: 'Valeria',
    apellido: 'Morales',
    dni: '35.621.890',
    telefono: '11-8901-2345',
    email: 'valeria.morales@email.com',
    direccion: 'Alsina 340',
    barrio: 'Norte',
    sector: 'Sector 2 - Norte / Barrio Jardín',
    cobradorId: 'cob-1',
    estado: 'Moroso',
    cuotaVoluntaria: 4000,
    fechaAlta: '2024-08-14',
    notas: 'Cambio de teléfono pendiente de verificación.',
  },
  {
    id: 'soc-7',
    socioNumero: 107,
    nombre: 'Gustavo',
    apellido: 'Peralta',
    dni: '27.481.567',
    telefono: '11-9012-3456',
    email: 'gustavo.peralta@email.com',
    direccion: 'Urquiza 1120',
    barrio: 'Norte',
    sector: 'Sector 2 - Norte / Barrio Jardín',
    cobradorId: 'cob-1',
    estado: 'Activo',
    cuotaVoluntaria: 5000,
    fechaAlta: '2026-03-01',
  },
  {
    id: 'soc-8',
    socioNumero: 108,
    nombre: 'Ana María',
    apellido: 'Vázquez',
    dni: '16.920.304',
    telefono: '11-0123-4567',
    email: 'anamaria.vazquez@email.com',
    direccion: 'Lavalle 780',
    barrio: 'Centro',
    sector: 'Sector 1 - Centro / Casco Histórico',
    cobradorId: 'cob-1',
    estado: 'De Baja',
    cuotaVoluntaria: 5000,
    fechaAlta: '2022-04-10',
    fechaBaja: '2026-08-15',
    motivoBaja: 'Mudanza a otra provincia.',
  },
  // Socios Cobrador 2
  {
    id: 'soc-9',
    socioNumero: 109,
    nombre: 'Jorge',
    apellido: 'Acuña',
    dni: '25.301.849',
    telefono: '11-2233-4455',
    email: 'jorge.acuna@email.com',
    direccion: 'Av. Roca 1420',
    barrio: 'Sur',
    sector: 'Sector 3 - Sur / Barrio Estación',
    cobradorId: 'cob-2',
    estado: 'Activo',
    cuotaVoluntaria: 5000,
    fechaAlta: '2023-09-01',
  },
  {
    id: 'soc-10',
    socioNumero: 110,
    nombre: 'Beatriz',
    apellido: 'Romero',
    dni: '21.750.911',
    telefono: '11-3344-5566',
    email: 'beatriz.romero@email.com',
    direccion: 'España 630',
    barrio: 'Estación',
    sector: 'Sector 3 - Sur / Barrio Estación',
    cobradorId: 'cob-2',
    estado: 'Activo',
    cuotaVoluntaria: 3500, // jubilada
    fechaAlta: '2023-11-15',
  },
  {
    id: 'soc-11',
    socioNumero: 111,
    nombre: 'Federico',
    apellido: 'Giménez',
    dni: '36.881.042',
    telefono: '11-4455-6677',
    email: 'federico.gimenez@email.com',
    direccion: 'Moreno 990',
    barrio: 'Sur',
    sector: 'Sector 3 - Sur / Barrio Estación',
    cobradorId: 'cob-2',
    estado: 'Activo',
    cuotaVoluntaria: 5000,
    fechaAlta: '2024-07-20',
  },
  {
    id: 'soc-12',
    socioNumero: 112,
    nombre: 'Silvia',
    apellido: 'Méndez',
    dni: '30.124.908',
    telefono: '11-5566-7788',
    email: 'silvia.mendez@email.com',
    direccion: 'Pellegrini 415',
    barrio: 'Estación',
    sector: 'Sector 3 - Sur / Barrio Estación',
    cobradorId: 'cob-2',
    estado: 'Moroso',
    cuotaVoluntaria: 5000,
    fechaAlta: '2025-01-10',
    notas: '3 meses sin abonar. Pasar en horario vespertino.',
  },
  {
    id: 'soc-13',
    socioNumero: 113,
    nombre: 'Nicolás',
    apellido: 'Herrera',
    dni: '39.405.612',
    telefono: '11-6677-8899',
    email: 'nicolas.herrera@email.com',
    direccion: 'Av. Los Álamos 210',
    barrio: 'Oeste',
    sector: 'Sector 4 - Oeste / Los Álamos',
    cobradorId: 'cob-2',
    estado: 'Activo',
    cuotaVoluntaria: 6000,
    fechaAlta: '2026-02-15',
  },
  {
    id: 'soc-14',
    socioNumero: 114,
    nombre: 'Patricia',
    apellido: 'Díaz',
    dni: '26.890.314',
    telefono: '11-7788-9900',
    email: 'patricia.diaz@email.com',
    direccion: 'Chacabuco 830',
    barrio: 'Sur',
    sector: 'Sector 3 - Sur / Barrio Estación',
    cobradorId: 'cob-2',
    estado: 'Activo',
    cuotaVoluntaria: 5000,
    fechaAlta: '2024-10-01',
  },
  {
    id: 'soc-15',
    socioNumero: 115,
    nombre: 'Eduardo',
    apellido: 'Castro',
    dni: '22.451.789',
    telefono: '11-8899-0011',
    email: 'eduardo.castro@email.com',
    direccion: 'Las Heras 1540',
    barrio: 'Oeste',
    sector: 'Sector 4 - Oeste / Los Álamos',
    cobradorId: 'cob-2',
    estado: 'De Baja',
    cuotaVoluntaria: 4500,
    fechaAlta: '2023-02-01',
    fechaBaja: '2026-05-20',
    motivoBaja: 'Problemas económicos.',
  },
  {
    id: 'soc-16',
    socioNumero: 116,
    nombre: 'Camila',
    apellido: 'Ríos',
    dni: '41.209.431',
    telefono: '11-9900-1122',
    email: 'camila.rios@email.com',
    direccion: 'Pringles 320',
    barrio: 'Estación',
    sector: 'Sector 3 - Sur / Barrio Estación',
    cobradorId: 'cob-2',
    estado: 'Activo',
    cuotaVoluntaria: 4000, // estudiante cuota voluntaria
    fechaAlta: '2026-09-01',
  },
  {
    id: 'soc-17',
    socioNumero: 117,
    nombre: 'Gonzalo',
    apellido: 'Torres',
    dni: '33.918.271',
    telefono: '11-1234-5670',
    email: 'gonzalo.torres@email.com',
    direccion: 'Maipú 750',
    barrio: 'Centro',
    sector: 'Sector 1 - Centro / Casco Histórico',
    cobradorId: 'cob-1',
    estado: 'Activo',
    cuotaVoluntaria: 5000,
    fechaAlta: '2026-10-01',
  },
  {
    id: 'soc-18',
    socioNumero: 118,
    nombre: 'Martina',
    apellido: 'López',
    dni: '37.512.980',
    telefono: '11-2345-6781',
    email: 'martina.lopez@email.com',
    direccion: 'Av. Libertador 1890',
    barrio: 'Oeste',
    sector: 'Sector 4 - Oeste / Los Álamos',
    cobradorId: 'cob-2',
    estado: 'Activo',
    cuotaVoluntaria: 5000,
    fechaAlta: '2026-11-01',
  },
];

// Generar pagos históricos realistas para los últimos 6 meses (2026-06 a 2026-11)
export function generateInitialPagos(socios: Socio[]): Pago[] {
  const periodos = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];
  const pagos: Pago[] = [];

  for (const periodo of periodos) {
    for (const socio of socios) {
      // Ignorar si el socio se dio de alta después de este período
      const socioPeriodoAlta = socio.fechaAlta.slice(0, 7);
      if (periodo < socioPeriodoAlta) continue;

      // Si el socio se dio de baja antes de este período
      if (socio.fechaBaja && periodo > socio.fechaBaja.slice(0, 7)) continue;

      // Determinamos si pagó este mes
      let pagado = true;

      // Socios marcados como morosos tienen cuotas impagas en 2026-10 o 2026-11
      if (socio.id === 'soc-4' && (periodo === '2026-10' || periodo === '2026-11')) {
        pagado = false;
      }
      if (socio.id === 'soc-6' && (periodo === '2026-09' || periodo === '2026-10' || periodo === '2026-11')) {
        pagado = false;
      }
      if (socio.id === 'soc-12' && (periodo === '2026-08' || periodo === '2026-09' || periodo === '2026-10' || periodo === '2026-11')) {
        pagado = false;
      }

      // En el mes actual 2026-11, algunos aún están pendientes de rendir en el día a día
      if (periodo === '2026-11' && (socio.id === 'soc-7' || socio.id === 'soc-13' || socio.id === 'soc-16' || socio.id === 'soc-18')) {
        pagado = false; // Pendientes de cobranza este mes para probar el módulo de escaneo y rendición
      }

      if (pagado) {
        const monto = socio.cuotaVoluntaria;
        const comision = Math.round(monto * 0.25);
        const neto = monto - comision;

        pagos.push({
          id: `pago-${socio.id}-${periodo}`,
          socioId: socio.id,
          socioNumero: socio.socioNumero,
          periodo,
          montoEstimado: monto,
          montoCobrado: monto,
          fechaCobro: `${periodo}-10`,
          cobradorId: socio.cobradorId,
          comisionCalculada: comision,
          netoInstitucion: neto,
          estado: 'Pagado',
          codigoBarra: `SOC-${String(socio.socioNumero).padStart(4, '0')}-${periodo.replace('-', '')}-${monto}`,
          observaciones: 'Pago mensual regular presentado en rendición.',
        });
      }
    }
  }

  return pagos;
}

export const INITIAL_RENDICIONES: RendicionMensual[] = [
  {
    id: 'rend-2026-10-cob1',
    fecha: '2026-10-15',
    periodo: '2026-10',
    cobradorId: 'cob-1',
    totalRecaudado: 29500,
    comisionTotal: 7375, // 25%
    netoEntregado: 22125, // 75%
    cantidadRecibos: 6,
    pagosIds: [],
    notas: 'Rendición de Octubre 2026 presentada en término por Marcos Almada.',
  },
  {
    id: 'rend-2026-10-cob2',
    fecha: '2026-10-16',
    periodo: '2026-10',
    cobradorId: 'cob-2',
    totalRecaudado: 24500,
    comisionTotal: 6125, // 25%
    netoEntregado: 18375, // 75%
    cantidadRecibos: 5,
    pagosIds: [],
    notas: 'Rendición de Octubre 2026 presentada por Esteban Roldán.',
  },
];
