const db = require('../db');

// Standalone utility to auto-approve escrow for contracts delivered more than 3 days ago.
async function autoReleaseEscrow() {
  try {
    // Find all contracts that are 'delivered' and delivered_at is older than 3 days.
    // SQLite datetime('now', '-3 days') works natively with ISO 8601 strings.
    const overdueContracts = db.prepare(`
      SELECT * FROM contracts 
      WHERE status = 'delivered' 
        AND delivered_at <= datetime('now', '-3 days')
    `).all();

    let releasedCount = 0;
    const failedList = [];

    for (const contract of overdueContracts) {
      try {
        const freelancerPayout = contract.agreed_budget * 0.92;
        const platformFee = contract.agreed_budget * 0.08;

        const releaseTransaction = db.transaction(() => {
          const timestamp = Date.now();

          // 1. Insert Freelancer payout payment row
          db.prepare(`
            INSERT INTO payments (contract_id, recipient_id, amount, type, mpesa_receipt)
            VALUES (?, ?, ?, 'freelancer_payout', ?)
          `).run(
            contract.contract_id, 
            contract.freelancer_id, 
            freelancerPayout, 
            \`MOCK-PAY-AUTO-\${timestamp}-\${contract.contract_id}\`
          );

          // 2. Insert Platform fee payment row (recipient platform admin is user_id 1)
          db.prepare(`
            INSERT INTO payments (contract_id, recipient_id, amount, type, mpesa_receipt)
            VALUES (?, 1, ?, 'platform_fee', ?)
          `).run(
            contract.contract_id, 
            platformFee, 
            \`MOCK-FEE-AUTO-\${timestamp}-\${contract.contract_id}\`
          );

          // 3. Update contract status to released
          db.prepare(`
            UPDATE contracts 
            SET status = 'released', released_at = datetime('now', 'localtime') 
            WHERE contract_id = ?
          `).run(contract.contract_id);
        });

        releaseTransaction();
        releasedCount++;
      } catch (err) {
        failedList.push({
          contract_id: contract.contract_id,
          error: err.message
        });
      }
    }

    return {
      released: releasedCount,
      failed: failedList
    };
  } catch (err) {
    console.error('Auto release escrow utility error:', err);
    throw err;
  }
}

module.exports = autoReleaseEscrow;
