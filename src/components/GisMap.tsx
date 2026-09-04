import React, { useState, useEffect } from 'react';
import { Waypoint, SimulationState, Convoy } from '../types';
import { INITIAL_WAYPOINTS } from '../data/mockData';
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
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
  [26.1445, 91.7362], // Guwahati
  [25.5788, 91.8933], // Shillong
  [25.4529, 92.2036], // Jowai
  [25.1054, 92.3681], // Sonapur Tunnel
  [24.8333, 92.7789], // Silchar
];

const nh27Coords: [number, number][] = [
  [26.1445, 91.7362], // Guwahati
  [26.3468, 92.6840], // Nagaon
  [25.7500, 93.1700], // Lumding
  [25.1700, 93.0200], // Haflong
  [24.8333, 92.7789], // Silchar
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

  const getPositionAlongPath = (points: [number, number][], progress: number): [number, number] => {
    const totalSegments = points.length - 1;
    const scaledProgress = Math.max(0, Math.min(progress, 0.999)) * totalSegments;
    const segmentIndex = Math.floor(scaledProgress);
    const segmentFraction = scaledProgress - segmentIndex;

    const p1 = points[segmentIndex];
    const p2 = points[segmentIndex + 1] || points[segmentIndex];

    const lat = p1[0] + (p2[0] - p1[0]) * segmentFraction;
    const lng = p1[1] + (p2[1] - p1[1]) * segmentFraction;

    return [lat, lng];
  };

  const activePoints = isDiverted ? nh27Coords : nh6Coords;
  const truckPos = getPositionAlongPath(activePoints, truckProgress);

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
          center={[25.5788, 92.4827]}
          zoom={8}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {/* ROUTE 2: ALTERNATIVE BYPASS NH-27 */}
          <Polyline
            positions={nh27Coords}
            pathOptions={{
              color: isDiverted ? '#00FFFF' : '#333333',
              weight: isDiverted ? 4 : 3,
              dashArray: isDiverted ? undefined : '4 4'
            }}
          />

          {/* ROUTE 1: PRIMARY DIRECT NH-6 */}
          <Polyline
            positions={nh6Coords}
            pathOptions={{
              color: isCorridorClosed || isCriticalRain ? '#FF0000' : '#555555',
              weight: isDiverted ? 2.5 : 4,
              dashArray: isCorridorClosed ? '4 4' : undefined,
              opacity: isDiverted ? 0.35 : 1
            }}
          />

          {/* Sonapur Choke Point */}
          <CircleMarker
            center={[25.1054, 92.3681]}
            radius={8}
            pathOptions={{
              color: isCriticalRain || isCorridorClosed ? '#FF0000' : '#666666',
              fillColor: isCorridorClosed ? '#690005' : isCriticalRain ? '#FF0000' : '#222222',
              fillOpacity: 1,
              weight: 2.5
            }}
            eventHandlers={{
              click: () => setSelectedWaypoint(INITIAL_WAYPOINTS.find(w => w.id === 'snp') || null)
            }}
          />
          {/* Animated radar rings for Sonapur if critical */}
          {(isCriticalRain || isCorridorClosed) && (
            <CircleMarker
              center={[25.1054, 92.3681]}
              radius={20}
              pathOptions={{ color: '#FF0000', fillColor: '#FF0000', fillOpacity: 0.2, weight: 0 }}
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
        <div className="absolute top-4 right-4 w-72 bg-[#111111]/95 backdrop-blur-md p-3 rounded-xl border border-[#2A2A2A] shadow-2xl z-[1000] pointer-events-none">
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
          map.setView([25.5788, 92.4827], 8);
        }}
        title="Reset View"
        className="w-7 h-7 rounded flex items-center justify-center text-[#E4E3E0] hover:bg-[#1A1A1A] hover:text-[#F27D26] transition-colors"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
}
