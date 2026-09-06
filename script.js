const pages = document.querySelectorAll('.page'), navs = document.querySelectorAll('.nav');
function openPage(id) { pages.forEach(p => p.classList.toggle('hidden', p.id !== id)); navs.forEach(n => n.classList.toggle('active', n.dataset.page === id)); window.scrollTo({ top: 0, behavior: 'smooth' }); if (id === 'dashboard' && window.map) { setTimeout(() => window.map.invalidateSize(), 100); } }
navs.forEach(n => n.onclick = () => openPage(n.dataset.page));
document.querySelector('#analyze').onclick = () => openPage('dashboard');
document.querySelector('#change').onclick = () => openPage('route');
document.querySelector('#allalerts').onclick = () => openPage('alerts');
document.querySelectorAll('.choose').forEach(b => b.onclick = () => { document.querySelectorAll('.route-card').forEach(x => x.style.outline = 'none'); b.closest('.route-card').style.outline = '2px solid rgba(105,191,232,.6)'; setTimeout(() => openPage('dashboard'), 250) });
document.querySelector('#swap').onclick = () => { let x = document.querySelectorAll('.field input');[x[0].value, x[1].value] = [x[1].value, x[0].value] };
document.querySelectorAll('.filters button').forEach(b => b.onclick = () => { document.querySelectorAll('.filters button').forEach(x => x.classList.remove('selected')); b.classList.add('selected') });

window.map = L.map('gis-map').setView([25.8, 92.2], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(window.map);

const mainRouteCoords = [
    [26.1445, 91.7362],
    [25.9, 91.88],
    [25.5788, 91.8933]
];

const altRouteCoords = [
    [26.1445, 91.7362],
    [26.0, 92.1],
    [25.5788, 91.8933]
];

L.polyline(mainRouteCoords, { color: 'red', weight: 4 }).addTo(window.map);
L.polyline(altRouteCoords, { color: 'cyan', weight: 4 }).addTo(window.map);