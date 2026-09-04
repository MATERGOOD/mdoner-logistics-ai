import React, { useState, useEffect, useRef } from 'react';
import { Waypoint, SimulationState, Convoy } from '../types';
import { INITIAL_WAYPOINTS } from '../data/mockData';
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

// Fix Leaflet's default missing asset warnings
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

interface GisMapProps {
  simulationState: SimulationState;
  onAuthorizeDiversion: () => void;
  selectedConvoy: Convoy;
}

const nh6Coords: [number, number][] = [
  [26.185, 91.748], [26.142, 91.790], [26.105, 91.868], [26.052, 91.885],
  [25.968, 91.882], [25.901, 91.881], [25.820, 91.875], [25.720, 91.890],
  [25.660, 91.905], [25.602, 91.898], [25.578, 91.885], [25.565, 91.950],
  [25.535, 92.055], [25.498, 92.140], [25.445, 92.205], [25.380, 92.285],
  [25.310, 92.315], [25.245, 92.365], [25.170, 92.385], [25.105, 92.368],
  [25.045, 92.395], [24.985, 92.485], [24.915, 92.565], [24.870, 92.655],
  [24.833, 92.779]
];

const nh27Coords: [number, number][] = [
  [26.185, 91.748], [26.155, 91.980], [26.120, 92.150], [26.175, 92.520],
  [26.345, 92.685], [26.130, 92.860], [25.985, 92.980], [25.750, 93.170],
  [25.580, 93.150], [25.415, 93.120], [25.270, 93.160], [25.170, 93.020],
  [25.080, 92.920], [24.960, 92.840], [24.833, 92.779]
];

