import React, { useState, useEffect } from 'react';
import { ActiveView, SimulationState } from '../types';
import { 
  Radar, 
  Satellite, 
  ShieldAlert, 
  CheckCircle2, 
  User, 
  FileText,
  Activity
} from 'lucide-react';

interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  simulationState: SimulationState;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  simulationState
}) => {
  const [currentTime, setCurrentTime] = useState<{ utc: string; ist: string }>({
    utc: '05:42:19Z',
    ist: '11:12:19'
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const utcString = now.toISOString().substr(11, 8) + 'Z';
      
      // IST is UTC + 5:30
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      const istString = istTime.toISOString().substr(11, 8);
      
      setCurrentTime({ utc: utcString, ist: istString });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isCriticalRain = simulationState.precipitation > 100 || simulationState.isLandslideTriggered;
  const isCorridorClosed = simulationState.isCorridorShutdown;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-[#2A2A2A]">
      {/* Top Main Command Bar */}
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-[#2A2A2A]">
        <div className="flex items-center gap-3 min-w-0">
          {/* Bento Emblem */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#F27D26] rounded flex items-center justify-center font-bold text-black font-mono shadow-sm">
              M
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold tracking-widest uppercase text-[#E4E3E0] truncate">
                MDoNER Logistics Platform
              </h1>
              <p className="text-[10px] text-[#888888] font-mono tracking-tight">
                SYSTEM ID: 26002 // SECTOR: NE-LOG-CORRIDOR
              </p>
            </div>
          </div>

          <div className="hidden md:block h-6 w-px bg-[#2A2A2A] mx-2"></div>

          {/* Sector Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-[#111111] rounded border border-[#2A2A2A]">
            <span className="w-2 h-2 rounded-full bg-[#00FF00] animate-ping"></span>
            <span className="font-mono text-[10px] uppercase text-[#00FF00] font-semibold">
              Sector: Guwahati - Silchar Lifeline
            </span>
          </div>

          {/* Quick View Switcher Buttons (Bento styling) */}
          <div className="flex items-center gap-1 bg-[#1A1A1A] p-1 rounded-md border border-[#2A2A2A] ml-2">
            <button
              id="view-switch-mission-control"
              onClick={() => setActiveView('mission-control')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-[10px] font-mono uppercase font-bold transition-all ${
                activeView === 'mission-control'
                  ? 'bg-[#F27D26] text-black shadow-sm'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              <Activity size={13} />
              <span>Mission Control</span>
            </button>

            <button
              id="view-switch-field-logger"
              onClick={() => setActiveView('field-logger')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-[10px] font-mono uppercase font-bold transition-all ${
                activeView === 'field-logger'
                  ? 'bg-[#F27D26] text-black shadow-sm'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              <FileText size={13} />
              <span>Field Incident Logger</span>
              {isCorridorClosed && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              )}
            </button>
          </div>
        </div>

        {/* Right Telemetry Strip */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-[#111111] rounded border border-[#2A2A2A]">
            <div className="relative flex items-center justify-center w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#00FF00] opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00FF00]"></span>
            </div>
            <span className="font-mono text-[10px] uppercase text-[#E4E3E0]">
              Telemetry Live
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 font-mono text-[11px] text-[#888888]">
            <span className="text-[#F27D26] font-bold">GRID:</span>
            <span>26.14°N, 91.73°E</span>
          </div>

          {/* Clocks */}
          <div className="flex items-center gap-2 font-mono text-[11px] px-2.5 py-1 bg-[#111111] rounded border border-[#2A2A2A]">
            <div className="flex flex-col text-right">
              <span className="text-[8px] text-[#888888] uppercase leading-none">UTC</span>
              <span className="text-[#00FFFF] font-semibold">{currentTime.utc}</span>
            </div>
            <div className="h-5 w-px bg-[#2A2A2A]"></div>
            <div className="flex flex-col text-right">
              <span className="text-[8px] text-[#888888] uppercase leading-none">IST</span>
              <span className="text-[#00FF00] font-semibold">{currentTime.ist}</span>
            </div>
          </div>

          <div className="w-7 h-7 rounded bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#F27D26]">
            <User size={15} />
          </div>
        </div>
      </div>

      {/* Secondary Sensor Strip */}
      <div className="h-9 px-4 sm:px-6 bg-[#0C0C0C] flex items-center justify-between text-[#888888] text-xs">
        <div className="flex items-center gap-3 overflow-x-auto">
          <div className="flex items-center gap-1.5 font-mono text-[11px] whitespace-nowrap">
            <span className="text-[10px] uppercase text-[#666666]">Doppler Radar:</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF00]"></span>
            <span className="text-[#00FF00] font-medium">ACTIVE // SILCHAR TOWER 04</span>
          </div>

          <div className="h-3.5 w-px bg-[#2A2A2A]"></div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] whitespace-nowrap">
            <span className="text-[10px] uppercase text-[#666666]">Satellite Feed:</span>
            <span className="text-[#00FFFF] font-medium">INSAT-3DR SYNCED</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 font-mono text-[11px] whitespace-nowrap">
            <span className="text-[10px] uppercase text-[#666666]">Bandwidth:</span>
            <span className="text-[#E4E3E0] font-medium">48.2 Gbps</span>
          </div>
        </div>

        {/* Alert Matrix Status Chips */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline font-mono text-[10px] uppercase text-[#666666]">Alert Matrix:</span>
          
          <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase transition-all ${
            isCorridorClosed 
              ? 'bg-red-600 text-white animate-pulse border border-red-500' 
              : isCriticalRain 
              ? 'bg-red-600/20 text-red-400 animate-pulse border border-red-500/40' 
              : 'bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30'
          }`}>
            {isCorridorClosed ? 'NH-06 BLOCKED' : isCriticalRain ? 'NH-06 CRITICAL' : 'NH-06 GREEN'}
          </span>

          <span className="font-mono text-[10px] px-2 py-0.5 bg-[#F27D26]/10 text-[#F27D26] rounded font-bold uppercase border border-[#F27D26]/30">
            JATINGA AMBER
          </span>

          <span className="hidden sm:inline-block font-mono text-[10px] px-2 py-0.5 bg-red-600/15 text-red-400 rounded font-bold uppercase border border-red-500/30">
            BARAK PASS ELEVATED
          </span>
        </div>
      </div>
    </header>
  );
};
