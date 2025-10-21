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

const monthLabel = document.getElementById('monthLabel');
const calRoot = document.getElementById('calendar');
const dayPanel = document.getElementById('dayPanel');
const dayTitle = document.getElementById('dayTitle');
const sessionList = document.getElementById('sessionList');

function dateKey(d) { return d.toISOString().slice(0, 10) }
function sameDay(a, b) { return a.getFullYear() == b.getFullYear() && a.getMonth() == b.getMonth() && a.getDate() == b.getDate() }
function dayInRange(day, s) { const start = new Date(s.start); start.setHours(0, 0, 0, 0); const end = new Date(s.end); end.setHours(23, 59, 59, 999); return day >= start && day <= end }
function fmtTime(d) { return d.toTimeString().slice(0, 5) }
function statusOf(s) { const now = new Date(); if (now > s.end) return 'past'; if (now >= s.start && now <= s.end) return 'ongoing'; return 'upcoming' }

function filteredSessionsForDate(dateStr) {
    const day = new Date(dateStr + 'T12:00:00'); // midday to avoid TZ edges
    return state.sessions.filter(s =>
        dayInRange(day, s) &&
        state.filters.club.includes(s.club) && state.filters.sport.includes(s.sport) &&
        (state.role === 'admin' ? true : state.filters.team.includes(s.team))
    );
}

function renderCalendar() {
    const y = state.currentMonth.getFullYear(); const m = state.currentMonth.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate(); const startDow = new Date(y, m, 1).getDay();
    monthLabel.textContent = state.currentMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' });
    calRoot.innerHTML = '';
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(d => { const el = document.createElement('div'); el.className = 'dow'; el.textContent = d; calRoot.appendChild(el) })
    for (let i = 0; i < startDow; i++) { const p = document.createElement('div'); p.className = 'cell'; p.style.visibility = 'hidden'; calRoot.appendChild(p) }
    for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement('div'); cell.className = 'cell';
        const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const sessions = filteredSessionsForDate(dateStr); const cnt = sessions.length;
        cell.innerHTML = `<div class="n">${d}</div><div class="cnt">${cnt ? cnt + (cnt > 1 ? ' sessions' : ' session') : ''}</div>`;
        if (cnt > 0) { const dot = document.createElement('div'); dot.className = 'dot'; cell.appendChild(dot) }
        if (sessions.some(s => s.offline)) { const w = document.createElement('div'); w.className = 'warn'; w.textContent = '⚠️'; const tip = document.createElement('div'); tip.className = 'tooltip'; tip.textContent = `${sessions.filter(s => s.offline).length} sessions have offline cameras.`; cell.appendChild(w); cell.appendChild(tip) }
        cell.addEventListener('click', () => selectDay(dateStr, cell));
        calRoot.appendChild(cell)
    }
}

function selectDay(dateStr, cell) {
    document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));
    cell.classList.add('selected'); dayPanel.style.display = 'block'; dayTitle.textContent = new Date(dateStr).toDateString(); dayPanel.dataset.date = dateStr; renderDaySessions();
}

function renderDaySessions() {
    const dateStr = dayPanel.dataset.date; const sessions = filteredSessionsForDate(dateStr); sessionList.innerHTML = '';
    if (sessions.length === 0) { sessionList.innerHTML = `<div class="hint">No sessions yet. Click <b>Create New Schedule</b> to add one.</div>`; return }
    sessions.sort((a, b) => a.start - b.start).forEach(s => {
        const row = document.createElement('div'); row.className = 'card-row';
        const st = statusOf(s); const badge = st === 'past' ? 'past' : st === 'ongoing' ? 'ongo' : 'upco'; const warn = s.offline ? `<span class="badge warning">⚠️ Offline camera</span>` : '';
        const canSeeDetails = (state.role === 'admin' || state.filters.team.includes(s.team));
        const dayStart = new Date(dateStr + 'T00:00:00'); const dayEnd = new Date(dateStr + 'T23:59:59');
        const from = new Date(Math.max(dayStart, s.start)); const to = new Date(Math.min(dayEnd, s.end));
        row.innerHTML = `<div class="meta">
        <div class="time">${fmtTime(from)} – ${fmtTime(to)}</div>
        <div class="name">${s.name} · <span style="font-weight:700;color:var(--ink-600)">${s.pitch}</span></div>
        <div class="cams">Cameras: ${s.cameras.join(', ')} ${warn}</div>
        <div><span class="badge ${badge}">${st.toUpperCase()}</span>${state.role === 'admin' ? ` <span class="badge" style="background:#eef2f7;color:#0f172a">Team: ${s.team}</span>` : ''}</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">${canSeeDetails ? `<button class="btn ghost" data-act="details" data-id="${s.id}">Details</button>` : ''}</div>`;
        sessionList.appendChild(row)
    });
    sessionList.querySelectorAll('[data-act="details"]').forEach(btn => btn.addEventListener('click', () => openDetails(btn.dataset.id)));
}

