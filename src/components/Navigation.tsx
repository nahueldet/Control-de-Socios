import React from 'react';
import {
  LayoutDashboard,
  Users,
  ScanLine,
  FileSpreadsheet,
  AlertTriangle,
  Settings,
  Building2,
  Printer
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'socios'
  | 'rendicion'
  | 'planilla'
  | 'morosidad'
  | 'configuracion';

interface NavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  institucionNombre: string;
  onOpenReporteComision: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  institucionNombre,
  onOpenReporteComision,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Panel Comisión', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'socios', label: 'Padrón de Socios', icon: <Users className="w-4 h-4" /> },
    { id: 'rendicion', label: 'Cargar Rendición', icon: <ScanLine className="w-4 h-4" /> },
    { id: 'planilla', label: 'Planilla y Recibos', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'morosidad', label: 'Morosidad x Sector', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'configuracion', label: 'Configuración', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 h-16">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 leading-tight whitespace-nowrap">
              {institucionNombre}
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 whitespace-nowrap">
              Gestión de Socios & Cobranzas
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Primary Action Zone */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenReporteComision}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Informe para Comisión Directiva"
            aria-label="Informe para Comisión Directiva"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Informe Comisión</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-100 gap-1 bg-slate-50/70 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