export const GisMap: React.FC<GisMapProps> = ({
  simulationState,
  onAuthorizeDiversion,
  selectedConvoy
}) => {
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
  const [showSonapurIntel, setShowSonapurIntel] = useState(true);

  // Animated truck progression (array index tracking)
  const [truckIndex, setTruckIndex] = useState<number>(0);

  const isCriticalRain = simulationState.precipitation > 100 || simulationState.isLandslideTriggered;
  const isCorridorClosed = simulationState.isCorridorShutdown;
  const isDiverted = simulationState.isDiverted;

  const prevDiverted = useRef(isDiverted);

  useEffect(() => {
    if (isDiverted && !prevDiverted.current) {
      // Transition vehicle index to closest waypoint on newly activated bypass
      const currentPos = nh6Coords[Math.min(truckIndex, nh6Coords.length - 1)];
      let minD = Infinity;
      let minI = 0;
      nh27Coords.forEach((pt, i) => {
        const d = (pt[0] - currentPos[0]) ** 2 + (pt[1] - currentPos[1]) ** 2;
        if (d < minD) { minD = d; minI = i; }
      });
      setTruckIndex(minI);
    }
    prevDiverted.current = isDiverted;
  }, [isDiverted, truckIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTruckIndex((prev) => {
        const activeRoute = simulationState.isDiverted ? nh27Coords : nh6Coords;
        const totalElems = activeRoute.length;
        const next = prev + 1;
        return next >= totalElems ? 0 : next;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [simulationState.isDiverted]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedWaypoint(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const activePoints = isDiverted ? nh27Coords : nh6Coords;
  const truckPos = activePoints[Math.min(truckIndex, activePoints.length - 1)];

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
          <span id="status-tag" className={`px-2 py-0.5 rounded-full text-[9px] font-bold border transition-all ${isCorridorClosed
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

      {/* Main Interactive Map Canvas */}
      <div className="relative w-full h-[460px] lg:h-[500px] bg-[#050505] overflow-hidden select-none">

        {/* Map In-Canvas Critical Alert Banner */}
        {isCriticalRain && !isDiverted && (
          <div id="alert-banner" className="absolute top-4 left-1/2 -translate-x-1/2 w-[85%] max-w-md bg-red-600 text-white text-[10px] font-mono font-bold p-2 text-center rounded-lg shadow-2xl animate-bounce z-[1000] pointer-events-none">
            CRITICAL: IMMINENT LANDSLIDE RISK AT SONAPUR CUT
          </div>
        )}

        <MapContainer
          center={[25.6, 92.5]}
          zoom={8.5}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          zoomControl={false}
        >
          <TileLayer
            className="tactical-basemap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* ROUTE 2: ALTERNATIVE BYPASS NH-27 */}
          <Polyline
            positions={nh27Coords}
            pathOptions={{
              color: '#00F0FF',
              weight: 5,
              dashArray: '6, 6'
            }}
          >
            <Tooltip sticky className="tactical-tooltip">NH-27 Haflong Bypass | 424 km | 100% Passable (Recommended)</Tooltip>
          </Polyline>

          {/* ROUTE 1: PRIMARY DIRECT NH-6 */}
          <Polyline
            positions={nh6Coords}
            pathOptions={{
              color: simulationState.precipitation > 100 ? '#EF4444' : '#10B981',
              weight: 5,
            }}
            className={(isCorridorClosed || isCriticalRain) && !isDiverted ? 'animate-pulse' : ''}
          >
            <Tooltip sticky className="tactical-tooltip">NH-6 Hill Lifeline | 312 km | Vulnerable to Landslides</Tooltip>
          </Polyline>

          {/* Sonapur Choke Point */}
          <CircleMarker
            center={[25.105, 92.368]}
            radius={8}
            pathOptions={{
              color: isCriticalRain || isCorridorClosed ? '#EF4444' : '#EF4444',
              fillColor: isCorridorClosed ? '#690005' : isCriticalRain ? '#EF4444' : '#222222',
              fillOpacity: 1,
              weight: 2.5
            }}
            eventHandlers={{
              click: () => setSelectedWaypoint(INITIAL_WAYPOINTS.find(w => w.id === 'snp') || null)
            }}
          >
            <Tooltip permanent direction="right" offset={[10, 0]} className="tactical-tooltip">
              Choke Point: Sonapur Cut
            </Tooltip>
          </CircleMarker>
          {/* Animated radar rings for Sonapur if critical */}
          {(isCriticalRain || isCorridorClosed) && (
            <CircleMarker
              center={[25.105, 92.368]}
              radius={20}
              pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.2, weight: 0 }}
              className="animate-ping"
            />
          )}

          {/* Animated Truck */}
          <CircleMarker
            center={truckPos}
            radius={isCriticalRain && !isDiverted ? 6 : 5}
            pathOptions={{
              color: '#FFFFFF',
              fillColor: isDiverted ? '#00FFFF' : '#F27D26',
              fillOpacity: 1,
              weight: 1.5
            }}
          >
            <Popup className="tactical-popup">
              <div className="bg-[#111111] p-1 border border-[#222222] text-xs font-mono">
                <div className="font-bold text-white mb-1">
                  MED-NER-04 {isDiverted ? '[DIVERTED]' : isCriticalRain ? '[ALERT]' : ''}
                </div>
                <div className={isDiverted ? 'text-[#00FFFF]' : 'text-[#F27D26]'}>
                  {isDiverted ? 'NH-27 HAFLONG BYPASS' : 'CRITICAL INSULIN SUPPLY'}
                </div>
              </div>
            </Popup>
          </CircleMarker>

          <GisCustomControls />
        </MapContainer>

        {/* Selected Waypoint Detail Modal / Flyout */}
        {selectedWaypoint && (
          <div className="absolute top-14 left-3 z-[1000] w-64 bg-[#111111]/95 backdrop-blur-md p-3 rounded-xl border border-[#2A2A2A] shadow-2xl">
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
        <div className="absolute top-4 right-4 w-72 bg-[#111111]/95 backdrop-blur-md p-3 rounded-xl border border-[#2A2A2A] shadow-2xl z-[1000] pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-[#2A2A2A]">
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setShowSonapurIntel(!showSonapurIntel)}>
              <span className={`w-2 h-2 rounded-full ${isCriticalRain || isCorridorClosed ? 'bg-red-500 animate-ping' : 'bg-[#00FF00]'}`}></span>
              <span className={`font-mono text-[11px] font-bold tracking-wider ${isCriticalRain || isCorridorClosed ? 'text-red-400' : 'text-[#E4E3E0] hover:text-white transition-colors'}`}>
                SONAPUR CHOKE POINT
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#888888]">KM 142.8</span>
              <button
                onClick={() => setShowSonapurIntel(false)}
                className="text-[#888888] hover:text-white font-bold px-1 transition-colors"
                title="Dismiss"
              >✕</button>
            </div>
          </div>

          {showSonapurIntel && (
            <div className="flex flex-col gap-2 mt-2 pointer-events-none">
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
          )}
        </div>

        {/* Bottom-Left GIS Map Legend */}
        <div className="absolute bottom-3 left-3 bg-[#111111]/90 backdrop-blur-md p-2.5 rounded-xl border border-[#2A2A2A] flex flex-col gap-1.5 text-[#E4E3E0] z-[1000] pointer-events-none">
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
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors border ${activeOverlays.doppler
              ? 'bg-[#F27D26] text-black border-[#F27D26]'
              : 'bg-[#1A1A1A] text-[#888888] border-[#2A2A2A] hover:text-white'
              }`}
          >
            <CloudRain size={12} />
            Doppler [{activeOverlays.doppler ? 'ON' : 'OFF'}]
          </button>

          <button
            id="overlay-patrols"
            onClick={() => setActiveOverlays(prev => ({ ...prev, patrols: !prev.patrols }))}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors border ${activeOverlays.patrols
              ? 'bg-[#00FF00]/20 text-[#00FF00] border-[#00FF00]/40'
              : 'bg-[#1A1A1A] text-[#888888] border-[#2A2A2A] hover:text-white'
              }`}
          >
            <Shield size={12} />
            Assam Rifles
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

// Map controls overlay component to attach zoom actions to Leaflet Map instance
function GisCustomControls() {
  const map = useMap();

  return (
    <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1.5 bg-[#111111]/90 backdrop-blur-md p-1.5 rounded-lg border border-[#2A2A2A] shadow-lg">
      <button
        onClick={() => map.zoomIn()}
        title="Zoom In"
        className="w-7 h-7 rounded flex items-center justify-center text-[#E4E3E0] hover:bg-[#1A1A1A] hover:text-[#F27D26] transition-colors"
      >
        <ZoomIn size={15} />
      </button>
      <button
        onClick={() => map.zoomOut()}
        title="Zoom Out"
        className="w-7 h-7 rounded flex items-center justify-center text-[#E4E3E0] hover:bg-[#1A1A1A] hover:text-[#F27D26] transition-colors"
      >
        <ZoomOut size={15} />
      </button>
      <button
        onClick={() => {
          map.setView([25.6, 92.5], 8.5);
        }}
        title="Reset View"
        className="w-7 h-7 rounded flex items-center justify-center text-[#E4E3E0] hover:bg-[#1A1A1A] hover:text-[#F27D26] transition-colors"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
}
