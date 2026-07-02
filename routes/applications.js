const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Seeker: apply to a job
router.post('/', requireAuth, requireRole('seeker'), async (req, res) => {
  try {
    const { jobId, coverNote } = req.body;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const application = await Application.create({
      job: jobId,
      applicant: req.user.id,
      coverNote: coverNote || '',
    });
    res.status(201).json(application);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You already applied to this job' });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Seeker: view own applications
router.get('/mine', requireAuth, requireRole('seeker'), async (req, res) => {
  const applications = await Application.find({ applicant: req.user.id })
    .populate('job')
    .sort({ createdAt: -1 });
  res.json(applications);
});

// Employer: view applications for one of their jobs
router.get('/job/:jobId', requireAuth, requireRole('employer'), async (req, res) => {
  const job = await Job.findOne({ _id: req.params.jobId, postedBy: req.user.id });
  if (!job) return res.status(404).json({ message: 'Job not found' });

  const applications = await Application.find({ job: req.params.jobId })
    .populate('applicant', 'name email skills resumeSummary')
    .sort({ createdAt: -1 });
  res.json(applications);
});

// Employer: update application status
router.put('/:id/status', requireAuth, requireRole('employer'), async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id).populate('job');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (String(application.job.postedBy) !== req.user.id) {
      return res.status(403).json({ message: 'Not your job posting' });
    }
    application.status = status;
    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
