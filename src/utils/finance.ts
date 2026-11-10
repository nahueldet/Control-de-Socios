import { Cobrador, LiquidacionCobradorMes, Pago, ResumenMorosidad, Socio } from '../types';

/**
 * Calcula la comisión del cobrador (por defecto 25%) y el neto para la institución.
 */
export function calculateCommission(montoCobrado: number, porcentajeComision: number = 25): {
  comision: number;
  neto: number;
} {
  if (montoCobrado <= 0 || isNaN(montoCobrado)) {
    return { comision: 0, neto: 0 };
  }
  const comision = Math.round((montoCobrado * (porcentajeComision / 100)) * 100) / 100;
  const neto = Math.round((montoCobrado - comision) * 100) / 100;
  return { comision, neto };
}

/**
 * Genera el código de barras legible para la cuota y el recibo.
 * Formato: SOC-XXXX-YYYYMM-MONTO (ej. SOC-0101-202611-5000)
 */
export function generateBarcodePayload(socioNumero: number, periodo: string, monto: number): string {
  const numPad = String(socioNumero).padStart(4, '0');
  const cleanPeriod = periodo.replace('-', '');
  const cleanMonto = Math.max(0, Math.round(monto));
  return `SOC-${numPad}-${cleanPeriod}-${cleanMonto}`;
}

/**
 * Parsea un código de barras escaneado (manual, pistola o cámara).
 * Soporta formato estándar SOC-0101-202611-5000, o socio directo.
 */
export function parseBarcodePayload(barcode: string): {
  isValid: boolean;
  socioNumero?: number;
  periodo?: string; // YYYY-MM
  monto?: number;
  rawText: string;
} {
  const clean = barcode.trim().toUpperCase();
  if (!clean) {
    return { isValid: false, rawText: barcode };
  }

  // Patrón SOC-XXXX-YYYYMM-MONTO
  const match = clean.match(/^SOC-(\d+)-(\d{4})(\d{2})-(\d+)$/);
  if (match) {
    const socioNumero = parseInt(match[1], 10);
    const year = match[2];
    const month = match[3];
    const monto = parseInt(match[4], 10);
    return {
      isValid: true,
      socioNumero,
      periodo: `${year}-${month}`,
      monto,
      rawText: clean,
    };
  }

  // Soporta número de socio directo ingresado numéricamente (ej. "101" o "0101")
  const numOnlyMatch = clean.match(/^(\d{1,6})$/);
  if (numOnlyMatch) {
    return {
      isValid: true,
      socioNumero: parseInt(numOnlyMatch[1], 10),
      rawText: clean,
    };
  }

  return { isValid: false, rawText: clean };
}

/**
 * Genera patrones de barras Code 128 (Subset B) para renderizar SVG nítido.
 */
const CODE128_PATTERNS: Record<number, string> = {
  // Patrones estándar Code 128 (pesos de barras y espacios)
  0: '212222', 1: '222122', 2: '222221', 3: '121223', 4: '121322',
  5: '131222', 6: '122213', 7: '122312', 8: '132212', 9: '221213',
  10: '221312', 11: '231212', 12: '112232', 13: '122132', 14: '122231',
  15: '113222', 16: '123122', 17: '123221', 18: '223211', 19: '221132',
  20: '221231', 21: '213212', 22: '223112', 23: '312131', 24: '311222',
  25: '321122', 26: '321221', 27: '312212', 28: '322112', 29: '322211',
  30: '212123', 31: '212321', 32: '232121', 33: '111323', 34: '131123',
  35: '131321', 36: '112313', 37: '132113', 38: '132311', 39: '211313',
  40: '231113', 41: '231311', 42: '112133', 43: '112331', 44: '132131',
  45: '113123', 46: '113321', 47: '133121', 48: '313121', 49: '211331',
  50: '231131', 51: '213113', 52: '213311', 53: '213131', 54: '311123',
  55: '311321', 56: '331121', 57: '312113', 58: '312311', 59: '332111',
  60: '314111', 61: '221411', 62: '431111', 63: '111224', 64: '111422',
  65: '121124', 66: '121421', 67: '141122', 68: '141221', 69: '112214',
  70: '112412', 71: '122114', 72: '122411', 73: '142112', 74: '142211',
  75: '241211', 76: '221114', 77: '413111', 78: '241112', 79: '134111',
  80: '111242', 81: '121142', 82: '121241', 83: '114212', 84: '124112',
  85: '124211', 86: '411212', 87: '421112', 88: '421211', 89: '212141',
  90: '214121', 91: '412121', 92: '111143', 93: '111341', 94: '131141',
  95: '114113', 96: '114311', 97: '411113', 98: '411311', 99: '113141',
  100: '114131', 101: '311141', 102: '411131', 103: '211412', 104: '211214',
  105: '211232', 106: '2331112' // STOP
};

