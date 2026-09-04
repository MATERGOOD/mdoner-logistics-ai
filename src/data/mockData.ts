import { Convoy, DecisionLog, Waypoint } from '../types';

export const INITIAL_WAYPOINTS: Waypoint[] = [
  {
    id: 'ghy',
    name: 'GUWAHATI LOGISTICS HUB',
    coordinates: '26.1445° N, 91.7362° E',
    elevation: '55m ASL',
    x: 140,
    y: 100,
    status: 'nominal',
    description: 'Primary Regional Dispatch Depot & Central Silo'
  },
  {
    id: 'shl',
    name: 'SHILLONG TRANSIT POINT',
    coordinates: '25.5788° N, 91.8933° E',
    elevation: '1,525m ASL',
    x: 260,
    y: 190,
    status: 'caution',
    description: 'High Altitude Meghalaya Depot & Weather Radar'
  },
  {
    id: 'jow',
    name: 'JOWAI CHECKPOINT',
    coordinates: '25.4522° N, 92.2044° E',
    elevation: '1,380m ASL',
    x: 350,
    y: 220,
    status: 'caution',
    description: 'Assam Rifles QRT & Weight Station'
  },
  {
    id: 'snp',
    name: 'SONAPUR TUNNEL CUT',
    coordinates: '25.1054° N, 92.3681° E',
    elevation: '842m ASL',
    x: 460,
    y: 265,
    status: 'critical',
    description: 'Km 142.8 South Portal Bypass — Vulnerable Debris Fan'
  },
  {
    id: 'nag',
    name: 'NAGAON (NH-27)',
    coordinates: '26.3476° N, 92.6841° E',
    elevation: '68m ASL',
    x: 290,
    y: 80,
    status: 'secure',
    description: 'Bypass Staging Point & Fuel Storage'
  },
  {
    id: 'lmd',
    name: 'LUMDING JUNCTION',
    coordinates: '25.8242° N, 93.1706° E',
    elevation: '125m ASL',
    x: 430,
    y: 110,
    status: 'secure',
    description: 'Railway Transshipment & Logistics Node'
  },
  {
    id: 'haf',
    name: 'HAFLONG SECURE BYPASS',
    coordinates: '25.1764° N, 93.0232° E',
    elevation: '680m ASL',
    x: 560,
    y: 240,
    status: 'secure',
    description: 'Borail Mountain Pass — 4 Bridges 100% Reinforced'
  },
  {
    id: 'sil',
    name: 'SILCHAR DESTINATION TERMINUS',
    coordinates: '24.8333° N, 92.7789° E',
    elevation: '25m ASL',
    x: 680,
    y: 410,
    status: 'nominal',
    description: 'Barak Valley Central Medical Depot / Silchar Medical College'
  }
];

export const INITIAL_CONVOYS: Convoy[] = [
  {
    id: 'med-04',
    code: 'MED-NER-04',
    name: 'Emergency Medical Cold Chain',
    cargo: 'Critical Insulin / Vaccines (4,200 Vials)',
    route: 'NH-06 KM 138',
    status: 'DIVERSION REQ',
    speed: 38,
    fuel: 78,
    coldTemp: 3.8,
    eta: '3.5h (At Risk)',
    pilot: 'Capt. R. Borah',
    type: 'medical',
    isDiverted: false,
    hazardAhead: 'Sonapur Mudslide Choke Point Ahead'
  },
  {
    id: 'food-12',
    code: 'FOOD-SEC-12',
    name: 'Tripura Foodgrain Buffer',
    cargo: 'Emergency Rice Rations (24MT)',
    route: 'NH-27 Bypass',
    status: 'CLEAR',
    speed: 52,
    fuel: 64,
    eta: '5.2h',
    pilot: 'Havildar P. Gogoi',
    type: 'rations',
    isDiverted: true
  },
  {
    id: 'oxy-09',
    code: 'OXY-CRY-09',
    name: 'Cryogenic Liquid Oxygen',
    cargo: 'Liquid Medical Cryo-Oxygen (18,000L)',
    route: 'Shillong Depot',
    status: 'HOLDING',
    speed: 0,
    fuel: 82,
    pressure: 4.1,
    eta: '6.0h (Hold)',
    pilot: 'Subedar M. Singha',
    type: 'medical',
    isDiverted: false
  },
  {
    id: 'fuel-07',
    code: 'FUEL-CON-07',
    name: 'Aviation Strategic Fuel',
    cargo: 'Aviation Fuel Tankers / Silchar AFS',
    route: 'Haflong Route',
    status: 'REROUTED',
    speed: 44,
    fuel: 91,
    eta: '4.8h',
    pilot: 'Naik T. Kalita',
    type: 'fuel',
    isDiverted: true
  }
];

export const INITIAL_LOGS: DecisionLog[] = [
  {
    id: 'log-1',
    timestamp: '14:22:01 IST',
    source: 'AI Predictive Engine',
    message: 'Flagged Sonapur sector precipitation > 100mm threshold. Triggered mudslide instability warning.',
    severity: 'critical'
  },
  {
    id: 'log-2',
    timestamp: '14:20:44 IST',
    source: 'Recon Drone GSAT-7A',
    message: 'NH-27 Lumding-Haflong sector drone reconnaissance cleared. Bridge structural integrity 100%.',
    severity: 'success'
  },
  {
    id: 'log-3',
    timestamp: '14:18:12 IST',
    source: 'Sat-Comm Uplink',
    message: 'Transmitted cold-chain temperature telemetry alert to Pilot Capt. R. Borah (MED-NER-04).',
    severity: 'info'
  }
];
