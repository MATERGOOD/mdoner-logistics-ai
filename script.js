// Translations Dictionary
const TRANSLATIONS = {
    en: {
        nav_dashboard: "Dashboard",
        nav_planner: "Route Planner",
        nav_alerts: "Alerts",
        quote: "Drive Safe.<br>Reach Safe.<br>Stronger North East.",
        route_title: "Select Your Route",
        route_sub: "Choose the best and safest route for your journey",
        from_lbl: "From",
        to_lbl: "To",
        cargo_title: "Vehicle & Cargo Summary",
        veh_type: "Vehicle Type",
        load_type: "Load Type",
        load_val: "Perishable Goods (Life-Saving Meds)",
        weight_lbl: "Weight",
        weather_sens: "Sensitivity to Weather",
        analyze_btn: "✦ Analyze Routes",
        avail_routes: "Available Routes",
        risk_score_lbl: "Overall Risk Score",
        distance_lbl: "Distance",
        est_time_lbl: "Est. Time",
        weather_lbl: "Weather",
        traffic_lbl: "Traffic",
        weather_val: "☔ Heavy Rain",
        traffic_val: "▱ Moderate",
        alt_title: "Safer Alternative Route",
        risk_lvl_title: "Risk Level: High Risk",
        risk_lvl_desc: "This route may not be safe for your cargo due to heavy rain and landslide-prone areas.",
        start_nav: "⌁ Compare Routes & Hazards",
        change_route: "⟳ Change Route",
        major_title: "Major Alert",
        major_desc: "Heavy rainfall and possible landslides at Sonapur Tunnel Cut (NH-6) within next 24 hours.",
        view_alerts: "View All Alerts",
        legend_low: "Low Risk",
        legend_mod: "Moderate Risk",
        legend_high: "High Risk (Blocked)",
        legend_inc: "Incident / Choke Point"
    },
    hi: {
        nav_dashboard: "डैशबोर्ड",
        nav_planner: "मार्ग योजना",
        nav_alerts: "अलर्ट्स",
        quote: "सुरक्षित ड्राइव करें.<br>सुरक्षित पहुंचें.<br>सशक्त पूर्वोत्तर.",
        route_title: "अपना मार्ग चुनें",
        route_sub: "अपनी यात्रा के लिए सबसे सुरक्षित और उपयुक्त मार्ग चुनें",
        from_lbl: "कहाँ से",
        to_lbl: "कहाँ तक",
        cargo_title: "वाहन और कार्गो विवरण",
        veh_type: "वाहन प्रकार",
        load_type: "कार्गो प्रकार",
        load_val: "जीवन रक्षक दवाएं (इंसुलिन)",
        weight_lbl: "वजन",
        weather_sens: "मौसम संवेदनशीलता",
        analyze_btn: "✦ मार्ग का विश्लेषण करें",
        avail_routes: "उपलब्ध मार्ग",
        risk_score_lbl: "कुल जोखिम स्कोर",
        distance_lbl: "दूरी",
        est_time_lbl: "अनुमानित समय",
        weather_lbl: "मौसम",
        traffic_lbl: "ट्रैफिक",
        weather_val: "☔ मूसलाधार बारिश",
        traffic_val: "▱ मध्यम",
        alt_title: "सुरक्षित वैकल्पिक मार्ग",
        risk_lvl_title: "जोखिम स्तर: उच्च जोखिम",
        risk_lvl_desc: "भारी बारिश और भूस्खलन के कारण यह मार्ग संवेदनशील कार्गो के लिए सुरक्षित नहीं है।",
        start_nav: "⌁ मार्ग और जोखिम की जांच करें",
        change_route: "⟳ मार्ग बदलें",
        major_title: "मुख्य चेतावनी",
        major_desc: "अगले 24 घंटों में सोनापुर टनल कट (NH-6) पर भारी बारिश और भूस्खलन की संभावना।",
        view_alerts: "सभी अलर्ट देखें",
        legend_low: "कम जोखिम",
        legend_mod: "मध्यम जोखिम",
        legend_high: "उच्च जोखिम (अवरुद्ध)",
        legend_inc: "भूस्खलन क्षेत्र"
    }
};

