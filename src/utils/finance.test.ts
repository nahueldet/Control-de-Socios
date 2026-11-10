import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCommission,
  generateBarcodePayload,
  parseBarcodePayload,
  calculateMorosidad,
  calculateLiquidationByCobrador,
  getRecentPeriods,
  generateAnnualCoupons
} from './finance';
import { Socio, Pago, Cobrador } from '../types';

test('generateAnnualCoupons produces 12 monthly coupons with exact barcodes for the year', () => {
  const socioMock: Socio = {
    id: 'soc-99',
    socioNumero: 250,
    nombre: 'Ana',
    apellido: 'Test',
    dni: '12345678',
    telefono: '11223344',
    email: 'ana@test.com',
    direccion: 'Calle Falsa 123',
    sector: 'Sector 1',
    cobradorId: 'cob-1',
    estado: 'Activo',
    cuotaVoluntaria: 4500,
    fechaAlta: '2026-01-01',
  };

  const cupones = generateAnnualCoupons(socioMock, 2026);
  assert.equal(cupones.length, 12);
  assert.equal(cupones[0].mesNombre, 'Enero');
  assert.equal(cupones[0].periodo, '2026-01');
  assert.equal(cupones[0].barcode, 'SOC-0250-202601-4500');
  assert.equal(cupones[11].mesNombre, 'Diciembre');
  assert.equal(cupones[11].periodo, '2026-12');
  assert.equal(cupones[11].barcode, 'SOC-0250-202612-4500');
});

test('calculateCommission calculates exact 25% commission and 75% net for institution', () => {
  const result1 = calculateCommission(10000, 25);
  assert.equal(result1.comision, 2500);
  assert.equal(result1.neto, 7500);

  const result2 = calculateCommission(6500, 25);
  assert.equal(result2.comision, 1625);
  assert.equal(result2.neto, 4875);

  const zero = calculateCommission(0, 25);
  assert.equal(zero.comision, 0);
  assert.equal(zero.neto, 0);
});

test('generateBarcodePayload builds compliant Code128 payload', () => {
  const payload = generateBarcodePayload(101, '2026-11', 5000);
  assert.equal(payload, 'SOC-0101-202611-5000');
});

test('parseBarcodePayload extracts metadata accurately from formatted barcode and raw number', () => {
  const parsed1 = parseBarcodePayload('SOC-0101-202611-5000');
  assert.equal(parsed1.isValid, true);
  assert.equal(parsed1.socioNumero, 101);
  assert.equal(parsed1.periodo, '2026-11');
  assert.equal(parsed1.monto, 5000);

  const parsed2 = parseBarcodePayload('101');
  assert.equal(parsed2.isValid, true);
  assert.equal(parsed2.socioNumero, 101);

  const invalid = parseBarcodePayload('INVALID_CODE_XYZ');
  assert.equal(invalid.isValid, false);
});

test('getRecentPeriods returns correct ordered past months', () => {
  const periods = getRecentPeriods(3, '2026-11');
  assert.deepEqual(periods, ['2026-11', '2026-10', '2026-09']);
});