function openDetails(id) {
    const s = state.sessions.find(x => x.id === id); const st = statusOf(s); 
    //const overlay = document.getElementById('overlay'); const modal = document.getElementById('modal'); overlay.classList.add('show'); modal.style.display = 'block';
    const dateRange = `${s.start.toLocaleString()} – ${s.end.toLocaleString()}`;
    // persist snapshot for the new tab to read
    localStorage.setItem(`corepoc_session_${id}`, JSON.stringify(s));

    const targetPage = st === 'past' ? 'playback.html' : 'schedule.html';
    window.open(`${targetPage}?id=${encodeURIComponent(id)}`, '_blank');
    // if (st === 'past') {
    //     modal.innerHTML = `<h3 style="margin-bottom:8px">Playback</h3>
    //   <div class="hint" style="margin-bottom:8px">${s.name} — ${s.pitch} — ${dateRange}</div>
    //   <video controls style="width:100%;background:#000;border-radius:12px" src=""></video>
    //   <div style="display:flex;gap:8px;margin-top:10px"><button class="btn primary">Play</button><button class="btn ghost">Download</button><button class="btn ghost" id="shareBtn">Share Link</button><button class="btn" onclick="closeOverlay()">Close</button></div>`;
    //     modal.querySelector('#shareBtn').addEventListener('click', () => { navigator.clipboard.writeText(location.href + `#playback-${s.id}`); alert('Playback URL copied!') });
    // } else {
    //     modal.innerHTML = `<h3 style="margin-bottom:8px">Edit Schedule (${st})</h3>
    //   <div class="hint" style="margin-bottom:8px">${s.name} — ${s.pitch} — ${dateRange}</div>
    //   <div class="row" style="margin:8px 0"><button class="btn primary" id="extendBtn">Extend +15m</button><button class="btn" style="background:linear-gradient(135deg,#ef4444,#f97316);color:#fff" id="stopBtn">Stop</button><button class="btn" onclick="closeOverlay()">Close</button></div>`;
    //     modal.querySelector('#extendBtn').addEventListener('click', () => { s.end = new Date(s.end.getTime() + 15 * 60000); renderDaySessions(); alert('Extended by 15 minutes.') });
    //     modal.querySelector('#stopBtn').addEventListener('click', () => { s.end = new Date(); renderDaySessions(); alert('Stopped.') });
    // }
}
function closeOverlay() { document.getElementById('overlay').classList.remove('show'); document.getElementById('modal').style.display = 'none' }

