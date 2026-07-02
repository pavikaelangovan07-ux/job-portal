// Small helper layer shared by every page.
const API_BASE = '/api';

const Auth = {
  getToken: () => localStorage.getItem('jp_token'),
  getUser: () => JSON.parse(localStorage.getItem('jp_user') || 'null'),
  setSession: (token, user) => {
    localStorage.setItem('jp_token', token);
    localStorage.setItem('jp_user', JSON.stringify(user));
  },
  clearSession: () => {
    localStorage.removeItem('jp_token');
    localStorage.removeItem('jp_user');
  },
  isLoggedIn: () => !!localStorage.getItem('jp_token'),
};

async function apiRequest(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = Auth.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

// Renders the login/dashboard/logout links in the header. Called on every page.
function renderNavUser() {
  const slot = document.getElementById('nav-user-slot');
  if (!slot) return;
  const user = Auth.getUser();

  if (!user) {
    slot.innerHTML = `
      <a href="login.html" class="btn btn-outline btn-small">Log in</a>
      <a href="register.html" class="btn btn-primary btn-small">Sign up</a>
    `;
    return;
  }

  const dashHref = user.role === 'employer' ? 'employer-dashboard.html' : 'seeker-dashboard.html';
  slot.innerHTML = `
    <span style="font-size:13px;color:var(--ink-soft)">Hi, ${escapeHtml(user.name)}</span>
    <a href="${dashHref}" class="btn btn-outline btn-small">Dashboard</a>
    <button id="logout-btn" class="btn btn-primary btn-small">Log out</button>
  `;
  document.getElementById('logout-btn').addEventListener('click', () => {
    Auth.clearSession();
    window.location.href = 'index.html';
  });
}

function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

function formatSalary(min, max) {
  if (!min && !max) return 'Salary not disclosed';
  if (min && max) return `₹${min.toLocaleString()} – ₹${max.toLocaleString()}`;
  return `₹${(min || max).toLocaleString()}+`;
}

document.addEventListener('DOMContentLoaded', renderNavUser);
