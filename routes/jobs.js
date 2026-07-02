const express = require('express');
const Job = require('../models/Job');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public: list/search jobs
router.get('/', async (req, res) => {
  try {
    const { q, location, category, jobType } = req.query;
    const filter = { isActive: true };

    if (q) filter.$text = { $search: q };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (jobType) filter.jobType = jobType;

    const jobs = await Job.find(filter).sort({ createdAt: -1 }).populate('postedBy', 'name companyName');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Public: single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name companyName email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Employer: post a job
router.post('/', requireAuth, requireRole('employer'), async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user.id });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Employer: list jobs they posted
router.get('/mine/list', requireAuth, requireRole('employer'), async (req, res) => {
  const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
  res.json(jobs);
});

// Employer: update own job
router.put('/:id', requireAuth, requireRole('employer'), async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user.id });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    Object.assign(job, req.body);
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Employer: delete/close own job
router.delete('/:id', requireAuth, requireRole('employer'), async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, postedBy: req.user.id });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
