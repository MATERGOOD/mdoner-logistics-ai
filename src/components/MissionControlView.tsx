import React, { useState } from 'react';
import { SimulationState, Convoy, DecisionLog } from '../types';
import { GisMap } from './GisMap';
import {
  Truck,
  AlertTriangle,
  Route,
  Search,
  Radio,
  Waves,
  Wind,
  Shield,
  Sliders,
  RotateCw,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface MissionControlViewProps {
  simulationState: SimulationState;
  setSimulationState: React.Dispatch<React.SetStateAction<SimulationState>>;
  convoys: Convoy[];
  setConvoys: React.Dispatch<React.SetStateAction<Convoy[]>>;
  decisionLogs: DecisionLog[];
  onAuthorizeDiversion: () => void;
  onTriggerLandslideSimulation: () => void;
  onPrecipitationChange: (value: number) => void;
  onSyncAllTelemetry: () => void;
}

export const MissionControlView: React.FC<MissionControlViewProps> = ({
  simulationState,
  setSimulationState,
  convoys,
  setConvoys,
  decisionLogs,
  onAuthorizeDiversion,
  onTriggerLandslideSimulation,
  onPrecipitationChange,
  onSyncAllTelemetry
}) => {
  const [filterText, setFilterText] = useState<string>('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<'ALL' | 'MEDICAL' | 'RATIONS' | 'FUEL' | 'HEAVY'>('ALL');
  const [hailModalOpen, setHailModalOpen] = useState<boolean>(false);
  const [hailMessage, setHailMessage] = useState<string>('');

  const selectedConvoy = convoys.find(c => c.id === simulationState.selectedConvoyId) || convoys[0];
  const isCriticalRain = simulationState.precipitation > 100 || simulationState.isLandslideTriggered;
  const isCorridorClosed = simulationState.isCorridorShutdown;
  const isDiverted = simulationState.isDiverted;

  const filteredConvoys = convoys.filter(c => {
    const matchesCategory =
      selectedFilterCategory === 'ALL' ||
      c.type.toUpperCase() === selectedFilterCategory;

    const matchesText =
      c.code.toLowerCase().includes(filterText.toLowerCase()) ||
      c.name.toLowerCase().includes(filterText.toLowerCase()) ||
      c.cargo.toLowerCase().includes(filterText.toLowerCase()) ||
      c.route.toLowerCase().includes(filterText.toLowerCase());

    return matchesCategory && matchesText;
  });

  const handleHailSatLink = (convoy: Convoy) => {
    setHailMessage(`Establishing high-frequency satellite telemetry link with ${convoy.code} (${convoy.pilot || 'Pilot Station'}). Frequency: 284.150 MHz GSAT-7A.`);
    setHailModalOpen(true);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Top Strategic Lifeline Banner (Bento Style) */}
      <div className="w-full bg-[#111111] p-3 sm:p-4 rounded-xl border border-[#2A2A2A] flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex-shrink-0 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] flex items-center justify-center text-[#F27D26]">
            <Radio size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-mono text-sm sm:text-base text-white font-bold tracking-wide uppercase">
                Guwahati — Silchar Lifeline Vector
              </h2>
              <span className="font-mono text-[9px] bg-[#F27D26]/10 text-[#F27D26] px-2 py-0.5 rounded font-bold uppercase border border-[#F27D26]/30">
                MONSOON STAGE-4
              </span>
            </div>
            <p className="font-mono text-[11px] text-[#888888]">
              North Eastern Accessibility & Strategic Supply Corridor // AI Resilience Grid MDoNER-OPS-9
            </p>
          </div>
        </div>

        {/* Active Vector KPIs Strip */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <div className="flex flex-col text-right">
            <span className="font-mono text-[9px] text-[#888888] uppercase">Passability Index</span>
            <span className={`font-mono text-base font-bold ${isCorridorClosed ? 'text-red-400' : isCriticalRain ? 'text-[#F27D26]' : 'text-[#00FF00]'}`}>
              {isCorridorClosed ? '34.2%' : isCriticalRain ? '51.8%' : '78.4%'}{' '}
              <span className="text-[10px] font-normal text-[#888888]">
                {isCorridorClosed ? '[LOCKED]' : isCriticalRain ? '[CRITICAL]' : '[NOMINAL]'}
              </span>
            </span>
          </div>

          <div className="w-px h-7 bg-[#2A2A2A] hidden sm:block"></div>

          <div className="flex flex-col text-right">
            <span className="font-mono text-[9px] text-[#888888] uppercase">Barak Flow</span>
            <span className="font-mono text-base font-bold text-[#00FFFF]">
              14,200 <span className="text-[10px] text-[#888888] font-normal">cumec</span>
            </span>
          </div>

          <div className="w-px h-7 bg-[#2A2A2A] hidden sm:block"></div>

          <div className="flex flex-col text-right">
            <span className="font-mono text-[9px] text-[#888888] uppercase">Active Sat-Mesh</span>
            <span className="font-mono text-base font-bold text-[#00FF00]">
              14 / 14 <span className="text-[10px] text-[#888888] font-normal">NODES</span>
            </span>
          </div>

          <button
            id="sync-all-telemetry-btn"
            onClick={onSyncAllTelemetry}
            className="bg-[#1A1A1A] hover:bg-[#222222] border border-[#2A2A2A] text-white font-mono text-[11px] px-3 py-2 rounded-lg font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCw size={13} className="text-[#F27D26]" />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {/* Main Bento Grid: 12 Columns */}
      <main className="grid grid-cols-12 gap-3 w-full items-start">
        {/* LEFT COLUMN: Map & Controls (Col 8) */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-3">
          {/* Map Box Bento Card */}
          <GisMap
            simulationState={simulationState}
            onAuthorizeDiversion={onAuthorizeDiversion}
            selectedConvoy={selectedConvoy}
          />

          {/* Bottom Controls Bento Grid (3 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Control 1: Rainfall Simulation */}
            <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-3.5 flex flex-col justify-between shadow-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono text-[#888888] uppercase">Precipitation Simulation</span>
                <span id="precip-val" className="text-xs font-mono font-bold text-[#F27D26]">
                  <span id="rainfall-display">{simulationState.precipitation}mm</span>
                </span>
              </div>
              <div className="my-2">
                <input
                  type="range"
                  id="rain-slider"
                  min="20"
                  max="160"
                  step="5"
                  value={simulationState.precipitation}
                  onChange={(e) => onPrecipitationChange(Number(e.target.value))}
                  className="w-full accent-[#F27D26] bg-[#222222] h-1.5 rounded-lg cursor-pointer"
                />
                <input
                  type="range"
                  id="rainfall-slider"
                  min="20"
                  max="160"
                  step="5"
                  value={simulationState.precipitation}
                  onChange={(e) => onPrecipitationChange(Number(e.target.value))}
                  className="hidden"
                />
                <div className="flex justify-between text-[8px] text-[#666666] font-mono mt-1.5">
                  <span>20mm (DRY)</span>
                  <span className="text-red-500 font-bold">100mm (CRITICAL)</span>
                  <span>160mm (EXTREME)</span>
                </div>
              </div>
              <div className="mt-2 flex flex-col gap-1.5">
                <p className="text-[9px] text-[#888888] leading-tight">
                  Threshold &gt;100mm triggers automated corridor diversion protocols.
                </p>
                <button
                  id="btn-trigger-landslide"
                  onClick={onTriggerLandslideSimulation}
                  className="w-full py-1 bg-red-950/30 hover:bg-red-950/50 text-red-400 border border-red-900/50 rounded text-[9px] font-mono uppercase font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <AlertTriangle size={11} className="text-red-400 animate-pulse" />
                  <span>Test Landslide Surge</span>
                </button>
              </div>
            </div>

            {/* Control 2: Tactical Rerouting Engine */}
            <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-3.5 flex flex-col justify-between shadow-md">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-[#888888] uppercase">Rerouting Engine</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${isDiverted ? 'bg-[#00FF00]/10 text-[#00FF00]' : 'bg-[#F27D26]/10 text-[#F27D26]'
                  }`}>
                  {isDiverted ? 'DIVERTED' : 'STANDBY'}
                </span>
              </div>
              <div className="my-2">
                <div className="text-xs font-bold text-white mb-0.5">Preemptive Diversion</div>
                <p className="text-[9px] text-[#888888] leading-tight">
                  {isDiverted
                    ? 'MED-NER-04 actively diverted onto NH-27 Haflong bypass. Sonapur cut cleared.'
                    : 'Reroutes MED-NER-04 via NH-27 Lumding-Haflong bypass safely.'}
                </p>
              </div>
              <button
                id="btn-reroute"
                onClick={onAuthorizeDiversion}
                className={`w-full py-2 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${isDiverted
                    ? 'bg-[#00FF00] hover:bg-[#00DD00] text-black'
                    : 'bg-[#F27D26] hover:bg-[#d96818] text-black'
                  }`}
              >
                <Route size={13} />
                <span>{isDiverted ? 'Diversion Authorized (Active)' : 'Authorize Diversion'}</span>
              </button>
              {/* Alias for test compatibility */}
              <button
                id="btn-authorize-preemptive-diversion"
                onClick={onAuthorizeDiversion}
                className="hidden"
              >
                Authorize
              </button>
            </div>

            {/* Control 3: Risk Probability Gauge */}
            <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-3.5 flex flex-col justify-between shadow-md">
              <span className="text-[10px] font-mono text-[#888888] uppercase">Landslide Probability</span>
              <div className="flex items-baseline gap-2 my-2">
                <span id="risk-prob" className="text-3xl font-bold font-mono text-white">
                  {simulationState.landslideProbability}%
                </span>
                <span
                  id="risk-status"
                  className={`text-[10px] font-mono font-bold uppercase ${isCriticalRain ? 'text-red-500 animate-pulse' : 'text-[#00FF00]'
                    }`}
                >
                  {isCriticalRain ? 'CRITICAL RISK' : 'LOW RISK'}
                </span>
              </div>
              <div className="w-full bg-[#222222] h-2 rounded-full overflow-hidden mb-2">
                <div
                  id="risk-bar"
                  className={`h-full transition-all duration-300 ${isCriticalRain ? 'bg-red-500' : 'bg-[#00FF00]'
                    }`}
                  style={{ width: `${simulationState.landslideProbability}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[9px] text-[#888888] font-mono">
                <span>Soil Saturation: {simulationState.soilSaturation}%</span>
                <span className="text-[#00FFFF]">NH-27 Passable</span>
              </div>
            </div>
          </div>

          {/* Real-Time Ground Sensor Cards (Horizontal Bento Strip) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-[#00FFFF]">
                  <Waves size={16} />
                </div>
                <div>
                  <span className="font-mono text-[9px] text-[#888888] block uppercase">BARAK WATER LEVEL</span>
                  <span className="font-mono text-xs font-bold text-white">19.82 m (+0.4m/h)</span>
                </div>
              </div>
              <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#00FF00]/10 text-[#00FF00] font-bold">NORMAL</span>
            </div>

            <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-[#F27D26]">
                  <Wind size={16} />
                </div>
                <div>
                  <span className="font-mono text-[9px] text-[#888888] block uppercase">BORAIL WINDS</span>
                  <span className="font-mono text-xs font-bold text-white">54 km/h (GUST 72)</span>
                </div>
              </div>
              <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#F27D26]/10 text-[#F27D26] font-bold">CAUTION</span>
            </div>

            <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-[#00FF00]">
                  <Shield size={16} />
                </div>
                <div>
                  <span className="font-mono text-[9px] text-[#888888] block uppercase">HAFLONG BRIDGES (4)</span>
                  <span className="font-mono text-xs font-bold text-[#00FF00]">STRUCTURAL 100%</span>
                </div>
              </div>
              <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#00FF00]/10 text-[#00FF00] font-bold">SECURE</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Status & Feed (Col 4) */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-3">
          {/* Convoy Telemetry Bento Card */}
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 flex flex-col gap-3 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-2">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-[#F27D26]" />
                <span className="text-xs font-bold font-mono uppercase text-white">MED-NER-04 Telemetry</span>
              </div>
              <span className="text-[9px] bg-red-950/40 text-red-400 border border-red-800 px-2 py-0.5 rounded font-mono font-bold">
                CRITICAL CARGO
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-[#0C0C0C] p-2.5 rounded-lg border border-[#222222]">
                <div className="text-[9px] text-[#888888]">PAYLOAD</div>
                <div className="text-white font-medium truncate">Insulin (Cold Chain)</div>
              </div>
              <div className="bg-[#0C0C0C] p-2.5 rounded-lg border border-[#222222]">
                <div className="text-[9px] text-[#888888]">INTERNAL TEMP</div>
                <div className="text-[#00FF00] font-medium">3.4°C [NOMINAL]</div>
              </div>
              <div className="bg-[#0C0C0C] p-2.5 rounded-lg border border-[#222222]">
                <div className="text-[9px] text-[#888888]">DESTINATION</div>
                <div className="text-white font-medium truncate">Silchar Med Coll</div>
              </div>
              <div className="bg-[#0C0C0C] p-2.5 rounded-lg border border-[#222222]">
                <div className="text-[9px] text-[#888888]">ESTIMATED ETA</div>
                <div id="truck-eta" className="text-[#F27D26] font-bold">
                  {isDiverted ? '6h 15m (Via NH-27 Bypass)' : '4h 12m (Via NH-6)'}
                </div>
              </div>
            </div>

            {/* Quick telemetry strip */}
            <div className="flex items-center justify-between text-[10px] font-mono text-[#888888] pt-1 border-t border-[#222222]">
              <span>SPEED: <strong className="text-white">42 km/h</strong></span>
              <span>FUEL: <strong className="text-white">78%</strong></span>
              <button
                onClick={() => handleHailSatLink(selectedConvoy)}
                className="text-[#00FFFF] hover:underline cursor-pointer"
              >
                Hail Sat-Link →
              </button>
            </div>
          </div>

          {/* AI Route Recommendation Panel */}
          {simulationState.precipitation > 100 && (
            <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 flex flex-col gap-3 shadow-xl">
              <div className="flex items-center gap-2 border-b border-[#2A2A2A] pb-2">
                <AlertTriangle size={16} className="text-yellow-500 animate-pulse" />
                <span className="font-mono text-[11px] font-bold text-yellow-500 uppercase tracking-wider">
                  ⚠️ RECOMMENDED ACTION: DIVERSIFY CORRIDOR
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="p-2.5 rounded-lg border border-red-900/50 bg-red-950/20">
                  <div className="text-[10px] text-[#888888] font-mono mb-1">Route A: NH-6 Primary</div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-white">Distance: 312 km</span>
                    <span className="text-red-400 font-bold">ETA: Indefinite (High Landslide Risk 88%)</span>
                  </div>
                  <div className="text-[10px] text-red-500 font-bold font-mono">STATUS: BLOCKED / HAZARDOUS AT SONAPUR</div>
                </div>
                <div className="p-2.5 rounded-lg border border-cyan-900/50 bg-cyan-950/20">
                  <div className="text-[10px] text-[#888888] font-mono mb-1">Route B: NH-27 Bypass (AI OPTIMAL)</div>
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-white">Distance: 424 km (+112 km)</span>
                    <span className="text-cyan-400 font-bold">ETA: 6h 15m (+1.8h)</span>
                  </div>
                  <div className="text-[9px] text-[#00FF00] font-mono">Hazard Risk: 4.2% (Clear) | Cold-Chain: 99.8% Safe</div>
                </div>
              </div>
              {!isDiverted && (
                <button
                  onClick={onAuthorizeDiversion}
                  className="mt-1 w-full py-2 bg-[#00F0FF] hover:bg-[#00D0FF] text-black font-bold rounded-lg text-[10px] font-mono uppercase tracking-wider transition-colors shadow-lg shadow-cyan-900/40"
                >
                  Authorize Preemptive Supply Diversion
                </button>
              )}
              {isDiverted && (
                <div className="mt-1 w-full py-2 bg-[#00FF00]/20 border border-[#00FF00]/40 text-[#00FF00] font-bold rounded-lg text-[10px] font-mono text-center uppercase tracking-wider">
                  Diversion Authorized (Active)
                </div>
              )}
            </div>
          )}

          {/* Active Incident / Decision Log Bento Card */}
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 flex flex-col gap-2 shadow-xl flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00FF00] animate-pulse"></span>
                <span className="font-mono text-xs font-bold uppercase text-white">
                  Tactical Decision Log
                </span>
              </div>
              <span className="font-mono text-[9px] text-[#888888]">MDoNER AUDIT TRAIL</span>
            </div>

            <div className="font-mono text-[11px] text-[#888888] flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {decisionLogs.map((log) => (
                <div key={log.id} className="p-2 bg-[#0C0C0C] rounded-lg border border-[#222222] flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${log.severity === 'critical'
                        ? 'text-red-400'
                        : log.severity === 'warning'
                          ? 'text-[#F27D26]'
                          : log.severity === 'success'
                            ? 'text-[#00FF00]'
                            : 'text-[#00FFFF]'
                      }`}>
                      [{log.timestamp}]
                    </span>
                    <span className="text-[9px] text-[#666666]">{log.source}</span>
                  </div>
                  <span className="text-white text-[10.5px] leading-relaxed">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tactical Fleet Metrics & Category Filter Bento Card */}
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-3.5 flex flex-col gap-2.5 shadow-xl">
            <div className="flex items-center justify-between pb-1 border-b border-[#2A2A2A]">
              <span className="font-mono text-xs font-bold text-white uppercase">Corridor Fleet Matrix</span>
              <span className="font-mono text-[10px] text-[#888888]">18 ACTIVE</span>
            </div>

            {/* Metric counters */}
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="bg-[#0C0C0C] p-2 rounded border border-[#222222]">
                <div className="text-[9px] text-[#888888]">FLEETS</div>
                <div className="text-sm font-bold text-white">18</div>
              </div>
              <div className="bg-[#0C0C0C] p-2 rounded border border-[#222222]">
                <div className="text-[9px] text-[#888888]">RISK CHOKES</div>
                <div className="text-sm font-bold text-[#F27D26]">{isCorridorClosed ? '4' : '3'}</div>
              </div>
              <div className="bg-[#0C0C0C] p-2 rounded border border-[#222222]">
                <div className="text-[9px] text-[#888888]">REROUTES</div>
                <div id="metric-reroute-counter" className="text-sm font-bold text-[#00FF00]">
                  {simulationState.rerouteCounter}
                </div>
              </div>
            </div>

            {/* Search Input & Category Filters */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#0C0C0C] rounded-lg border border-[#222222]">
              <Search size={13} className="text-[#888888]" />
              <input
                id="convoy-search-input"
                type="text"
                placeholder="Filter Fleet ID, Sector, Cargo..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full bg-transparent font-mono text-xs text-white focus:outline-none placeholder:text-[#666666]"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto py-0.5">
              {(['ALL', 'MEDICAL', 'RATIONS', 'FUEL', 'HEAVY'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilterCategory(cat)}
                  className={`font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase transition-colors whitespace-nowrap cursor-pointer ${selectedFilterCategory === cat
                      ? 'bg-[#F27D26] text-black'
                      : 'bg-[#1A1A1A] text-[#888888] hover:text-white'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Mini list of filtered convoys */}
            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
              {filteredConvoys.map((c) => {
                const isMed = c.id === 'med-04';
                const isSelected = simulationState.selectedConvoyId === c.id;
                return (
                  <div
                    key={c.id}
                    id={`convoy-card-${c.code.toLowerCase()}`}
                    onClick={() => setSimulationState(prev => ({ ...prev, selectedConvoyId: c.id }))}
                    className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between text-xs font-mono ${isSelected
                        ? 'bg-[#1A1A1A] border-[#F27D26]'
                        : 'bg-[#0C0C0C] border-[#222222] hover:border-[#444444]'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{c.code}</span>
                      <span className="text-[10px] text-[#888888] truncate max-w-[110px]">{c.cargo}</span>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${isMed && isDiverted
                        ? 'bg-[#00FF00]/20 text-[#00FF00]'
                        : isMed && isCriticalRain
                          ? 'bg-red-900/40 text-red-400'
                          : 'text-[#888888]'
                      }`}>
                      {isMed && isDiverted ? 'DIVERTED' : isMed && isCriticalRain ? 'ALERT' : c.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Sat-Link Modal */}
      {hailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#111111] border border-[#2A2A2A] p-5 rounded-xl shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2">
              <div className="flex items-center gap-2 text-[#00FFFF]">
                <Radio size={16} className="animate-pulse" />
                <span className="font-mono text-xs font-bold uppercase">SAT-LINK CHANNEL ACTIVE</span>
              </div>
              <button
                onClick={() => setHailModalOpen(false)}
                className="text-[#888888] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-white font-mono leading-relaxed">
              {hailMessage}
            </p>
            <div className="p-2.5 bg-[#0C0C0C] rounded-lg border border-[#222222] text-[11px] font-mono text-[#00FF00]">
              STATUS: ACKNOWLEDGED // PILOT RECEIVING VECTOR COORD UPDATES
            </div>
            <button
              onClick={() => setHailModalOpen(false)}
              className="mt-1 py-2 bg-[#F27D26] text-black font-mono text-xs font-bold uppercase rounded-lg hover:bg-[#d96818] cursor-pointer"
            >
              Close Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
