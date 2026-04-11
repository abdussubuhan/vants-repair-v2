/* ============================================================
   VANTS V2 — Admin Dashboard JavaScript
   Luxury Black & Gold Edition
   ============================================================ */

'use strict';

// ── Constants ──────────────────────────────────────────────────
const ADMIN_PASS = 'vants2026';
const STORAGE_KEY = 'vants-bookings';

// ── State ──────────────────────────────────────────────────────
let allBookings = [];
let filteredBookings = [];
let activeFilter = 'bookings';
let currentBookingId = null;

// ── DOM refs ───────────────────────────────────────────────────
const loginPage = document.getElementById('loginPage');
const adminPage = document.getElementById('adminPage');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const adminThemeToggle = document.getElementById('adminThemeToggle');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');

// ── Theme ──────────────────────────────────────────────────────
function getTheme() {
  return localStorage.getItem('vants-v2-theme') || 'dark';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (adminThemeToggle) adminThemeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
}

applyTheme(getTheme());

adminThemeToggle?.addEventListener('click', () => {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  localStorage.setItem('vants-v2-theme', next);
  applyTheme(next);
});

// ── Toast ──────────────────────────────────────────────────────
function showToast(msg, icon = '✅') {
  const t = document.getElementById('adminToast');
  const m = document.getElementById('adminToastMsg');
  const i = document.getElementById('adminToastIcon');
  if (!t) return;
  if (i) i.textContent = icon;
  if (m) m.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ── Auth ───────────────────────────────────────────────────────
function isLoggedIn() {
  return sessionStorage.getItem('vants-admin-auth') === '1';
}

function login(pass) {
  if (pass === ADMIN_PASS) {
    sessionStorage.setItem('vants-admin-auth', '1');
    showDashboard();
    return true;
  }
  return false;
}

function logout() {
  sessionStorage.removeItem('vants-admin-auth');
  loginPage.classList.remove('hidden');
  adminPage.classList.remove('active');
  loginPage.style.display = '';
  adminPage.style.display = 'none';
  if (loginError) loginError.classList.remove('show');
  document.getElementById('adminPassword').value = '';
}

// ── Init on load ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (isLoggedIn()) {
    showDashboard();
  } else {
    loginPage.style.display = 'flex';
    adminPage.style.display = 'none';
  }
});

loginForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const pass = document.getElementById('adminPassword').value;
  if (!login(pass)) {
    loginError.classList.add('show');
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminPassword').focus();
  }
});

logoutBtn?.addEventListener('click', logout);

// ── Show Dashboard ─────────────────────────────────────────────
function showDashboard() {
  loginPage.style.display = 'none';
  adminPage.style.display = '';
  adminPage.classList.add('active');
  loadBookings();
  updateStats();
  renderTable();
}

// ── Sidebar Mobile Toggle ──────────────────────────────────────
sidebarToggle?.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (sidebar?.classList.contains('open') &&
      !sidebar.contains(e.target) &&
      e.target !== sidebarToggle) {
    sidebar.classList.remove('open');
  }
});

// ── Sidebar Navigation ─────────────────────────────────────────
document.querySelectorAll('.sidebar-link[data-section]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-link').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.section;
    applyFilters();
    updateTopbar();
    if (window.innerWidth <= 900) sidebar.classList.remove('open');
  });
});

function updateTopbar() {
  const topbarTitle = document.getElementById('topbarTitle');
  const topbarSubtitle = document.getElementById('topbarSubtitle');
  const panelTitle = document.getElementById('panelTitle');
  const map = {
    bookings:  ['All Bookings', 'All client repair requests'],
    today:     ["Today's Bookings", "Requests received today"],
    pending:   ['Pending Requests', 'Awaiting technician assignment'],
    completed: ['Completed Jobs', 'Successfully resolved repairs'],
  };
  const [title, sub] = map[activeFilter] || ['Bookings', ''];
  if (topbarTitle) topbarTitle.textContent = title;
  if (topbarSubtitle) topbarSubtitle.textContent = sub;
  if (panelTitle) panelTitle.textContent = title;
}

// ── Data ───────────────────────────────────────────────────────
function loadBookings() {
  try {
    allBookings = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (_) {
    allBookings = [];
  }
}

function saveBookingsToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allBookings));
}

function updateStats() {
  const today = new Date().toDateString();

  document.getElementById('statTotal').textContent = allBookings.length;
  document.getElementById('statToday').textContent = allBookings.filter(b => {
    try { return new Date(b.timestamp).toDateString() === today; } catch (_) { return false; }
  }).length;
  document.getElementById('statPending').textContent = allBookings.filter(b => b.status === 'pending' || !b.status).length;
  document.getElementById('statCompleted').textContent = allBookings.filter(b => b.status === 'completed').length;
  document.getElementById('sidebarBadge').textContent = allBookings.length;
}

