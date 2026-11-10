import React, { useState, useRef, useEffect } from 'react';
import { Cobrador, Pago, RendicionMensual, Socio } from '../types';
import {
  ScanLine,
  Barcode,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  UserCheck,
  Printer,
  Trash2,
  Camera,
  Layers,
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';
import {
  calculateCommission,
  formatCurrency,
  formatPeriodSpanish,
  generateBarcodePayload,
  getRecentPeriods,
  parseBarcodePayload
} from '../utils/finance';

interface RendicionCobranzaViewProps {
  socios: Socio[];
  pagos: Pago[];
  cobradores: Cobrador[];
  onRegistrarPago: (pago: Pago) => void;
  onEliminarPago: (pagoId: string) => void;
  onGuardarRendicion: (rendicion: RendicionMensual) => void;
}

export const RendicionCobranzaView: React.FC<RendicionCobranzaViewProps> = ({
  socios,
  pagos,
  cobradores,
  onRegistrarPago,
  onEliminarPago,
  onGuardarRendicion,
}) => {
  const [selectedCobradorId, setSelectedCobradorId] = useState(cobradores[0]?.id || 'cob-1');
  const [selectedPeriod, setSelectedPeriod] = useState('2026-11');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [mensajeScan, setMensajeScan] = useState<{ tipo: 'success' | 'warning' | 'error'; texto: string } | null>(null);

  // Modal para confirmar pago especial (cuando socio paga monto voluntario distinto)
  const [socioParaCobrar, setSocioParaCobrar] = useState<Socio | null>(null);
  const [montoACobrar, setMontoACobrar] = useState<number>(0);
  const [observacionPago, setObservacionPago] = useState<string>('');

  // Modal comprobante de cierre de rendición
  const [comprobanteRendicion, setComprobanteRendicion] = useState<RendicionMensual | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const availablePeriods = getRecentPeriods(6, '2026-11');
  const selectedCobrador = cobradores.find((c) => c.id === selectedCobradorId);

  // Socios asignados a este cobrador
  const sociosCobrador = socios.filter(
    (s) => s.cobradorId === selectedCobradorId && s.estado !== 'De Baja'
  );

  // Pagos ya registrados para este cobrador y periodo
  const pagosMesCobrador = pagos.filter(
    (p) => p.cobradorId === selectedCobradorId && p.periodo === selectedPeriod && p.estado === 'Pagado'
  );

  // Socios pendientes de cobro este mes
  const sociosPendientes = sociosCobrador.filter((s) => {
    return !pagosMesCobrador.some((p) => p.socioId === s.id);
  });

  // Totales de la liquidación en vivo
  const totalBruto = pagosMesCobrador.reduce((sum, p) => sum + p.montoCobrado, 0);
  const { comision: totalComision25, neto: totalNetoInstitucion } = calculateCommission(
    totalBruto,
    selectedCobrador?.porcentajeComision || 25
  );

  // Mantener foco en el input de escaneo para que la pistola lectora o tipeo rápido funcione
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, [selectedCobradorId, selectedPeriod]);

  // Procesar código de barras
  const procesarCodigo = (codeStr: string) => {
    if (!codeStr.trim()) return;

    const parsed = parseBarcodePayload(codeStr);
    if (!parsed.isValid || !parsed.socioNumero) {
      setMensajeScan({
        tipo: 'error',
        texto: `Código no reconocido: "${codeStr}". Ingrese el código de barras del recibo o el Nº de socio.`,
      });
      return;
    }

    // Buscar socio por número
    const socioEncontrado = socios.find((s) => s.socioNumero === parsed.socioNumero);
    if (!socioEncontrado) {
      setMensajeScan({
        tipo: 'error',
        texto: `No se encontró ningún socio registrado con el Nº ${parsed.socioNumero}.`,
      });
      return;
    }

    if (socioEncontrado.estado === 'De Baja') {
      setMensajeScan({
        tipo: 'warning',
        texto: `El socio Nº ${socioEncontrado.socioNumero} (${socioEncontrado.apellido}) figura De Baja.`,
      });
      return;
    }

    // Verificar si ya fue cobrado en este período
    const yaCobrado = pagos.find(
      (p) => p.socioId === socioEncontrado.id && p.periodo === selectedPeriod && p.estado === 'Pagado'
    );
    if (yaCobrado) {
      setMensajeScan({
        tipo: 'warning',
        texto: `El socio Nº ${socioEncontrado.socioNumero} (${socioEncontrado.apellido}) ya tiene su cuota de ${formatPeriodSpanish(selectedPeriod)} registrada por ${formatCurrency(yaCobrado.montoCobrado)}.`,
      });
      return;
    }

    // Si coincide el período o viene sin período, procedemos
    const monto = parsed.monto || socioEncontrado.cuotaVoluntaria;
    setSocioParaCobrar(socioEncontrado);
    setMontoACobrar(monto);
    setObservacionPago('Cobro presentado por cobrador con recibo de código de barras.');
    setMensajeScan(null);
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    procesarCodigo(barcodeInput);
    setBarcodeInput('');
  };

  // Confirmar registro del pago
  const handleConfirmarCobro = () => {
    if (!socioParaCobrar || montoACobrar < 0) return;

    const { comision, neto } = calculateCommission(
      montoACobrar,
      selectedCobrador?.porcentajeComision || 25
    );

    const nuevoPago: Pago = {
      id: `pago-${socioParaCobrar.id}-${selectedPeriod}-${Date.now()}`,
      socioId: socioParaCobrar.id,
      socioNumero: socioParaCobrar.socioNumero,
      periodo: selectedPeriod,
      montoEstimado: socioParaCobrar.cuotaVoluntaria,
      montoCobrado: montoACobrar,
      fechaCobro: new Date().toISOString().slice(0, 10),
      cobradorId: selectedCobradorId,
      comisionCalculada: comision,
      netoInstitucion: neto,
      estado: 'Pagado',
      codigoBarra: generateBarcodePayload(socioParaCobrar.socioNumero, selectedPeriod, montoACobrar),
      observaciones: observacionPago.trim(),
    };

    onRegistrarPago(nuevoPago);

    setMensajeScan({
      tipo: 'success',
      texto: `¡Cuota cobrada! Socio Nº ${socioParaCobrar.socioNumero} (${socioParaCobrar.apellido}): ${formatCurrency(montoACobrar)} registrado con éxito. Comisión 25%: ${formatCurrency(comision)}.`,
    });

    setSocioParaCobrar(null);
    barcodeInputRef.current?.focus();
  };

  // Cerrar y emitir comprobante de rendición
  const handleCerrarRendicion = () => {
    if (pagosMesCobrador.length === 0) {
      alert('No hay pagos registrados para este cobrador en este período.');
      return;
    }

    const rendicion: RendicionMensual = {
      id: `rend-${selectedPeriod}-${selectedCobradorId}-${Date.now()}`,
      fecha: new Date().toISOString().slice(0, 10),
      periodo: selectedPeriod,
      cobradorId: selectedCobradorId,
      totalRecaudado: totalBruto,
      comisionTotal: totalComision25,
      netoEntregado: totalNetoInstitucion,
      cantidadRecibos: pagosMesCobrador.length,
      pagosIds: pagosMesCobrador.map((p) => p.id),
      notas: `Rendición mensual de cuotas de ${formatPeriodSpanish(selectedPeriod)} efectuada por ${selectedCobrador?.nombre}.`,
    };

    onGuardarRendicion(rendicion);
    setComprobanteRendicion(rendicion);
  };

  return (
    <div className="space-y-6">
      {/* Selector de Cobrador y Período */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700">
            <ScanLine className="w-4 h-4" />
            <span>Recepción y Rendición de Cuotas Mensuales</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Cargar Presentación de Pagos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Escanee los códigos de barra de los recibos presentados por el cobrador para liquidar en vivo la comisión del 25%.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selector Cobrador */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg">
            <span className="text-xs font-medium text-slate-600 pl-1">Cobrador:</span>
            <select
              value={selectedCobradorId}
              onChange={(e) => setSelectedCobradorId(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {cobradores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} (Comisión {c.porcentajeComision}%)
                </option>
              ))}
            </select>
          </div>

          {/* Selector Período */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg">
            <span className="text-xs font-medium text-slate-600 pl-1">Mes:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {availablePeriods.map((p) => (
                <option key={p} value={p}>
                  {formatPeriodSpanish(p)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Panel de Liquidación en Tiempo Real */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Recibos Cobrados
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {pagosMesCobrador.length}
            </span>
            <span className="text-xs text-slate-500">
              de {sociosCobrador.length} socios asignados
            </span>
          </div>
          <span className="text-[11px] text-indigo-600 font-medium mt-1 block">
            {sociosPendientes.length} cuotas pendientes
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Recaudado (Bruto)
          </span>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {formatCurrency(totalBruto)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Cobrado en mano por {selectedCobrador?.nombre}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-xs bg-amber-50/40">
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">
            Comisión Cobrador (25%)
          </span>
          <div className="mt-2 text-2xl font-bold text-amber-800 tabular-nums">
            {formatCurrency(totalComision25)}
          </div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">
            A liquidar/pagar al cobrador
          </span>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200 p-4 shadow-xs bg-emerald-50/40">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
            Neto para Tesorería (75%)
          </span>
          <div className="mt-2 text-2xl font-bold text-emerald-800 tabular-nums">
            {formatCurrency(totalNetoInstitucion)}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            Ingreso efectivo a la institución
          </span>
        </div>
      </div>

      {/* Barcode Scanner Box */}
      <div className="bg-white rounded-xl border-2 border-indigo-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Lector de Recibos con Código de Barras
              </h2>
              <p className="text-xs text-slate-500">
                Apunte la pistola lectora de código de barras al recibo o tipee el Nº de socio y presione Enter
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-mono">
              Formato: SOC-XXXX-YYYYMM-MONTO
            </span>
          </div>
        </div>

        {/* Input de lectura con autofocus */}
        <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <ScanLine className="w-5 h-5 text-indigo-500 absolute left-3.5 top-3" />
            <input
              ref={barcodeInputRef}
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Escanear código de barras o ingresar Nº de socio..."
              className="w-full pl-11 pr-4 py-2.5 text-sm font-mono border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/70"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            Registrar Código
          </button>
        </form>

        {/* Notification feedback */}
        {mensajeScan && (
          <div
            className={`mt-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
              mensajeScan.tipo === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : mensajeScan.tipo === 'warning'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {mensajeScan.tipo === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span className="font-medium">{mensajeScan.texto}</span>
          </div>
        )}
      </div>

      {/* Modal / Dialogo de Confirmación de Cobro al Escanear */}
      {socioParaCobrar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Confirmar Cobro de Cuota ({formatPeriodSpanish(selectedPeriod)})
                </h3>
              </div>
              <button
                onClick={() => setSocioParaCobrar(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Socio:</span>
                <span className="font-bold text-slate-900 text-sm">
                  #{socioParaCobrar.socioNumero} - {socioParaCobrar.apellido}, {socioParaCobrar.nombre}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DNI:</span>
                <span className="font-medium text-slate-800">{socioParaCobrar.dni}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sector / Domicilio:</span>
                <span className="font-medium text-slate-800">{socioParaCobrar.direccion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cuota habitual acordada:</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(socioParaCobrar.cuotaVoluntaria)}
                </span>
              </div>
            </div>

            {/* Monto efectivamente cobrado */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monto efectivamente pagado por el socio ($):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-bold">$</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={montoACobrar}
                  onChange={(e) => setMontoACobrar(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 text-base font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Permite modificar el valor si el socio abonó un importe a voluntad diferente al habitual.
              </span>
            </div>

            {/* Detalle cálculo comisión instantáneo */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-100 rounded-lg text-xs">
              <div>
                <span className="text-slate-500 block">Comisión cobrador (25%):</span>
                <span className="font-bold text-amber-700 tabular-nums text-sm">
                  {formatCurrency(calculateCommission(montoACobrar).comision)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Neto institución (75%):</span>
                <span className="font-bold text-emerald-700 tabular-nums text-sm">
                  {formatCurrency(calculateCommission(montoACobrar).neto)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observación (opcional):
              </label>
              <input
                type="text"
                value={observacionPago}
                onChange={(e) => setObservacionPago(e.target.value)}
                placeholder="Ej. Recibo nº 045, pagó con cambio justo"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSocioParaCobrar(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarCobro}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar e Ingresar Pago</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Recibos Rendidos vs Socios Pendientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recibos Ingresados en esta rendición */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Cuotas Registradas en esta Rendición ({pagosMesCobrador.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Listado de recibos presentados y liquidados al 25%
                </p>
              </div>

              {pagosMesCobrador.length > 0 && (
                <button
                  onClick={handleCerrarRendicion}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cerrar Rendición y Liquidar</span>
                </button>
              )}
            </div>

            {pagosMesCobrador.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
                <Barcode className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-medium text-slate-700">Aún no hay cuotas cargadas en esta presentación.</p>
                <p className="text-slate-400 mt-1">
                  Escanee el código de barras de cada recibo entregado por {selectedCobrador?.nombre} o haga click en "Cargar" en la lista de pendientes.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Socio</th>
                      <th className="py-2.5 px-3 text-right">Monto Cobrado</th>
                      <th className="py-2.5 px-3 text-right">Comisión 25%</th>
                      <th className="py-2.5 px-3 text-right">Neto Institución (75%)</th>
                      <th className="py-2.5 px-3">Código Barra</th>
                      <th className="py-2.5 px-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagosMesCobrador.map((pago) => {
                      const socio = socios.find((s) => s.id === pago.socioId);
                      return (
                        <tr key={pago.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900 block">
                              #{pago.socioNumero} {socio?.apellido}, {socio?.nombre}
                            </span>
                            <span className="text-[10px] text-slate-500">{socio?.direccion}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                            {formatCurrency(pago.montoCobrado)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-amber-700 font-semibold tabular-nums">
                            {formatCurrency(pago.comisionCalculada)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-emerald-700 font-bold tabular-nums">
                            {formatCurrency(pago.netoInstitucion)}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                            {pago.codigoBarra}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => {
                                if (window.confirm('¿Desea anular este pago registrado?')) {
                                  onEliminarPago(pago.id);
                                }
                              }}
                              title="Anular / Quitar de la rendición"
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {pagosMesCobrador.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2">
              <span>
                Total rendido: <strong>{pagosMesCobrador.length} recibos</strong>
              </span>
              <div className="flex items-center gap-4">
                <span>
                  Comisión total a pagar:{' '}
                  <strong className="text-amber-800">{formatCurrency(totalComision25)}</strong>
                </span>
                <span>
                  Neto a caja: <strong className="text-emerald-800">{formatCurrency(totalNetoInstitucion)}</strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Socios Pendientes de este Cobrador */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Cuotas Pendientes</h3>
                <p className="text-xs text-slate-500">
                  Socios asignados que aún no fueron rendidos en {formatPeriodSpanish(selectedPeriod)}
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {sociosPendientes.length}
              </span>
            </div>

            {sociosPendientes.length === 0 ? (
              <div className="text-center py-8 text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200 text-xs p-4">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
                <p className="font-bold">¡Cobranza Completa!</p>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Todos los socios asignados a {selectedCobrador?.nombre} han abonado la cuota de este período.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {sociosPendientes.map((socio) => (
                  <div
                    key={socio.id}
                    className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 rounded-lg flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-200 px-1.5 rounded">
                          #{socio.socioNumero}
                        </span>
                        <span className="font-bold text-slate-900">
                          {socio.apellido}, {socio.nombre}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5 truncate max-w-[180px]">
                        {socio.direccion}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-700 block tabular-nums">
                        Cuota acordada: {formatCurrency(socio.cuotaVoluntaria)}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSocioParaCobrar(socio);
                        setMontoACobrar(socio.cuotaVoluntaria);
                        setObservacionPago('Carga directa desde lista de pendientes.');
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors"
                    >
                      Cargar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
            Consejo: Puede escanear directamente con la pistola lectora o hacer click en "Cargar" para confirmar.
          </div>
        </div>
      </div>

      {/* Modal Comprobante Oficial de Rendición Mensual */}
      {comprobanteRendicion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Comprobante Oficial de Liquidación de Rendición
                </h3>
              </div>
              <button
                onClick={() => setComprobanteRendicion(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Cobrador:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedCobrador?.nombre}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Período Rendido:</span>
                <span className="font-bold text-slate-900">
                  {formatPeriodSpanish(comprobanteRendicion.periodo)}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Fecha de Cierre:</span>
                <span className="font-medium text-slate-800">{comprobanteRendicion.fecha}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Cantidad de Recibos Rendidos:</span>
                <span className="font-bold text-slate-900">{comprobanteRendicion.cantidadRecibos}</span>
              </div>

              <div className="flex justify-between text-sm pt-1">
                <span className="font-semibold text-slate-700">Total Recaudado (Bruto):</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {formatCurrency(comprobanteRendicion.totalRecaudado)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-amber-800 bg-amber-50 p-2 rounded">
                <span className="font-bold">Comisión Pagada al Cobrador (25%):</span>
                <span className="font-bold tabular-nums">
                  {formatCurrency(comprobanteRendicion.comisionTotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-emerald-800 bg-emerald-50 p-2 rounded">
                <span className="font-bold">Neto Ingresado a Tesorería (75%):</span>
                <span className="font-bold tabular-nums">
                  {formatCurrency(comprobanteRendicion.netoEntregado)}
                </span>
              </div>
            </div>

            {/* Firmas */}
            <div className="grid grid-cols-2 gap-6 pt-6 text-center text-xs text-slate-500">
              <div className="border-t border-slate-300 pt-2">
                <span className="block font-semibold text-slate-700">Firma Tesorero / Comisión</span>
                <span className="text-[10px]">Recibí conforme el neto</span>
              </div>
              <div className="border-t border-slate-300 pt-2">
                <span className="block font-semibold text-slate-700">Firma Cobrador ({selectedCobrador?.nombre})</span>
                <span className="text-[10px]">Recibí conforme mi 25% comisión</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-indigo-600" />
                <span>Imprimir Comprobante</span>
              </button>
              <button
                type="button"
                onClick={() => setComprobanteRendicion(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Cerrar y Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