test('calculateMorosidad identifies delinquent members and severity correctly', () => {
  const mockSocios: Socio[] = [
    {
      id: 'soc-1',
      socioNumero: 101,
      nombre: 'Carlos',
      apellido: 'Perez',
      dni: '12345678',
      telefono: '11223344',
      email: 'carlos@test.com',
      direccion: 'Av San Martin 123',
      sector: 'Sector 1 - Centro',
      cobradorId: 'cob-1',
      estado: 'Activo',
      cuotaVoluntaria: 5000,
      fechaAlta: '2026-01-01',
    },
    {
      id: 'soc-2',
      socioNumero: 102,
      nombre: 'Maria',
      apellido: 'Gonzalez',
      dni: '87654321',
      telefono: '99887766',
      email: 'maria@test.com',
      direccion: 'Rivadavia 456',
      sector: 'Sector 2 - Sur',
      cobradorId: 'cob-2',
      estado: 'Activo',
      cuotaVoluntaria: 6000,
      fechaAlta: '2026-01-01',
    }
  ];

  // soc-1 pagó 2026-11, 2026-10 y 2026-09 (al día)
  // soc-2 solo pagó 2026-09 (adeuda 2026-11 y 2026-10 => 2 meses => Moderado)
  const mockPagos: Pago[] = [
    {
      id: 'p-1',
      socioId: 'soc-1',
      socioNumero: 101,
      periodo: '2026-11',
      montoEstimado: 5000,
      montoCobrado: 5000,
      fechaCobro: '2026-11-05',
      cobradorId: 'cob-1',
      comisionCalculada: 1250,
      netoInstitucion: 3750,
      estado: 'Pagado',
      codigoBarra: 'SOC-0101-202611-5000',
    },
    {
      id: 'p-2',
      socioId: 'soc-1',
      socioNumero: 101,
      periodo: '2026-10',
      montoEstimado: 5000,
      montoCobrado: 5000,
      fechaCobro: '2026-10-05',
      cobradorId: 'cob-1',
      comisionCalculada: 1250,
      netoInstitucion: 3750,
      estado: 'Pagado',
      codigoBarra: 'SOC-0101-202610-5000',
    },
    {
      id: 'p-3',
      socioId: 'soc-1',
      socioNumero: 101,
      periodo: '2026-09',
      montoEstimado: 5000,
      montoCobrado: 5000,
      fechaCobro: '2026-09-05',
      cobradorId: 'cob-1',
      comisionCalculada: 1250,
      netoInstitucion: 3750,
      estado: 'Pagado',
      codigoBarra: 'SOC-0101-202609-5000',
    },
    {
      id: 'p-4',
      socioId: 'soc-2',
      socioNumero: 102,
      periodo: '2026-09',
      montoEstimado: 6000,
      montoCobrado: 6000,
      fechaCobro: '2026-09-05',
      cobradorId: 'cob-2',
      comisionCalculada: 1500,
      netoInstitucion: 4500,
      estado: 'Pagado',
      codigoBarra: 'SOC-0102-202609-6000',
    }
  ];

  const morosos = calculateMorosidad(mockSocios, mockPagos, '2026-11', 3);
  assert.equal(morosos.length, 1);
  assert.equal(morosos[0].socio.id, 'soc-2');
  assert.equal(morosos[0].mesesAdeudados, 2);
  assert.equal(morosos[0].nivelGravedad, 'Moderado');
  assert.equal(morosos[0].deudaTotalEstimada, 12000); // 2 * 6000
});

test('calculateLiquidationByCobrador aggregates collections and commissions per collector', () => {
  const cobradores: Cobrador[] = [
    {
      id: 'cob-1',
      nombre: 'Juan Perez',
      telefono: '111',
      sectorPrincipal: 'Sector 1',
      porcentajeComision: 25,
      activo: true,
    },
    {
      id: 'cob-2',
      nombre: 'Roberto Gomez',
      telefono: '222',
      sectorPrincipal: 'Sector 2',
      porcentajeComision: 25,
      activo: true,
    }
  ];

  const socios: Socio[] = [
    {
      id: 'soc-1',
      socioNumero: 101,
      nombre: 'A',
      apellido: 'B',
      dni: '1',
      telefono: '1',
      email: 'a@b.com',
      direccion: 'D',
      sector: 'Sector 1',
      cobradorId: 'cob-1',
      estado: 'Activo',
      cuotaVoluntaria: 5000,
      fechaAlta: '2026-01-01',
    }
  ];

  const pagos: Pago[] = [
    {
      id: 'p-1',
      socioId: 'soc-1',
      socioNumero: 101,
      periodo: '2026-11',
      montoEstimado: 5000,
      montoCobrado: 5000,
      fechaCobro: '2026-11-05',
      cobradorId: 'cob-1',
      comisionCalculada: 1250,
      netoInstitucion: 3750,
      estado: 'Pagado',
      codigoBarra: 'SOC-0101-202611-5000',
    }
  ];

  const liquidaciones = calculateLiquidationByCobrador(cobradores, socios, pagos, '2026-11', 25);
  assert.equal(liquidaciones.length, 2);

  const liqCob1 = liquidaciones.find((l) => l.cobradorId === 'cob-1')!;
  assert.equal(liqCob1.montoBrutoRecaudado, 5000);
  assert.equal(liqCob1.montoComision25, 1250);
  assert.equal(liqCob1.netoParaInstitucion, 3750);
  assert.equal(liqCob1.sociosCobrados, 1);

  const liqCob2 = liquidaciones.find((l) => l.cobradorId === 'cob-2')!;
  assert.equal(liqCob2.montoBrutoRecaudado, 0);
  assert.equal(liqCob2.montoComision25, 0);
  assert.equal(liqCob2.netoParaInstitucion, 0);
});
