import React, { useState, useEffect } from 'react';
import { Cobrador, Socio } from '../types';
import { X, UserCheck, AlertCircle } from 'lucide-react';

interface ModalSocioProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (socio: Partial<Socio>) => void;
  socioAEditar?: Socio | null;
  cobradores: Cobrador[];
  sectores: string[];
  cuotaEstimativaAnual: number;
  siguienteNumeroSocio: number;
}

export const ModalSocio: React.FC<ModalSocioProps> = ({
  isOpen,
  onClose,
  onSave,
  socioAEditar,
  cobradores,
  sectores,
  cuotaEstimativaAnual,
  siguienteNumeroSocio,
}) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [barrio, setBarrio] = useState('');
  const [sector, setSector] = useState(sectores[0] || '');
  const [cobradorId, setCobradorId] = useState(cobradores[0]?.id || 'cob-1');
  const [cuotaVoluntaria, setCuotaVoluntaria] = useState(cuotaEstimativaAnual);
  const [usarCuotaEstimativa, setUsarCuotaEstimativa] = useState(true);
  const [estado, setEstado] = useState<'Activo' | 'Moroso' | 'De Baja'>('Activo');
  const [motivoBaja, setMotivoBaja] = useState('');
  const [notas, setNotas] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (socioAEditar) {
      setNombre(socioAEditar.nombre);
      setApellido(socioAEditar.apellido);
      setDni(socioAEditar.dni);
      setTelefono(socioAEditar.telefono);
      setEmail(socioAEditar.email);
      setDireccion(socioAEditar.direccion);
      setBarrio(socioAEditar.barrio || '');
      setSector(socioAEditar.sector);
      setCobradorId(socioAEditar.cobradorId);
      setCuotaVoluntaria(socioAEditar.cuotaVoluntaria);
      setUsarCuotaEstimativa(socioAEditar.cuotaVoluntaria === cuotaEstimativaAnual);
      setEstado(socioAEditar.estado);
      setMotivoBaja(socioAEditar.motivoBaja || '');
      setNotas(socioAEditar.notas || '');
    } else {
      setNombre('');
      setApellido('');
      setDni('');
      setTelefono('');
      setEmail('');
      setDireccion('');
      setBarrio('');
      setSector(sectores[0] || '');
      setCobradorId(cobradores[0]?.id || 'cob-1');
      setCuotaVoluntaria(cuotaEstimativaAnual);
      setUsarCuotaEstimativa(true);
      setEstado('Activo');
      setMotivoBaja('');
      setNotas('');
    }
    setErrorMsg('');
  }, [socioAEditar, isOpen, cuotaEstimativaAnual, sectores, cobradores]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim() || !dni.trim() || !direccion.trim()) {
      setErrorMsg('Por favor completa los campos obligatorios: Nombre, Apellido, DNI y Dirección.');
      return;
    }

    if (cuotaVoluntaria < 0) {
      setErrorMsg('El valor de la cuota voluntaria no puede ser negativo.');
      return;
    }

    const payload: Partial<Socio> = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      dni: dni.trim(),
      telefono: telefono.trim(),
      email: email.trim(),
      direccion: direccion.trim(),
      barrio: barrio.trim(),
      sector,
      cobradorId,
      cuotaVoluntaria: Number(cuotaVoluntaria),
      estado,
      motivoBaja: estado === 'De Baja' ? motivoBaja.trim() : undefined,
      notas: notas.trim(),
    };

    if (socioAEditar) {
      payload.id = socioAEditar.id;
      payload.socioNumero = socioAEditar.socioNumero;
      payload.fechaAlta = socioAEditar.fechaAlta;
      if (estado === 'De Baja' && !socioAEditar.fechaBaja) {
        payload.fechaBaja = new Date().toISOString().slice(0, 10);
      } else if (estado !== 'De Baja') {
        payload.fechaBaja = undefined;
      }
    } else {
      payload.socioNumero = siguienteNumeroSocio;
      payload.fechaAlta = new Date().toISOString().slice(0, 10);
    }

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              {socioAEditar ? `Editar Socio Nº ${socioAEditar.socioNumero}` : `Alta de Nuevo Socio (Nº ${siguienteNumeroSocio})`}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Datos Personales */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Datos Personales y Contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Martín"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Apellido <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Ej. Gómez"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  DNI / Documento <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="Ej. 30.123.456"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono / Celular
                </label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej. 11-4567-8900"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="socio@email.com"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Domicilio y Cobranza */}
          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Domicilio y Asignación de Cobranza
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dirección (Calle y Número) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej. San Martín 1234"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Barrio / Referencia
                </label>
                <input
                  type="text"
                  value={barrio}
                  onChange={(e) => setBarrio(e.target.value)}
                  placeholder="Ej. Barrio Jardín"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sector / Zona de Cobranza
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  {sectores.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cobrador Asignado
                </label>
                <select
                  value={cobradorId}
                  onChange={(e) => setCobradorId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  {cobradores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} (Comisión {c.porcentajeComision}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cuota A Voluntad */}
          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Cuota Mensual (A Voluntad)
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              La comisión directiva fijó un valor estimativo de{' '}
              <strong className="text-slate-900">${cuotaEstimativaAnual.toLocaleString('es-AR')}</strong>.
              El socio puede acordar un valor personalizado según su posibilidad económica.
            </p>

            <div className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chkCuotaEstimativa"
                  checked={usarCuotaEstimativa}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setUsarCuotaEstimativa(checked);
                    if (checked) {
                      setCuotaVoluntaria(cuotaEstimativaAnual);
                    }
                  }}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="chkCuotaEstimativa" className="text-sm font-medium text-slate-800">
                  Abonar cuota estimativa anual fijada por la comisión (${cuotaEstimativaAnual.toLocaleString('es-AR')})
                </label>
              </div>

              {!usarCuotaEstimativa && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monto pactado voluntariamente ($):
                  </label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3 top-2 text-slate-500 text-sm">$</span>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={cuotaVoluntaria}
                      onChange={(e) => setCuotaVoluntaria(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white tabular-nums"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Ej: jubilados, estudiantes o socios protectores que aportan montos diferentes.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Estado del Socio */}
          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Estado y Observaciones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estado
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as 'Activo' | 'Moroso' | 'De Baja')}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Activo">Activo (Habilitado)</option>
                  <option value="Moroso">Moroso (Con deuda de cuotas)</option>
                  <option value="De Baja">De Baja</option>
                </select>
              </div>

              {estado === 'De Baja' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Motivo de Baja
                  </label>
                  <input
                    type="text"
                    value={motivoBaja}
                    onChange={(e) => setMotivoBaja(e.target.value)}
                    placeholder="Ej. Mudanza, fallecimiento, renuncia"
                    className="w-full px-3 py-2 text-sm border border-rose-300 bg-rose-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notas / Observaciones
                </label>
                <textarea
                  rows={2}
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Detalles sobre horarios de cobranza, preferencias del socio, etc."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              {socioAEditar ? 'Guardar Cambios' : 'Registrar Socio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
