// ===== State & mock data =====
const state = {
    role: 'admin',
    filters: { club: ['Palermo'], sport: ['Football'], team: ['Mens'] },
    today: new Date(),
    currentMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    sessions: [],
    pitches: [{ id: 'p1', name: 'Main Pitch', cameras: ['c1', 'c2', 'c3', 'c4'] }, { id: 'p2', name: 'Youth Academy', cameras: ['c5', 'c6', 'c7'] }, { id: 'p3', name: 'Practice Field A', cameras: ['c8', 'c9'] }, { id: 'p4', name: 'Practice Field B', cameras: ['c10', 'c11'] }],
    cameras: [
        { id: 'c1', name: 'CAM-001', customName: '', pitch: 'Main Pitch', broadcastSetting: 'Football', tacticalSetting: 'Football Tactical' },
        { id: 'c2', name: 'CAM-002', customName: '', pitch: 'Main Pitch', broadcastSetting: 'Football', tacticalSetting: 'Football Tactical' },
        { id: 'c3', name: 'CAM-003', customName: '', pitch: 'Main Pitch', broadcastSetting: 'Football', tacticalSetting: 'Football Tactical' },
        { id: 'c4', name: 'CAM-004', customName: '', pitch: 'Main Pitch', broadcastSetting: 'Football', tacticalSetting: 'Football Tactical' },
        { id: 'c5', name: 'CAM-005', customName: '', pitch: 'Youth Academy', broadcastSetting: 'Football', tacticalSetting: 'Football Tactical' },
        { id: 'c6', name: 'CAM-006', customName: '', pitch: 'Youth Academy', broadcastSetting: 'Football', tacticalSetting: 'Football Tactical' },
        { id: 'c7', name: 'CAM-007', customName: '', pitch: 'Youth Academy', broadcastSetting: 'Football', tacticalSetting: 'Football Tactical' },
        { id: 'c8', name: 'CAM-008', customName: '', pitch: 'Practice A', broadcastSetting: 'Football', tacticalSetting: 'Football Tactical' },
        { id: 'c9', name: 'CAM-009', customName: '', pitch: 'Practice A', broadcastSetting: 'Football', tacticalSetting: 'Football Tactical' },
        { id: 'c10', name: 'CAM-010', customName: '', pitch: 'Practice B', broadcastSetting: 'Football', tacticalSetting: 'Football Tactical' },
        { id: 'c11', name: 'CAM-011', customName: '', pitch: 'Practice B', broadcastSetting: 'Football', tacticalSetting: 'Football Tactical' },
    ],
    cameraPresets: { 'Static': ['Wide', 'Halfline', 'Penalty Box', 'Custom-1'] },
};
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
function seedSessions() {
    const y = state.currentMonth.getFullYear(); const m = state.currentMonth.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate(); const teams = ['Mens', 'Ladies', 'Youth'];
    state.sessions = [];
    for (let d = 1; d <= daysInMonth; d++) {
        if (Math.random() < 0.55) {
            const count = rnd(1, 4);
            for (let k = 0; k < count; k++) {
                const startH = rnd(7, 19); const dur = [60, 90, 120][rnd(0, 2)];
                const name = ['First Team Training', 'Tactical Session', 'Youth Academy', 'Matchday Prep'][rnd(0, 3)];
                const pitch = state.pitches[rnd(0, state.pitches.length - 1)];
                const cams = rnd(1, 4); const camList = pitch.cameras.slice(0, cams);
                const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const start = new Date(`${dateStr}T${String(startH).padStart(2, '0')}:00:00`);
                const end = new Date(start.getTime() + dur * 60000);
                const offline = Math.random() < 0.25; const ownerTeam = teams[rnd(0, 2)];
                state.sessions.push({ id: crypto.randomUUID(), name, start, end, pitch: pitch.name, cameras: camList, offline, club: 'Palermo', sport: 'Football', team: ownerTeam });
            }
        }
    }
}

// ===== Form logic =====
const pitchGrid = document.getElementById('pitchGrid');
const cameraGrid = document.getElementById('cameraGrid');
const viewsBox = document.getElementById('viewsBox');
const viewsList = document.getElementById('viewsList');

function renderPickers() {
    pitchGrid.innerHTML = ''; cameraGrid.innerHTML = '';
    state.pitches.forEach(p => { const el = document.createElement('div'); el.className = 'pick'; el.textContent = `${p.name} (${p.cameras.length} cams)`; el.dataset.id = p.id; el.addEventListener('click', () => el.classList.toggle('selected')); pitchGrid.appendChild(el) });
    state.cameras.forEach(c => { const el = document.createElement('div'); el.className = 'pick'; el.innerHTML = `<div style="font-weight:900">${c.name}</div><div class="hint">${c.pitch}</div>`; el.dataset.id = c.id; el.addEventListener('click', () => { el.classList.toggle('selected'); renderViewsConfig() }); cameraGrid.appendChild(el) });
}

