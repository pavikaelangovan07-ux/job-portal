# Fieldnote — Job Portal

Simple full-stack job portal: plain HTML/CSS/JS frontend, Node/Express backend, MongoDB database.

## Features
- Two account types: job seeker and employer
- Employers: post jobs, edit/delete their listings, view applicants, update application status
- Seekers: search/filter jobs, apply with a cover note, track application status
- JWT-based authentication, passwords hashed with bcrypt

## Project structure
```
job-portal/
├── server.js              Express app entry point
├── models/                Mongoose schemas (User, Job, Application)
├── middleware/auth.js     JWT auth + role guard
├── routes/                auth.js, jobs.js, applications.js
└── public/                Static frontend (served by Express)
    ├── index.html          Job search/listing
    ├── login.html / register.html
    ├── post-job.html       Employer: create a job
    ├── employer-dashboard.html
    ├── seeker-dashboard.html
    ├── job-detail.html
    ├── css/style.css
    └── js/                 api.js (shared helpers), main.js, job-detail.js, dashboards.js
```

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Make sure MongoDB is running locally, or use a hosted MongoDB (e.g. MongoDB Atlas).

3. Copy the environment file and fill in your own secret:
   ```
   cp .env.example .env
   ```
   Edit `.env`:
   ```
   MONGO_URI=mongodb://127.0.0.1:27017/job-portal
   JWT_SECRET=some_long_random_string
   PORT=5000
   ```

4. Start the server:
   ```
   npm start
   ```
   or with auto-reload during development:
   ```
   npm run dev
   ```

5. Open **http://localhost:5000** in your browser.

## Try it out
1. Register as an **employer**, then go to "Post a job" and publish a listing.
2. Log out, register as a **job seeker**, search for the job, open it, and apply.
3. Log back in as the employer → Dashboard → "View applicants" → change their status.
4. Log back in as the seeker → Dashboard to see the updated status.

## Notes / next steps
- No file upload for resumes yet — seekers apply with a text cover note. Adding real resume uploads would mean wiring in `multer` + storage (local disk or S3).
- No pagination on the job list — fine for a demo, but add `skip`/`limit` before using with a large dataset.
- No password reset / email verification flow.
- To deploy: host the Node app (Render, Railway, a VPS) and point `MONGO_URI` at MongoDB Atlas; the `public/` folder is served automatically by Express so there's no separate frontend deploy step.
