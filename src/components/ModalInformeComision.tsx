import React, { useState } from 'react';
import { Cobrador, InstitucionConfig, Pago, Socio } from '../types';
import { X, Printer, Building2, TrendingUp, Users, DollarSign, Award, Calendar } from 'lucide-react';
import {
  calculateLiquidationByCobrador,
  calculateMonthlyStats,
  formatCurrency,
  formatPeriodSpanish,
  getRecentPeriods
} from '../utils/finance';

interface ModalInformeComisionProps {
  isOpen: boolean;
  onClose: () => void;
  socios: Socio[];
  pagos: Pago[];
  config: InstitucionConfig;
}

export const ModalInformeComision: React.FC<ModalInformeComisionProps> = ({
  isOpen,
  onClose,
  socios,
  pagos,
  config,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('2026-11');
  const availablePeriods = getRecentPeriods(6, '2026-11');

  if (!isOpen) return null;

  // Liquidaciones por cobrador
  const liquidaciones = calculateLiquidationByCobrador(
    config.cobradores,
    socios,
    pagos,
    selectedPeriod,
    config.comisionPorcentaje
  );

  const totalBrutoMes = liquidaciones.reduce((sum, l) => sum + l.montoBrutoRecaudado, 0);
  const totalComisionMes = liquidaciones.reduce((sum, l) => sum + l.montoComision25, 0);
  const totalNetoMes = liquidaciones.reduce((sum, l) => sum + l.netoParaInstitucion, 0);
  const totalRecibos = liquidaciones.reduce((sum, l) => sum + l.sociosCobrados, 0);

  // Padron
  const activos = socios.filter((s) => s.estado === 'Activo').length;
  const morosos = socios.filter((s) => s.estado === 'Moroso').length;
  const bajas = socios.filter((s) => s.estado === 'De Baja').length;
  const totalPadron = activos + morosos;

  // Altas y bajas del mes
  const altasMes = socios.filter((s) => s.fechaAlta.startsWith(selectedPeriod)).length;
  const bajasMes = socios.filter((s) => s.fechaBaja && s.fechaBaja.startsWith(selectedPeriod)).length;

  // Estadísticas anuales
  const monthlyStats = calculateMonthlyStats(pagos, socios, 2026, config.comisionPorcentaje);
  const totalAnualBruto = monthlyStats.reduce((sum, m) => sum + m.totalRecaudado, 0);
  const totalAnualComision = monthlyStats.reduce((sum, m) => sum + m.comisionCobradores, 0);
  const totalAnualNeto = monthlyStats.reduce((sum, m) => sum + m.netoInstitucion, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col print:max-h-none print:shadow-none print:border-none">
        {/* Header - Not printed */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-slate-50/70 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Informe Oficial para Reunión de Comisión Directiva
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>Período:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="py-1 px-2 border border-slate-300 rounded font-semibold bg-white"
              >
                {availablePeriods.map((p) => (
                  <option key={p} value={p}>
                    {formatPeriodSpanish(p)}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="p-1 text-slate-400 hover:text-slate-700 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Formal Document */}
        <div className="overflow-y-auto p-8 space-y-6 flex-1 print:p-0 print:overflow-visible">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <span className="text-2xl font-black text-slate-900 tracking-tight uppercase block">
              {config.nombre}
            </span>
            <span className="text-xs text-slate-600 font-medium block mt-0.5">
              {config.subtitulo}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              CUIT: {config.cuit} · Domicilio: {config.direccion} · Tel: {config.telefono}
            </span>
            <div className="mt-3 inline-block bg-slate-900 text-white text-xs font-black px-4 py-1 rounded uppercase tracking-wider">
              BALANCE MENSUAL DE COBRANZAS Y ESTADO DE PADRÓN - COMISIÓN DIRECTIVA
            </div>
            <p className="text-xs text-slate-700 font-bold mt-1">
              PERÍODO ANALIZADO: {formatPeriodSpanish(selectedPeriod).toUpperCase()}
            </p>
          </div>

          {/* 1. Resumen Ejecutivo Financiero */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
              1. Rendición Financiera Mensual y Liquidación de Cobradores
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center mb-4">
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg">
                <span className="text-[11px] text-slate-600 font-semibold block uppercase">
                  Recaudación Bruta Total
                </span>
                <span className="text-xl font-black text-slate-900 tabular-nums block mt-1">
                  {formatCurrency(totalBrutoMes)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {totalRecibos} cuotas cobradas
                </span>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                <span className="text-[11px] text-amber-800 font-semibold block uppercase">
                  Comisión a Cobradores ({config.comisionPorcentaje}%)
                </span>
                <span className="text-xl font-black text-amber-800 tabular-nums block mt-1">
                  {formatCurrency(totalComisionMes)}
                </span>
                <span className="text-[10px] text-amber-700 block mt-0.5">
                  Liquidado a 2 cobradores
                </span>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                <span className="text-[11px] text-emerald-800 font-semibold block uppercase">
                  Ingreso Neto Institución (75%)
                </span>
                <span className="text-xl font-black text-emerald-800 tabular-nums block mt-1">
                  {formatCurrency(totalNetoMes)}
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">
                  Ingreso neto a tesorería
                </span>
              </div>
            </div>

            {/* Tabla Desglose Cobradores */}
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Cobrador</th>
                  <th className="py-2 px-3">Sector Asignado</th>
                  <th className="py-2 px-3 text-center">Socios Asignados</th>
                  <th className="py-2 px-3 text-center">Recibos Cobrados</th>
                  <th className="py-2 px-3 text-right">Bruto Cobrado</th>
                  <th className="py-2 px-3 text-right">Comisión 25%</th>
                  <th className="py-2 px-3 text-right">Neto Institución</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {liquidaciones.map((l) => (
                  <tr key={l.cobradorId}>
                    <td className="py-2 px-3 font-bold text-slate-900">{l.cobradorNombre}</td>
                    <td className="py-2 px-3 text-slate-600">
                      {config.cobradores.find((c) => c.id === l.cobradorId)?.sectorPrincipal}
                    </td>
                    <td className="py-2 px-3 text-center tabular-nums">{l.totalSociosAsignados}</td>
                    <td className="py-2 px-3 text-center tabular-nums font-semibold">
                      {l.sociosCobrados} ({l.efectividadPorcentaje}%)
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums font-medium">
                      {formatCurrency(l.montoBrutoRecaudado)}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-amber-800 font-bold">
                      {formatCurrency(l.montoComision25)}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-emerald-800 font-bold">
                      {formatCurrency(l.netoParaInstitucion)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2. Padrón Societario y Movimientos */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
              2. Estado del Padrón de Socios y Movimiento del Período
            </h3>
            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <div className="p-2.5 border border-slate-300 rounded-lg">
                <span className="text-slate-500 block">Padrón Total</span>
                <span className="text-lg font-black text-slate-900 tabular-nums">
                  {totalPadron} socios
                </span>
              </div>
              <div className="p-2.5 border border-slate-300 rounded-lg">
                <span className="text-emerald-700 font-medium block">Activos al Día</span>
                <span className="text-lg font-black text-emerald-700 tabular-nums">
                  {activos} socios
                </span>
              </div>
              <div className="p-2.5 border border-slate-300 rounded-lg">
                <span className="text-amber-700 font-medium block">Socios Morosos</span>
                <span className="text-lg font-black text-amber-700 tabular-nums">
                  {morosos} socios
                </span>
              </div>
              <div className="p-2.5 border border-slate-300 rounded-lg">
                <span className="text-rose-700 font-medium block">Dados de Baja</span>
                <span className="text-lg font-black text-rose-700 tabular-nums">
                  {bajas} socios
                </span>
              </div>
            </div>

            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex justify-between">
              <span>
                Nuevas Altas en el período: <strong className="text-emerald-700">+{altasMes}</strong>
              </span>
              <span>
                Bajas registradas en el período: <strong className="text-rose-700">-{bajasMes}</strong>
              </span>
              <span>
                Crecimiento neto:{' '}
                <strong className={altasMes - bajasMes >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                  {altasMes - bajasMes >= 0 ? `+${altasMes - bajasMes}` : altasMes - bajasMes}
                </strong>
              </span>
            </div>
          </div>

          {/* 3. Acumulado Anual 2026 */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
              3. Resumen Acumulado del Ejercicio Anual 2026
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg">
                <span className="text-slate-600 block">Recaudación Bruta Anual</span>
                <span className="text-base font-bold text-slate-900 tabular-nums">
                  {formatCurrency(totalAnualBruto)}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg">
                <span className="text-amber-800 block">Total Comisiones Pagadas (25%)</span>
                <span className="text-base font-bold text-amber-800 tabular-nums">
                  {formatCurrency(totalAnualComision)}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg">
                <span className="text-emerald-800 block">Neto Acumulado para la Institución</span>
                <span className="text-base font-bold text-emerald-800 tabular-nums">
                  {formatCurrency(totalAnualNeto)}
                </span>
              </div>
            </div>
          </div>

          {/* Firmas de Autoridades de Comisión Directiva */}
          <div className="pt-10 grid grid-cols-3 gap-6 text-center text-xs text-slate-700">
            <div>
              <div className="border-t border-slate-400 mx-4 pt-2">
                <span className="font-bold block">Presidente</span>
                <span className="text-[10px] text-slate-500">{config.nombre}</span>
              </div>
            </div>
            <div>
              <div className="border-t border-slate-400 mx-4 pt-2">
                <span className="font-bold block">Secretario General</span>
                <span className="text-[10px] text-slate-500">Comisión Directiva</span>
              </div>
            </div>
            <div>
              <div className="border-t border-slate-400 mx-4 pt-2">
                <span className="font-bold block">Tesorero / Revisor de Cuentas</span>
                <span className="text-[10px] text-slate-500">Aprobado en Reunión</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
