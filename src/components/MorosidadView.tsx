import React, { useState, useMemo } from 'react';
import { Cobrador, InstitucionConfig, Pago, Socio } from '../types';
import {
  AlertTriangle,
  Printer,
  Download,
  Filter,
  Search,
  Phone,
  MapPin,
  Clock,
  ShieldAlert,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import {
  calculateMorosidad,
  formatCurrency,
  formatPeriodSpanish
} from '../utils/finance';

interface MorosidadViewProps {
  socios: Socio[];
  pagos: Pago[];
  config: InstitucionConfig;
  onOpenFichaSocio: (socio: Socio) => void;
}

export const MorosidadView: React.FC<MorosidadViewProps> = ({
  socios,
  pagos,
  config,
  onOpenFichaSocio,
}) => {
  const [selectedSector, setSelectedSector] = useState<string>('todos');
  const [selectedCobrador, setSelectedCobrador] = useState<string>('todos');
  const [selectedGravedad, setSelectedGravedad] = useState<string>('todos');
  const [search, setSearch] = useState('');

  // Cálculo automático de morosos
  const todosMorosos = useMemo(() => {
    return calculateMorosidad(socios, pagos, '2026-11', 6);
  }, [socios, pagos]);

  // Filtrado
  const morososFiltrados = useMemo(() => {
    return todosMorosos.filter((m) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.socio.nombre.toLowerCase().includes(q) ||
        m.socio.apellido.toLowerCase().includes(q) ||
        m.socio.dni.includes(q) ||
        String(m.socio.socioNumero).includes(q) ||
        m.socio.direccion.toLowerCase().includes(q);

      const matchSector = selectedSector === 'todos' || m.socio.sector === selectedSector;
      const matchCobrador = selectedCobrador === 'todos' || m.socio.cobradorId === selectedCobrador;
      const matchGravedad = selectedGravedad === 'todos' || m.nivelGravedad === selectedGravedad;

      return matchSearch && matchSector && matchCobrador && matchGravedad;
    });
  }, [todosMorosos, search, selectedSector, selectedCobrador, selectedGravedad]);

  // Totales y estadísticas por Sector
  const resumenPorSector = useMemo(() => {
    const sectoresMap: Record<string, { cantidad: number; deudaTotal: number; criticos: number }> = {};

    config.sectores.forEach((sec) => {
      sectoresMap[sec] = { cantidad: 0, deudaTotal: 0, criticos: 0 };
    });

    todosMorosos.forEach((m) => {
      if (!sectoresMap[m.socio.sector]) {
        sectoresMap[m.socio.sector] = { cantidad: 0, deudaTotal: 0, criticos: 0 };
      }
      sectoresMap[m.socio.sector].cantidad += 1;
      sectoresMap[m.socio.sector].deudaTotal += m.deudaTotalEstimada;
      if (m.nivelGravedad === 'Critico') {
        sectoresMap[m.socio.sector].criticos += 1;
      }
    });

    return sectoresMap;
  }, [todosMorosos, config.sectores]);

  const totalDeudaGeneral = todosMorosos.reduce((sum, m) => sum + m.deudaTotalEstimada, 0);
  const totalMorosos = todosMorosos.length;
  const totalSociosActivos = socios.filter((s) => s.estado !== 'De Baja').length;
  const porcentajeMorosidad = totalSociosActivos > 0 ? Math.round((totalMorosos / totalSociosActivos) * 100) : 0;

  // Exportar a CSV
  const handleExportCSV = () => {
    const headers = [
      'Nº Socio',
      'Apellido y Nombre',
      'DNI',
      'Teléfono',
      'Sector',
      'Cobrador',
      'Meses Adeudados',
      'Períodos Impagos',
      'Deuda Total Estimada ($)',
      'Gravedad',
    ];

    const rows = morososFiltrados.map((m) => {
      const cobrador = config.cobradores.find((c) => c.id === m.socio.cobradorId)?.nombre || m.socio.cobradorId;
      return [
        m.socio.socioNumero,
        `"${m.socio.apellido}, ${m.socio.nombre}"`,
        `"${m.socio.dni}"`,
        `"${m.socio.telefono}"`,
        `"${m.socio.sector}"`,
        `"${cobrador}"`,
        m.mesesAdeudados,
        `"${m.periodosAdeudados.join('; ')}"`,
        m.deudaTotalEstimada,
        m.nivelGravedad,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_morosidad_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-700">
            <ShieldAlert className="w-4 h-4" />
            <span>Control y Auditoría de Deuda de Cuotas</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Reporte Automático de Morosidad por Sector
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Detección de socios con cuotas adeudadas, segmentación por zona geográfica y asignación a cobrador.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Reporte</span>
          </button>
        </div>
      </div>

      {/* KPI Cards de Morosidad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Socios con Deuda
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-700 tabular-nums">
              {totalMorosos}
            </span>
            <span className="text-xs text-slate-500">
              de {totalSociosActivos} socios activos
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Índice de mora: <strong>{porcentajeMorosidad}%</strong>
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Deuda Total Acumulada
          </span>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {formatCurrency(totalDeudaGeneral)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Suma de cuotas a voluntad pendientes
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Mora Crítica (3+ meses)
          </span>
          <div className="mt-2 text-2xl font-bold text-rose-800 tabular-nums">
            {todosMorosos.filter((m) => m.nivelGravedad === 'Critico').length} socios
          </div>
          <span className="text-[11px] text-rose-700 font-medium mt-1 block">
            Requiere gestión especial de comisión
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Mora Leve (1 mes)
          </span>
          <div className="mt-2 text-2xl font-bold text-amber-700 tabular-nums">
            {todosMorosos.filter((m) => m.nivelGravedad === 'Leve').length} socios
          </div>
          <span className="text-[11px] text-amber-800 mt-1 block">
            Cobro habitual a regularizar en la próxima ruta
          </span>
        </div>
      </div>

      {/* Resumen por Sector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Distribución de Morosidad por Sector Geográfico
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Permite a los cobradores enfocar los recorridos en las zonas con mayor acumulación de deuda
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(resumenPorSector).map(([sectorNombre, data]) => {
            const isSelected = selectedSector === sectorNombre;
            return (
              <div
                key={sectorNombre}
                onClick={() => setSelectedSector(isSelected ? 'todos' : sectorNombre)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70'
                }`}
              >
                <span className="text-xs font-bold text-slate-900 block truncate leading-tight">
                  {sectorNombre}
                </span>
                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-lg font-bold text-slate-900 tabular-nums">
                      {data.cantidad} morosos
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {data.criticos > 0 ? `${data.criticos} críticos` : 'Sin casos críticos'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-rose-700 tabular-nums">
                    {formatCurrency(data.deudaTotal)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters (Hidden on Print) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 no-print">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por socio o dirección..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        <div>
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

        <div>
          <select
            value={selectedCobrador}
            onChange={(e) => setSelectedCobrador(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <option value="todos">Todos los cobradores</option>
            {config.cobradores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedGravedad}
            onChange={(e) => setSelectedGravedad(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <option value="todos">Cualquier gravedad</option>
            <option value="Leve">Leve (1 mes)</option>
            <option value="Moderado">Moderado (2 meses)</option>
            <option value="Critico">Crítico (3 o más meses)</option>
          </select>
        </div>
      </div>

      {/* Tabla Detallada de Socios Morosos */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs print:border-none print:shadow-none">
        {/* Cabecera oficial en impresión */}
        <div className="hidden print:block p-4 border-b-2 border-slate-900 mb-2">
          <h2 className="text-xl font-black text-slate-900 uppercase">{config.nombre}</h2>
          <p className="text-xs text-slate-600">INFORME OFICIAL DE SOCIOS MOROSOS POR SECTOR - FECHA: {new Date().toLocaleDateString('es-AR')}</p>
          <p className="text-xs text-slate-700 mt-1">
            Sector: <strong>{selectedSector === 'todos' ? 'TODOS LOS SECTORES' : selectedSector}</strong> · Total adeudado: <strong>{formatCurrency(totalDeudaGeneral)}</strong>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Socio</th>
                <th className="py-3 px-4">Domicilio / Sector</th>
                <th className="py-3 px-4">Cobrador</th>
                <th className="py-3 px-4 text-center">Meses Deuda</th>
                <th className="py-3 px-4">Períodos Impagos</th>
                <th className="py-3 px-4 text-right">Deuda Estimada</th>
                <th className="py-3 px-4 text-center">Gravedad</th>
                <th className="py-3 px-4 text-center no-print">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {morososFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500">
                    No se encontraron socios morosos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                morososFiltrados.map((m) => {
                  const cobrador = config.cobradores.find((c) => c.id === m.socio.cobradorId);

                  return (
                    <tr key={m.socio.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block leading-tight">
                          #{m.socio.socioNumero} - {m.socio.apellido}, {m.socio.nombre}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          DNI {m.socio.dni} {m.socio.telefono ? `· ${m.socio.telefono}` : ''}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        <span className="font-medium block truncate max-w-xs">{m.socio.direccion}</span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-xs">{m.socio.sector}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        <span className="font-semibold block">{cobrador?.nombre || 'Sin cobrador'}</span>
                        <span className="text-[10px] text-slate-500">Comisión 25%</span>
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-slate-900 tabular-nums">
                        {m.mesesAdeudados} {m.mesesAdeudados === 1 ? 'mes' : 'meses'}
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {m.periodosAdeudados.map(p => formatPeriodSpanish(p)).join(', ')}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-rose-700 tabular-nums text-sm">
                        {formatCurrency(m.deudaTotalEstimada)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            m.nivelGravedad === 'Critico'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : m.nivelGravedad === 'Moderado'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                          }`}
                        >
                          {m.nivelGravedad}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center no-print">
                        <button
                          onClick={() => onOpenFichaSocio(m.socio)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                        >
                          Ver Ficha
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