/**
 * Codifica texto ASCII a Code 128 Subset B.
 */
export function encodeCode128B(text: string): string {
  // Start Code B es 104
  let checksum = 104;
  const codes: number[] = [104];

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    // Para subset B, ASCII 32..126 corresponde a códigos 0..94
    const code = charCode >= 32 && charCode <= 126 ? charCode - 32 : 0;
    codes.push(code);
    checksum += code * (i + 1);
  }

  const checkDigit = checksum % 103;
  codes.push(checkDigit);
  codes.push(106); // Stop code

  let patternString = '';
  for (const c of codes) {
    patternString += CODE128_PATTERNS[c] || '212222';
  }
  return patternString;
}

/**
 * Genera rectángulos SVG para el código de barras.
 */
export function getBarcodeBars(text: string, barWidth: number = 2): {
  x: number;
  width: number;
}[] {
  const pattern = encodeCode128B(text);
  const bars: { x: number; width: number }[] = [];
  let currentX = 10; // Margen izquierdo
  let isBar = true;

  for (let i = 0; i < pattern.length; i++) {
    const moduleCount = parseInt(pattern[i], 10);
    const width = moduleCount * barWidth;
    if (isBar) {
      bars.push({ x: currentX, width });
    }
    currentX += width;
    isBar = !isBar;
  }

  return bars;
}

/**
 * Genera la lista de los últimos N periodos en formato YYYY-MM
 */
export function getRecentPeriods(count: number = 6, basePeriod?: string): string[] {
  const periods: string[] = [];
  let date: Date;

  if (basePeriod && basePeriod.match(/^\d{4}-\d{2}$/)) {
    const [y, m] = basePeriod.split('-').map(Number);
    date = new Date(y, m - 1, 1);
  } else {
    // Por defecto período actual relativo a noviembre 2026
    date = new Date(2026, 10, 1);
  }

  for (let i = 0; i < count; i++) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    periods.push(`${year}-${month}`);
    date.setMonth(date.getMonth() - 1);
  }

  return periods;
}

/**
 * Formatea nombres de meses en español (ej. "Noviembre 2026")
 */
export function formatPeriodSpanish(periodo: string): string {
  const [yearStr, monthStr] = periodo.split('-');
  const monthNum = parseInt(monthStr, 10);
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const nombreMes = meses[monthNum - 1] || monthStr;
  return `${nombreMes} ${yearStr}`;
}

/**
 * Calcula el reporte de morosidad automático para todos los socios activos.
 */
export function calculateMorosidad(
  socios: Socio[],
  pagos: Pago[],
  currentPeriod: string,
  mesesAtras: number = 6
): ResumenMorosidad[] {
  const periodosToCheck = getRecentPeriods(mesesAtras, currentPeriod);
  const resultado: ResumenMorosidad[] = [];

  const sociosActivos = socios.filter((s) => s.estado !== 'De Baja');

  for (const socio of sociosActivos) {
    const periodosAdeudados: string[] = [];

    // Consideramos solo los periodos desde que el socio se dio de alta
    const [altaYear, altaMonth] = socio.fechaAlta.split('-').map(Number);
    const altaPeriodo = `${altaYear}-${String(altaMonth).padStart(2, '0')}`;

    for (const p of periodosToCheck) {
      if (p < altaPeriodo) continue; // No adeuda periodos anteriores a su alta

      const pagoRealizado = pagos.find(
        (pago) => pago.socioId === socio.id && pago.periodo === p && pago.estado === 'Pagado'
      );

      if (!pagoRealizado) {
        periodosAdeudados.push(p);
      }
    }

    if (periodosAdeudados.length > 0) {
      const deudaTotalEstimada = periodosAdeudados.length * socio.cuotaVoluntaria;
      let nivelGravedad: 'Leve' | 'Moderado' | 'Critico' = 'Leve';
      if (periodosAdeudados.length === 2) {
        nivelGravedad = 'Moderado';
      } else if (periodosAdeudados.length >= 3) {
        nivelGravedad = 'Critico';
      }

      resultado.push({
        socio,
        mesesAdeudados: periodosAdeudados.length,
        deudaTotalEstimada,
        periodosAdeudados,
        nivelGravedad,
      });
    }
  }

  // Ordenar por gravedad descendente (más meses adeudados primero)
  return resultado.sort((a, b) => b.mesesAdeudados - a.mesesAdeudados);
}

