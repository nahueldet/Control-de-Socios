import React, { useState } from 'react';
import { Cobrador, InstitucionConfig, Pago, Socio } from '../types';
import {
  TrendingUp,
  DollarSign,
  Users,
  Percent,
  UserPlus,
  UserMinus,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Printer,
  ShieldCheck,
  Award
} from 'lucide-react';
import {
  calculateLiquidationByCobrador,
  calculateMonthlyStats,
  formatCurrency,
  formatPeriodSpanish,
  getRecentPeriods
} from '../utils/finance';

interface DashboardViewProps {
  socios: Socio[];
  pagos: Pago[];
  config: InstitucionConfig;
  onOpenReporteComision: () => void;
  onGoToTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  socios,
  pagos,
  config,
  onOpenReporteComision,
  onGoToTab,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('2026-11');
  const availablePeriods = getRecentPeriods(6, '2026-11');

  // Liquidaciones del periodo seleccionado para los 2 cobradores
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
  const totalSociosCobradosMes = liquidaciones.reduce((sum, l) => sum + l.sociosCobrados, 0);
  const totalSociosAsignados = socios.filter((s) => s.estado !== 'De Baja').length;
  const tasaCobranza = totalSociosAsignados > 0 ? Math.round((totalSociosCobradosMes / totalSociosAsignados) * 100) : 0;

  // Estadísticas anuales mes a mes
  const monthlyStats = calculateMonthlyStats(pagos, socios, 2026, config.comisionPorcentaje);
  const maxRecaudacion = Math.max(...monthlyStats.map((m) => m.totalRecaudado), 10000);

  // Padron breakdown
  const sociosActivos = socios.filter((s) => s.estado === 'Activo').length;
  const sociosMorosos = socios.filter((s) => s.estado === 'Moroso').length;
  const sociosDeBaja = socios.filter((s) => s.estado === 'De Baja').length;

  // Altas y bajas del periodo seleccionado
  const altasMes = socios.filter((s) => s.fechaAlta.startsWith(selectedPeriod)).length;
  const bajasMes = socios.filter((s) => s.fechaBaja && s.fechaBaja.startsWith(selectedPeriod)).length;

