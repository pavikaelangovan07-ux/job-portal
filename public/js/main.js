async function loadJobs(params = {}) {
  const listEl = document.getElementById('job-list');
  listEl.innerHTML = '<p style="color:var(--ink-soft)">Loading jobs…</p>';

  const query = new URLSearchParams(params).toString();
  try {
    const jobs = await apiRequest(`/jobs${query ? `?${query}` : ''}`);
    renderJobs(jobs);
  } catch (err) {
    listEl.innerHTML = `<div class="empty-state">Could not load jobs. ${escapeHtml(err.message)}</div>`;
  }
}

function renderJobs(jobs) {
  const listEl = document.getElementById('job-list');
  const titleEl = document.getElementById('results-title');
  titleEl.textContent = `${jobs.length} open role${jobs.length === 1 ? '' : 's'}`;

  if (jobs.length === 0) {
    listEl.innerHTML = '<div class="empty-state">No jobs match that search yet. Try a broader term.</div>';
    return;
  }

  listEl.innerHTML = jobs.map((job) => `
    <a class="job-card" href="job-detail.html?id=${job._id}">
      <div>
        <div class="company">${escapeHtml(job.company)}</div>
        <h3>${escapeHtml(job.title)}</h3>
        <div class="meta">
          <span>${escapeHtml(job.location)}</span>
          <span>${escapeHtml(job.jobType)}</span>
          <span>${formatSalary(job.salaryMin, job.salaryMax)}</span>
          <span>Posted ${timeAgo(job.createdAt)}</span>
        </div>
      </div>
      <span class="tag">${escapeHtml(job.category)}</span>
    </a>
  `).join('');
}

document.getElementById('search-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const q = document.getElementById('q').value.trim();
  const location = document.getElementById('location').value.trim();
  const jobType = document.getElementById('jobType').value;
  const params = {};
  if (q) params.q = q;
  if (location) params.location = location;
  if (jobType) params.jobType = jobType;
  loadJobs(params);
});

loadJobs();
