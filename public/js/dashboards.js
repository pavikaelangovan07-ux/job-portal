const user = Auth.getUser();
const gate = document.getElementById('gate');
const content = document.getElementById('dashboard-content');

const isEmployerPage = document.getElementById('job-list') && document.getElementById('applicants-list');
const isSeekerPage = document.getElementById('application-list');

function showGateMessage(text) {
  gate.innerHTML = `<div class="empty-state">${escapeHtml(text)}</div>`;
}

if (!user) {
  showGateMessage('Log in to view this page.');
} else if (isEmployerPage && user.role !== 'employer') {
  showGateMessage('This dashboard is for employer accounts.');
} else if (isSeekerPage && user.role !== 'seeker') {
  showGateMessage('This dashboard is for job seeker accounts.');
} else {
  content.style.display = isEmployerPage ? 'grid' : 'block';
  if (isEmployerPage) initEmployerDashboard();
  if (isSeekerPage) initSeekerDashboard();
}

/* ---------------- Employer dashboard ---------------- */

async function initEmployerDashboard() {
  const jobListEl = document.getElementById('job-list');
  try {
    const jobs = await apiRequest('/jobs/mine/list', { auth: true });
    if (jobs.length === 0) {
      jobListEl.innerHTML = `<div class="empty-state">You haven't posted any jobs yet.<br><br><a href="post-job.html" class="btn btn-primary btn-small">Post your first job</a></div>`;
      return;
    }
    jobListEl.innerHTML = jobs.map((job) => `
      <div class="card-row">
        <div>
          <div style="font-weight:600">${escapeHtml(job.title)}</div>
          <div class="meta" style="margin-top:2px"><span>${escapeHtml(job.location)}</span><span>${escapeHtml(job.jobType)}</span></div>
        </div>
        <button class="btn btn-outline btn-small" data-view-job="${job._id}" data-title="${escapeHtml(job.title)}">View applicants</button>
      </div>
    `).join('');

    jobListEl.querySelectorAll('[data-view-job]').forEach((btn) => {
      btn.addEventListener('click', () => loadApplicants(btn.dataset.viewJob, btn.dataset.title));
    });
  } catch (err) {
    jobListEl.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
  }
}

async function loadApplicants(jobId, jobTitle) {
  const titleEl = document.getElementById('applicants-title');
  const listEl = document.getElementById('applicants-list');
  titleEl.textContent = `Applicants — ${jobTitle}`;
  listEl.innerHTML = '<p style="color:var(--ink-soft);font-size:14px">Loading…</p>';

  try {
    const applications = await apiRequest(`/applications/job/${jobId}`, { auth: true });
    if (applications.length === 0) {
      listEl.innerHTML = '<p style="color:var(--ink-soft);font-size:14px">No applicants yet.</p>';
      return;
    }
    listEl.innerHTML = applications.map((app) => `
      <div class="card-row" style="flex-direction:column;align-items:stretch;gap:8px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-weight:600">${escapeHtml(app.applicant.name)}</div>
          <span class="status-badge status-${app.status}">${app.status}</span>
        </div>
        <div style="font-size:13px;color:var(--ink-soft)">${escapeHtml(app.applicant.email)}</div>
        ${app.coverNote ? `<div style="font-size:13px;color:var(--ink-soft)">"${escapeHtml(app.coverNote)}"</div>` : ''}
        <select data-app-id="${app._id}" style="margin-top:4px;padding:6px;border-radius:6px;border:1px solid var(--line);font-size:13px">
          ${['Applied', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'].map((s) => `<option value="${s}" ${s === app.status ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
    `).join('');

    listEl.querySelectorAll('[data-app-id]').forEach((select) => {
      select.addEventListener('change', async () => {
        try {
          await apiRequest(`/applications/${select.dataset.appId}/status`, {
            method: 'PUT',
            auth: true,
            body: { status: select.value },
          });
        } catch (err) {
          alert(err.message);
        }
      });
    });
  } catch (err) {
    listEl.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
  }
}

/* ---------------- Seeker dashboard ---------------- */

async function initSeekerDashboard() {
  const listEl = document.getElementById('application-list');
  try {
    const applications = await apiRequest('/applications/mine', { auth: true });
    if (applications.length === 0) {
      listEl.innerHTML = `<div class="empty-state">You haven't applied to any jobs yet.<br><br><a href="index.html" class="btn btn-primary btn-small">Browse open roles</a></div>`;
      return;
    }
    listEl.innerHTML = applications.map((app) => `
      <div class="card-row">
        <div>
          <a href="job-detail.html?id=${app.job._id}" style="font-weight:600">${escapeHtml(app.job.title)}</a>
          <div class="meta" style="margin-top:2px"><span>${escapeHtml(app.job.company)}</span><span>Applied ${timeAgo(app.createdAt)}</span></div>
        </div>
        <span class="status-badge status-${app.status}">${app.status}</span>
      </div>
    `).join('');
  } catch (err) {
    listEl.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
  }
}