/**
 * Liquidación mensual por cobrador (con comisión del 25%).
 */
export function calculateLiquidationByCobrador(
  cobradores: Cobrador[],
  socios: Socio[],
  pagos: Pago[],
  periodo: string,
  comisionPorcentaje: number = 25
): LiquidacionCobradorMes[] {
  return cobradores.map((cobrador) => {
    const sociosAsignados = socios.filter(
      (s) => s.cobradorId === cobrador.id && s.estado !== 'De Baja'
    );
    const pagosCobrador = pagos.filter(
      (p) => p.cobradorId === cobrador.id && p.periodo === periodo && p.estado === 'Pagado'
    );

    const montoBrutoRecaudado = pagosCobrador.reduce((sum, p) => sum + p.montoCobrado, 0);
    const pct = cobrador.porcentajeComision || comisionPorcentaje;
    const { comision, neto } = calculateCommission(montoBrutoRecaudado, pct);

    const efectividad =
      sociosAsignados.length > 0
        ? Math.round((pagosCobrador.length / sociosAsignados.length) * 100)
        : 0;

    return {
      cobradorId: cobrador.id,
      cobradorNombre: cobrador.nombre,
      periodo,
      totalSociosAsignados: sociosAsignados.length,
      sociosCobrados: pagosCobrador.length,
      montoBrutoRecaudado,
      porcentajeComision: pct,
      montoComision25: comision,
      netoParaInstitucion: neto,
      efectividadPorcentaje: efectividad,
    };
  });
}

/**
 * Calcula estadísticas mensuales comparativas para el panel de comisión directiva.
 */
export function calculateMonthlyStats(
  pagos: Pago[],
  socios: Socio[],
  year: number = 2026,
  comisionPct: number = 25
) {
  const meses = [
    '01', '02', '03', '04', '05', '06',
    '07', '08', '09', '10', '11', '12'
  ];
  const nombresMesesCortos = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  return meses.map((mes, idx) => {
    const periodo = `${year}-${mes}`;
    const pagosMes = pagos.filter((p) => p.periodo === periodo && p.estado === 'Pagado');
    const bruto = pagosMes.reduce((sum, p) => sum + p.montoCobrado, 0);
    const { comision, neto } = calculateCommission(bruto, comisionPct);

    // Altas en este mes
    const altas = socios.filter((s) => s.fechaAlta.startsWith(periodo)).length;

    // Bajas en este mes
    const bajas = socios.filter((s) => s.fechaBaja && s.fechaBaja.startsWith(periodo)).length;

    return {
      mes,
      periodo,
      nombreMes: nombresMesesCortos[idx],
      nombreCompleto: `${nombresMesesCortos[idx]} ${year}`,
      totalRecaudado: bruto,
      comisionCobradores: comision,
      netoInstitucion: neto,
      cantidadPagos: pagosMes.length,
      altas,
      bajas,
      crecimientoNeto: altas - bajas,
    };
  });
}

/**
 * Formatea moneda en formato estándar de institución (pesos argentinos con separadores)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface CuponAnual {
  mesNum: string;
  mesNombre: string;
  periodo: string;
  barcode: string;
  monto: number;
}

/**
 * Genera el conjunto de las 12 cuotas mensuales del año para el talonario anual de un socio.
 * Cada cuota cuenta con su código de barras listo para escanear en la rendición mensual.
 */
export function generateAnnualCoupons(socio: Socio, year: number = 2026): CuponAnual[] {
  const meses = [
    { num: '01', nombre: 'Enero' },
    { num: '02', nombre: 'Febrero' },
    { num: '03', nombre: 'Marzo' },
    { num: '04', nombre: 'Abril' },
    { num: '05', nombre: 'Mayo' },
    { num: '06', nombre: 'Junio' },
    { num: '07', nombre: 'Julio' },
    { num: '08', nombre: 'Agosto' },
    { num: '09', nombre: 'Septiembre' },
    { num: '10', nombre: 'Octubre' },
    { num: '11', nombre: 'Noviembre' },
    { num: '12', nombre: 'Diciembre' },
  ];

  return meses.map((m) => {
    const periodo = `${year}-${m.num}`;
    const barcode = generateBarcodePayload(socio.socioNumero, periodo, socio.cuotaVoluntaria);
    return {
      mesNum: m.num,
      mesNombre: m.nombre,
      periodo,
      barcode,
      monto: socio.cuotaVoluntaria,
    };
  });
}

