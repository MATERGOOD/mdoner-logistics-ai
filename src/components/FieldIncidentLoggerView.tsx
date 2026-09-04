import React, { useState, useEffect } from 'react';
import { SimulationState, DecisionLog, Convoy } from '../types';
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  Camera, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Wrench, 
  CheckSquare, 
  Square, 
  Radio, 
  ChevronRight, 
  Maximize2,
  FileCheck,
  Send,
  Eye
} from 'lucide-react';

interface FieldIncidentLoggerViewProps {
  simulationState: SimulationState;
  setSimulationState: React.Dispatch<React.SetStateAction<SimulationState>>;
  onEmergencyCorridorShutdown: () => void;
  decisionLogs: DecisionLog[];
  convoys: Convoy[];
}

export const FieldIncidentLoggerView: React.FC<FieldIncidentLoggerViewProps> = ({
  simulationState,
  setSimulationState,
  onEmergencyCorridorShutdown,
  decisionLogs,
  convoys
}) => {
  // Real-time clearance countdown timer
  const [countdownSeconds, setCountdownSeconds] = useState<number>(7 * 3600 + 42 * 60 + 18);
  const [filterMode, setFilterMode] = useState<'merged' | 'thermal' | 'optical'>('merged');
  const [selectedSeverity, setSelectedSeverity] = useState<'moderate' | 'high' | 'critical'>('critical');
  const [checklist, setChecklist] = useState<{
    check1: boolean;
    check2: boolean;
    check3: boolean;
  }>({
    check1: true,
    check2: true,
    check3: false
  });
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return {
      hours: String(h).padStart(2, '0'),
      mins: String(m).padStart(2, '0'),
      secs: String(s).padStart(2, '0')
    };
  };

  const timerDisplay = formatTime(countdownSeconds);
  const isCorridorClosed = simulationState.isCorridorShutdown;

  const handleConfirmShutdown = () => {
    onEmergencyCorridorShutdown();
    setShowConfirmModal(false);
  };

  const handleBroadcastAlert = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 4000);
  };

  return (
    <div className="w-full flex flex-col gap-3 text-[#E4E3E0]">
      {/* Top Breadcrumb & Incident Banner (Bento Card) */}
      <section className="p-4 bg-[#111111] rounded-xl border border-[#2A2A2A] shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Incident ID & Location Meta */}
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap font-mono">
              <span className="text-[10px] px-2 py-0.5 bg-[#1A1A1A] text-[#F27D26] rounded border border-[#2A2A2A] font-bold">
                INCIDENT PROTOCOL // SEC-04
              </span>
              <span className="text-base text-white font-bold tracking-wider">
                INC-2024-0884
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1.5 shadow-sm ${
                isCorridorClosed 
                  ? 'bg-red-600 text-white animate-pulse border border-red-500' 
                  : 'bg-red-950/40 text-red-400 border border-red-800'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                {isCorridorClosed ? 'CORRIDOR SHUTDOWN ENFORCED' : 'CRITICAL TOTAL BLOCKAGE'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                isCorridorClosed 
                  ? 'bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/20' 
                  : 'bg-[#F27D26]/10 text-[#F27D26] border border-[#F27D26]/20'
              }`}>
                {isCorridorClosed ? 'COMMAND SIGN-OFF EXECUTED' : 'PENDING COMMAND SIGN-OFF'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[#888888] flex-wrap mt-0.5">
              <ShieldAlert size={18} className="text-[#F27D26]" />
              <span className="font-mono text-sm sm:text-base text-white font-bold">
                NH-6 Sonapur Cut, East Jaintia Hills
              </span>
              <span className="font-mono text-xs text-[#888888]">
                [Km 142.8 — Sonapur Tunnel South Portal Bypass]
              </span>
            </div>
          </div>

          {/* Live GPS & Sector Matrix Pills */}
          <div className="flex items-center gap-4 bg-[#0C0C0C] px-3.5 py-2 rounded-xl border border-[#2A2A2A] shadow-md font-mono">
            <div className="flex flex-col">
              <span className="text-[9px] text-[#888888] uppercase font-bold">COORDINATES</span>
              <span className="text-xs text-white font-semibold">25.10°N, 92.36°E</span>
            </div>
            <div className="w-px h-6 bg-[#2A2A2A]"></div>
            <div className="flex flex-col">
              <span className="text-[9px] text-[#888888] uppercase font-bold">ELEVATION</span>
              <span className="text-xs text-[#00FF00] font-semibold">842m ASL</span>
            </div>
            <div className="w-px h-6 bg-[#2A2A2A]"></div>
            <div className="flex flex-col">
              <span className="text-[9px] text-[#888888] uppercase font-bold">UPLINK STREAM</span>
              <span className="text-xs text-[#00FFFF] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF00]"></span>
                GSAT-7A
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Agency Verification Matrix Bar */}
        <div className="mt-3 pt-2.5 flex flex-wrap items-center justify-between gap-3 text-[#888888] bg-[#0C0C0C] px-3 py-1.5 rounded-lg border border-[#222222]">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-[#00FF00]" />
              <span className="text-white">3 Ground Field Scouts Synced</span>
              <span className="text-[10px] text-[#666666]">(Jowai Mobile Unit 02)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-[#00FF00]" />
              <span className="text-white">Assam Rifles 28th Bn Sector Validated</span>
              <span className="text-[10px] text-[#666666]">(Ref: #AR-28-994)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Camera size={13} className="text-[#00FFFF]" />
              <span className="text-white">Drone Recon Overpass</span>
              <span className="text-[10px] text-[#00FF00] font-bold">0.2m FLIR</span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="text-[#666666] uppercase">TELEMETRY HASH:</span>
            <span className="text-[#F27D26] font-mono">0x7c49...b40e</span>
          </div>
        </div>
      </section>

      {/* Main Operational Bento Grid: 12 Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* LEFT 7 COLS: PHOTO PROOF, HUD OVERLAY & METRIC METADATA */}
        <div className="xl:col-span-7 flex flex-col gap-3">
          {/* High-Resolution Field Photo Proof with HUD Reticles */}
          <div className="bg-[#111111] rounded-xl p-3.5 border border-[#2A2A2A] shadow-xl flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="font-mono text-[10px] text-[#888888] uppercase tracking-widest font-bold">
                  OPTICAL SENSOR INTEL // FORWARD SCOUT 01 CAPTURE
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                <button
                  onClick={() => setFilterMode('merged')}
                  className={`px-2 py-0.5 rounded font-bold uppercase transition-colors cursor-pointer ${
                    filterMode === 'merged' ? 'bg-[#F27D26] text-black' : 'bg-[#1A1A1A] text-[#888888]'
                  }`}
                >
                  LIDAR + OPTICAL
                </button>
                <button
                  onClick={() => setFilterMode('thermal')}
                  className={`px-2 py-0.5 rounded font-bold uppercase transition-colors cursor-pointer ${
                    filterMode === 'thermal' ? 'bg-[#F27D26] text-black' : 'bg-[#1A1A1A] text-[#888888]'
                  }`}
                >
                  FLIR THERMAL
                </button>
              </div>
            </div>

            {/* Tactical Camera HUD Feed */}
            <div className="relative w-full rounded-lg overflow-hidden aspect-video bg-[#050505] border border-[#2A2A2A] group">
              <div className={`w-full h-full relative transition-all duration-300 ${
                filterMode === 'thermal' ? 'brightness-125 hue-rotate-180 contrast-150' : ''
              }`}>
                {/* Visual mountain landslide simulation canvas */}
                <svg className="w-full h-full" viewBox="0 0 600 340" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="skyGradBento" x1="0%" y1="0%" x2="0%" y2="1">
                      <stop offset="0%" stopColor="#080808" />
                      <stop offset="50%" stopColor="#111111" />
                      <stop offset="100%" stopColor="#1a1a1a" />
                    </linearGradient>
                    <linearGradient id="mudSlideGradBento" x1="0%" y1="0%" x2="0.8" y2="1">
                      <stop offset="0%" stopColor="#3d2c1d" />
                      <stop offset="30%" stopColor="#543d2b" />
                      <stop offset="70%" stopColor="#2e2116" />
                      <stop offset="100%" stopColor="#1c140d" />
                    </linearGradient>
                    <linearGradient id="asphaltGradBento" x1="0%" y1="0%" x2="1" y2="0">
                      <stop offset="0%" stopColor="#1a1a1a" />
                      <stop offset="50%" stopColor="#2a2a2a" />
                      <stop offset="100%" stopColor="#1a1a1a" />
                    </linearGradient>
                  </defs>

                  {/* Mountain backdrop */}
                  <rect width="600" height="340" fill="url(#skyGradBento)" />
                  <path d="M 0 160 Q 150 70 320 130 T 600 90 L 600 340 L 0 340 Z" fill="#141414" />
                  <path d="M 0 200 Q 180 130 380 180 T 600 160 L 600 340 L 0 340 Z" fill="#1c1c1c" />

                  {/* Highway NH-6 tarmac roadway */}
                  <path d="M 0 300 L 600 270 L 600 340 L 0 340 Z" fill="url(#asphaltGradBento)" />
                  <line x1="0" y1="320" x2="600" y2="305" stroke="#F27D26" strokeWidth="2" strokeDasharray="12 12" />

                  {/* Debris cone & saturated talus mudslide */}
                  <path d="M 210 110 Q 250 170 190 260 Q 220 290 390 320 L 460 270 Q 380 180 340 140 Z" fill="url(#mudSlideGradBento)" />
                  <path d="M 240 190 Q 280 250 330 315 L 420 300 Q 360 220 310 160 Z" fill="#423021" opacity="0.8" />
                  
                  {/* Boulders & rockfall */}
                  <circle cx="280" cy="270" r="14" fill="#302419" stroke="#523d2b" strokeWidth="2" />
                  <circle cx="340" cy="290" r="18" fill="#291e14" stroke="#453324" strokeWidth="2" />
                  <circle cx="385" cy="280" r="11" fill="#302419" stroke="#523d2b" strokeWidth="1.5" />
                  <circle cx="250" cy="245" r="9" fill="#3b2b1d" />

                  {/* Sonapur Tunnel portal frame in background */}
                  <rect x="470" y="220" width="80" height="60" rx="30" fill="#050505" stroke="#333333" strokeWidth="3" />
                  <text x="475" y="212" fill="#888888" fontFamily="JetBrains Mono" fontSize="9" fontWeight="bold">TUNNEL PORTAL</text>
                </svg>
              </div>

              {/* Tactical HUD Layer */}
              <div className="absolute inset-0 pointer-events-none p-3.5 flex flex-col justify-between bg-gradient-to-t from-black/90 via-transparent to-black/40 font-mono">
                {/* Top HUD Bar */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 bg-black/80 backdrop-blur px-2.5 py-1 rounded border border-[#2A2A2A]">
                    <span className="text-[#F27D26] font-bold">REC // FLD-CAM-09</span>
                    <span className="text-[#888888]">|</span>
                    <span className="text-red-500 font-semibold animate-pulse">LIVE RECON</span>
                  </div>
                  <div className="bg-black/80 backdrop-blur px-2.5 py-1 rounded text-white border border-[#2A2A2A]">
                    25.10°N • 92.36°E • 14:18:22 IST
                  </div>
                </div>

                {/* Central HUD Crosshairs / Bounding Box */}
                <div className="self-center flex flex-col items-center justify-center">
                  <div className="w-44 h-32 rounded bg-red-950/20 border border-red-500 flex flex-col items-center justify-between p-2 backdrop-blur-[2px]">
                    <div className="w-full flex justify-between text-[9px]">
                      <span className="text-red-400 font-bold tracking-tighter">SLUMP APEX</span>
                      <span className="text-red-400 font-bold">62° SLOP</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <AlertTriangle size={24} className="text-red-500 animate-bounce" />
                      <span className="text-[10px] text-white font-bold bg-red-600 px-1.5 py-0.5 rounded shadow">
                        ACTIVE SLIP ZONE
                      </span>
                    </div>

                    <div className="w-full flex justify-between text-[10px] text-red-400 font-bold">
                      <span>Δ 1.4 m/h</span>
                      <span>~4,200 m³</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Geotag Watermark & Compass Matrix */}
                <div className="flex items-end justify-between text-[10px]">
                  <div className="bg-black/90 backdrop-blur p-2 rounded-lg border border-[#2A2A2A] flex flex-col gap-0.5">
                    <div className="text-[#F27D26] font-bold uppercase tracking-wider">
                      GEOTAG WATERMARK // MIL-STD-2525D
                    </div>
                    <div className="text-[#888888]">
                      GRID: NH6-SNP-K142 • AZIMUTH: 138° SE • ALT: 842m ASL
                    </div>
                    <div className="text-red-400 font-bold flex items-center gap-1">
                      <AlertTriangle size={12} />
                      ESTIMATED MASS: ~4,200 m³ SHALE & TOPSOIL
                    </div>
                  </div>

                  <div className="bg-black/90 backdrop-blur px-2.5 py-1 rounded flex items-center gap-1.5 border border-[#2A2A2A]">
                    <span className="text-[10px] text-[#00FF00] font-bold">LENS AI VERIFIED</span>
                    <span className="w-2 h-2 rounded-full bg-[#00FF00]"></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Severity Level Selection Matrix */}
            <div className="flex flex-col gap-1.5 mt-1 font-mono">
              <span className="text-[10px] text-[#888888] uppercase tracking-wider font-bold">
                COMMAND CLASSIFICATION OVERRIDE (SELECT OPERATIONAL SEVERITY)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSeverity('moderate')}
                  className={`p-2.5 rounded-lg text-left transition-all flex flex-col gap-1 border cursor-pointer ${
                    selectedSeverity === 'moderate'
                      ? 'bg-[#00FF00]/10 border-[#00FF00] ring-1 ring-[#00FF00]'
                      : 'bg-[#0C0C0C] border-[#222222] hover:bg-[#1A1A1A]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#00FF00]">MODERATE</span>
                    <span className="w-2 h-2 rounded-full bg-[#00FF00]"></span>
                  </div>
                  <span className="text-xs text-[#888888]">
                    Single Lane Restricted, Light Motor Vehicles Passable
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSeverity('high')}
                  className={`p-2.5 rounded-lg text-left transition-all flex flex-col gap-1 border cursor-pointer ${
                    selectedSeverity === 'high'
                      ? 'bg-[#F27D26]/10 border-[#F27D26] ring-1 ring-[#F27D26]'
                      : 'bg-[#0C0C0C] border-[#222222] hover:bg-[#1A1A1A]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#F27D26]">HIGH ALERT</span>
                    <span className="w-2 h-2 rounded-full bg-[#F27D26]"></span>
                  </div>
                  <span className="text-xs text-[#888888]">
                    Multi-Axle HCV Blocked, Light Convoy Pilot
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSeverity('critical')}
                  className={`p-2.5 rounded-lg text-left transition-all flex flex-col gap-1 border cursor-pointer ${
                    selectedSeverity === 'critical'
                      ? 'bg-red-950/30 border-red-500 ring-1 ring-red-500'
                      : 'bg-[#0C0C0C] border-[#222222] hover:bg-[#1A1A1A]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                      CRITICAL HAZARD
                    </span>
                    <CheckSquare size={13} className="text-red-400" />
                  </div>
                  <span className="text-xs text-white font-medium">
                    Total Freight Blockage • Both Carriageways Obstructed
                  </span>
                </button>
              </div>
            </div>

            {/* Geological Slip Diagnostics Matrix */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 font-mono">
              <div className="bg-[#0C0C0C] p-2.5 rounded-lg border border-[#222222] flex flex-col">
                <span className="text-[9px] text-[#888888] uppercase">DEBRIS COMP</span>
                <span className="text-xs text-white font-semibold truncate">Wet Shale Slurry</span>
                <span className="text-[10px] text-[#888888]">45% Liquefied silt</span>
              </div>
              <div className="bg-[#0C0C0C] p-2.5 rounded-lg border border-[#222222] flex flex-col">
                <span className="text-[9px] text-[#888888] uppercase">SLOPE ANGLE</span>
                <span className="text-xs text-[#F27D26] font-semibold">62° Shear Scarp</span>
                <span className="text-[10px] text-[#888888]">High afterslip risk</span>
              </div>
              <div className="bg-[#0C0C0C] p-2.5 rounded-lg border border-[#222222] flex flex-col">
                <span className="text-[9px] text-[#888888] uppercase">SLIP VELOCITY</span>
                <span className="text-xs text-red-400 font-semibold">1.4 m/h Active</span>
                <span className="text-[10px] text-red-400">Unstable talus</span>
              </div>
              <div className="bg-[#0C0C0C] p-2.5 rounded-lg border border-[#222222] flex flex-col">
                <span className="text-[9px] text-[#888888] uppercase">DRAINAGE</span>
                <span className="text-xs text-[#00FFFF] font-semibold">Culvert C-88</span>
                <span className="text-[10px] text-[#00FFFF]">Runoff redirected</span>
              </div>
            </div>
          </div>

          {/* Audit Log & Cryptographic Verification Trail */}
          <div className="bg-[#111111] rounded-xl p-3.5 border border-[#2A2A2A] shadow-md flex flex-col gap-2 font-mono">
            <div className="flex items-center justify-between pb-1 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-2">
                <FileCheck size={15} className="text-[#F27D26]" />
                <span className="text-xs text-white font-bold uppercase tracking-wider">
                  COMMAND CHAIN OF CUSTODY & AUDIT TRAIL
                </span>
              </div>
              <span className="text-xs text-[#00FF00]">
                VALID_CHAIN: 0884-28-AR
              </span>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between p-2 bg-[#0C0C0C] rounded-lg border border-[#222222]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF00]"></span>
                  <span className="text-white font-semibold">Field Operator Auth:</span>
                  <span className="text-[#888888]">Subedar R. Thapa (28 Assam Rifles QRT)</span>
                </div>
                <span className="text-[#666666]">14:19:04 IST</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#0C0C0C] rounded-lg border border-[#222222]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF00]"></span>
                  <span className="text-white font-semibold">GIS Sensor Datalink:</span>
                  <span className="text-[#888888] font-mono">SHA-256: e8b9f71c...b8f10</span>
                </div>
                <span className="text-[#00FF00] font-bold">CONFIRMED</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-[#0C0C0C] rounded-lg border border-[#222222]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F27D26]"></span>
                  <span className="text-white font-semibold">TOC Controller Sign-Off:</span>
                  <span className="text-[#F27D26] font-bold">Duty Commander MDoNER</span>
                </div>
                <span className={`uppercase font-bold text-[10px] px-2 py-0.5 rounded ${
                  isCorridorClosed 
                    ? 'bg-[#00FF00]/10 text-[#00FF00]' 
                    : 'bg-[#F27D26]/10 text-[#F27D26]'
                }`}>
                  {isCorridorClosed ? 'CORRIDOR LOCKED' : 'AWAITING STRIKE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: CLEARANCE COUNTDOWN, STRANDED ASSETS, AND EMERGENCY DIRECTIVES */}
        <div className="xl:col-span-5 flex flex-col gap-3 font-mono">
          {/* Clearance Countdown Display */}
          <div className="bg-[#111111] rounded-xl p-4 border border-[#2A2A2A] shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#F27D26]" />
                <span className="text-xs text-white font-bold uppercase tracking-widest">
                  CLEARANCE COUNTDOWN
                </span>
              </div>
              <span className="text-[10px] text-[#888888]">BRO 118 RCC PROJECTION</span>
            </div>

            {/* Timer Big Digit Matrix */}
            <div className="flex flex-col items-center justify-center p-4 bg-[#0C0C0C] rounded-xl border border-[#2A2A2A]">
              <span className="text-[10px] text-[#888888] uppercase tracking-widest mb-1 text-center">
                ESTIMATED TIME TO RESTORE SINGLE LINE
              </span>
              <div className="text-4xl sm:text-5xl font-mono text-white font-extrabold tracking-widest flex items-center gap-2">
                <span>{timerDisplay.hours}</span>
                <span className="animate-pulse text-[#F27D26]">:</span>
                <span>{timerDisplay.mins}</span>
                <span className="animate-pulse text-[#F27D26]">:</span>
                <span>{timerDisplay.secs}</span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-[#888888] text-xs">
                <span>Two-Way: <strong className="text-[#F27D26]">18h 30m</strong></span>
                <span className="text-[#2A2A2A]">|</span>
                <span>Confidence: <strong className="text-[#00FF00]">88%</strong></span>
              </div>
            </div>

            {/* Heavy Assets Tracker */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white uppercase tracking-wider flex items-center gap-1.5 font-bold">
                  <Wrench size={13} className="text-[#F27D26]" />
                  HEAVY ASSETS IN DISPATCH (BRO GREF)
                </span>
                <span className="text-[10px] text-[#00FF00] font-bold">
                  2 UNITS CONVERGING
                </span>
              </div>

              {/* Unit 1 */}
              <div className="p-2.5 bg-[#0C0C0C] rounded-lg border border-[#222222] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-[#1A1A1A] flex items-center justify-center text-[#F27D26]">
                    <Wrench size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">
                      BRO Bulldozer D-85
                    </span>
                    <span className="text-[11px] text-[#888888]">
                      Dispatched: Jowai Depot (24 km out)
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-[#00FF00] font-bold">ETA 42 MIN</span>
                  <span className="text-[9px] text-[#888888]">34 KM/H</span>
                </div>
              </div>

              {/* Unit 2 */}
              <div className="p-2.5 bg-[#0C0C0C] rounded-lg border border-[#222222] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-[#1A1A1A] flex items-center justify-center text-[#00FFFF]">
                    <Truck size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">
                      JCB Excavator Track-4
                    </span>
                    <span className="text-[11px] text-[#888888]">
                      Dispatched: Khliehriat Staging
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-[#00FF00] font-bold">ETA 58 MIN</span>
                  <span className="text-[9px] text-[#888888]">28 KM/H</span>
                </div>
              </div>
            </div>

            {/* High-Priority Stranded Convoys */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white uppercase tracking-wider flex items-center gap-1 font-bold">
                  <Truck size={13} className="text-[#F27D26]" />
                  STRANDED LOGISTICS (QUEUED AT CUT)
                </span>
                <span className="text-[9px] text-red-400 font-bold px-1.5 py-0.5 bg-red-950/40 rounded border border-red-800">
                  SPOILAGE RISK
                </span>
              </div>

              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <div className="p-2 bg-[#0C0C0C] rounded-lg border border-[#222222] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-white font-bold">MED-NER-04</span>
                    <span className="text-[#888888] text-[11px]">Insulin Cold Chain</span>
                  </div>
                  <span className="text-red-400 font-bold">BATTERY: 04h 12m</span>
                </div>

                <div className="p-2 bg-[#0C0C0C] rounded-lg border border-[#222222] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F27D26]"></span>
                    <span className="text-white font-bold">OXY-CRY-09</span>
                    <span className="text-[#888888] text-[11px]">Silchar Hospital Oxygen</span>
                  </div>
                  <span className="text-[#F27D26] font-bold">VENT: 12h</span>
                </div>

                <div className="p-2 bg-[#0C0C0C] rounded-lg border border-[#222222] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF00]"></span>
                    <span className="text-white font-bold">RATIONS-12</span>
                    <span className="text-[#888888] text-[11px]">FCI Foodgrain</span>
                  </div>
                  <span className="text-[#00FF00] font-bold">SECURE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Operational Authority Controls */}
          <div className="bg-[#111111] rounded-xl p-4 border border-[#2A2A2A] shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-[#F27D26]" />
                <span className="text-xs text-white font-bold uppercase tracking-widest">
                  COMMAND CLEARANCE DIRECTIVE
                </span>
              </div>
              <span className="text-[10px] text-[#888888]">LEVEL 4 INCIDENT</span>
            </div>

            {/* Master Critical Emergency Shut Down Button */}
            <button
              id="btn-authorize-corridor-shutdown"
              onClick={() => setShowConfirmModal(true)}
              className={`w-full py-3.5 px-4 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all active:scale-[0.98] cursor-pointer ${
                isCorridorClosed
                  ? 'bg-red-600 text-white border-2 border-red-400 shadow-red-600/30 animate-pulse'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
              }`}
            >
              <Lock size={18} className="animate-pulse" />
              <span>
                {isCorridorClosed 
                  ? 'CORRIDOR SHUTDOWN ENFORCED (OVERRIDE)' 
                  : 'Authorize Emergency Corridor Shutdown'}
              </span>
            </button>

            {/* Secondary Action Triggers */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setSimulationState(prev => ({
                    ...prev,
                    isDiverted: true,
                    rerouteCounter: prev.rerouteCounter + 1,
                    bannerMessage: 'AUTOMATIC DIVERSION: Badarpur-Guwahati heavy fleet rerouted to NH-27 bypass via Umrangso.',
                    bannerType: 'warning'
                  }));
                }}
                className="w-full py-2.5 px-3 bg-[#0C0C0C] hover:bg-[#1A1A1A] border border-[#222222] rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ChevronRight size={16} className="text-[#F27D26]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white uppercase">
                      Trigger Traffic Divert to NH-27 Bypass
                    </span>
                    <span className="text-[11px] text-[#888888]">
                      Reroute Badarpur-Guwahati fleet via Umrangso
                    </span>
                  </div>
                </div>
                <ChevronRight size={15} className="text-[#666666]" />
              </button>

              <button
                type="button"
                onClick={handleBroadcastAlert}
                className="w-full py-2.5 px-3 bg-[#0C0C0C] hover:bg-[#1A1A1A] border border-[#222222] rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Radio size={16} className="text-[#00FFFF]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white uppercase">
                      Broadcast HF/SMS Alert to Carrier Union
                    </span>
                    <span className="text-[11px] text-[#888888]">
                      {broadcastSent ? 'SUCCESS: 1,480 Units Notified' : 'Push emergency bulletin to 1,480 units'}
                    </span>
                  </div>
                </div>
                <Send size={14} className={broadcastSent ? "text-[#00FF00]" : "text-[#666666]"} />
              </button>
            </div>

            {/* Commander Override Checklist */}
            <div className="p-3 bg-[#0C0C0C] rounded-lg border border-[#222222] flex flex-col gap-2">
              <span className="text-[10px] text-[#888888] uppercase tracking-wider font-bold">
                COMMAND VERIFICATION CHECKLIST
              </span>

              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setChecklist(prev => ({ ...prev, check1: !prev.check1 }))}
              >
                <input
                  type="checkbox"
                  checked={checklist.check1}
                  onChange={() => {}}
                  className="w-4 h-4 rounded bg-[#1A1A1A] accent-[#F27D26] cursor-pointer"
                />
                <label className="text-xs text-white cursor-pointer">
                  Visual confirmation verified with 28 AR outpost
                </label>
              </div>

              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setChecklist(prev => ({ ...prev, check2: !prev.check2 }))}
              >
                <input
                  type="checkbox"
                  checked={checklist.check2}
                  onChange={() => {}}
                  className="w-4 h-4 rounded bg-[#1A1A1A] accent-[#F27D26] cursor-pointer"
                />
                <label className="text-xs text-white cursor-pointer">
                  Emergency medical convoy (MED-04) diversion confirmed
                </label>
              </div>

              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setChecklist(prev => ({ ...prev, check3: !prev.check3 }))}
              >
                <input
                  type="checkbox"
                  checked={checklist.check3}
                  onChange={() => {}}
                  className="w-4 h-4 rounded bg-[#1A1A1A] accent-[#F27D26] cursor-pointer"
                />
                <label className="text-xs text-white cursor-pointer">
                  District Magistrate notified for Sec 144 restriction
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Emergency Corridor Shutdown */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#111111] border-2 border-red-500 p-5 rounded-xl shadow-2xl flex flex-col gap-4 font-mono">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle size={26} className="text-red-500 animate-bounce" />
              <div>
                <h3 className="text-base font-bold uppercase text-white">
                  CONFIRM EMERGENCY CORRIDOR SHUTDOWN
                </h3>
                <span className="text-[10px] text-[#888888]">
                  LEVEL-4 OPERATIONAL LOCKDOWN DIRECTIVE
                </span>
              </div>
            </div>

            <p className="text-xs text-white leading-relaxed bg-[#0C0C0C] p-3 rounded-lg border border-[#222222]">
              AUTHORIZATION DIRECTIVE: Route NH-6 at Km 142.8 Sonapur Cut will be permanently closed across all regional checkpoints (Jowai, Umkiang, Ratacherra). All inbound freight will be diverted to NH-27 bypass via Haflong.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#2A2A2A]">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#222222] text-white text-xs font-semibold rounded-lg border border-[#2A2A2A] cursor-pointer"
              >
                Cancel Directive
              </button>

              <button
                type="button"
                id="modal-confirm-shutdown-btn"
                onClick={handleConfirmShutdown}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase rounded-lg shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Lock size={14} />
                <span>Confirm Immediate Lockdown</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
