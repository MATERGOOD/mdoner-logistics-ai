import React from 'react';
import { ActiveView } from '../types';
import { 
  LayoutGrid, 
  Map, 
  Truck, 
  CloudLightning, 
  HeartPulse, 
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  isCorridorClosed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  isCorridorClosed
}) => {
  return (
    <aside className="fixed left-0 top-23 bottom-0 w-60 bg-[#0A0A0A] border-r border-[#2A2A2A] z-40 hidden md:flex flex-col justify-between py-4 select-none">
      <div className="flex flex-col gap-2">
        <div className="px-4 pb-2 font-mono text-[10px] text-[#666666] uppercase tracking-widest font-bold">
          Mission Modules
        </div>

        <nav className="flex flex-col gap-1 px-2.5">
          {/* Tactical Overview / Mission Control */}
          <button
            onClick={() => setActiveView('mission-control')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors text-left ${
              activeView === 'mission-control'
                ? 'bg-[#1A1A1A] text-[#F27D26] font-semibold border-l-2 border-[#F27D26]'
                : 'text-[#888888] hover:bg-[#111111] hover:text-[#E4E3E0]'
            }`}
          >
            <LayoutGrid size={16} className={activeView === 'mission-control' ? 'text-[#F27D26]' : 'text-[#666666]'} />
            <span>Tactical Overview</span>
          </button>

          {/* Incident Command / Field Logger */}
          <button
            onClick={() => setActiveView('field-logger')}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors text-left ${
              activeView === 'field-logger'
                ? 'bg-red-950/25 text-red-400 font-semibold border-l-2 border-red-500'
                : 'text-[#888888] hover:bg-[#111111] hover:text-[#E4E3E0]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldAlert size={16} className={activeView === 'field-logger' ? 'text-red-400' : 'text-[#666666]'} />
              <span>Incident Command</span>
            </div>
            {isCorridorClosed && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            )}
          </button>

          {/* GIS Corridor Matrix */}
          <button
            onClick={() => setActiveView('mission-control')}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-[#888888] hover:bg-[#111111] hover:text-[#E4E3E0] transition-colors text-left"
          >
            <Map size={16} className="text-[#666666]" />
            <span>GIS Corridor Matrix</span>
          </button>

          {/* Convoy Telemetry */}
          <button
            onClick={() => setActiveView('mission-control')}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-[#888888] hover:bg-[#111111] hover:text-[#E4E3E0] transition-colors text-left"
          >
            <Truck size={16} className="text-[#666666]" />
            <span>Convoy Telemetry</span>
          </button>

          {/* Weather & Doppler */}
          <button
            onClick={() => setActiveView('mission-control')}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-[#888888] hover:bg-[#111111] hover:text-[#E4E3E0] transition-colors text-left"
          >
            <CloudLightning size={16} className="text-[#666666]" />
            <span>Weather & Doppler</span>
          </button>

          {/* Critical Lifelines */}
          <button
            onClick={() => setActiveView('mission-control')}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-[#888888] hover:bg-[#111111] hover:text-[#E4E3E0] transition-colors text-left"
          >
            <HeartPulse size={16} className="text-[#666666]" />
            <span>Critical Lifelines</span>
          </button>
        </nav>
      </div>

      {/* Sidebar Footer Metadata in Bento Card */}
      <div className="px-3 flex flex-col gap-2">
        <div className="p-3 bg-[#111111] rounded-xl border border-[#2A2A2A]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[9px] text-[#888888] uppercase tracking-wider">Uplink Status</span>
            <span className="font-mono text-[11px] text-[#00FF00] font-bold">99.94%</span>
          </div>
          <div className="w-full bg-[#222222] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#00FF00] h-full w-[99.9%]"></div>
          </div>
        </div>

        <div className="p-2.5 bg-[#050505] rounded-xl border border-[#2A2A2A] flex flex-col gap-1 text-[#888888] font-mono text-[10px]">
          <div className="flex items-center justify-between">
            <span>NODE: GHY-TOC-01</span>
            <span className="text-[#F27D26]">v4.2</span>
          </div>
          <div className="flex items-center justify-between text-[9px] text-[#666666]">
            <span>AES-256 GCM</span>
            <span className="text-[#00FF00]">GSAT-7A</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
