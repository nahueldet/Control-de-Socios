import React, { useState } from 'react';
import { Cobrador, InstitucionConfig } from '../types';
import {
  Settings,
  Building2,
  DollarSign,
  Users,
  Save,
  CheckCircle2,
  Download,
  Upload,
  RotateCcw,
  Percent
} from 'lucide-react';
import { formatCurrency } from '../utils/finance';

interface ConfiguracionViewProps {
  config: InstitucionConfig;
  onSaveConfig: (newConfig: InstitucionConfig) => void;
  onResetData: () => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ConfiguracionView: React.FC<ConfiguracionViewProps> = ({
  config,
  onSaveConfig,
  onResetData,
  onExportJSON,
  onImportJSON,
}) => {
  const [nombre, setNombre] = useState(config.nombre);
  const [subtitulo, setSubtitulo] = useState(config.subtitulo);
  const [cuit, setCuit] = useState(config.cuit);
  const [direccion, setDireccion] = useState(config.direccion);
  const [telefono, setTelefono] = useState(config.telefono);
  const [cuotaEstimativaAnual, setCuotaEstimativaAnual] = useState(config.cuotaEstimativaAnual);
  const [comisionPorcentaje, setComisionPorcentaje] = useState(config.comisionPorcentaje);

  // Cobradores
  const [cobrador1Nombre, setCobrador1Nombre] = useState(config.cobradores[0]?.nombre || '');
  const [cobrador1Tel, setCobrador1Tel] = useState(config.cobradores[0]?.telefono || '');
  const [cobrador1Sector, setCobrador1Sector] = useState(config.cobradores[0]?.sectorPrincipal || '');

  const [cobrador2Nombre, setCobrador2Nombre] = useState(config.cobradores[1]?.nombre || '');
  const [cobrador2Tel, setCobrador2Tel] = useState(config.cobradores[1]?.telefono || '');
  const [cobrador2Sector, setCobrador2Sector] = useState(config.cobradores[1]?.sectorPrincipal || '');

  const [guardadoExito, setGuardadoExito] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedCobradores: Cobrador[] = [
      {
        id: 'cob-1',
        nombre: cobrador1Nombre.trim(),
        telefono: cobrador1Tel.trim(),
        sectorPrincipal: cobrador1Sector.trim(),
        porcentajeComision: Number(comisionPorcentaje),
        activo: true,
      },
      {
        id: 'cob-2',
        nombre: cobrador2Nombre.trim(),
        telefono: cobrador2Tel.trim(),
        sectorPrincipal: cobrador2Sector.trim(),
        porcentajeComision: Number(comisionPorcentaje),
        activo: true,
      },
    ];

    const newConfig: InstitucionConfig = {
      ...config,
      nombre: nombre.trim(),
      subtitulo: subtitulo.trim(),
      cuit: cuit.trim(),
      direccion: direccion.trim(),
      telefono: telefono.trim(),
      cuotaEstimativaAnual: Number(cuotaEstimativaAnual),
      comisionPorcentaje: Number(comisionPorcentaje),
      cobradores: updatedCobradores,
    };

    onSaveConfig(newConfig);
    setGuardadoExito(true);
    setTimeout(() => setGuardadoExito(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Configuración Institucional</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Parámetros de la comisión directiva, valor de cuota estimativa anual, cobradores y respaldo de datos.
          </p>
        </div>

        {guardadoExito && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Configuración guardada</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos Institución */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Datos de la Institución</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre de la Institución (Taller Protegido de Producción)
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subtítulo / Personería Jurídica
              </label>
              <input
                type="text"
                value={subtitulo}
                onChange={(e) => setSubtitulo(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CUIT
              </label>
              <input
                type="text"
                value={cuit}
                onChange={(e) => setCuit(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono Institucional
              </label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Domicilio Legal
              </label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Parámetros de Cuota y Comisión */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Régimen de Cuota Estimativa y Comisión de Cobranza
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-900">
                Valor Estimativo de Cuota Anual ($)
              </label>
              <p className="text-[11px] text-slate-500">
                Monto fijado por la comisión directiva a principio de año como sugerencia. Cada socio puede mantener este monto o acordar uno voluntario diferenciado.
              </p>
              <div className="relative pt-1">
                <span className="absolute left-3 top-3.5 text-slate-500 text-sm font-bold">$</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  required
                  value={cuotaEstimativaAnual}
                  onChange={(e) => setCuotaEstimativaAnual(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 text-base font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white tabular-nums"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-900">
                Porcentaje de Comisión a Cobradores (%)
              </label>
              <p className="text-[11px] text-slate-500">
                Porcentaje asignado a los cobradores sobre el monto total efectivamente recaudado en cada rendición mensual.
              </p>
              <div className="relative pt-1">
                <span className="absolute right-3 top-3.5 text-slate-500 text-sm font-bold">%</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  required
                  value={comisionPorcentaje}
                  onChange={(e) => setComisionPorcentaje(Number(e.target.value))}
                  className="w-full pl-3 pr-8 py-2 text-base font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white tabular-nums"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Configuración de los 2 Cobradores */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Gestión de los 2 Cobradores Oficiales
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cobrador 1 */}
            <div className="p-4 border border-indigo-200 bg-indigo-50/30 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-bold text-slate-900">Cobrador 1</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={cobrador1Nombre}
                  onChange={(e) => setCobrador1Nombre(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono / Celular
                </label>
                <input
                  type="text"
                  value={cobrador1Tel}
                  onChange={(e) => setCobrador1Tel(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sector Principal
                </label>
                <input
                  type="text"
                  value={cobrador1Sector}
                  onChange={(e) => setCobrador1Sector(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            {/* Cobrador 2 */}
            <div className="p-4 border border-indigo-200 bg-indigo-50/30 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm font-bold text-slate-900">Cobrador 2</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={cobrador2Nombre}
                  onChange={(e) => setCobrador2Nombre(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono / Celular
                </label>
                <input
                  type="text"
                  value={cobrador2Tel}
                  onChange={(e) => setCobrador2Tel(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sector Principal
                </label>
                <input
                  type="text"
                  value={cobrador2Sector}
                  onChange={(e) => setCobrador2Sector(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botón Guardar Cambios */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración</span>
          </button>
        </div>
      </form>

      {/* Respaldo y Gestión de Datos */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Copia de Seguridad y Restauración de Datos
        </h2>
        <p className="text-xs text-slate-500">
          Exporte toda la base de datos (socios, cuotas cobradas, rendiciones y parámetros) a un archivo JSON para respaldo seguro o impórtela en cualquier momento.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={onExportJSON}
            className="p-3 border border-slate-300 hover:bg-slate-50 rounded-xl text-left flex items-center gap-3 transition-colors"
          >
            <Download className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">Exportar Base JSON</span>
              <span className="text-[10px] text-slate-500 block">Descargar copia completa</span>
            </div>
          </button>

          <label className="p-3 border border-slate-300 hover:bg-slate-50 rounded-xl text-left flex items-center gap-3 transition-colors cursor-pointer">
            <Upload className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-slate-900 block">Restaurar desde JSON</span>
              <span className="text-[10px] text-slate-500 block">Cargar archivo de respaldo</span>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={onImportJSON}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={onResetData}
            className="p-3 border border-rose-200 hover:bg-rose-50/50 rounded-xl text-left flex items-center gap-3 transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-rose-900 block">Reiniciar Datos Muestra</span>
              <span className="text-[10px] text-rose-600 block">Restablecer datos de inicio</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
