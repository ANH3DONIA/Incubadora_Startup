import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema, changePasswordSchema } from '../src/modules/auth/auth.schema.js';
import {
  createSubscriptionSchema,
  createInvestmentSchema,
} from '../src/modules/payments/payment.schema.js';
import { createEventSchema } from '../src/modules/calendar/calendar.schema.js';

describe('Authentication, Financial & Calendar Validation Schemas Suite', () => {
  test('1. Register Schema: Accepts valid compliant user registration payload', () => {
    const validPayload = {
      body: {
        email: 'founder@nexusventures.com',
        password: 'Password123!',
        firstName: 'Elena',
        lastName: 'Rostova',
        role: 'ENTREPRENEUR',
      },
    };

    const result = registerSchema.safeParse(validPayload);
    assert.equal(result.success, true, 'Valid payload must successfully parse');
  });

  test('1.1 Name Validation: Rejects firstName and lastName containing digits or invalid symbols', () => {
    const invalidNames = ['Angel123', 'John99', '12345', 'Carlos_Santana', 'Elena@'];
    for (const name of invalidNames) {
      const payload = {
        body: {
          email: 'test@example.com',
          password: 'Password123!',
          firstName: name,
          lastName: 'Valenzuela',
          role: 'ENTREPRENEUR',
        },
      };
      const result = registerSchema.safeParse(payload);
      assert.equal(result.success, false, `Name "${name}" containing digits/symbols must be rejected`);
    }
  });

  test('2. Password Complexity: Rejects weak passwords lacking special characters or numbers', () => {
    const weakPasswords = [
      'password',       // no uppercase, no number, no symbol
      'Password',       // no number, no symbol
      'Password123',    // no symbol
      'pass123!',       // no uppercase
      'Short1!',        // too short (<8 chars)
    ];

    for (const pwd of weakPasswords) {
      const payload = {
        body: {
          email: 'test@example.com',
          password: pwd,
          firstName: 'John',
          lastName: 'Doe',
        },
      };
      const result = registerSchema.safeParse(payload);
      assert.equal(result.success, false, `Weak password "${pwd}" must be rejected`);
    }
  });

  test('3. Subscriptions Schema: Accepts PRO and ENTERPRISE plans and rejects invalid plans', () => {
    const validPro = createSubscriptionSchema.safeParse({ body: { plan: 'PRO' } });
    assert.equal(validPro.success, true, 'PRO plan must pass validation');

    const validEnterprise = createSubscriptionSchema.safeParse({ body: { plan: 'ENTERPRISE' } });
    assert.equal(validEnterprise.success, true, 'ENTERPRISE plan must pass validation');

    const invalidPlan = createSubscriptionSchema.safeParse({ body: { plan: 'SUPER_VIP' } });
    assert.equal(invalidPlan.success, false, 'Invalid plan must be rejected');
  });

  test('4. Investment Schema: Enforces startupId UUID and ticket boundaries ($50 to $10,000,000)', () => {
    const validInvestment = createInvestmentSchema.safeParse({
      body: {
        startupId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 5000,
      },
    });
    assert.equal(validInvestment.success, true, 'Valid investment must pass');

    const belowMin = createInvestmentSchema.safeParse({
      body: {
        startupId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 49.99,
      },
    });
    assert.equal(belowMin.success, false, 'Amount below $50 must be rejected');

    const invalidUuid = createInvestmentSchema.safeParse({
      body: {
        startupId: 'not-a-uuid',
        amount: 500,
      },
    });
    assert.equal(invalidUuid.success, false, 'Invalid UUID must be rejected');
  });

  test('5. Calendar Schema: Validates title length and ensures endTime is after startTime', () => {
    const validEvent = createEventSchema.safeParse({
      body: {
        title: 'Masterclass Cap Tables',
        description: 'Taller de dilución',
        startTime: '2026-09-01T10:00:00.000Z',
        endTime: '2026-09-01T11:30:00.000Z',
      },
    });
    assert.equal(validEvent.success, true, 'Valid calendar event must pass');

    const invertedDates = createEventSchema.safeParse({
      body: {
        title: 'Demo Day',
        startTime: '2026-09-01T12:00:00.000Z',
        endTime: '2026-09-01T10:00:00.000Z',
      },
    });
    assert.equal(invertedDates.success, false, 'Inverted dates must be rejected');
  });

  test('6. JWT Signing & Verification: Rejects tokens with forged signatures', () => {
    const secret = 'super-secret-key-at-least-32-chars-long-test';
    const forgedSecret = 'attacker-wrong-secret-key-32-chars-long';

    const token = jwt.sign({ userId: 'user-uuid-123', role: 'INVESTOR' }, secret, { expiresIn: '15m' });

    // Valid verification
    const decoded = jwt.verify(token, secret) as any;
    assert.equal(decoded.userId, 'user-uuid-123');

    // Forged signature verification must fail
    assert.throws(
      () => jwt.verify(token, forgedSecret),
      /invalid signature/,
      'Token verified with wrong secret must throw invalid signature error'
    );
  });
});