  // Analisis de cuotas a voluntad
  const cuotasActivas = socios.filter((s) => s.estado !== 'De Baja').map((s) => s.cuotaVoluntaria);
  const cuotaPromedio = cuotasActivas.length > 0 ? Math.round(cuotasActivas.reduce((a, b) => a + b, 0) / cuotasActivas.length) : 0;
  const paganEstimativa = socios.filter((s) => s.estado !== 'De Baja' && s.cuotaVoluntaria === config.cuotaEstimativaAnual).length;
  const paganMenor = socios.filter((s) => s.estado !== 'De Baja' && s.cuotaVoluntaria < config.cuotaEstimativaAnual).length;
  const paganMayor = socios.filter((s) => s.estado !== 'De Baja' && s.cuotaVoluntaria > config.cuotaEstimativaAnual).length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
            <ShieldCheck className="w-4 h-4" />
            <span>Panel Ejecutivo para Comisión Directiva</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Resumen Financiero y Estado de Cobranzas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Seguimiento de ingresos, liquidación del {config.comisionPorcentaje}% a cobradores y movimiento societario.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <span className="text-xs text-slate-500 pl-2 font-medium">Período:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-xs font-semibold bg-white text-slate-800 rounded-md px-2.5 py-1.5 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs cursor-pointer"
            >
              {availablePeriods.map((p) => (
                <option key={p} value={p}>
                  {formatPeriodSpanish(p)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenReporteComision}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600" />
            <span>Imprimir Resumen</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recaudación Bruta */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Recaudación Bruta ({formatPeriodSpanish(selectedPeriod)})
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {formatCurrency(totalBrutoMes)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>{totalSociosCobradosMes} cuotas cobradas de {totalSociosAsignados}</span>
            </p>
          </div>
        </div>

        {/* Comisión 25% Cobradores */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Comisiones a Pagar ({config.comisionPorcentaje}%)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-700 tabular-nums">
              {formatCurrency(totalComisionMes)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              25% liquidado a los 2 cobradores
            </p>
          </div>
        </div>

        {/* Neto para la Institución */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ingreso Neto Institución (75%)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-700 tabular-nums">
              {formatCurrency(totalNetoMes)}
            </div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              Fondos libres ingresados a tesorería
            </p>
          </div>
        </div>

        {/* Efectividad y Padrón */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Efectividad de Cobranza
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {tasaCobranza}%
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, tasaCobranza)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Liquidación a los 2 Cobradores & Movimiento Societario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liquidación por Cobrador (2 Cobradores) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Liquidación de Cobradores ({formatPeriodSpanish(selectedPeriod)})
              </h2>
              <p className="text-xs text-slate-500">
                Rendición individual y cálculo automático de la comisión del 25%
              </p>
            </div>
            <button
              onClick={() => onGoToTab('rendicion')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Cargar Pagos <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liquidaciones.map((liq, idx) => {
              const cobrador = config.cobradores.find((c) => c.id === liq.cobradorId);
              return (
                <div
                  key={liq.cobradorId}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          C{idx + 1}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-900 block leading-tight">
                            {liq.cobradorNombre}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {cobrador?.sectorPrincipal}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        25% Comisión
                      </span>
                    </div>

                    <div className="space-y-2 mt-4 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-600">Socios Asignados:</span>
                        <span className="font-semibold text-slate-900 tabular-nums">
                          {liq.totalSociosAsignados} socios
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-600">Recibos Cobrados:</span>
                        <span className="font-semibold text-slate-900 tabular-nums">
                          {liq.sociosCobrados} ({liq.efectividadPorcentaje}%)
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-600">Recaudación Bruta:</span>
                        <span className="font-bold text-slate-900 tabular-nums">
                          {formatCurrency(liq.montoBrutoRecaudado)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200 text-amber-800 bg-amber-50/50 px-1 rounded">
                        <span className="font-semibold">Comisión a Pagarle (25%):</span>
                        <span className="font-bold tabular-nums">
                          {formatCurrency(liq.montoComision25)}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 text-emerald-800 bg-emerald-50/50 px-1 rounded">
                        <span className="font-semibold">Neto para la Institución:</span>
                        <span className="font-bold tabular-nums">
                          {formatCurrency(liq.netoParaInstitucion)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
                    <span>Tel: {cobrador?.telefono}</span>
                    <span className="text-indigo-600 font-medium">Estado: Rendido</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Padrón y Movimiento Societario */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Padrón Societario</h2>
                <p className="text-xs text-slate-500">Composición y movimientos</p>
              </div>
              <Users className="w-4 h-4 text-slate-400" />
            </div>

            {/* Counts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-900">Socios Activos al Día</span>
                </div>
                <span className="text-base font-bold text-emerald-900 tabular-nums">
                  {sociosActivos}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                  <span className="text-xs font-semibold text-amber-900">Socios en Mora</span>
                </div>
                <span className="text-base font-bold text-amber-900 tabular-nums">
                  {sociosMorosos}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-rose-50/70 border border-rose-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span className="text-xs font-semibold text-rose-900">Socios Dados de Baja</span>
                </div>
                <span className="text-base font-bold text-rose-900 tabular-nums">
                  {sociosDeBaja}
                </span>
              </div>
            </div>

            {/* Movimiento del mes */}
            <div className="mt-5 pt-4 border-t border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Movimientos del Período ({selectedPeriod})
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-slate-500 block">Nuevas Altas</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">+{altasMes}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
                  <UserMinus className="w-4 h-4 text-rose-600" />
                  <div>
                    <span className="text-slate-500 block">Bajas del Mes</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">-{bajasMes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onGoToTab('socios')}
            className="mt-4 w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            Ver Padrón Completo <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Evolución Mensual de Recaudación (Gráfico de Barras y Comparativa) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Evolución Mensual de Recaudación y Comisiones (2026)
            </h2>
            <p className="text-xs text-slate-500">
              Comparativa de Recaudación Bruta vs Comisión 25% pagada a cobradores vs Ingreso Neto
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-indigo-600" />
              <span className="text-slate-600 font-medium">Recaudación Bruta</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-500" />
              <span className="text-slate-600 font-medium">Comisión 25%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-600" />
              <span className="text-slate-600 font-medium">Neto Institución</span>
            </div>
          </div>
        </div>

        {/* Bar Visualizer */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 h-44 items-end pt-4 pb-2 border-b border-slate-200">
          {monthlyStats.map((item) => {
            const heightBrutoPct = maxRecaudacion > 0 ? (item.totalRecaudado / maxRecaudacion) * 100 : 0;
            const heightNetoPct = maxRecaudacion > 0 ? (item.netoInstitucion / maxRecaudacion) * 100 : 0;
            const isSelected = item.periodo === selectedPeriod;

            return (
              <div
                key={item.periodo}
                onClick={() => setSelectedPeriod(item.periodo)}
                className={`flex flex-col items-center h-full justify-end cursor-pointer group p-1 rounded-lg transition-colors ${
                  isSelected ? 'bg-indigo-50/70 border border-indigo-200' : 'hover:bg-slate-50'
                }`}
                title={`${item.nombreCompleto}: Bruto ${formatCurrency(item.totalRecaudado)} | Comisión ${formatCurrency(item.comisionCobradores)} | Neto ${formatCurrency(item.netoInstitucion)}`}
              >
                <div className="w-full flex items-end justify-center gap-1 h-32">
                  <div
                    className="w-2.5 bg-indigo-600 rounded-t transition-all group-hover:opacity-90"
                    style={{ height: `${Math.max(4, heightBrutoPct)}%` }}
                  />
                  <div
                    className="w-2 bg-emerald-500 rounded-t transition-all group-hover:opacity-90"
                    style={{ height: `${Math.max(4, heightNetoPct)}%` }}
                  />
                </div>
                <span
                  className={`text-[10px] mt-2 font-medium ${
                    isSelected ? 'font-bold text-indigo-700' : 'text-slate-500'
                  }`}
                >
                  {item.nombreMes}
                </span>
              </div>
            );
          })}
        </div>

        {/* Detailed Monthly Summary Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-2 px-3">Mes</th>
                <th className="py-2 px-3 text-right">Recaudación Bruta</th>
                <th className="py-2 px-3 text-right">Comisión 25%</th>
                <th className="py-2 px-3 text-right">Neto Institución (75%)</th>
                <th className="py-2 px-3 text-center">Cuotas</th>
                <th className="py-2 px-3 text-center">Altas / Bajas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyStats.slice(5, 11).map((m) => (
                <tr
                  key={m.periodo}
                  className={`hover:bg-slate-50 ${m.periodo === selectedPeriod ? 'bg-indigo-50/40 font-semibold' : ''}`}
                >
                  <td className="py-2 px-3 text-slate-900">{m.nombreCompleto}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-slate-900 font-medium">
                    {formatCurrency(m.totalRecaudado)}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums text-amber-700">
                    {formatCurrency(m.comisionCobradores)}
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums text-emerald-700 font-bold">
                    {formatCurrency(m.netoInstitucion)}
                  </td>
                  <td className="py-2 px-3 text-center tabular-nums text-slate-600">
                    {m.cantidadPagos}
                  </td>
                  <td className="py-2 px-3 text-center tabular-nums">
                    <span className="text-emerald-700 font-medium">+{m.altas}</span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span className="text-rose-700 font-medium">-{m.bajas}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Análisis de Cuotas A Voluntad */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Régimen de Cuotas "A Voluntad"
            </h2>
            <p className="text-xs text-slate-500">
              Valor estimativo fijado por comisión directiva: <strong>{formatCurrency(config.cuotaEstimativaAnual)}</strong>.
              Distribución según acuerdos individuales con los socios.
            </p>
          </div>
          <Award className="w-5 h-5 text-indigo-600" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 block">Cuota Promedio Acordada</span>
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {formatCurrency(cuotaPromedio)}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">Padrón activo</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 block">Cuota Estimativa Estándar</span>
            <span className="text-xl font-bold text-indigo-700 tabular-nums">
              {paganEstimativa} socios
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              Abonan {formatCurrency(config.cuotaEstimativaAnual)}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 block">Cuota Reducida Acordada</span>
            <span className="text-xl font-bold text-amber-700 tabular-nums">
              {paganMenor} socios
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              Jubilados / Situación económica
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 block">Cuota Protectora Voluntaria</span>
            <span className="text-xl font-bold text-emerald-700 tabular-nums">
              {paganMayor} socios
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              Aportes solidarios superiores
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
