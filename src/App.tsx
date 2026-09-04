import React, { useState, useEffect, useCallback } from 'react';
import { ActiveView, SimulationState, Convoy, DecisionLog } from './types';
import { INITIAL_CONVOYS, INITIAL_LOGS } from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AlertBanner } from './components/AlertBanner';
import { MissionControlView } from './components/MissionControlView';
import { FieldIncidentLoggerView } from './components/FieldIncidentLoggerView';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('mission-control');
  const [convoys, setConvoys] = useState<Convoy[]>(INITIAL_CONVOYS);
  const [decisionLogs, setDecisionLogs] = useState<DecisionLog[]>(INITIAL_LOGS);

  // Initial simulation state matching Image 1: 115 mm rainfall (Alert > 100), 88.4% Landslide probability, 4 reroutes
  const [simulationState, setSimulationState] = useState<SimulationState>({
    precipitation: 115,
    isLandslideTriggered: false,
    isDiverted: false,
    rerouteCounter: 4,
    isCorridorShutdown: false,
    landslideProbability: 88.4,
    soilSaturation: 92.4,
    sonapurStatus: 'critical',
    activeRoute: 'NH-6',
    bannerMessage: 'CRITICAL: Imminent Landslide Risk at Sonapur Cut — Precipitation exceeds 100mm threshold.',
    bannerType: 'critical',
    selectedConvoyId: 'med-04',
    filterCategory: 'ALL'
  });

  // Get current timestamp formatted as [HH:MM:SS IST]
  const getCurrentIST = () => {
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    return istTime.toISOString().substr(11, 8) + ' IST';
  };

  // Precipitation change handler (20mm - 160mm)
  const handlePrecipitationChange = useCallback((value: number) => {
    setSimulationState((prev) => {
      const isOver100 = value > 100;

      // Calculate realistic landslide probability
      let prob: number;
      if (value < 50) {
        prob = Math.round(15 + (value / 50) * 20); // 15% - 35%
      } else if (value <= 100) {
        prob = Math.round(35 + ((value - 50) / 50) * 35); // 35% - 70%
      } else {
        // Exceeds 100mm: Spike landslide probability to 89% (or higher dynamically)
        prob = Math.min(99, Math.round(89 + ((value - 100) / 60) * 10)); // 89% - 99%
      }

      const soilSat = Math.min(98, Math.round(50 + (value / 160) * 45));

      let bannerMsg = prev.bannerMessage;
      let bannerT = prev.bannerType;

      if (isOver100 && !prev.isCorridorShutdown) {
        bannerMsg = 'CRITICAL: Imminent Landslide Risk at Sonapur Cut';
        bannerT = 'critical';
      } else if (!isOver100 && !prev.isCorridorShutdown && prev.bannerMessage?.includes('Imminent Landslide Risk')) {
        bannerMsg = null;
        bannerT = null;
      }

      return {
        ...prev,
        precipitation: value,
        landslideProbability: prob,
        soilSaturation: soilSat,
        sonapurStatus: prev.isCorridorShutdown ? 'blocked' : isOver100 ? 'critical' : value > 70 ? 'alert' : 'passable',
        bannerMessage: bannerMsg,
        bannerType: bannerT
      };
    });
  }, []);

  // Trigger simulated landslide cut action
  const handleTriggerLandslideSimulation = useCallback(() => {
    const istTime = getCurrentIST();

    setSimulationState((prev) => ({
      ...prev,
      precipitation: 135,
      isLandslideTriggered: true,
      landslideProbability: 92.6,
      soilSaturation: 96.2,
      sonapurStatus: 'critical',
      bannerMessage: 'CRITICAL: Imminent Landslide Risk at Sonapur Cut — Seismic rig detects slope-cut failure.',
      bannerType: 'critical'
    }));

    setDecisionLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: istTime,
        source: 'Landslide Simulator',
        message: 'Injected 135mm monsoon saturation test. Seismic telemetry triggered critical slope instability warning at Sonapur Cut.',
        severity: 'critical'
      },
      ...prev
    ]);
  }, []);

  // Preemptive rerouting action (Prompt requirement 3)
  const handleAuthorizeDiversion = useCallback(() => {
    const istTime = getCurrentIST();

    setSimulationState((prev) => {
      const nextCount = prev.isDiverted ? prev.rerouteCounter : prev.rerouteCounter + 1;
      return {
        ...prev,
        isDiverted: true,
        activeRoute: 'NH-27',
        rerouteCounter: nextCount,
        bannerMessage: 'PREEMPTIVE DIVERSION AUTHORIZED: MED-NER-04 rerouted to NH-27 Haflong bypass. Status: Diverted via NH-27 (Passable).',
        bannerType: 'success'
      };
    });

    // Update MED-NER-04 convoy card
    setConvoys((prev) =>
      prev.map((convoy) => {
        if (convoy.id === 'med-04') {
          return {
            ...convoy,
            status: 'DIVERTED',
            route: 'NH-27 Haflong Bypass',
            eta: '6h 15m (Via NH-27 Bypass)',
            speed: 50,
            isDiverted: true,
            hazardAhead: undefined
          };
        }
        return convoy;
      })
    );

    // Add entry to Tactical Decision Log
    setDecisionLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: istTime,
        source: 'Command Authority',
        message: 'Authorized Preemptive Supply Diversion for supply vehicle MED-NER-04 via NH-27 Haflong bypass. Cold chain insulin ETA updated to 6h 15m (Via NH-27 Bypass).',
        severity: 'success'
      },
      ...prev
    ]);
  }, []);

  // Emergency Corridor Shutdown in Field Logger (Prompt requirement 4)
  const handleEmergencyCorridorShutdown = useCallback(() => {
    const istTime = getCurrentIST();

    setSimulationState((prev) => {
      const isAlreadyClosed = prev.isCorridorShutdown;
      const nextShutdownState = !isAlreadyClosed;

      return {
        ...prev,
        isCorridorShutdown: nextShutdownState,
        sonapurStatus: nextShutdownState ? 'blocked' : 'critical',
        bannerMessage: nextShutdownState
          ? 'EMERGENCY SHUTDOWN BROADCAST: Route NH-6 Sonapur Cut is permanently blocked. Diversion to NH-27 bypass initiated across all check gates.'
          : 'CORRIDOR SHUTDOWN OVERRULED: Route NH-6 set to controlled pilot status.',
        bannerType: nextShutdownState ? 'critical' : 'warning'
      };
    });

    // Add log entry
    setDecisionLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: istTime,
        source: 'Incident Command Protocol',
        message: 'Authorized Emergency Corridor Shutdown at Km 142.8 Sonapur Cut. Total freight blockage enforced; inbound traffic routed to NH-27 Umrangso-Haflong.',
        severity: 'critical'
      },
      ...prev
    ]);
  }, []);

  // Sync All Telemetry Button
  const handleSyncAllTelemetry = useCallback(() => {
    const istTime = getCurrentIST();

    setSimulationState((prev) => ({
      ...prev,
      bannerMessage: 'ALL SENSOR MESH NODES SYNCED: INSAT-3DR, GSAT-7A & 14 ground river gauges updated with zero packet loss.',
      bannerType: 'info'
    }));

    setDecisionLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: istTime,
        source: 'Sat-Mesh Sync',
        message: 'Telemetry synchronization cycle complete across all 14 nodes. Doppler stream latency 18ms.',
        severity: 'info'
      },
      ...prev
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#E4E3E0] font-sans selection:bg-[#F27D26] selection:text-black flex flex-col">
      {/* Top Universal Tactical Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        simulationState={simulationState}
      />

      {/* Persistent Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isCorridorClosed={simulationState.isCorridorShutdown}
      />

      {/* Main Content Viewport */}
      <div className="md:pl-60 pt-23 min-h-screen flex flex-col flex-1">
        {/* Critical Synchronized Alert Banner */}
        <AlertBanner
          message={simulationState.bannerMessage}
          type={simulationState.bannerType}
          onDismiss={() => setSimulationState(prev => ({ ...prev, bannerMessage: null, bannerType: null }))}
        />

        {/* View Switching: Mission Control Center vs Field Incident Logger */}
        <main className="flex-1 p-3 sm:p-4 w-full max-w-[1920px] mx-auto flex flex-col">
          {activeView === 'mission-control' ? (
            <MissionControlView
              simulationState={simulationState}
              setSimulationState={setSimulationState}
              convoys={convoys}
              setConvoys={setConvoys}
              decisionLogs={decisionLogs}
              onAuthorizeDiversion={handleAuthorizeDiversion}
              onTriggerLandslideSimulation={handleTriggerLandslideSimulation}
              onPrecipitationChange={handlePrecipitationChange}
              onSyncAllTelemetry={handleSyncAllTelemetry}
            />
          ) : (
            <FieldIncidentLoggerView
              simulationState={simulationState}
              setSimulationState={setSimulationState}
              onEmergencyCorridorShutdown={handleEmergencyCorridorShutdown}
              decisionLogs={decisionLogs}
              convoys={convoys}
            />
          )}
        </main>

        {/* Bento Grid Footer */}
        <footer className="mt-auto flex justify-between items-center text-[10px] text-[#666666] border-t border-[#2A2A2A] px-4 py-3 bg-[#050505] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF00]"></span>
            <span>SYSTEM STATUS: NOMINAL</span>
          </div>
          <span className="hidden sm:inline">GPS LOCK: 26.14°N, 91.73°E // ENCRYPTION: AES-256</span>
          <span className="text-[#888888]">MDoNER LOGISTICS PLATFORM // PS-26002</span>
        </footer>
      </div>
    </div>
  );
}
