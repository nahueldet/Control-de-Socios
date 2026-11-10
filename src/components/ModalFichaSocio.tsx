import React from 'react';
import { Cobrador, Pago, Socio } from '../types';
import { X, Calendar, MapPin, Phone, Mail, DollarSign, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency, formatPeriodSpanish } from '../utils/finance';
import { BarcodeRenderer } from './BarcodeRenderer';

interface ModalFichaSocioProps {
  isOpen: boolean;
  onClose: () => void;
  socio: Socio | null;
  pagos: Pago[];
  cobradores: Cobrador[];
}

export const ModalFichaSocio: React.FC<ModalFichaSocioProps> = ({
  isOpen,
  onClose,
  socio,
  pagos,
  cobradores,
}) => {
  if (!isOpen || !socio) return null;

  const cobrador = cobradores.find((c) => c.id === socio.cobradorId);
  const pagosSocio = pagos
    .filter((p) => p.socioId === socio.id)
    .sort((a, b) => b.periodo.localeCompare(a.periodo));

  const totalAportado = pagosSocio
    .filter((p) => p.estado === 'Pagado')
    .reduce((sum, p) => sum + p.montoCobrado, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                SOCIO Nº {socio.socioNumero}
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                {socio.apellido}, {socio.nombre}
              </h2>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  socio.estado === 'Activo'
                    ? 'bg-emerald-100 text-emerald-800'
                    : socio.estado === 'Moroso'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {socio.estado}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">DNI {socio.dni} · Alta: {socio.fechaAlta}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar ficha"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Tarjeta Resumen Cuota y Cobranza */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 block">Cuota acordada</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {formatCurrency(socio.cuotaVoluntaria)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Mensual a voluntad</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Cobrador asignado</span>
              <span className="text-sm font-semibold text-slate-800 block truncate">
                {cobrador?.nombre || 'Sin cobrador'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">{socio.sector}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Total Histórico Aportado</span>
              <span className="text-lg font-bold text-emerald-700 tabular-nums">
                {formatCurrency(totalAportado)}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">{pagosSocio.length} pagos registrados</span>
            </div>
          </div>

          {/* Datos de Contacto y Domicilio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  <strong>Domicilio:</strong> {socio.direccion} {socio.barrio && `(${socio.barrio})`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  <strong>Teléfono:</strong> {socio.telefono || 'No registrado'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  <strong>Email:</strong> {socio.email || 'No registrado'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  <strong>Fecha de Ingreso:</strong> {socio.fechaAlta}
                </span>
              </div>
            </div>
          </div>

          {socio.estado === 'De Baja' && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
              <strong>Socio dado de baja el {socio.fechaBaja || 'N/D'}:</strong> {socio.motivoBaja || 'Sin motivo especificado'}
            </div>
          )}

          {socio.notas && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-900">
              <strong>Observaciones:</strong> {socio.notas}
            </div>
          )}

          {/* Historial de Pagos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                Historial de Pagos y Cuotas Registradas
              </h3>
              <span className="text-xs text-slate-500">{pagosSocio.length} comprobantes</span>
            </div>

            {pagosSocio.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-xs text-slate-500">
                No hay pagos registrados para este socio todavía.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2.5">Período</th>
                      <th className="px-3 py-2.5">Fecha Cobro</th>
                      <th className="px-3 py-2.5 text-right">Monto</th>
                      <th className="px-3 py-2.5 text-right">Comisión Cobrador (25%)</th>
                      <th className="px-3 py-2.5 text-right">Neto Institución (75%)</th>
                      <th className="px-3 py-2.5 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {pagosSocio.map((pago) => (
                      <tr key={pago.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium text-slate-900">
                          {formatPeriodSpanish(pago.periodo)}
                        </td>
                        <td className="px-3 py-2 text-slate-600">{pago.fechaCobro}</td>
                        <td className="px-3 py-2 text-right font-semibold text-slate-900 tabular-nums">
                          {formatCurrency(pago.montoCobrado)}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-600 tabular-nums">
                          {formatCurrency(pago.comisionCalculada)}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-emerald-700 tabular-nums">
                          {formatCurrency(pago.netoInstitucion)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            {pago.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Código de barra de cuota actual */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
            <span className="text-xs text-slate-600 mb-2 font-medium">
              Código de Barra de Cuota Rápida (Para Lector en Cobranza)
            </span>
            <BarcodeRenderer
              value={`SOC-${String(socio.socioNumero).padStart(4, '0')}-202611-${socio.cuotaVoluntaria}`}
              height={44}
              barWidth={1.8}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