// ── Filters ────────────────────────────────────────────────────
function applyFilters() {
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  const status = document.getElementById('statusFilter')?.value || '';
  const device = document.getElementById('deviceFilter')?.value || '';
  const today = new Date().toDateString();

  filteredBookings = allBookings.filter(b => {
    // Section filter
    if (activeFilter === 'today') {
      try { if (new Date(b.timestamp).toDateString() !== today) return false; } catch (_) { return false; }
    }
    if (activeFilter === 'pending' && b.status !== 'pending' && b.status) return false;
    if (activeFilter === 'completed' && b.status !== 'completed') return false;

    // Search
    if (q && !b.name?.toLowerCase().includes(q) && !b.phone?.toLowerCase().includes(q)) return false;

    // Status dropdown
    if (status) {
      const bStatus = b.status || 'pending';
      if (bStatus !== status) return false;
    }

    // Device dropdown
    if (device && b.device !== device) return false;

    return true;
  });

  renderTable();
}

// ── Render Table ───────────────────────────────────────────────
function renderTable() {
  const tbody = document.getElementById('bookingsBody');
  const emptyState = document.getElementById('emptyState');
  const panelCount = document.getElementById('panelCount');

  if (!tbody) return;

  tbody.innerHTML = '';

  if (filteredBookings.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = '';
    if (panelCount) panelCount.textContent = '0 bookings';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (panelCount) panelCount.textContent = `${filteredBookings.length} booking${filteredBookings.length !== 1 ? 's' : ''}`;

  filteredBookings.forEach((b, idx) => {
    const status = b.status || 'pending';
    const statusLabels = {
      pending: '⏳ Pending',
      inprogress: '🔧 In Progress',
      completed: '✅ Completed',
      cancelled: '❌ Cancelled',
    };

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color: var(--text-3); font-size: 0.78rem; font-family: 'JetBrains Mono', monospace;">${allBookings.indexOf(b) + 1}</td>
      <td class="td-name">${escHtml(b.name || '—')}</td>
      <td class="td-phone"><a href="https://wa.me/${waNumber(b.phone)}" target="_blank">${escHtml(b.phone || '—')}</a></td>
      <td class="td-device">${escHtml(b.device || '—')}</td>
      <td class="td-issue" title="${escHtml(b.issue || '')}">${escHtml(b.issue || '—')}</td>
      <td style="font-size: 0.8rem; white-space: nowrap;">${escHtml(b.slot || '—')}</td>
      <td class="td-time">${escHtml(b.date || '—')}</td>
      <td>
        <button class="status-badge ${status}" onclick="cycleStatus('${b.id}')" title="Click to change status">
          ${statusLabels[status] || status}
        </button>
      </td>
      <td>
        <div style="display: flex; gap: 0.4rem; align-items: center;">
          <button class="action-btn" onclick="openModal('${b.id}')" title="View details">👁️</button>
          <button class="action-btn" onclick="openWhatsApp('${b.phone}', '${b.name || ''}')" title="WhatsApp client">📱</button>
          <button class="action-btn danger" onclick="deleteBooking('${b.id}')" title="Delete booking">🗑️</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ── Actions ────────────────────────────────────────────────────
function cycleStatus(id) {
  const cycle = ['pending', 'inprogress', 'completed', 'cancelled'];
  const b = allBookings.find(b => b.id === id);
  if (!b) return;
  const cur = b.status || 'pending';
  const next = cycle[(cycle.indexOf(cur) + 1) % cycle.length];
  b.status = next;
  saveBookingsToStorage();
  updateStats();
  applyFilters();
  showToast(`Status updated to "${next}"`, '✅');
}

function deleteBooking(id) {
  if (!confirm('Delete this booking? This cannot be undone.')) return;
  const idx = allBookings.findIndex(b => b.id === id);
  if (idx < 0) return;
  allBookings.splice(idx, 1);
  saveBookingsToStorage();
  updateStats();
  applyFilters();
  showToast('Booking deleted', '🗑️');
}

function openWhatsApp(phone, name) {
  const num = waNumber(phone);
  const msg = encodeURIComponent(`Hi ${name || 'there'}, this is VANTS PC Repair. Following up on your booking request. How can we assist you?`);
  window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
}

// ── Modal ──────────────────────────────────────────────────────
function openModal(id) {
  const b = allBookings.find(b => b.id === id);
  if (!b) return;
  currentBookingId = id;

  document.getElementById('mName').textContent = b.name || '—';
  document.getElementById('mPhone').textContent = b.phone || '—';
  document.getElementById('mDevice').textContent = b.device || '—';
  document.getElementById('mSlot').textContent = b.slot || '—';
  document.getElementById('mLocation').textContent = b.location || '—';
  document.getElementById('mIssue').textContent = b.issue || '—';
  document.getElementById('mDate').textContent = b.date || '—';

  const status = b.status || 'pending';
  const statusLabels = {
    pending: '⏳ Pending',
    inprogress: '🔧 In Progress',
    completed: '✅ Completed',
    cancelled: '❌ Cancelled',
  };

  document.getElementById('mStatus').textContent = statusLabels[status] || status;
  document.getElementById('mStatusSelect').value = status;

  const waBtn = document.getElementById('mWhatsApp');
  waBtn.onclick = () => openWhatsApp(b.phone, b.name);

  document.getElementById('mUpdateStatus').onclick = () => {
    const newStatus = document.getElementById('mStatusSelect').value;
    b.status = newStatus;
    saveBookingsToStorage();
    updateStats();
    applyFilters();
    document.getElementById('mStatus').textContent = statusLabels[newStatus] || newStatus;
    showToast(`Status updated to "${newStatus}"`, '✅');
  };

  modalOverlay.classList.add('open');
}

modalClose?.addEventListener('click', () => modalOverlay.classList.remove('open'));

modalOverlay?.addEventListener('click', (e) => {
  if (e.target === modalOverlay) modalOverlay.classList.remove('open');
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') modalOverlay.classList.remove('open');
});

// ── Export CSV ─────────────────────────────────────────────────
function exportCSV() {
  if (!allBookings.length) {
    showToast('No bookings to export', '⚠️');
    return;
  }

  const headers = ['ID', 'Name', 'Phone', 'Device', 'Slot', 'Location', 'Issue', 'Date', 'Status'];
  const rows = allBookings.map(b => [
    b.id, b.name, b.phone, b.device, b.slot, b.location,
    (b.issue || '').replace(/"/g, '""'),
    b.date, b.status || 'pending'
  ].map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vants-bookings-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`${allBookings.length} bookings exported`, '📥');
}

// ── Clear All ──────────────────────────────────────────────────
function clearAllData() {
  if (!confirm('⚠️ Are you sure you want to delete ALL bookings?\n\nThis action cannot be undone.')) return;
  allBookings = [];
  saveBookingsToStorage();
  updateStats();
  applyFilters();
  showToast('All booking data cleared', '🗑️');
}

// ── Add Sample Data ────────────────────────────────────────────
function addSampleData() {
  const samples = [
    { id: `BK-${Date.now()}1`, name: 'Rahul Menon', phone: '9876543210', device: 'Laptop', slot: 'Morning (9AM – 12PM)', location: 'Perumbavoor', issue: 'Laptop screen is cracked and touchpad not working', date: new Date().toLocaleString('en-IN'), timestamp: new Date().toISOString(), status: 'completed' },
    { id: `BK-${Date.now()}2`, name: 'Priya Nair', phone: '9876543211', device: 'Desktop PC', slot: 'Afternoon (12PM – 4PM)', location: 'Aluva', issue: 'Computer is running very slow and getting unusual popups', date: new Date(Date.now() - 3600000).toLocaleString('en-IN'), timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'inprogress' },
    { id: `BK-${Date.now()}3`, name: 'Arjun Kumar', phone: '9876543212', device: 'Laptop', slot: 'Evening (4PM – 8PM)', location: 'Ernakulam', issue: 'Need data recovery from old hard drive — accidentally formatted', date: new Date(Date.now() - 7200000).toLocaleString('en-IN'), timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'pending' },
    { id: `BK-${Date.now()}4`, name: 'Sunita George', phone: '9876543213', device: 'Laptop', slot: 'Morning (9AM – 12PM)', location: 'Kakkanad', issue: 'Battery drains very fast, lasts only 30 mins', date: new Date(Date.now() - 86400000).toLocaleString('en-IN'), timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'completed' },
    { id: `BK-${Date.now()}5`, name: 'Mohammed Shafeer', phone: '9876543214', device: 'Desktop PC', slot: 'Flexible / Any time', location: 'Angamaly', issue: 'Office WiFi network setup for 4 computers', date: new Date(Date.now() - 172800000).toLocaleString('en-IN'), timestamp: new Date(Date.now() - 172800000).toISOString(), status: 'completed' },
  ];

  samples.forEach(s => {
    if (!allBookings.find(b => b.id === s.id)) {
      allBookings.unshift(s);
    }
  });

  saveBookingsToStorage();
  updateStats();
  applyFilters();
  showToast(`${samples.length} sample bookings added`, '✅');
}

// ── Expose globals ─────────────────────────────────────────────
window.applyFilters = applyFilters;
window.exportCSV = exportCSV;
window.clearAllData = clearAllData;
window.addSampleData = addSampleData;

// ── Helpers ────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function waNumber(phone) {
  const digits = String(phone).replace(/\D/g, '');
  return digits.startsWith('91') ? digits : `91${digits}`;
}

// ── Keyboard shortcut ──────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'e') { e.preventDefault(); exportCSV(); }
});
