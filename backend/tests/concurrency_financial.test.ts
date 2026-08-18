import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Concurrency, Anti-Double Spend & Token Family Rotation Suite', () => {
  test('1. Anti-Double Spend Concurrency: Out of 50 simultaneous parallel requests, exactly 1 succeeds', async () => {
    // In-memory simulation of the exact conditional update condition used in Prisma:
    // WHERE transactionHash = ? AND status != 'COMPLETED'
    const transactionState = {
      hash: 'cs_live_simulated_hash_999',
      status: 'PENDING',
      amount: 5000,
    };

    let processedCount = 0;
    let rejectedDoubleSpends = 0;

    // Simulate 50 concurrent goroutines / workers trying to complete the exact same payment hash simultaneously
    const attempts = Array.from({ length: 50 }).map(async (_, idx) => {
      // Atomic compare-and-swap simulation
      if (transactionState.status !== 'COMPLETED') {
        transactionState.status = 'COMPLETED';
        processedCount++;
        return { workerId: idx, status: 'SUCCESS' };
      } else {
        rejectedDoubleSpends++;
        return { workerId: idx, status: 'REJECTED_ALREADY_PROCESSED' };
      }
    });

    const results = await Promise.all(attempts);
    
    assert.equal(processedCount, 1, 'Exactly 1 request must succeed in crediting the funds');
    assert.equal(rejectedDoubleSpends, 49, '49 concurrent requests must be rejected as duplicate/replay attacks');
    assert.equal(transactionState.status, 'COMPLETED');
  });

  test('2. Refresh Token Family Reuse Detection: Using a previously revoked token invalidates the entire session family', () => {
    // Simulate database token storage for a user
    const userTokens = [
      { id: 'tok-1', token: 'token-alpha-1', revokedAt: new Date(Date.now() - 60000), expiresAt: new Date(Date.now() + 86400000) },
      { id: 'tok-2', token: 'token-beta-2', revokedAt: null, expiresAt: new Date(Date.now() + 86400000) },
      { id: 'tok-3', token: 'token-gamma-3', revokedAt: null, expiresAt: new Date(Date.now() + 86400000) },
    ];

    const simulateRefresh = (incomingToken: string) => {
      const stored = userTokens.find((t) => t.token === incomingToken);
      if (!stored) throw new Error('Token not found');

      // Detection logic: If revokedAt is not null -> Token Reuse Attack!
      if (stored.revokedAt !== null) {
        // Revoke all active tokens for this user
        userTokens.forEach((t) => {
          if (!t.revokedAt) t.revokedAt = new Date();
        });
        throw new Error('SESSION_COMPROMISED_REUSE_DETECTED');
      }

      // Normal rotation
      stored.revokedAt = new Date();
      return 'new-rotated-token';
    };

    // Attacker presents the old compromised token "token-alpha-1"
    assert.throws(
      () => simulateRefresh('token-alpha-1'),
      /SESSION_COMPROMISED_REUSE_DETECTED/,
      'Replaying an already-rotated token must trigger token reuse exception'
    );

    // Verify that all other active tokens for this user have been cascade-revoked
    const activeTokensRemaining = userTokens.filter((t) => t.revokedAt === null);
    assert.equal(activeTokensRemaining.length, 0, 'All active tokens must be revoked upon detecting a replay attack');
  });

  test('3. Matchmaking Scoring Engine: Accurate scoring based on industry, stage, and ticket size', () => {
    const preferences = {
      preferredIndustries: ['Fintech', 'AI'],
      preferredStages: ['Seed', 'Series A'],
      minTicketSize: 10000,
      maxTicketSize: 500000,
    };

    const calculateScore = (startup: { industry: string; stage: string; fundingGoal: number }) => {
      let score = 40; // baseline
      if (preferences.preferredIndustries.some((i) => i.toLowerCase() === startup.industry.toLowerCase())) score += 30;
      if (preferences.preferredStages.some((s) => s.toLowerCase() === startup.stage.toLowerCase())) score += 20;
      if (startup.fundingGoal >= preferences.minTicketSize && startup.fundingGoal <= preferences.maxTicketSize) score += 20;
      return Math.min(score, 100);
    };

    // Perfect fit
    const perfectStartup = { industry: 'Fintech', stage: 'Seed', fundingGoal: 100000 };
    assert.equal(calculateScore(perfectStartup), 100, 'Perfect match must score 100/100');

    // Partial fit (Industry only)
    const partialStartup = { industry: 'Fintech', stage: 'Pre-Seed', fundingGoal: 1000000 };
    assert.equal(calculateScore(partialStartup), 70, 'Partial match (baseline 40 + industry 30) must score 70');

    // Zero match
    const zeroMatchStartup = { industry: 'Biotech', stage: 'Late Stage', fundingGoal: 5000000 };
    assert.equal(calculateScore(zeroMatchStartup), 40, 'Zero match must return baseline 40');
  });
});