let currentLang = 'en';

// Navigation & Multi-page Setup
const pages = document.querySelectorAll('.page');
const navs = document.querySelectorAll('.nav');
let map = null;
let nh6Polyline = null;
let altPolyline = null;
let chokeMarker = null;

// High-accuracy waypoints along NH-6 and NH-27/SH-5
const NH6_COORDINATES = [
    [26.185, 91.748], [26.052, 91.885], [25.901, 91.881],
    [25.660, 91.905], [25.578, 91.885], [25.445, 92.205],
    [25.245, 92.365], [25.105, 92.368], [24.985, 92.485], [24.833, 92.779]
];

const BYPASS_COORDINATES = [
    [26.185, 91.748], [26.345, 92.685], [25.750, 93.170],
    [25.170, 93.020], [24.960, 92.840], [24.833, 92.779]
];

function initMap() {
    const mapContainer = document.getElementById('gis-map');
    if (!mapContainer || map) return;

    map = L.map('gis-map', { zoomControl: true }).setView([25.6, 92.4], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Red Primary Route (NH-6: Vulnerable/Blocked)
    nh6Polyline = L.polyline(NH6_COORDINATES, {
        color: '#ed4258',
        weight: 6,
        opacity: 0.95
    }).addTo(map).bindPopup("<b>NH-6 (Vulnerable)</b><br>Imminent Landslide Blockage at Sonapur Cut");

    // Emerald Green Alternative Route (SH-5 / NH-27 Bypass: Passable)
    altPolyline = L.polyline(BYPASS_COORDINATES, {
        color: '#25a87a',
        weight: 5,
        dashArray: '8, 8',
        opacity: 0.95
    }).addTo(map).bindPopup("<b>SH-5 / NH-27 Bypass (Safe)</b><br>100% Passable Corridor to Silchar");

    // Red Landslide Choke Point Marker at Sonapur
    chokeMarker = L.circleMarker([25.105, 92.368], {
        radius: 14,
        color: '#b91c1c',
        fillColor: '#ef4444',
        fillOpacity: 0.85,
        weight: 3
    }).addTo(map);

    chokeMarker.bindPopup("<b>⚠️ CRITICAL HAZARD: Sonapur Tunnel Cut</b><br>Rainfall: 115mm (Threshold Exceeded)<br>Landslide Risk: 88.4%");
    chokeMarker.openPopup();

    // Static Waypoint Pins
    L.marker([26.185, 91.748]).addTo(map).bindPopup("<b>Guwahati Logistics Origin</b>");
    L.marker([24.833, 92.779]).addTo(map).bindPopup("<b>Silchar Destination (Medical Supplies)</b>");
}

function openPage(id) {
    pages.forEach(p => p.classList.toggle('hidden', p.id !== id));
    navs.forEach(n => n.classList.toggle('active', n.dataset.page === id));
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (id === 'dashboard') {
        setTimeout(() => {
            initMap();
            if (map) {
                map.invalidateSize();
                map.fitBounds([
                    [26.35, 91.70],
                    [24.80, 93.20]
                ]);
            }
        }, 150);
    }
}

navs.forEach(n => n.onclick = () => openPage(n.dataset.page));

// Analyze Routes Button
const analyzeBtn = document.querySelector('#analyze');
if (analyzeBtn) {
    analyzeBtn.onclick = () => {
        analyzeBtn.innerText = currentLang === 'hi' ? "विश्लेषण हो रहा है..." : "Analyzing...";
        setTimeout(() => {
            analyzeBtn.innerText = TRANSLATIONS[currentLang].analyze_btn;
            openPage('dashboard');
        }, 350);
    };
}

// Change Route Button
const changeBtn = document.querySelector('#change');
if (changeBtn) changeBtn.onclick = () => openPage('route');

// All Alerts Link
const allAlertsBtn = document.querySelector('#allalerts');
if (allAlertsBtn) allAlertsBtn.onclick = () => openPage('alerts');

// Route Card Select
document.querySelectorAll('.choose').forEach(b => {
    b.onclick = () => {
        document.querySelectorAll('.route-card').forEach(x => x.style.outline = 'none');
        b.closest('.route-card').style.outline = '2px solid #69bfe8';
        setTimeout(() => openPage('dashboard'), 200);
    };
});

// Start Navigation Button: Route & Hazard Focus
const startNavBtn = document.querySelector('.start-btn');
if (startNavBtn) {
    startNavBtn.onclick = () => {
        if (map && chokeMarker) {
            map.flyTo([25.105, 92.368], 10, { duration: 1.2 });
            setTimeout(() => {
                chokeMarker.openPopup();
            }, 1300);
        }
    };
}

// Alternative Route View Button
const altBtn = document.querySelector('.alternative button');
if (altBtn) {
    altBtn.onclick = () => {
        if (map) {
            map.flyTo([25.45, 92.85], 9, { duration: 1.2 });
            if (altPolyline) altPolyline.openPopup();
        }
    };
}

// Swap Inputs
const swapBtn = document.querySelector('#swap');
if (swapBtn) {
    swapBtn.onclick = () => {
        let inputs = document.querySelectorAll('.field input');
        if (inputs.length >= 2) {
            [inputs[0].value, inputs[1].value] = [inputs[1].value, inputs[0].value];
        }
    };
}

// Language Switcher (English <-> Hindi)
const langBtn = document.querySelector('.tools button');
function applyTranslations(lang) {
    currentLang = lang;
    const t = TRANSLATIONS[lang];

    // Language button label
    langBtn.innerText = (lang === 'en' ? '◎ English ⌄' : '◎ हिन्दी ⌄');

    // Nav Items
    const navSpans = document.querySelectorAll('.nav span');
    if (navSpans[0]) navSpans[0].innerText = t.nav_dashboard;
    if (navSpans[1]) navSpans[1].innerText = t.nav_planner;
    if (navSpans[2]) navSpans[2].innerText = t.nav_alerts;

    const quoteEl = document.querySelector('.quote');
    if (quoteEl) quoteEl.innerHTML = t.quote;

    // Route Planner
    const rTitle = document.querySelector('#route h1');
    if (rTitle) rTitle.innerText = t.route_title;
    const rSub = document.querySelector('#route .subtitle');
    if (rSub) rSub.innerText = t.route_sub;
    const cTitle = document.querySelector('.cargo h3');
    if (cTitle) cTitle.innerText = t.cargo_title;
    const aBtn = document.querySelector('#analyze');
    if (aBtn) aBtn.innerText = t.analyze_btn;

    // Dashboard Metrics
    const metricSmalls = document.querySelectorAll('.metric small');
    if (metricSmalls[0]) metricSmalls[0].innerText = t.risk_score_lbl;
    if (metricSmalls[1]) metricSmalls[1].innerText = t.distance_lbl;
    if (metricSmalls[2]) metricSmalls[2].innerText = t.est_time_lbl;
    if (metricSmalls[3]) metricSmalls[3].innerText = t.weather_lbl;
    if (metricSmalls[4]) metricSmalls[4].innerText = t.traffic_lbl;

    const altTitle = document.querySelector('.alternative h3');
    if (altTitle) altTitle.innerText = t.alt_title;

    const riskTitle = document.querySelector('.risk h3');
    if (riskTitle) riskTitle.innerText = t.risk_lvl_title;
    const riskDesc = document.querySelector('.risk p');
    if (riskDesc) riskDesc.innerText = t.risk_lvl_desc;

    if (startNavBtn) startNavBtn.innerText = t.start_nav;
    if (changeBtn) changeBtn.innerText = t.change_route;

    const majorTitle = document.querySelector('.major p b');
    if (majorTitle) majorTitle.innerText = t.major_title;
}

if (langBtn) {
    langBtn.onclick = () => {
        applyTranslations(currentLang === 'en' ? 'hi' : 'en');
    };
}

// Alert Filter Buttons
document.querySelectorAll('.filters button').forEach(b => {
    b.onclick = () => {
        document.querySelectorAll('.filters button').forEach(x => x.classList.remove('selected'));
        b.classList.add('selected');
    };
});