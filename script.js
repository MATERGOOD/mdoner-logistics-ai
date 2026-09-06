// Navigation Page Routing
const pages = document.querySelectorAll('.page');
const navs = document.querySelectorAll('.nav');

let map = null;
let navInterval = null;
let currentTruckMarker = null;
let currentStep = 0;

// High-density genuine road waypoints (Guwahati -> Shillong -> Jowai -> Sonapur -> Silchar)
const NH6_COORDINATES = [
    [26.185, 91.748], [26.142, 91.790], [26.105, 91.868], [26.052, 91.885],
    [25.968, 91.882], [25.901, 91.881], [25.820, 91.875], [25.720, 91.890],
    [25.660, 91.905], [25.602, 91.898], [25.578, 91.885], [25.565, 91.950],
    [25.535, 92.055], [25.498, 92.140], [25.445, 92.205], [25.380, 92.285],
    [25.310, 92.315], [25.245, 92.365], [25.170, 92.385], [25.105, 92.368]
];

const BYPASS_COORDINATES = [
    [26.185, 91.748], [26.155, 91.980], [26.120, 92.150], [26.175, 92.520],
    [26.345, 92.685], [26.130, 92.860], [25.985, 92.980], [25.750, 93.170],
    [25.580, 93.150], [25.415, 93.120], [25.270, 93.160], [25.170, 93.020]
];

let activeRouteCoords = NH6_COORDINATES;

function initMap() {
    const mapContainer = document.getElementById('gis-map');
    if (!mapContainer || map) return;

    map = L.map('gis-map', {
        zoomControl: true
    }).setView([25.8, 92.1], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // Primary NH-6 Path
    L.polyline(NH6_COORDINATES, {
        color: '#ed4258',
        weight: 5,
        opacity: 0.9
    }).addTo(map).bindPopup("<b>NH-6 Hill Lifeline</b><br>High Landslide Risk");

    // SH-5 / Haflong Bypass
    L.polyline(BYPASS_COORDINATES, {
        color: '#25a87a',
        weight: 4,
        dashArray: '6, 8',
        opacity: 0.9
    }).addTo(map).bindPopup("<b>SH-5 / NH-27 Bypass</b><br>Safe Alternative");

    // Sonapur Choke Point Alert Marker
    const hazardCircle = L.circleMarker([25.105, 92.368], {
        radius: 12,
        color: '#e84c66',
        fillColor: '#ed4058',
        fillOpacity: 0.8
    }).addTo(map);
    hazardCircle.bindPopup("<b>⚠️ Choke Point: Sonapur Cut</b><br>Active Landslide Hazard Area");

    // Supply Convoy Marker
    const truckIcon = L.divIcon({
        html: '<div style="background:#2563eb;color:#fff;font-size:11px;font-weight:bold;padding:4px 8px;border-radius:6px;box-shadow:0 3px 8px rgba(0,0,0,0.3);white-space:nowrap;">🚚 MED-NER-04</div>',
        className: 'truck-marker',
        iconSize: [40, 20],
        iconAnchor: [20, 10]
    });

    currentTruckMarker = L.marker(activeRouteCoords[0], { icon: truckIcon }).addTo(map);
}

function openPage(id) {
    pages.forEach(p => p.classList.toggle('hidden', p.id !== id));
    navs.forEach(n => n.classList.toggle('active', n.dataset.page === id));
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (id === 'dashboard') {
        setTimeout(() => {
            initMap();
            if (map) map.invalidateSize();
        }, 150);
    }
}

// Navigation Events
navs.forEach(n => n.onclick = () => openPage(n.dataset.page));

const analyzeBtn = document.querySelector('#analyze');
if (analyzeBtn) {
    analyzeBtn.onclick = () => {
        analyzeBtn.innerText = "Analyzing Risk...";
        setTimeout(() => {
            analyzeBtn.innerText = "✦ Analyze Routes";
            openPage('dashboard');
        }, 400);
    };
}

const changeBtn = document.querySelector('#change');
if (changeBtn) changeBtn.onclick = () => openPage('route');

const allAlertsBtn = document.querySelector('#allalerts');
if (allAlertsBtn) allAlertsBtn.onclick = () => openPage('alerts');

// Route Selection Cards
document.querySelectorAll('.choose').forEach(b => {
    b.onclick = () => {
        document.querySelectorAll('.route-card').forEach(x => x.style.outline = 'none');
        b.closest('.route-card').style.outline = '2px solid #69bfe8';
        setTimeout(() => openPage('dashboard'), 200);
    };
});

// Swap Location
const swapBtn = document.querySelector('#swap');
if (swapBtn) {
    swapBtn.onclick = () => {
        let inputs = document.querySelectorAll('.field input');
        if (inputs.length >= 2) {
            [inputs[0].value, inputs[1].value] = [inputs[1].value, inputs[0].value];
        }
    };
}

// "Start Navigation" Active Driving Simulation
const startNavBtn = document.querySelector('.start-btn');
if (startNavBtn) {
    startNavBtn.onclick = () => {
        if (navInterval) {
            clearInterval(navInterval);
            navInterval = null;
            startNavBtn.innerText = "⌁ Start Navigation";
            return;
        }

        startNavBtn.innerText = "⏹ Pause Trip";
        navInterval = setInterval(() => {
            if (currentStep < activeRouteCoords.length - 1) {
                currentStep++;
                const nextCoord = activeRouteCoords[currentStep];
                currentTruckMarker.setLatLng(nextCoord);
                if (map) map.panTo(nextCoord);
            } else {
                clearInterval(navInterval);
                navInterval = null;
                startNavBtn.innerText = "✔ Arrived at Silchar";
            }
        }, 800);
    };
}

// Alternative Route Switch
const altBtn = document.querySelector('.alternative button');
if (altBtn) {
    altBtn.onclick = () => {
        activeRouteCoords = BYPASS_COORDINATES;
        currentStep = 0;
        if (currentTruckMarker) currentTruckMarker.setLatLng(activeRouteCoords[0]);
        alert("Switched to SH-5 Alternative Bypass: Safe corridor engaged.");
    };
}

// Language Selector Demo
const langBtn = document.querySelector('.tools button');
if (langBtn) {
    const languages = ['◎ English', '◎ অসমীয়া (Assamese)', '◎ বাংলা (Bengali)', '◎ हिन्दी (Hindi)'];
    let langIdx = 0;
    langBtn.onclick = () => {
        langIdx = (langIdx + 1) % languages.length;
        langBtn.innerText = languages[langIdx] + ' ⌄';
    };
}

// Alert Filter Toggles
document.querySelectorAll('.filters button').forEach(b => {
    b.onclick = () => {
        document.querySelectorAll('.filters button').forEach(x => x.classList.remove('selected'));
        b.classList.add('selected');
    };
});
