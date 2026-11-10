import React, { useState, useEffect } from 'react';
import {
  INITIAL_CONFIG,
  INITIAL_RENDICIONES,
  INITIAL_SOCIOS,
  generateInitialPagos
} from './data/initialData';
import { Cobrador, InstitucionConfig, Pago, RendicionMensual, Socio } from './types';
import { Navigation, TabType } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { SociosView } from './components/SociosView';
import { RendicionCobranzaView } from './components/RendicionCobranzaView';
import { PlanillaRecibosView } from './components/PlanillaRecibosView';
import { MorosidadView } from './components/MorosidadView';
import { ConfiguracionView } from './components/ConfiguracionView';
import { ModalSocio } from './components/ModalSocio';
import { ModalFichaSocio } from './components/ModalFichaSocio';
import { ModalInformeComision } from './components/ModalInformeComision';

const STORAGE_KEY_SOCIOS = 'app_socios_data_v1';
const STORAGE_KEY_PAGOS = 'app_pagos_data_v1';
const STORAGE_KEY_RENDICIONES = 'app_rendiciones_data_v1';
const STORAGE_KEY_CONFIG = 'app_config_data_v1';

export default function App() {
  // Inicialización de estado con soporte para localStorage
  const [socios, setSocios] = useState<Socio[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOCIOS);
      return saved ? JSON.parse(saved) : INITIAL_SOCIOS;
    } catch {
      return INITIAL_SOCIOS;
    }
  });

  const [pagos, setPagos] = useState<Pago[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PAGOS);
      return saved ? JSON.parse(saved) : generateInitialPagos(INITIAL_SOCIOS);
    } catch {
      return generateInitialPagos(INITIAL_SOCIOS);
    }
  });

  const [rendiciones, setRendiciones] = useState<RendicionMensual[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RENDICIONES);
      return saved ? JSON.parse(saved) : INITIAL_RENDICIONES;
    } catch {
      return INITIAL_RENDICIONES;
    }
  });

  const [config, setConfig] = useState<InstitucionConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      return saved ? JSON.parse(saved) : INITIAL_CONFIG;
    } catch {
      return INITIAL_CONFIG;
    }
  });

  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');

  // Modales
  const [modalSocioOpen, setModalSocioOpen] = useState(false);
  const [socioAEditar, setSocioAEditar] = useState<Socio | null>(null);
  const [socioParaFicha, setSocioParaFicha] = useState<Socio | null>(null);
  const [modalInformeOpen, setModalInformeOpen] = useState(false);

  // Persistir en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SOCIOS, JSON.stringify(socios));
    } catch (e) {
      console.error('Error saving socios to localStorage', e);
    }
  }, [socios]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PAGOS, JSON.stringify(pagos));
    } catch (e) {
      console.error('Error saving pagos to localStorage', e);
    }
  }, [pagos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RENDICIONES, JSON.stringify(rendiciones));
    } catch (e) {
      console.error('Error saving rendiciones to localStorage', e);
    }
  }, [rendiciones]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Error saving config to localStorage', e);
    }
  }, [config]);

  // Siguiente número correlativo de socio
  const siguienteNumeroSocio = socios.length > 0 ? Math.max(...socios.map((s) => s.socioNumero)) + 1 : 101;

  // Guardar o Editar Socio
  const handleGuardarSocio = (datosSocio: Partial<Socio>) => {
    if (datosSocio.id) {
      // Edición
      setSocios((prev) =>
        prev.map((s) => (s.id === datosSocio.id ? ({ ...s, ...datosSocio } as Socio) : s))
      );
    } else {
      // Alta de nuevo socio
      const nuevo: Socio = {
        id: `soc-${Date.now()}`,
        socioNumero: datosSocio.socioNumero || siguienteNumeroSocio,
        nombre: datosSocio.nombre || '',
        apellido: datosSocio.apellido || '',
        dni: datosSocio.dni || '',
        telefono: datosSocio.telefono || '',
        email: datosSocio.email || '',
        direccion: datosSocio.direccion || '',
        barrio: datosSocio.barrio || '',
        sector: datosSocio.sector || config.sectores[0],
        cobradorId: datosSocio.cobradorId || config.cobradores[0]?.id || 'cob-1',
        estado: 'Activo',
        cuotaVoluntaria: datosSocio.cuotaVoluntaria ?? config.cuotaEstimativaAnual,
        fechaAlta: datosSocio.fechaAlta || new Date().toISOString().slice(0, 10),
        notas: datosSocio.notas || '',
      };
      setSocios((prev) => [nuevo, ...prev]);
    }
  };

  // Cambiar estado de socio (Activo / Moroso / De Baja)
  const handleCambiarEstadoSocio = (
    socioId: string,
    nuevoEstado: 'Activo' | 'Moroso' | 'De Baja',
    motivo?: string
  ) => {
    setSocios((prev) =>
      prev.map((s) => {
        if (s.id !== socioId) return s;
        return {
          ...s,
          estado: nuevoEstado,
          fechaBaja: nuevoEstado === 'De Baja' ? new Date().toISOString().slice(0, 10) : undefined,
          motivoBaja: nuevoEstado === 'De Baja' ? motivo || 'Baja solicitada' : undefined,
        };
      })
    );
  };

  // Registrar Pago presentado por cobrador
  const handleRegistrarPago = (nuevoPago: Pago) => {
    setPagos((prev) => [nuevoPago, ...prev]);

    // Si el socio estaba como Moroso, actualizamos a Activo si regularizó
    setSocios((prev) =>
      prev.map((s) => {
        if (s.id === nuevoPago.socioId && s.estado === 'Moroso') {
          return { ...s, estado: 'Activo' };
        }
        return s;
      })
    );
  };

  // Eliminar / anular un pago
  const handleEliminarPago = (pagoId: string) => {
    setPagos((prev) => prev.filter((p) => p.id !== pagoId));
  };

  // Guardar rendición mensual cerrada
  const handleGuardarRendicion = (rendicion: RendicionMensual) => {
    setRendiciones((prev) => [rendicion, ...prev]);
  };

  // Resetear a datos iniciales de demostración
  const handleResetData = () => {
    if (window.confirm('¿Está seguro de reiniciar los datos a la muestra inicial? Se perderán las modificaciones no respaldadas.')) {
      const initialPagos = generateInitialPagos(INITIAL_SOCIOS);
      setSocios(INITIAL_SOCIOS);
      setPagos(initialPagos);
      setRendiciones(INITIAL_RENDICIONES);
      setConfig(INITIAL_CONFIG);
      localStorage.removeItem(STORAGE_KEY_SOCIOS);
      localStorage.removeItem(STORAGE_KEY_PAGOS);
      localStorage.removeItem(STORAGE_KEY_RENDICIONES);
      localStorage.removeItem(STORAGE_KEY_CONFIG);
      alert('Datos reiniciados con éxito.');
    }
  };

  // Exportar backup JSON completo
  const handleExportJSON = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      config,
      socios,
      pagos,
      rendiciones,
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', jsonStr);
    dlAnchor.setAttribute('download', `respaldo_socios_club_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchor.click();
  };

  // Importar backup JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.socios && parsed.config) {
          setSocios(parsed.socios);
          if (parsed.pagos) setPagos(parsed.pagos);
          if (parsed.rendiciones) setRendiciones(parsed.rendiciones);
          if (parsed.config) setConfig(parsed.config);
          alert('¡Copia de seguridad restaurada correctamente!');
        } else {
          alert('El archivo JSON no contiene un formato de respaldo válido.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Navigation */}
      <Navigation
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        institucionNombre={config.nombre}
        onOpenReporteComision={() => setModalInformeOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 pb-12">
        {currentTab === 'dashboard' && (
          <DashboardView
            socios={socios}
            pagos={pagos}
            config={config}
            onOpenReporteComision={() => setModalInformeOpen(true)}
            onGoToTab={setCurrentTab}
          />
        )}

        {currentTab === 'socios' && (
          <SociosView
            socios={socios}
            pagos={pagos}
            cobradores={config.cobradores}
            sectores={config.sectores}
            cuotaEstimativaAnual={config.cuotaEstimativaAnual}
            onOpenNuevoSocio={() => {
              setSocioAEditar(null);
              setModalSocioOpen(true);
            }}
            onOpenEditarSocio={(socio) => {
              setSocioAEditar(socio);
              setModalSocioOpen(true);
            }}
            onOpenFichaSocio={(socio) => setSocioParaFicha(socio)}
            onCambiarEstadoSocio={handleCambiarEstadoSocio}
          />
        )}

        {currentTab === 'rendicion' && (
          <RendicionCobranzaView
            socios={socios}
            pagos={pagos}
            cobradores={config.cobradores}
            onRegistrarPago={handleRegistrarPago}
            onEliminarPago={handleEliminarPago}
            onGuardarRendicion={handleGuardarRendicion}
          />
        )}

        {currentTab === 'planilla' && (
          <PlanillaRecibosView
            socios={socios}
            config={config}
          />
        )}

        {currentTab === 'morosidad' && (
          <MorosidadView
            socios={socios}
            pagos={pagos}
            config={config}
            onOpenFichaSocio={(socio) => setSocioParaFicha(socio)}
          />
        )}

        {currentTab === 'configuracion' && (
          <ConfiguracionView
            config={config}
            onSaveConfig={setConfig}
            onResetData={handleResetData}
            onExportJSON={handleExportJSON}
            onImportJSON={handleImportJSON}
          />
        )}
      </main>

      {/* Footer (No print) */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{config.nombre} · Sistema de Control de Socios & Cobranzas</span>
          <span>Liquidación automática de comisión (25%) a cobradores oficiales</span>
        </div>
      </footer>

      {/* Modales */}
      <ModalSocio
        isOpen={modalSocioOpen}
        onClose={() => {
          setModalSocioOpen(false);
          setSocioAEditar(null);
        }}
        onSave={handleGuardarSocio}
        socioAEditar={socioAEditar}
        cobradores={config.cobradores}
        sectores={config.sectores}
        cuotaEstimativaAnual={config.cuotaEstimativaAnual}
        siguienteNumeroSocio={siguienteNumeroSocio}
      />

      <ModalFichaSocio
        isOpen={Boolean(socioParaFicha)}
        onClose={() => setSocioParaFicha(null)}
        socio={socioParaFicha}
        pagos={pagos}
        cobradores={config.cobradores}
      />

      <ModalInformeComision
        isOpen={modalInformeOpen}
        onClose={() => setModalInformeOpen(false)}
        socios={socios}
        pagos={pagos}
        config={config}
      />
    </div>
  );
}