function renderViewsConfig() {
    const selectedCams = [...cameraGrid.querySelectorAll('.pick.selected')].map(x => x.dataset.id);
    viewsList.innerHTML = ''; if (selectedCams.length === 0) { viewsBox.style.display = 'none'; return } viewsBox.style.display = 'block';
    selectedCams.forEach(cid => {
        const wrap = document.createElement('div'); wrap.innerHTML = `<div style="font-weight:900;margin:6px 0">${state.cameras.find(c => c.id === cid).name}</div>`;
        for (let i = 1; i <= 2; i++) {
            const noneOption = i === 2 ? '<option>None</option>' : '';
            const row = document.createElement('div'); row.className = 'view-row';
            row.innerHTML = `<label>View ${i}</label><select class="view-type">${noneOption}<option>Broadcast</option><option>Static</option></select>
                     <select class="view-preset"><option value="">— Preset —</option>${(state.cameraPresets['Static'] || []).map(p => `<option>${p}</option>`).join('')}</select>`;
            const typeSel = row.querySelector('.view-type'); const presetSel = row.querySelector('.view-preset');
            const sync = () => { presetSel.style.display = typeSel.value === 'Static' ? 'block' : 'none' }; typeSel.addEventListener('change', sync); sync();
            wrap.appendChild(row);
        }
        viewsList.appendChild(wrap);
    });
}

function clearForm() {
    document.getElementById('fName').value = '';
    document.getElementById('fStartDT').value = '';
    document.getElementById('fEndDT').value = '';
    // reset cards
    document.querySelectorAll('#typeCards .pill').forEach((p, i) => p.classList.toggle('active', i === 0));
    document.querySelectorAll('#settingCards .pill').forEach((p, i) => p.classList.toggle('active', i === 0));
    pitchGrid.querySelectorAll('.pick.selected').forEach(p => p.classList.remove('selected'));
    cameraGrid.querySelectorAll('.pick.selected').forEach(p => p.classList.remove('selected'));
    viewsList.innerHTML = ''; viewsBox.style.display = 'none';
}

function getActiveVal(groupId) { const btn = [...document.querySelectorAll(`#${groupId} .pill`)].find(b => b.classList.contains('active')); return btn?.dataset.val }

function collectViews() {
    const data = {};
    viewsList.querySelectorAll('> div').forEach(block => {
        const camName = block.querySelector('div').textContent.trim();
        const rows = block.querySelectorAll('.view-row');
        data[camName] = [...rows].map(r => ({ type: r.querySelector('.view-type').value, preset: r.querySelector('.view-preset').value || null }));
    });
    return data;
}

function saveSchedule() {
    const name = document.getElementById('fName').value.trim();
    const stv = document.getElementById('fStartDT').value; const etv = document.getElementById('fEndDT').value;
    if (!name || !stv || !etv) { alert('Please fill Name, Start & End'); return }
    const start = new Date(stv); const end = new Date(etv);
    if (end <= start) { alert('End must be after Start'); return }
    const selectedPitches = [...pitchGrid.querySelectorAll('.pick.selected')].map(x => x.dataset.id);
    let cameras = []; if (selectedPitches.length) { selectedPitches.forEach(pid => { const p = state.pitches.find(pp => pp.id === pid); cameras.push(...p.cameras) }); } else { cameras = [...cameraGrid.querySelectorAll('.pick.selected')].map(x => x.dataset.id) }
    if (cameras.length === 0) { alert('Pick at least one pitch or camera.'); return }
    const views = collectViews();
    state.sessions.push({ id: crypto.randomUUID(), name, start, end, pitch: selectedPitches.length ? state.pitches.find(p => p.id === selectedPitches[0]).name : (state.cameras.find(c => c.id === cameras[0]).pitch || 'Unknown'), cameras, offline: false, club: state.filters.club[0] || 'Palermo', sport: state.filters.sport[0] || 'Football', team: state.filters.team[0] || 'Mens', views, sessionType: getActiveVal('typeCards'), sportSetting: getActiveVal('settingCards') });
    renderCalendar(); if (dayPanel.style.display !== 'none') { renderDaySessions() } alert('Session saved.');
}


