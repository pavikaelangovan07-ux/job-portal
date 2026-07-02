const jobId = new URLSearchParams(window.location.search).get('id');
const container = document.getElementById('job-detail');

async function loadJob() {
  if (!jobId) {
    container.innerHTML = '<div class="empty-state">No job specified.</div>';
    return;
  }
  try {
    const job = await apiRequest(`/jobs/${jobId}`);
    renderJob(job);
  } catch (err) {
    container.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
  }
}

function renderJob(job) {
  const user = Auth.getUser();
  const isSeeker = user && user.role === 'seeker';

  container.innerHTML = `
    <div class="card" style="max-width:720px">
      <span class="tag">${escapeHtml(job.category)}</span>
      <h1 style="font-family:var(--font-display);font-size:28px;margin:14px 0 4px">${escapeHtml(job.title)}</h1>
      <div class="company" style="font-size:15px">${escapeHtml(job.company)}</div>
      <div class="meta" style="margin:10px 0 24px">
        <span>${escapeHtml(job.location)}</span>
        <span>${escapeHtml(job.jobType)}</span>
        <span>${formatSalary(job.salaryMin, job.salaryMax)}</span>
        <span>Posted ${timeAgo(job.createdAt)}</span>
      </div>
      <h3>About this role</h3>
      <p style="white-space:pre-wrap;color:var(--ink-soft)">${escapeHtml(job.description)}</p>
      ${job.requirements && job.requirements.length ? `
        <h3>Requirements</h3>
        <ul style="color:var(--ink-soft)">
          ${job.requirements.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}
        </ul>
      ` : ''}
      <div id="apply-area" style="margin-top:28px"></div>
    </div>
  `;

  const applyArea = document.getElementById('apply-area');

  if (!user) {
    applyArea.innerHTML = `<a href="login.html" class="btn btn-primary">Log in to apply</a>`;
    return;
  }

  if (!isSeeker) {
    applyArea.innerHTML = `<p style="color:var(--ink-soft);font-size:14px">Only job seeker accounts can apply.</p>`;
    return;
  }

  applyArea.innerHTML = `
    <div class="field">
      <label for="coverNote">A short note to the employer (optional)</label>
      <textarea id="coverNote" placeholder="Why you're a good fit..."></textarea>
    </div>
    <button id="apply-btn" class="btn btn-signal">Apply to this job</button>
    <p id="apply-msg" class="form-msg"></p>
  `;

  document.getElementById('apply-btn').addEventListener('click', async () => {
    const msg = document.getElementById('apply-msg');
    const btn = document.getElementById('apply-btn');
    btn.disabled = true;
    try {
      await apiRequest('/applications', {
        method: 'POST',
        auth: true,
        body: { jobId: job._id, coverNote: document.getElementById('coverNote').value },
      });
      msg.textContent = 'Application submitted!';
      msg.className = 'form-msg success';
      applyArea.querySelector('#apply-btn').remove();
    } catch (err) {
      msg.textContent = err.message;
      msg.className = 'form-msg error';
      btn.disabled = false;
    }
  });
}

loadJob();
