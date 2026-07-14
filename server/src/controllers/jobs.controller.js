const db = require('../db');

// GET /api/jobs - Query jobs with filters + pagination + sorting
function getJobs(req, res) {
  try {
    const { search, category, location, budget_min, budget_max, sort } = req.query;
    
    // Pagination params
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 10;
    if (limit > 50) limit = 50;
    if (limit < 1) limit = 10;
    if (page < 1) page = 1;
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    // Apply Search Filter (Case-insensitive matching on title or description)
    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    // Apply Category Filter
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    // Apply Location Filter
    if (location) {
      conditions.push('location = ?');
      params.push(location);
    }

    // Apply Budget Range Filters
    if (budget_min) {
      const minVal = parseFloat(budget_min);
      if (!isNaN(minVal)) {
        conditions.push('budget >= ?');
        params.push(minVal);
      }
    }
    if (budget_max) {
      const maxVal = parseFloat(budget_max);
      if (!isNaN(maxVal)) {
        conditions.push('budget <= ?');
        params.push(maxVal);
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Apply Sorting logic
    let orderBy = 'ORDER BY created_at DESC'; // default newest
    if (sort === 'budget_high') {
      orderBy = 'ORDER BY budget DESC';
    } else if (sort === 'budget_low') {
      orderBy = 'ORDER BY budget ASC';
    }

    // 1. Get total count of matching rows
    const countSql = `SELECT COUNT(*) as count FROM jobs ${whereClause}`;
    const totalRow = db.prepare(countSql).get(...params);
    const total = totalRow ? totalRow.count : 0;

    // 2. Fetchpaginated results with proposal counts
    const jobsSql = `
      SELECT *, 
             (SELECT COUNT(*) FROM proposals WHERE proposals.job_id = jobs.job_id) as proposal_count
      FROM jobs
      ${whereClause}
      ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const selectParams = [...params, limit, offset];
    const rows = db.prepare(jobsSql).all(...selectParams);

    // Format skills field (stored as JSON string) for all returned jobs
    const jobsList = rows.map((job) => {
      try {
        job.skills = JSON.parse(job.skills);
      } catch (e) {
        job.skills = [];
      }
      return job;
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      jobs: jobsList,
      total,
      page,
      limit,
      totalPages
    });
  } catch (err) {
    console.error('Get jobs error:', err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/jobs - Create a new job opening (Employer only)
function createJob(req, res) {
  const { title, description, category, location, budget, skills, deadline } = req.body;
  const employerId = req.user.userId;

  try {
    const insertQuery = db.prepare(`
      INSERT INTO jobs (employer_id, title, description, category, location, budget, skills, deadline)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertQuery.run(
      employerId,
      title,
      description,
      category,
      location,
      budget,
      JSON.stringify(skills || []),
      deadline || null
    );

    const newJob = db.prepare('SELECT * FROM jobs WHERE job_id = ?').get(result.lastInsertRowid);
    newJob.skills = JSON.parse(newJob.skills);

    return res.status(201).json(newJob);
  } catch (err) {
    console.error('Create job error:', err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// GET /api/jobs/:id - Get single job plus proposal count
function getJobById(req, res) {
  const jobId = req.params.id;

  try {
    const job = db.prepare(`
      SELECT *, 
             (SELECT COUNT(*) FROM proposals WHERE proposals.job_id = jobs.job_id) as proposal_count
      FROM jobs
      WHERE job_id = ?
    `).get(jobId);

    if (!job) {
      return res.status(404).json({ error: "Job listing not found" });
    }

    try {
      job.skills = JSON.parse(job.skills);
    } catch (e) {
      job.skills = [];
    }

    return res.status(200).json(job);
  } catch (err) {
    console.error('Get job by ID error:', err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/jobs/:id/proposals - Submit proposal (Freelancer only)
function submitProposal(req, res) {
  const jobId = req.params.id;
  const freelancerId = req.user.userId;
  const { cover_letter, proposed_budget, timeline_days, portfolio_url } = req.body;

  try {
    // 1. Check if the target job exists and is open
    const job = db.prepare('SELECT status FROM jobs WHERE job_id = ?').get(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job listing not found" });
    }
    if (job.status !== 'open') {
      return res.status(400).json({ error: "Proposals can only be submitted for open jobs" });
    }

    // 2. Attempt insertion of the proposal
    const insertQuery = db.prepare(`
      INSERT INTO proposals (job_id, freelancer_id, cover_letter, proposed_budget, timeline_days, portfolio_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertQuery.run(
      jobId,
      freelancerId,
      cover_letter,
      proposed_budget,
      timeline_days,
      portfolio_url || null
    );

    const newProposal = db.prepare('SELECT * FROM proposals WHERE proposal_id = ?').get(result.lastInsertRowid);
    return res.status(201).json(newProposal);
  } catch (err) {
    // Catch duplicate proposal exception (freelancer already applied)
    if (err.code === 'SQLITE_CONSTRAINT' || err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: "You have already submitted a proposal for this job" });
    }
    console.error('Submit proposal error:', err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// PUT /api/jobs/:id/proposals/:proposalId/accept - Accept proposal, create contract (Employer only)
function acceptProposal(req, res) {
  const jobId = req.params.id;
  const proposalId = req.params.proposalId;
  const employerId = req.user.userId;

  try {
    // 1. Verify target job exists and is owned by caller
    const job = db.prepare('SELECT employer_id, status FROM jobs WHERE job_id = ?').get(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job listing not found" });
    }
    if (job.employer_id !== employerId) {
      return res.status(403).json({ error: "Access forbidden: you do not own this job listing" });
    }
    if (job.status !== 'open') {
      return res.status(400).json({ error: "Job listing is no longer open" });
    }

    // 2. Verify target proposal exists and belongs to the job
    const proposal = db.prepare('SELECT * FROM proposals WHERE proposal_id = ? AND job_id = ?').get(proposalId, jobId);
    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found for this job" });
    }
    if (proposal.status !== 'pending') {
      return res.status(400).json({ error: "Proposal has already been processed" });
    }

    // 3. Execute transactional acceptance
    const transaction = db.transaction(() => {
      // a. Accept target proposal
      db.prepare("UPDATE proposals SET status = 'accepted' WHERE proposal_id = ?")
        .run(proposalId);

      // b. Reject all other proposals for this job
      db.prepare("UPDATE proposals SET status = 'rejected' WHERE job_id = ? AND proposal_id != ?")
        .run(jobId, proposalId);

      // c. Set job status to in_progress
      db.prepare("UPDATE jobs SET status = 'in_progress' WHERE job_id = ?")
        .run(jobId);

      // d. Create contracts record
      const contractResult = db.prepare(`
        INSERT INTO contracts (proposal_id, job_id, employer_id, freelancer_id, agreed_budget, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `).run(proposalId, jobId, employerId, proposal.freelancer_id, proposal.proposed_budget);

      return contractResult.lastInsertRowid;
    });

    const contractId = transaction();
    const contract = db.prepare('SELECT * FROM contracts WHERE contract_id = ?').get(contractId);

    return res.status(200).json(contract);
  } catch (err) {
    console.error('Accept proposal error:', err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getJobs,
  createJob,
  getJobById,
  submitProposal,
  acceptProposal
};
