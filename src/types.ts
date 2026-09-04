export type ActiveView = 'mission-control' | 'field-logger';

export interface Waypoint {
  id: string;
  name: string;
  coordinates: string;
  elevation?: string;
  x: number; // SVG coordinate
  y: number;
  status: 'nominal' | 'caution' | 'critical' | 'secure';
  description?: string;
}

export interface Convoy {
  id: string;
  code: string;
  name: string;
  cargo: string;
  route: string;
  status: 'DIVERSION REQ' | 'CLEAR' | 'HOLDING' | 'REROUTED' | 'CRITICAL' | 'DIVERTED';
  speed: number;
  fuel: number;
  coldTemp?: number;
  eta: string;
  pressure?: number;
  pilot?: string;
  type: 'medical' | 'rations' | 'fuel' | 'heavy';
  isDiverted?: boolean;
  hazardAhead?: string;
}

export interface SimulationState {
  precipitation: number; // 20 to 160 mm
  isLandslideTriggered: boolean;
  isDiverted: boolean;
  rerouteCounter: number;
  isCorridorShutdown: boolean;
  landslideProbability: number;
  soilSaturation: number;
  sonapurStatus: 'passable' | 'alert' | 'critical' | 'blocked';
  activeRoute: 'NH-6' | 'NH-27';
  bannerMessage: string | null;
  bannerType: 'critical' | 'warning' | 'info' | 'success' | null;
  selectedConvoyId: string;
  filterCategory: 'ALL' | 'MEDICAL' | 'RATIONS' | 'FUEL' | 'HEAVY';
}

export interface DecisionLog {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  severity: 'critical' | 'warning' | 'success' | 'info';
}
