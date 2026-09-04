import React, { useState, useEffect } from 'react';
import { Waypoint, SimulationState, Convoy } from '../types';
import { INITIAL_WAYPOINTS } from '../data/mockData';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Shield, 
  Thermometer, 
  CloudRain, 
  Radio
} from 'lucide-react';

interface GisMapProps {
  simulationState: SimulationState;
  onAuthorizeDiversion: () => void;
  selectedConvoy: Convoy;
}

export const GisMap: React.FC<GisMapProps> = ({
  simulationState,
  onAuthorizeDiversion,
  selectedConvoy
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeOverlays, setActiveOverlays] = useState<{
    doppler: boolean;
    contours: boolean;
    patrols: boolean;
    thermal: boolean;
  }>({
    doppler: true,
    contours: true,
    patrols: false,
    thermal: false
  });
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);

  // Animated truck progression (0 to 1 along path)
  const [truckProgress, setTruckProgress] = useState<number>(0.38);

  useEffect(() => {
    const interval = setInterval(() => {
      setTruckProgress((prev) => {
        const next = prev + 0.003;
        return next > 0.95 ? 0.05 : next;
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const isCriticalRain = simulationState.precipitation > 100 || simulationState.isLandslideTriggered;
  const isCorridorClosed = simulationState.isCorridorShutdown;
  const isDiverted = simulationState.isDiverted;

  // Path coordinates
  const nh6Points = [
    { x: 140, y: 100 },
    { x: 260, y: 190 },
    { x: 350, y: 220 },
    { x: 460, y: 265 },
    { x: 680, y: 410 }
  ];

  const nh27Points = [
    { x: 140, y: 100 },
    { x: 290, y: 80 },
    { x: 430, y: 110 },
    { x: 560, y: 240 },
    { x: 680, y: 410 }
  ];

  const getPositionAlongPoints = (points: { x: number; y: number }[], progress: number) => {
    const totalSegments = points.length - 1;
    const scaledProgress = Math.max(0, Math.min(progress, 0.999)) * totalSegments;
    const segmentIndex = Math.floor(scaledProgress);
    const segmentFraction = scaledProgress - segmentIndex;

    const p1 = points[segmentIndex];
    const p2 = points[segmentIndex + 1] || points[segmentIndex];

    const x = p1.x + (p2.x - p1.x) * segmentFraction;
    const y = p1.y + (p2.y - p1.y) * segmentFraction;

    const angleRad = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const angleDeg = (angleRad * 180) / Math.PI;

    return { x, y, angle: angleDeg };
  };

  const activePoints = isDiverted ? nh27Points : nh6Points;
  const truckPos = getPositionAlongPoints(activePoints, truckProgress);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.8), 2.2));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedWaypoint(null);
  };

  return (
    <div id="gis-radar-container" className="relative w-full bg-[#080808] rounded-xl border border-[#2A2A2A] overflow-hidden flex flex-col shadow-2xl">
      {/* Top Map HUD Status Bar */}
      <div className="relative z-10 px-4 py-3 bg-[#0C0C0C] border-b border-[#2A2A2A] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full ${isCriticalRain || isCorridorClosed ? 'bg-red-500 animate-ping' : 'bg-[#00FF00] animate-pulse'}`}></span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#E4E3E0] font-bold tracking-wider uppercase">
              GIS Engine // Corridor Monitor
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[#1A1A1A] text-[#888888] font-mono text-[9px] border border-[#2A2A2A]">
              WGS-84 / UTM 46N
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span id="status-tag" className={`px-2 py-0.5 rounded-full text-[9px] font-bold border transition-all ${
            isCorridorClosed 
              ? 'bg-red-950/40 text-red-400 border-red-800' 
              : isDiverted 
              ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20' 
              : 'bg-[#00FF00]/10 text-[#00FF00] border-[#00FF00]/20'
          }`}>
            {isCorridorClosed ? 'LOCKED: CORRIDOR SHUTDOWN' : isDiverted ? 'DIVERTED VIA NH-27 (PASSABLE)' : 'ACTIVE: NH-6 PRIMARY'}
          </span>
          <span className="px-2 py-0.5 rounded bg-[#1A1A1A] text-[#888888] border border-[#2A2A2A]">
            INSAT-3DR
          </span>
        </div>
      </div>

      {/* Main Interactive SVG Map Canvas */}
      <div className="relative w-full h-[460px] lg:h-[500px] bg-[#050505] overflow-hidden select-none">
        {/* Radar concentric range circles & tactical crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[500px] h-[500px] rounded-full border border-[#F27D26]/40"></div>
          <div className="w-[360px] h-[360px] rounded-full border border-[#2A2A2A] border-dashed"></div>
          <div className="w-[200px] h-[200px] rounded-full border border-[#2A2A2A]"></div>
          <div className="w-full h-px bg-[#2A2A2A] absolute"></div>
          <div className="h-full w-px bg-[#2A2A2A] absolute"></div>
          {/* Radar sweeping beam */}
          <div className="w-[500px] h-[500px] rounded-full absolute animate-radar-sweep pointer-events-none opacity-25 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_310deg,rgba(242,125,38,0.25)_360deg)]"></div>
        </div>

        {/* Map In-Canvas Critical Alert Banner (Bento style) */}
        {isCriticalRain && !isDiverted && (
          <div id="alert-banner" className="absolute top-4 left-1/2 -translate-x-1/2 w-[85%] max-w-md bg-red-600 text-white text-[10px] font-mono font-bold p-2 text-center rounded-lg shadow-2xl animate-bounce z-30">
            CRITICAL: IMMINENT LANDSLIDE RISK AT SONAPUR CUT
          </div>
        )}

        {/* Map Pan & Zoom Controls */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 bg-[#111111]/90 backdrop-blur-md p-1.5 rounded-lg border border-[#2A2A2A] shadow-lg">
          <button 
            id="map-zoom-in"
            onClick={() => handleZoom(0.2)}
            title="Zoom In"
            className="w-7 h-7 rounded flex items-center justify-center text-[#E4E3E0] hover:bg-[#1A1A1A] hover:text-[#F27D26] transition-colors"
          >
            <ZoomIn size={15} />
          </button>
          <button 
            id="map-zoom-out"
            onClick={() => handleZoom(-0.2)}
            title="Zoom Out"
            className="w-7 h-7 rounded flex items-center justify-center text-[#E4E3E0] hover:bg-[#1A1A1A] hover:text-[#F27D26] transition-colors"
          >
            <ZoomOut size={15} />
          </button>
          <button 
            id="map-reset-view"
            onClick={handleResetView}
            title="Reset View"
            className="w-7 h-7 rounded flex items-center justify-center text-[#E4E3E0] hover:bg-[#1A1A1A] hover:text-[#F27D26] transition-colors"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Tactical SVG Map */}
        <svg 
          id="tactical-gis-svg"
          className="w-full h-full cursor-crosshair transition-transform duration-200 ease-out"
          viewBox="0 0 800 500" 
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: 'center center'
          }}
        >
          <defs>
            <linearGradient id="primaryRouteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F27D26" />
              <stop offset="45%" stopColor={isCriticalRain || isCorridorClosed ? "#FF0000" : "#666666"} />
              <stop offset="100%" stopColor={isCorridorClosed ? "#7f1d1d" : "#FF0000"} />
            </linearGradient>

            <linearGradient id="bypassRouteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F27D26" />
              <stop offset="40%" stopColor="#00FFFF" />
              <stop offset="100%" stopColor="#00FF00" />
            </linearGradient>
          </defs>

          {/* Topography Elevation Contours */}
          {activeOverlays.contours && (
            <g className="contours opacity-30">
              <path d="M 60 110 C 180 60, 270 140, 370 95 C 450 70, 530 160, 620 120" stroke="#2A2A2A" strokeWidth="1.5" strokeDasharray="5 5" fill="none" />
              <path d="M 100 170 C 220 120, 310 210, 420 170 C 510 150, 580 230, 690 180" stroke="#2A2A2A" strokeWidth="1.5" strokeDasharray="5 5" fill="none" />
              <path d="M 140 240 C 260 195, 360 290, 480 250 C 560 220, 640 310, 740 270" stroke="#222222" strokeWidth="1" strokeDasharray="3 4" fill="none" />
              <path d="M 200 320 C 300 280, 400 370, 530 330 C 610 310, 690 390, 770 350" stroke="#222222" strokeWidth="1" strokeDasharray="3 4" fill="none" />
            </g>
          )}

          {/* Severe Rain Storm Cloud Doppler Simulation */}
          {activeOverlays.doppler && (
            <g id="doppler-storm-cloud">
              <ellipse 
                cx="450" 
                cy="260" 
                rx={isCriticalRain ? "110" : "80"} 
                ry={isCriticalRain ? "75" : "55"} 
                fill="#F27D26" 
                fillOpacity={isCriticalRain ? "0.22" : "0.1"} 
                className="transition-all duration-500"
              />
              <ellipse 
                cx="465" 
                cy="255" 
                rx={isCriticalRain ? "70" : "45"} 
                ry={isCriticalRain ? "50" : "32"} 
                fill="#FF0000" 
                fillOpacity={isCriticalRain ? "0.35" : "0.15"} 
                className="transition-all duration-500"
              />
              <circle 
                cx="460" 
                cy="260" 
                r={isCriticalRain ? "28" : "15"} 
                fill="#FF0000" 
                fillOpacity={isCriticalRain ? "0.6" : "0.25"} 
                className={isCriticalRain ? "animate-ping" : ""}
              />
              <text x="425" y="215" fill="#F27D26" fontFamily="JetBrains Mono" fontSize="9" fontWeight="bold">
                {isCriticalRain ? `CELL MAX: ${simulationState.precipitation}mm/h` : 'CELL CONVECTIVE: 65mm/h'}
              </text>
            </g>
          )}

          {/* ROUTE 2: ALTERNATIVE BYPASS NH-27 (Dashed in Bento design) */}
          <path 
            id="nh-27"
            d="M 140 100 L 290 80 L 430 110 L 560 240 L 680 410" 
            fill="none" 
            stroke={isDiverted ? "#00FFFF" : "#333333"} 
            strokeWidth={isDiverted ? "4" : "3"} 
            strokeDasharray={isDiverted ? "none" : "4 4"}
            className="transition-all duration-300"
          />

          {/* ROUTE 1: PRIMARY DIRECT NH-6 */}
          <path 
            id="nh-6"
            d="M 140 100 L 260 190 L 350 220 L 460 265 L 680 410" 
            fill="none" 
            stroke={isCorridorClosed || isCriticalRain ? "#FF0000" : "#555555"} 
            strokeWidth={isDiverted ? "2.5" : "4"} 
            strokeDasharray={isCorridorClosed ? "4 4" : "none"} 
            opacity={isDiverted ? 0.35 : 1}
            className="transition-all duration-300"
          />

          {/* Route labels */}
          <g>
            <text x="280" y="235" fill="#888888" fontFamily="JetBrains Mono" fontSize="9">
              NH-6 PRIMARY {isCorridorClosed ? '[BLOCKED]' : isCriticalRain ? '[CRITICAL]' : '[ACTIVE]'}
            </text>
            <text x="400" y="70" fill={isDiverted ? "#00FFFF" : "#666666"} fontFamily="JetBrains Mono" fontSize="9" fontWeight="bold">
              NH-27 BYPASS VIA HAFLONG {isDiverted ? '[DIVERTED ACTIVE]' : '[STANDBY]'}
            </text>
          </g>

          {/* CRITICAL CHOKE POINT: Sonapur Tunnel KM 142.8 */}
          <g 
            id="sonapur-node"
            transform="translate(460, 265)"
            className="cursor-pointer"
            onClick={() => setSelectedWaypoint(INITIAL_WAYPOINTS.find(w => w.id === 'snp') || null)}
          >
            {(isCriticalRain || isCorridorClosed) && (
              <>
                <circle cx="0" cy="0" r="32" fill="#FF0000" fillOpacity="0.2" className="animate-ping" />
                <circle cx="0" cy="0" r="20" fill="#FF0000" fillOpacity="0.4" className="animate-pulse" />
              </>
            )}
            <circle 
              cx="0" 
              cy="0" 
              r="14" 
              fill={isCorridorClosed ? "#690005" : isCriticalRain ? "#FF0000" : "#222222"} 
              stroke={isCriticalRain || isCorridorClosed ? "#FF0000" : "#666666"} 
              strokeWidth="2.5" 
            />
            <text x="-4" y="4" fill="#ffffff" fontFamily="JetBrains Mono" fontSize="12" fontWeight="bold">!</text>

            {/* Sonapur Callout Box */}
            <line x1="12" y1="-12" x2="35" y2="-35" stroke={isCriticalRain || isCorridorClosed ? "#FF0000" : "#666666"} strokeWidth="1.5" />
            <rect 
              x="35" 
              y="-58" 
              width="145" 
              height="40" 
              rx="6" 
              fill="#111111" 
              stroke={isCriticalRain || isCorridorClosed ? "#FF0000" : "#2A2A2A"} 
              strokeWidth="1.2" 
            />
            <text x="42" y="-42" fill={isCriticalRain || isCorridorClosed ? "#FF5555" : "#E4E3E0"} fontFamily="JetBrains Mono" fontSize="9" fontWeight="bold">
              SONAPUR TUNNEL CUT
            </text>
            <text x="42" y="-28" fill={isCorridorClosed ? "#FF5555" : isCriticalRain ? "#FF0000" : "#00FF00"} fontFamily="JetBrains Mono" fontSize="8" fontWeight="bold">
              {isCorridorClosed ? 'CORRIDOR SHUTDOWN' : isCriticalRain ? `LANDSLIDE PROB: ${simulationState.landslideProbability}%` : 'PASSABLE (WATCH)'}
            </text>
          </g>

          {/* Waypoints Render */}
          {INITIAL_WAYPOINTS.filter(w => w.id !== 'snp').map((wp) => {
            const isSelected = selectedWaypoint?.id === wp.id;
            return (
              <g 
                key={wp.id} 
                transform={`translate(${wp.x}, ${wp.y})`}
                className="cursor-pointer group"
                onClick={() => setSelectedWaypoint(wp)}
              >
                <circle 
                  cx="0" 
                  cy="0" 
                  r={isSelected ? "8" : wp.id === 'ghy' || wp.id === 'sil' ? "5" : "4"} 
                  fill={wp.id === 'ghy' || wp.id === 'sil' ? '#F27D26' : '#888888'} 
                  stroke={isSelected ? '#F27D26' : 'none'}
                  strokeWidth="2"
                />
                <text 
                  x="8" 
                  y="4" 
                  fill={wp.id === 'ghy' || wp.id === 'sil' ? '#E4E3E0' : '#888888'} 
                  fontFamily="JetBrains Mono" 
                  fontSize="9" 
                  fontWeight={wp.id === 'ghy' || wp.id === 'sil' ? 'bold' : 'normal'}
                  className="group-hover:fill-[#F27D26] transition-colors"
                >
                  {wp.name}
                </text>
              </g>
            );
          })}

          {/* MAIN ANIMATED TRUCK: MED-NER-04 carrying critical insulin */}
          <g 
            id="truck"
            transform={`translate(${truckPos.x}, ${truckPos.y})`}
            className="cursor-pointer"
          >
            <circle 
              id="truck-pin"
              cx="0" 
              cy="0" 
              r={isCriticalRain && !isDiverted ? "8" : "7"} 
              fill={isDiverted ? "#00FFFF" : "#F27D26"} 
              stroke="#FFFFFF"
              strokeWidth="1.5"
            >
              <animate attributeName="r" values="6;8;6" dur="1.5s" repeatCount="indefinite" />
            </circle>

            {/* Truck Pin Tag Card */}
            <g transform="translate(12, -14)">
              <rect 
                x="0" 
                y="-14" 
                width="145" 
                height="30" 
                rx="4" 
                fill="#111111" 
                stroke={isDiverted ? "#00FFFF" : isCriticalRain ? "#FF0000" : "#2A2A2A"} 
                strokeWidth="1" 
              />
              <text id="truck-label" x="6" y="-2" fill="#FFFFFF" fontFamily="JetBrains Mono" fontSize="9" fontWeight="bold">
                MED-NER-04 {isDiverted ? '[DIVERTED]' : isCriticalRain ? '[ALERT]' : ''}
              </text>
              <text x="6" y="9" fill={isDiverted ? "#00FFFF" : "#F27D26"} fontFamily="JetBrains Mono" fontSize="7.5">
                {isDiverted ? 'NH-27 HAFLONG BYPASS' : 'CRITICAL INSULIN SUPPLY'}
              </text>
            </g>
          </g>
        </svg>

        {/* Selected Waypoint Detail Modal / Flyout */}
        {selectedWaypoint && (
          <div className="absolute top-14 left-3 z-30 w-64 bg-[#111111]/95 backdrop-blur-md p-3 rounded-xl border border-[#2A2A2A] shadow-2xl">
            <div className="flex items-center justify-between pb-1 border-b border-[#2A2A2A]">
              <span className="font-mono text-[10px] text-[#F27D26] font-bold uppercase">
                WAYPOINT TELEMETRY
              </span>
              <button 
                onClick={() => setSelectedWaypoint(null)}
                className="text-[#888888] hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <div className="mt-2 flex flex-col gap-1 text-xs">
              <div className="font-bold text-[#E4E3E0]">{selectedWaypoint.name}</div>
              <div className="text-[11px] text-[#888888] font-mono">{selectedWaypoint.coordinates}</div>
              {selectedWaypoint.elevation && (
                <div className="text-[11px] text-[#00FF00] font-mono">Elevation: {selectedWaypoint.elevation}</div>
              )}
              <div className="text-[11px] text-[#888888] mt-1">{selectedWaypoint.description}</div>
              {selectedWaypoint.id === 'snp' && (
                <div className="mt-2 pt-2 border-t border-[#2A2A2A]">
                  <div className="text-[11px] text-red-400 font-bold">Landslide Risk: {simulationState.landslideProbability}%</div>
                  {!isDiverted && (
                    <button
                      onClick={onAuthorizeDiversion}
                      className="mt-2 w-full py-1.5 bg-[#F27D26] hover:bg-[#F27D26]/90 text-black font-bold rounded text-[10px] font-mono uppercase tracking-wider transition-colors"
                    >
                      Authorize Diversion
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating HUD Window: Sonapur Choke Point Sensor Telemetry */}
        <div className="absolute top-4 right-4 w-72 bg-[#111111]/95 backdrop-blur-md p-3 rounded-xl border border-[#2A2A2A] shadow-2xl z-20">
          <div className="flex items-center justify-between pb-2 border-b border-[#2A2A2A]">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isCriticalRain || isCorridorClosed ? 'bg-red-500 animate-ping' : 'bg-[#00FF00]'}`}></span>
              <span className={`font-mono text-[11px] font-bold tracking-wider ${isCriticalRain || isCorridorClosed ? 'text-red-400' : 'text-[#E4E3E0]'}`}>
                SONAPUR CHOKE POINT
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#888888]">KM 142.8</span>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            {/* Precipitation Telemetry */}
            <div>
              <div className="flex justify-between font-mono text-[11px] mb-1">
                <span className="text-[#888888]">Precipitation (24h)</span>
                <span className={`font-bold ${isCriticalRain ? 'text-[#F27D26] animate-pulse' : 'text-[#00FF00]'}`}>
                  {simulationState.precipitation} mm
                </span>
              </div>
              <div className="w-full bg-[#222222] h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${isCriticalRain ? 'bg-[#F27D26]' : 'bg-[#00FF00]'}`}
                  style={{ width: `${Math.min(100, (simulationState.precipitation / 160) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Landslide Probability */}
            <div>
              <div className="flex justify-between font-mono text-[11px] mb-1">
                <span className="text-[#888888]">Landslide Risk</span>
                <span className={`font-bold ${simulationState.landslideProbability > 70 ? 'text-red-400' : 'text-[#00FF00]'}`}>
                  {simulationState.landslideProbability}%
                </span>
              </div>
              <div className="w-full bg-[#222222] h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${simulationState.landslideProbability > 70 ? 'bg-red-600' : 'bg-[#00FF00]'}`}
                  style={{ width: `${simulationState.landslideProbability}%` }}
                ></div>
              </div>
            </div>

            {/* Seismic Rig Stat */}
            <div className={`p-2 rounded-lg mt-1 flex items-center gap-2 border ${isCriticalRain ? 'bg-red-950/20 border-red-800/40' : 'bg-[#1A1A1A] border-[#2A2A2A]'}`}>
              <Radio size={14} className={isCriticalRain ? 'text-red-400 animate-pulse' : 'text-[#F27D26]'} />
              <span className={`font-mono text-[10px] leading-tight ${isCriticalRain ? 'text-red-400' : 'text-[#888888]'}`}>
                {isCriticalRain 
                  ? 'Active Slip Detected: Micro-tremors exceeding threshold' 
                  : 'Sensors: Normal baseline (< 0.2 mm/h)'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom-Left GIS Map Legend */}
        <div className="absolute bottom-3 left-3 bg-[#111111]/90 backdrop-blur-md p-2.5 rounded-xl border border-[#2A2A2A] flex flex-col gap-1.5 text-[#E4E3E0] z-10">
          <span className="font-mono text-[9px] text-[#888888] uppercase tracking-wider font-bold">
            Corridor Legend
          </span>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="w-3 h-1 bg-[#00FFFF] inline-block rounded-sm"></span>
            <span>NH-27 Bypass (Passable)</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className={`w-3 h-1 inline-block rounded-sm ${isCorridorClosed || isCriticalRain ? 'bg-red-600' : 'bg-[#555555]'}`}></span>
            <span>NH-6 Primary ({isCorridorClosed ? 'Shutdown' : isCriticalRain ? 'High Risk' : 'Normal'})</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="w-2 h-2 rounded-full bg-[#F27D26] inline-block"></span>
            <span>MED-NER-04 Insulin Vehicle</span>
          </div>
        </div>
      </div>

      {/* GIS Layer Controls Bar */}
      <div className="relative z-10 p-2.5 bg-[#0C0C0C] border-t border-[#2A2A2A] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] text-[#666666] uppercase">Overlays:</span>
          
          <button 
            id="overlay-doppler"
            onClick={() => setActiveOverlays(prev => ({ ...prev, doppler: !prev.doppler }))}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors border ${
              activeOverlays.doppler 
                ? 'bg-[#F27D26] text-black border-[#F27D26]' 
                : 'bg-[#1A1A1A] text-[#888888] border-[#2A2A2A] hover:text-white'
            }`}
          >
            <CloudRain size={12} />
            Doppler [{activeOverlays.doppler ? 'ON' : 'OFF'}]
          </button>

          <button 
            id="overlay-contours"
            onClick={() => setActiveOverlays(prev => ({ ...prev, contours: !prev.contours }))}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors border ${
              activeOverlays.contours 
                ? 'bg-[#1A1A1A] text-[#E4E3E0] border-[#F27D26]' 
                : 'bg-[#1A1A1A] text-[#888888] border-[#2A2A2A] hover:text-white'
            }`}
          >
            <Layers size={12} />
            Elevation Contours
          </button>

          <button 
            id="overlay-patrols"
            onClick={() => setActiveOverlays(prev => ({ ...prev, patrols: !prev.patrols }))}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors border ${
              activeOverlays.patrols 
                ? 'bg-[#00FF00]/20 text-[#00FF00] border-[#00FF00]/40' 
                : 'bg-[#1A1A1A] text-[#888888] border-[#2A2A2A] hover:text-white'
            }`}
          >
            <Shield size={12} />
            Assam Rifles
          </button>

          <button 
            id="overlay-thermal"
            onClick={() => setActiveOverlays(prev => ({ ...prev, thermal: !prev.thermal }))}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors border ${
              activeOverlays.thermal 
                ? 'bg-[#1A1A1A] text-[#F27D26] border-[#F27D26]' 
                : 'bg-[#1A1A1A] text-[#888888] border-[#2A2A2A] hover:text-white'
            }`}
          >
            <Thermometer size={12} />
            Sat Thermal
          </button>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-[#666666]">
          <span>WGS-84 / UTM 46N</span>
          <span className="text-[#00FF00] font-bold">1:50,000 MESH</span>
        </div>
      </div>
    </div>
  );
};
