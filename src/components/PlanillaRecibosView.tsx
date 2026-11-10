import React, { useState } from 'react';
import { Cobrador, InstitucionConfig, Socio } from '../types';
import {
  FileSpreadsheet,
  Printer,
  Barcode,
  Layers,
  MapPin,
  Calendar,
  Building2,
  DollarSign,
  Scissors,
  Users,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import {
  formatCurrency,
  formatPeriodSpanish,
  generateAnnualCoupons,
  generateBarcodePayload,
  getRecentPeriods
} from '../utils/finance';
import { BarcodeRenderer } from './BarcodeRenderer';

interface PlanillaRecibosViewProps {
  socios: Socio[];
  config: InstitucionConfig;
}

export const PlanillaRecibosView: React.FC<PlanillaRecibosViewProps> = ({
  socios,
  config,
}) => {
  const [selectedCobradorId, setSelectedCobradorId] = useState<string>('todos');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-11');
  const [selectedSector, setSelectedSector] = useState<string>('todos');
  const [selectedSocioId, setSelectedSocioId] = useState<string>('todos');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [modoVisualizacion, setModoVisualizacion] = useState<'talonario_anual' | 'planilla' | 'recibos'>(
    'talonario_anual'
  );

  const availablePeriods = getRecentPeriods(6, '2026-11');
  const selectedCobrador = config.cobradores.find((c) => c.id === selectedCobradorId);

  // Filtrar socios activos para la impresión
  const sociosActivos = socios.filter((s) => s.estado !== 'De Baja');

  const sociosFiltrados = sociosActivos.filter((s) => {
    const matchCobrador = selectedCobradorId === 'todos' || s.cobradorId === selectedCobradorId;
    const matchSector = selectedSector === 'todos' || s.sector === selectedSector;
    const matchSocio = selectedSocioId === 'todos' || s.id === selectedSocioId;
    return matchCobrador && matchSector && matchSocio;
  });

  const totalEstimadoMes = sociosFiltrados.reduce((sum, s) => sum + s.cuotaVoluntaria, 0);
  const comisionEstimadaMes = Math.round(totalEstimadoMes * (config.comisionPorcentaje / 100));
  const netoEstimadoMes = totalEstimadoMes - comisionEstimadaMes;

  const totalAnualEstimado = totalEstimadoMes * 12;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Configuration & Print Control Bar (Hidden on Print) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
            <Layers className="w-4 h-4" />
            <span>Emisión Anual de Cuotas · Taller Protegido de Producción</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Talonarios Anuales y Planillas de Cobranza
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Imprima a principio de año los talonarios anuales troquelados por socio (comprobante para el socio + talón con código de barras para la institución).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de modo */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setModoVisualizacion('talonario_anual')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                modoVisualizacion === 'talonario_anual'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Talonario Anual x Socio
            </button>
            <button
              onClick={() => setModoVisualizacion('planilla')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                modoVisualizacion === 'planilla'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Planilla de Calle
            </button>
            <button
              onClick={() => setModoVisualizacion('recibos')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                modoVisualizacion === 'recibos'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recibos del Mes
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>
              {modoVisualizacion === 'talonario_anual'
                ? `Imprimir Talonarios (${sociosFiltrados.length} socios)`
                : modoVisualizacion === 'planilla'
                ? 'Imprimir Planilla de Calle'
                : 'Imprimir Recibos'}
            </span>
          </button>
        </div>
      </div>

      {/* Filters (Hidden on Print) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 no-print">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Cobrador Asignado:
          </label>
          <select
            value={selectedCobradorId}
            onChange={(e) => setSelectedCobradorId(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <option value="todos">Todos los cobradores ({sociosActivos.length} socios)</option>
            {config.cobradores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} ({c.sectorPrincipal})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Filtrar Sector:
          </label>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <option value="todos">Todos los sectores</option>
            {config.sectores.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>

        {modoVisualizacion === 'talonario_anual' ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Socio Específico o Todo el Padrón:
            </label>
            <select
              value={selectedSocioId}
              onChange={(e) => setSelectedSocioId(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              <option value="todos">Imprimir Todo el Padrón ({sociosFiltrados.length} socios)</option>
              {sociosActivos.map((s) => (
                <option key={s.id} value={s.id}>
                  #{s.socioNumero} - {s.apellido}, {s.nombre} ({formatCurrency(s.cuotaVoluntaria)})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Período de Cuota:
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              {availablePeriods.map((p) => (
                <option key={p} value={p}>
                  {formatPeriodSpanish(p)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Año del Ejercicio:
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <option value={2026}>Ejercicio 2026</option>
            <option value={2027}>Ejercicio 2027</option>
          </select>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODO 1: TALONARIO ANUAL POR SOCIO (12 MESES CON CUPÓN DOBLE: SOCIO + INSTITUCIÓN) */}
      {/* ======================================================== */}
      {modoVisualizacion === 'talonario_anual' && (
        <div className="space-y-8">
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>
                <strong>Talonarios Anuales Listos para Imprimir ({sociosFiltrados.length} socios seleccionados)</strong>: Cada cuota mensual cuenta con una línea de corte troquelada: el <strong>Comprobante para el Socio</strong> queda con el socio tras el pago, y el <strong>Talón para la Institución</strong> lo retiene el cobrador para escanear su código de barras en la rendición mensual.
              </span>
            </div>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shrink-0 whitespace-nowrap"
            >
              Imprimir Lote Completo
            </button>
          </div>

          {/* Listado de talonarios anuales (un bloque por cada socio con salto de página en impresión) */}
          {sociosFiltrados.map((socio) => {
            const cobrador = config.cobradores.find((c) => c.id === socio.cobradorId);
            const cupones = generateAnnualCoupons(socio, selectedYear);

            return (
              <div
                key={socio.id}
                className="bg-white rounded-xl border-2 border-slate-300 p-6 shadow-sm print:p-0 print:border-none print:shadow-none print-page-break"
              >
                {/* Encabezado Oficial del Talonario Anual */}
                <div className="border-b-2 border-slate-900 pb-3 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                        {config.nombre}
                      </h2>
                      <p className="text-[11px] text-slate-600 font-semibold">
                        {config.subtitulo}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        CUIT: {config.cuit} · Domicilio: {config.direccion} · Tel: {config.telefono}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-block bg-slate-900 text-white font-black text-[11px] px-3 py-0.5 rounded uppercase">
                        TALONARIO ANUAL DE CUOTAS · AÑO {selectedYear}
                      </span>
                      <p className="text-xs font-bold text-slate-900 mt-1">
                        SOCIO Nº {socio.socioNumero}
                      </p>
                    </div>
                  </div>

                  {/* Ficha Resumen del Socio en el encabezado de su talonario */}
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Socio:</span>
                      <strong className="text-slate-900 block truncate">
                        {socio.apellido}, {socio.nombre}
                      </strong>
                      <span className="text-[10px] text-slate-500">DNI: {socio.dni}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">Domicilio de Cobro:</span>
                      <strong className="text-slate-900 block truncate">{socio.direccion}</strong>
                      <span className="text-[10px] text-slate-500 block truncate">{socio.sector}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block">Cobrador Asignado:</span>
                      <strong className="text-slate-900 block truncate">
                        {cobrador?.nombre || 'Cobrador Oficial'}
                      </strong>
                      <span className="text-[10px] text-slate-500">Comisión 25%</span>
                    </div>

                    <div className="text-right sm:text-left">
                      <span className="text-[10px] text-slate-500 block">Cuota Mensual (A Voluntad):</span>
                      <strong className="text-sm font-black text-indigo-700 block tabular-nums">
                        {formatCurrency(socio.cuotaVoluntaria)}
                      </strong>
                      <span className="text-[10px] text-slate-500">Aporte solidario voluntario</span>
                    </div>
                  </div>
                </div>

                {/* Las 12 Cuotas Mensuales del Año (Troqueladas: Lado Izq Socio, Lado Der Institución con Código de Barras) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2 print:gap-2">
                  {cupones.map((cupon) => (
                    <div
                      key={cupon.periodo}
                      className="border border-slate-300 rounded-lg overflow-hidden flex bg-white print:break-inside-avoid print:border-slate-400"
                    >
                      {/* PARTE 1: COMPROBANTE PARA EL SOCIO (Lado Izquierdo) */}
                      <div className="w-1/2 p-2.5 bg-slate-50/50 flex flex-col justify-between border-r-2 border-dashed border-slate-400">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1.5">
                            <span className="text-[9px] font-black uppercase text-slate-700 tracking-tight block">
                              TALÓN SOCIO
                            </span>
                            <span className="bg-indigo-50 text-indigo-800 font-bold text-[9px] px-1.5 py-0.2 rounded border border-indigo-200 uppercase">
                              {cupon.mesNombre} {selectedYear}
                            </span>
                          </div>

                          <span className="text-[10px] font-bold text-slate-900 block leading-tight">
                            #{socio.socioNumero} - {socio.apellido}, {socio.nombre}
                          </span>

                          <div className="mt-1.5 flex items-baseline justify-between">
                            <span className="text-[9px] text-slate-500">Cuota a voluntad:</span>
                            <span className="text-xs font-black text-slate-900 tabular-nums">
                              {formatCurrency(cupon.monto)}
                            </span>
                          </div>

                          <p className="text-[8px] text-slate-500 italic mt-1 leading-tight">
                            Aporte al Taller Protegido para personas con discapacidad.
                          </p>
                        </div>

                        <div className="mt-2 pt-1 border-t border-slate-200 text-[8px] text-slate-500 space-y-0.5">
                          <div className="flex justify-between">
                            <span>Fecha: ___/___/{selectedYear}</span>
                            <span>Firma Cobrador: _______</span>
                          </div>
                        </div>
                      </div>

                      {/* PARTE 2: TALÓN DE CONTROL PARA LA INSTITUCIÓN (Lado Derecho - Con Código de Barras) */}
                      <div className="w-1/2 p-2.5 bg-white flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1">
                            <span className="text-[9px] font-black uppercase text-slate-900 tracking-tight block">
                              TALÓN INSTITUCIÓN
                            </span>
                            <span className="text-[9px] font-bold text-slate-700 uppercase">
                              {cupon.mesNombre}
                            </span>
                          </div>

                          <div className="flex justify-between items-baseline text-[9px] text-slate-600 mb-1">
                            <span>Socio #{socio.socioNumero}</span>
                            <span className="font-bold text-slate-900 tabular-nums">
                              {formatCurrency(cupon.monto)}
                            </span>
                          </div>

                          {/* Código de Barras nítido para escaneo rápido con pistola en rendición */}
                          <div className="flex flex-col items-center justify-center py-0.5">
                            <BarcodeRenderer
                              value={cupon.barcode}
                              height={30}
                              barWidth={1.1}
                              showText={false}
                            />
                            <span className="font-mono text-[8px] font-bold text-slate-700 tracking-wider">
                              {cupon.barcode}
                            </span>
                          </div>
                        </div>

                        <div className="mt-1 pt-1 border-t border-slate-200 text-[8px] text-slate-400 flex justify-between">
                          <span>Cobrador: {cobrador?.nombre?.split(' ')[0]}</span>
                          <span>Rendición Taller</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pie del Talonario */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between text-[10px] text-slate-500">
                  <span>{config.nombre} · Personería Jurídica Nº 1842/89</span>
                  <span>Al recibir el cobro, desprenda el talón derecho para la rendición</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODO 2: PLANILLA DE COBRANZA IMPRIMIBLE (RUTA DE CALLE) */}
      {/* ======================================================== */}
      {modoVisualizacion === 'planilla' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs print:p-0 print:border-none print:shadow-none">
          {/* Encabezado Oficial Institucional */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                {config.nombre}
              </h2>
              <p className="text-xs text-slate-600 font-medium">{config.subtitulo}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                CUIT: {config.cuit} · Domicilio: {config.direccion} · Tel: {config.telefono}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-slate-900 text-white font-black text-xs px-3 py-1 rounded uppercase tracking-wider">
                PLANILLA OFICIAL DE COBRANZA
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1 uppercase">
                PERÍODO: {formatPeriodSpanish(selectedPeriod)}
              </p>
              <p className="text-xs text-slate-700 mt-0.5">
                Cobrador:{' '}
                <strong>
                  {selectedCobradorId === 'todos' ? 'CONSOLIDADO GENERAL' : selectedCobrador?.nombre}
                </strong>
              </p>
            </div>
          </div>

          {/* Resumen de la planilla */}
          <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-300 mb-4 text-xs">
            <div>
              <span className="text-slate-500 block">Total Socios en Planilla:</span>
              <strong className="text-slate-900 text-sm tabular-nums">{sociosFiltrados.length}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Recaudación Estimada:</span>
              <strong className="text-slate-900 text-sm tabular-nums">
                {formatCurrency(totalEstimadoMes)}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Comisión 25% Estimada:</span>
              <strong className="text-amber-800 text-sm tabular-nums">
                {formatCurrency(comisionEstimadaMes)}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Neto Estimado Institución:</span>
              <strong className="text-emerald-800 text-sm tabular-nums">
                {formatCurrency(netoEstimadoMes)}
              </strong>
            </div>
          </div>

          {/* Tabla de Socios con Código de Barra */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-y-2 border-slate-800 bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
                  <th className="py-2 px-2 border-r border-slate-300">Nº</th>
                  <th className="py-2 px-2 border-r border-slate-300">Socio / DNI</th>
                  <th className="py-2 px-2 border-r border-slate-300">Dirección y Barrio</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-right">Cuota ($)</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center">Código Barra Cuota</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-24">Cobrado ($)</th>
                  <th className="py-2 px-2 border-r border-slate-300 text-center w-20">Fecha / Firma</th>
                  <th className="py-2 px-2 text-center w-32">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {sociosFiltrados.map((socio) => {
                  const barcodeValue = generateBarcodePayload(
                    socio.socioNumero,
                    selectedPeriod,
                    socio.cuotaVoluntaria
                  );

                  return (
                    <tr key={socio.id} className="border-b border-slate-300">
                      <td className="py-2 px-2 font-mono font-bold border-r border-slate-300">
                        #{socio.socioNumero}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-300">
                        <span className="font-bold text-slate-900 block leading-tight">
                          {socio.apellido}, {socio.nombre}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          DNI {socio.dni} {socio.telefono ? `· ${socio.telefono}` : ''}
                        </span>
                      </td>
                      <td className="py-2 px-2 border-r border-slate-300">
                        <span className="font-medium text-slate-900 block leading-tight">
                          {socio.direccion}
                        </span>
                        <span className="text-[10px] text-slate-500 block">{socio.sector}</span>
                      </td>
                      <td className="py-2 px-2 border-r border-slate-300 text-right font-bold text-slate-900 tabular-nums">
                        {formatCurrency(socio.cuotaVoluntaria)}
                      </td>
                      <td className="py-1 px-2 border-r border-slate-300 text-center">
                        <BarcodeRenderer
                          value={barcodeValue}
                          height={28}
                          barWidth={1.2}
                          showText={false}
                        />
                        <span className="font-mono text-[9px] text-slate-500 block">
                          {barcodeValue}
                        </span>
                      </td>
                      {/* Casilleros para completar a mano por el cobrador */}
                      <td className="py-2 px-2 border-r border-slate-300 text-center bg-slate-50/50">
                        <div className="h-6 w-full border border-dashed border-slate-400 rounded-xs" />
                      </td>
                      <td className="py-2 px-2 border-r border-slate-300 text-center bg-slate-50/50">
                        <div className="h-6 w-full border border-dashed border-slate-400 rounded-xs" />
                      </td>
                      <td className="py-2 px-2 text-center bg-slate-50/50">
                        <div className="h-6 w-full border border-dashed border-slate-400 rounded-xs" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Firmas al pie de la planilla */}
          <div className="mt-8 pt-6 border-t-2 border-slate-400 grid grid-cols-2 gap-8 text-center text-xs text-slate-700">
            <div>
              <div className="border-t border-slate-400 mx-8 pt-2">
                <span className="font-bold block">Firma del Cobrador</span>
                <span className="text-[11px] text-slate-500">
                  {selectedCobrador?.nombre || 'Cobrador'}
                </span>
              </div>
            </div>
            <div>
              <div className="border-t border-slate-400 mx-8 pt-2">
                <span className="font-bold block">Firma Tesorería / Comisión Directiva</span>
                <span className="text-[11px] text-slate-500">{config.nombre}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODO 3: RECIBOS INDIVIDUALES DEL MES (REIMPRESIÓN PUNTUAL) */}
      {/* ======================================================== */}
      {modoVisualizacion === 'recibos' && (
        <div className="space-y-4">
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 no-print flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Barcode className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>
                Se muestran <strong>{sociosFiltrados.length} recibos oficiales</strong> con código de barras listo para escanear en la rendición mensual.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
            {sociosFiltrados.map((socio) => {
              const barcodeValue = generateBarcodePayload(
                socio.socioNumero,
                selectedPeriod,
                socio.cuotaVoluntaria
              );
              const cobrador = config.cobradores.find((c) => c.id === socio.cobradorId);

              return (
                <div
                  key={socio.id}
                  className="bg-white border-2 border-dashed border-slate-400 p-4 rounded-xl flex flex-col justify-between print:break-inside-avoid print:p-3 print:rounded-none"
                >
                  <div>
                    <div className="flex items-start justify-between border-b border-slate-300 pb-2 mb-2">
                      <div>
                        <span className="font-black text-xs uppercase text-slate-900 block tracking-tight">
                          {config.nombre}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          CUIT: {config.cuit} · {config.direccion}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="bg-slate-900 text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                          RECIBO OFICIAL
                        </span>
                        <span className="font-bold text-xs text-indigo-700 block mt-0.5">
                          {formatPeriodSpanish(selectedPeriod)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Socio:</span>
                        <span className="font-bold text-slate-900 block leading-tight">
                          #{socio.socioNumero} - {socio.apellido}, {socio.nombre}
                        </span>
                        <span className="text-[10px] text-slate-500">DNI: {socio.dni}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[10px]">Domicilio / Sector:</span>
                        <span className="font-medium text-slate-800 block truncate leading-tight">
                          {socio.direccion}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {socio.sector}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-300 rounded-lg mb-3">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Cobrador Asignado:</span>
                        <span className="font-semibold text-slate-800 text-xs">
                          {cobrador?.nombre || 'Cobrador Oficial'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block font-medium">Cuota a Voluntad:</span>
                        <span className="text-base font-black text-slate-900 tabular-nums">
                          {formatCurrency(socio.cuotaVoluntaria)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex flex-col items-center justify-center">
                    <BarcodeRenderer
                      value={barcodeValue}
                      height={38}
                      barWidth={1.4}
                      showText={true}
                    />
                    <div className="w-full flex justify-between text-[9px] text-slate-400 mt-2 pt-1 border-t border-dashed border-slate-200">
                      <span>Validez: Mes en curso</span>
                      <span>Firma Cobrador: __________________</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
