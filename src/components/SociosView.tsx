import React, { useState, useMemo } from 'react';
import { Cobrador, Pago, Socio } from '../types';
import {
  Search,
  Filter,
  UserPlus,
  Edit2,
  FileText,
  UserX,
  UserCheck,
  Download,
  AlertTriangle,
  Building2,
  SlidersHorizontal
} from 'lucide-react';
import { formatCurrency } from '../utils/finance';

interface SociosViewProps {
  socios: Socio[];
  pagos: Pago[];
  cobradores: Cobrador[];
  sectores: string[];
  cuotaEstimativaAnual: number;
  onOpenNuevoSocio: () => void;
  onOpenEditarSocio: (socio: Socio) => void;
  onOpenFichaSocio: (socio: Socio) => void;
  onCambiarEstadoSocio: (socioId: string, nuevoEstado: 'Activo' | 'Moroso' | 'De Baja', motivo?: string) => void;
}

export const SociosView: React.FC<SociosViewProps> = ({
  socios,
  pagos,
  cobradores,
  sectores,
  cuotaEstimativaAnual,
  onOpenNuevoSocio,
  onOpenEditarSocio,
  onOpenFichaSocio,
  onCambiarEstadoSocio,
}) => {
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [filterCobrador, setFilterCobrador] = useState<string>('todos');
  const [filterSector, setFilterSector] = useState<string>('todos');

  // Filtrado de socios
  const filteredSocios = useMemo(() => {
    return socios.filter((s) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.nombre.toLowerCase().includes(q) ||
        s.apellido.toLowerCase().includes(q) ||
        s.dni.includes(q) ||
        String(s.socioNumero).includes(q) ||
        s.direccion.toLowerCase().includes(q);

      const matchEstado = filterEstado === 'todos' || s.estado === filterEstado;
      const matchCobrador = filterCobrador === 'todos' || s.cobradorId === filterCobrador;
      const matchSector = filterSector === 'todos' || s.sector === filterSector;

      return matchSearch && matchEstado && matchCobrador && matchSector;
    });
  }, [socios, search, filterEstado, filterCobrador, filterSector]);

  // Exportar a CSV
  const handleExportCSV = () => {
    const headers = [
      'Nº Socio',
      'Apellido y Nombre',
      'DNI',
      'Teléfono',
      'Email',
      'Dirección',
      'Sector',
      'Cobrador',
      'Estado',
      'Cuota Voluntaria ($)',
      'Fecha Alta',
      'Fecha Baja',
    ];

    const rows = filteredSocios.map((s) => {
      const cobrador = cobradores.find((c) => c.id === s.cobradorId)?.nombre || s.cobradorId;
      return [
        s.socioNumero,
        `"${s.apellido}, ${s.nombre}"`,
        `"${s.dni}"`,
        `"${s.telefono}"`,
        `"${s.email}"`,
        `"${s.direccion}"`,
        `"${s.sector}"`,
        `"${cobrador}"`,
        s.estado,
        s.cuotaVoluntaria,
        s.fechaAlta,
        s.fechaBaja || '',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `padron_socios_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header and Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Padrón General de Socios</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de altas, bajas, domicilios, asignación de cobradores y valor de cuota a voluntad.
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
            onClick={onOpenNuevoSocio}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Nuevo Socio</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, DNI, Nº..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* Filter Estado */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">Estado:</span>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full py-2 px-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              <option value="todos">Todos los Estados</option>
              <option value="Activo">Activos</option>
              <option value="Moroso">Morosos</option>
              <option value="De Baja">Dados de Baja</option>
            </select>
          </div>

          {/* Filter Cobrador */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">Cobrador:</span>
            <select
              value={filterCobrador}
              onChange={(e) => setFilterCobrador(e.target.value)}
              className="w-full py-2 px-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              <option value="todos">Todos los Cobradores</option>
              {cobradores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Sector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">Sector:</span>
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="w-full py-2 px-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            >
              <option value="todos">Todos los Sectores</option>
              {sectores.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Mostrando {filteredSocios.length} de {socios.length} socios registrados</span>
          {(search || filterEstado !== 'todos' || filterCobrador !== 'todos' || filterSector !== 'todos') && (
            <button
              onClick={() => {
                setSearch('');
                setFilterEstado('todos');
                setFilterCobrador('todos');
                setFilterSector('todos');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Table of Socios */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Nº Socio</th>
                <th className="py-3 px-4">Apellido y Nombre</th>
                <th className="py-3 px-4">Domicilio / Sector</th>
                <th className="py-3 px-4">Cobrador</th>
                <th className="py-3 px-4 text-right">Cuota Mensual</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSocios.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    No se encontraron socios que coincidan con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredSocios.map((socio) => {
                  const cobrador = cobradores.find((c) => c.id === socio.cobradorId);
                  const esEstimativa = socio.cuotaVoluntaria === cuotaEstimativaAnual;

                  return (
                    <tr key={socio.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Nº Socio */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          #{socio.socioNumero}
                        </span>
                      </td>

                      {/* Nombre y DNI */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onOpenFichaSocio(socio)}
                          className="font-bold text-slate-900 hover:text-indigo-600 text-left block"
                        >
                          {socio.apellido}, {socio.nombre}
                        </button>
                        <span className="text-[11px] text-slate-500 block">
                          DNI {socio.dni} · {socio.telefono || 'Sin tel'}
                        </span>
                      </td>

                      {/* Domicilio y Sector */}
                      <td className="py-3 px-4 text-slate-700">
                        <span className="block font-medium truncate max-w-xs">{socio.direccion}</span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                          {socio.sector}
                        </span>
                      </td>

                      {/* Cobrador */}
                      <td className="py-3 px-4 text-slate-700">
                        <span className="font-semibold block">{cobrador?.nombre || 'Sin asignar'}</span>
                        <span className="text-[10px] text-slate-500">Comisión 25%</span>
                      </td>

                      {/* Cuota A Voluntad */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-slate-900 text-sm tabular-nums block">
                          {formatCurrency(socio.cuotaVoluntaria)}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {esEstimativa ? 'Cuota Estimativa' : 'Cuota Acordada'}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                            socio.estado === 'Activo'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : socio.estado === 'Moroso'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {socio.estado}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenFichaSocio(socio)}
                            title="Ver Ficha y Pagos"
                            aria-label={`Ver ficha de ${socio.nombre} ${socio.apellido}`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onOpenEditarSocio(socio)}
                            title="Editar Datos"
                            aria-label={`Editar ${socio.nombre} ${socio.apellido}`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {socio.estado !== 'De Baja' ? (
                            <button
                              onClick={() => {
                                const motivo = window.prompt(
                                  `Ingrese el motivo de baja para ${socio.apellido}, ${socio.nombre}:`,
                                  'Mudanza / Dificultad económica'
                                );
                                if (motivo !== null) {
                                  onCambiarEstadoSocio(socio.id, 'De Baja', motivo);
                                }
                              }}
                              title="Dar de Baja"
                              aria-label={`Dar de baja a ${socio.nombre} ${socio.apellido}`}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onCambiarEstadoSocio(socio.id, 'Activo')}
                              title="Reactivar Socio"
                              aria-label={`Reactivar a ${socio.nombre} ${socio.apellido}`}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
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