document.getElementById('overlay').addEventListener('click', e => { if (e.target.id === 'overlay') closeOverlay() });

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
            const row = document.createElement('div'); row.className = 'view-row';
            row.innerHTML = `<select class="view-type"><option>Broadcast</option><option>Static</option></select>
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

// ===== Filters, Role, Tabs, Avatar =====
document.getElementById('prevMonth').addEventListener('click', () => { state.currentMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() - 1, 1); seedSessions(); renderCalendar(); dayPanel.style.display = 'none' });
document.getElementById('nextMonth').addEventListener('click', () => { state.currentMonth = new Date(state.currentMonth.getFullYear(), state.currentMonth.getMonth() + 1, 1); seedSessions(); renderCalendar(); dayPanel.style.display = 'none' });
// document.getElementById('refreshDay').addEventListener('click', renderDaySessions);
// document.getElementById('createSchedule').addEventListener('click', () => {
//     const date = dayPanel.dataset.date || new Date().toISOString().slice(0, 10);
//     document.getElementById('fStartDT').value = date + 'T10:00';
//     document.getElementById('fEndDT').value = date + 'T11:00';
//     document.getElementById('fName').focus();
// });

// Multi-select dropdown functionality
function initMultiSelectDropdown(dropdownId, filterKey) {
    const dropdown = document.getElementById(dropdownId);
    const trigger = dropdown.querySelector('.multiselect-trigger');
    const content = dropdown.querySelector('.multiselect-dropdown-content');
    const options = dropdown.querySelectorAll('.multiselect-option');
    const selectAllBtn = dropdown.querySelector('[data-action="select-all"]');
    const clearBtn = dropdown.querySelector('[data-action="clear"]');

    // Toggle dropdown
    trigger.addEventListener('click', () => {
        const isOpen = content.classList.contains('show');
        // Close all other dropdowns
        document.querySelectorAll('.multiselect-dropdown-content.show').forEach(el => {
            if (el !== content) el.classList.remove('show');
        });
        document.querySelectorAll('.multiselect-trigger.open').forEach(el => {
            if (el !== trigger) el.classList.remove('open');
        });

        if (isOpen) {
            content.classList.remove('show');
            trigger.classList.remove('open');
        } else {
            content.classList.add('show');
            trigger.classList.add('open');
        }
    });

    // Handle option selection
    options.forEach(option => {
        const checkbox = option.querySelector('.multiselect-checkbox');
        const value = option.dataset.value;

        option.addEventListener('click', (e) => {
            e.stopPropagation();
            checkbox.checked = !checkbox.checked;
            option.classList.toggle('selected', checkbox.checked);
            updateFilterState();
            updateTriggerLabel();
        });

        // Handle checkbox click
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            option.classList.toggle('selected', checkbox.checked);
            updateFilterState();
            updateTriggerLabel();
        });
    });

    // Select all functionality
    selectAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        options.forEach(option => {
            const checkbox = option.querySelector('.multiselect-checkbox');
            checkbox.checked = true;
            option.classList.add('selected');
        });
        updateFilterState();
        updateTriggerLabel();
    });

    // Clear all functionality
    clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        options.forEach(option => {
            const checkbox = option.querySelector('.multiselect-checkbox');
            checkbox.checked = false;
            option.classList.remove('selected');
        });
        updateFilterState();
        updateTriggerLabel();
    });

    function updateFilterState() {
        const selectedValues = Array.from(options)
            .filter(option => option.querySelector('.multiselect-checkbox').checked)
            .map(option => option.dataset.value);

        state.filters[filterKey] = selectedValues;
        renderCalendar();
        if (dayPanel.style.display !== 'none') renderDaySessions();
    }

    function updateTriggerLabel() {
        const selectedValues = Array.from(options)
            .filter(option => option.querySelector('.multiselect-checkbox').checked)
            .map(option => option.dataset.value);

        const label = dropdown.querySelector('.multiselect-label');
        if (selectedValues.length === 0) {
            label.textContent = `Select ${filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}`;
        } else if (selectedValues.length === 1) {
            label.textContent = selectedValues[0];
        } else {
            label.textContent = `${selectedValues.length} selected`;
        }
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            content.classList.remove('show');
            trigger.classList.remove('open');
        }
    });

    // Initialize label
    updateTriggerLabel();
}

// mode + cards
// const modePitch = document.getElementById('modePitch'); const modeCamera = document.getElementById('modeCamera');
// modePitch.addEventListener('click', () => { modePitch.classList.add('active'); modeCamera.classList.remove('active'); pitchGrid.style.display = 'grid'; cameraGrid.style.display = 'none'; viewsBox.style.display = 'none' });
// modeCamera.addEventListener('click', () => { modeCamera.classList.add('active'); modePitch.classList.remove('active'); cameraGrid.style.display = 'grid'; pitchGrid.style.display = 'none'; renderViewsConfig() });

// document.getElementById('typeCards').addEventListener('click', e => { if (e.target.classList.contains('pill')) { document.querySelectorAll('#typeCards .pill').forEach(x => x.classList.remove('active')); e.target.classList.add('active') } });
// document.getElementById('settingCards').addEventListener('click', e => { if (e.target.classList.contains('pill')) { document.querySelectorAll('#settingCards .pill').forEach(x => x.classList.remove('active')); e.target.classList.add('active') } });

// document.getElementById('clearForm').addEventListener('click', clearForm);
// document.getElementById('saveSchedule').addEventListener('click', saveSchedule);

function init() {
    // Initialize multi-select dropdowns
    initMultiSelectDropdown('clubDropdown', 'club');
    initMultiSelectDropdown('sportDropdown', 'sport');
    initMultiSelectDropdown('teamDropdown', 'team');

    seedSessions();
    renderCalendar();
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