const fs = require('fs');
const path = require('path');

function initializeDatabase(db) {
  // Ensure the database table structures exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id       INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      phone         TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL CHECK(role IN ('freelancer', 'employer', 'admin')),
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      token      TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS jobs (
      job_id        INTEGER PRIMARY KEY AUTOINCREMENT,
      employer_id   INTEGER NOT NULL REFERENCES users(user_id),
      title         TEXT NOT NULL,
      description   TEXT NOT NULL,
      category      TEXT NOT NULL,
      location      TEXT NOT NULL,
      budget        REAL NOT NULL CHECK(budget > 0),
      skills        TEXT NOT NULL,   -- stored as JSON string
      status        TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','closed')),
      deadline      DATE,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS proposals (
      proposal_id    INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id         INTEGER NOT NULL REFERENCES jobs(job_id),
      freelancer_id  INTEGER NOT NULL REFERENCES users(user_id),
      cover_letter   TEXT NOT NULL,
      proposed_budget REAL NOT NULL CHECK(proposed_budget > 0),
      timeline_days  INTEGER NOT NULL CHECK(timeline_days BETWEEN 1 AND 365),
      portfolio_url  TEXT,
      status         TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','rejected')),
      submitted_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(job_id, freelancer_id)
    );

    CREATE TABLE IF NOT EXISTS contracts (
      contract_id      INTEGER PRIMARY KEY AUTOINCREMENT,
      proposal_id      INTEGER NOT NULL UNIQUE REFERENCES proposals(proposal_id),
      job_id           INTEGER NOT NULL REFERENCES jobs(job_id),
      employer_id      INTEGER NOT NULL REFERENCES users(user_id),
      freelancer_id    INTEGER NOT NULL REFERENCES users(user_id),
      agreed_budget    REAL NOT NULL,
      status           TEXT NOT NULL DEFAULT 'pending'
                       CHECK(status IN ('pending','funded','delivered','released','disputed')),
      checkout_request_id TEXT,
      funded_at        DATETIME,
      delivered_at     DATETIME,
      released_at      DATETIME,
      created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      payment_id       INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_id      INTEGER NOT NULL REFERENCES contracts(contract_id),
      recipient_id     INTEGER NOT NULL REFERENCES users(user_id),
      amount           REAL NOT NULL CHECK(amount > 0),
      type             TEXT NOT NULL CHECK(type IN ('freelancer_payout','platform_fee')),
      mpesa_receipt    TEXT UNIQUE,
      created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

module.exports = { initializeDatabase };
