const db = require('../db');

// POST /api/contracts/:id/fund - Fund escrow (Employer only)
function fundContract(req, res) {
  const contractId = req.params.id;
  const employerId = req.user.userId;

  try {
    const contract = db.prepare('SELECT * FROM contracts WHERE contract_id = ?').get(contractId);
    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    // Verify caller is the employer on the contract
    if (contract.employer_id !== employerId) {
      return res.status(403).json({ error: "Access forbidden: you are not the employer for this contract" });
    }

    // Verify contract is pending
    if (contract.status !== 'pending') {
      return res.status(400).json({ error: "Contract has already been funded or processed" });
    }

    const mockReceipt = `MOCK-${Date.now()}`;
    const fundedAt = new Date().toISOString();

    // Update contract status to funded
    db.prepare(`
      UPDATE contracts 
      SET status = 'funded', funded_at = ?, checkout_request_id = ? 
      WHERE contract_id = ?
    `).run(fundedAt, mockReceipt, contractId);

    const updatedContract = db.prepare('SELECT * FROM contracts WHERE contract_id = ?').get(contractId);

    return res.status(200).json({
      message: "Escrow funded successfully",
      mockReceipt,
      contract: updatedContract
    });
  } catch (err) {
    console.error('Fund contract error:', err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/contracts/:id/deliver - Mark contract delivered (Freelancer only)
function deliverContract(req, res) {
  const contractId = req.params.id;
  const freelancerId = req.user.userId;

  try {
    const contract = db.prepare('SELECT * FROM contracts WHERE contract_id = ?').get(contractId);
    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    // Verify caller is the freelancer on the contract
    if (contract.freelancer_id !== freelancerId) {
      return res.status(403).json({ error: "Access forbidden: you are not the freelancer for this contract" });
    }

    // Verify contract is funded
    if (contract.status !== 'funded') {
      return res.status(400).json({ error: "Contract must be funded before delivery can be marked" });
    }

    const deliveredAt = new Date().toISOString();

    // Update contract status to delivered
    db.prepare(`
      UPDATE contracts 
      SET status = 'delivered', delivered_at = ? 
      WHERE contract_id = ?
    `).run(deliveredAt, contractId);

    const updatedContract = db.prepare('SELECT * FROM contracts WHERE contract_id = ?').get(contractId);

    return res.status(200).json(updatedContract);
  } catch (err) {
    console.error('Deliver contract error:', err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/contracts/:id/approve - Approve deliverables and release payments (Employer only)
function approveContract(req, res) {
  const contractId = req.params.id;
  const employerId = req.user.userId;

  try {
    const contract = db.prepare('SELECT * FROM contracts WHERE contract_id = ?').get(contractId);
    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    // Verify ownership and status is delivered
    if (contract.employer_id !== employerId) {
      return res.status(403).json({ error: "Access forbidden: you are not the employer for this contract" });
    }
    if (contract.status !== 'delivered') {
      return res.status(400).json({ error: "Contract status must be delivered to approve release" });
    }

    // Calculate payouts
    const freelancerPayout = contract.agreed_budget * 0.92;
    const platformFee = contract.agreed_budget * 0.08;

    const releasedAt = new Date().toISOString();
    const timestamp = Date.now();

    // Run release transactions
    const transaction = db.transaction(() => {
      // 1. Insert Freelancer payout payment row
      db.prepare(`
        INSERT INTO payments (contract_id, recipient_id, amount, type, mpesa_receipt)
        VALUES (?, ?, ?, 'freelancer_payout', ?)
      `).run(
        contractId, 
        contract.freelancer_id, 
        freelancerPayout, 
        `MOCK-PAY-${timestamp}`
      );

      // 2. Insert Platform fee payment row (recipient platform admin is user_id 1)
      db.prepare(`
        INSERT INTO payments (contract_id, recipient_id, amount, type, mpesa_receipt)
        VALUES (?, 1, ?, 'platform_fee', ?)
      `).run(
        contractId, 
        platformFee, 
        `MOCK-FEE-${timestamp}`
      );

      // 3. Update contract status to released
      db.prepare(`
        UPDATE contracts 
        SET status = 'released', released_at = ? 
        WHERE contract_id = ?
      `).run(releasedAt, contractId);
    });

    transaction();

    const updatedContract = db.prepare('SELECT * FROM contracts WHERE contract_id = ?').get(contractId);
    const payments = db.prepare('SELECT * FROM payments WHERE contract_id = ?').all(contractId);

    return res.status(200).json({
      message: "Contract approved and funds released successfully",
      freelancerPayout,
      platformFee,
      contract: updatedContract,
      payments
    });
  } catch (err) {
    console.error('Approve contract error:', err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/contracts/:id/dispute - Raise dispute (Employer or Freelancer)
function disputeContract(req, res) {
  const contractId = req.params.id;
  const userId = req.user.userId;
  const { reason } = req.body;

  try {
    const contract = db.prepare('SELECT * FROM contracts WHERE contract_id = ?').get(contractId);
    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    // Verify caller is either employer or freelancer on the contract
    if (contract.employer_id !== userId && contract.freelancer_id !== userId) {
      return res.status(403).json({ error: "Access forbidden: you are not a party to this contract" });
    }

    // Update contract status to disputed
    db.prepare(`
      UPDATE contracts 
      SET status = 'disputed' 
      WHERE contract_id = ?
    `).run(contractId);

    const updatedContract = db.prepare('SELECT * FROM contracts WHERE contract_id = ?').get(contractId);

    return res.status(200).json(updatedContract);
  } catch (err) {
    console.error('Dispute contract error:', err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  fundContract,
  deliverContract,
  approveContract,
  disputeContract
};