//mode + cards
const modePitch = document.getElementById('modePitch'); const modeCamera = document.getElementById('modeCamera');
modePitch.addEventListener('click', () => { modePitch.classList.add('active'); modeCamera.classList.remove('active'); pitchGrid.style.display = 'grid'; cameraGrid.style.display = 'none'; viewsBox.style.display = 'none' });
modeCamera.addEventListener('click', () => { modeCamera.classList.add('active'); modePitch.classList.remove('active'); cameraGrid.style.display = 'grid'; pitchGrid.style.display = 'none'; renderViewsConfig() });

document.getElementById('typeCards').addEventListener('click', e => { if (e.target.classList.contains('pill')) { document.querySelectorAll('#typeCards .pill').forEach(x => x.classList.remove('active')); e.target.classList.add('active') } });
document.getElementById('settingCards').addEventListener('click', e => { if (e.target.classList.contains('pill')) { document.querySelectorAll('#settingCards .pill').forEach(x => x.classList.remove('active')); e.target.classList.add('active') } });

document.getElementById('clearForm').addEventListener('click', clearForm);
document.getElementById('saveSchedule').addEventListener('click', saveSchedule);


// helper to format Date -> "YYYY-MM-DDTHH:MM" for <input type="datetime-local">
function toDateTimeLocal(dt) {
    const d = new Date(dt);
    const YYYY = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const DD = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
}

function populateFormFromSession(snap) {
    if (!snap) return;
    // basic fields
    document.getElementById('fName').value = snap.name || '';
    document.getElementById('fStartDT').value = snap.start ? toDateTimeLocal(snap.start) : '';
    document.getElementById('fEndDT').value = snap.end ? toDateTimeLocal(snap.end) : '';

    // sessionType & sportSetting pills
    if (snap.sessionType) {
        document.querySelectorAll('#typeCards .pill').forEach(p => p.classList.toggle('active', p.dataset.val === snap.sessionType));
    }
    if (snap.sportSetting) {
        document.querySelectorAll('#settingCards .pill').forEach(p => p.classList.toggle('active', p.dataset.val === snap.sportSetting));
    }

    // select pitch if it matches; otherwise select cameras from snapshot
    pitchGrid.querySelectorAll('.pick.selected').forEach(el => el.classList.remove('selected'));
    cameraGrid.querySelectorAll('.pick.selected').forEach(el => el.classList.remove('selected'));

    const pitchObj = state.pitches.find(p => p.name === snap.pitch);
    if (pitchObj) {
        const pitchEl = pitchGrid.querySelector(`.pick[data-id="${pitchObj.id}"]`);
        if (pitchEl) pitchEl.classList.add('selected');
    } else if (Array.isArray(snap.cameras) && snap.cameras.length) {
        snap.cameras.forEach(cid => {
            const camEl = cameraGrid.querySelector(`.pick[data-id="${cid}"]`);
            if (camEl) camEl.classList.add('selected');
        });
    }

    // render views UI and set selections if views snapshot exists
    renderViewsConfig();
    if (snap.views && typeof snap.views === 'object') {
        // each block in viewsList corresponds to a camera name
        viewsList.querySelectorAll('> div').forEach(block => {
            const camName = block.querySelector('div')?.textContent?.trim();
            const rows = block.querySelectorAll('.view-row');
            const cfg = snap.views[camName];
            if (Array.isArray(cfg)) {
                rows.forEach((row, i) => {
                    const typeSel = row.querySelector('.view-type');
                    const presetSel = row.querySelector('.view-preset');
                    const entry = cfg[i];
                    if (entry) {
                        if (typeSel) typeSel.value = entry.type || typeSel.value;
                        if (presetSel) {
                            presetSel.value = entry.preset || '';
                            presetSel.style.display = (typeSel?.value === 'Static') ? 'block' : 'none';
                        }
                    }
                });
            }
        });
    }
}


function init() {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
        document.getElementById('title').textContent = 'Edit Scheduled Session';
    }
    const key = 'corepoc_session_' + id;
    try { s = JSON.parse(localStorage.getItem(key)) } catch (e) { s = null }

    // if we have a session snapshot, populate the form
    if (s) {
        populateFormFromSession(s);
    }
    renderPickers();

    // preselect today
    const todayStr = new Date().toISOString().slice(0, 10);
    const y = state.currentMonth.getFullYear();
    const m = state.currentMonth.getMonth();
    if (todayStr.startsWith(`${y}-${String(m + 1).padStart(2, '0')}`)) {
        const idx = [...document.querySelectorAll('#calendar .cell .n')].findIndex(n => n.textContent === String(new Date().getDate()));
        if (idx >= 0) {
            document.querySelectorAll('#calendar .cell')[7 + idx]?.click();
        }
    }


}
init();
// cleanup stored snapshot on unload
window.addEventListener('beforeunload', () => localStorage.removeItem(key));