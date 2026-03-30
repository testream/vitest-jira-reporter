import { describe, it, expect } from 'vitest';
import { applyPercentage, applyFixed, validateCoupon, applyCoupon } from '../src/discount';
import type { Coupon } from '../src/discount';

// ─────────────────────────────────────────────────────────────────────────────
// Discount tests
//
// See the "INTENTIONALLY FAILING" comment below for a test that is
// deliberately broken to demonstrate Testream failure inspection in Jira.
// ─────────────────────────────────────────────────────────────────────────────

/** A coupon that expires well in the future and has no minimum order. */
const validPercentageCoupon: Coupon = {
  code: 'SUMMER20',
  type: 'percentage',
  value: 20,
  expiresAt: new Date('2099-12-31'),
};

/** A fixed-amount coupon worth £5.00 (500 pence). */
const validFixedCoupon: Coupon = {
  code: 'SAVE500',
  type: 'fixed',
  value: 500,
  expiresAt: new Date('2099-12-31'),
};

describe('applyPercentage', () => {
  it('applies a 20% discount to a price', () => {
    expect(applyPercentage(1000, 20)).toBe(800);
  });

  it('applies a 0% discount (no change)', () => {
    expect(applyPercentage(1000, 0)).toBe(1000);
  });

  it('applies a 100% discount (free)', () => {
    expect(applyPercentage(1000, 100)).toBe(0);
  });

  it('clamps to 0 and never returns negative', () => {
    expect(applyPercentage(100, 100)).toBeGreaterThanOrEqual(0);
  });

  it('throws when percent is below 0', () => {
    expect(() => applyPercentage(1000, -1)).toThrow();
  });

  it('throws when percent exceeds 100', () => {
    expect(() => applyPercentage(1000, 101)).toThrow();
  });
});

describe('applyFixed', () => {
  it('subtracts a fixed amount from the price', () => {
    expect(applyFixed(1000, 300)).toBe(700);
  });

  it('clamps to 0 when discount exceeds price', () => {
    expect(applyFixed(200, 500)).toBe(0);
  });

  it('returns unchanged price for a £0 discount', () => {
    expect(applyFixed(1000, 0)).toBe(1000);
  });

  it('throws when discount amount is negative', () => {
    expect(() => applyFixed(1000, -1)).toThrow();
  });
});

describe('validateCoupon', () => {
  const now = new Date('2025-06-01T12:00:00Z');

  it('returns no errors for a valid percentage coupon', () => {
    expect(validateCoupon(validPercentageCoupon, 5000, now)).toHaveLength(0);
  });

  it('returns no errors for a valid fixed coupon', () => {
    expect(validateCoupon(validFixedCoupon, 5000, now)).toHaveLength(0);
  });

  it('reports an error when the coupon has expired', () => {
    const expired: Coupon = { ...validPercentageCoupon, expiresAt: new Date('2020-01-01') };
    const errors = validateCoupon(expired, 5000, now);
    expect(errors).toContain('Coupon has expired');
  });

  it('reports an error when the minimum order value is not met', () => {
    const coupon: Coupon = { ...validPercentageCoupon, minOrderValue: 10000 };
    const errors = validateCoupon(coupon, 5000, now);
    expect(errors.some(e => e.includes('Minimum order value'))).toBe(true);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // INTENTIONALLY FAILING TEST
  //
  // This test checks that an expired coupon with an unmet minimum order value
  // produces exactly 2 errors. The assertion says 3, which is wrong.
  // This simulates a developer adding a validation rule and forgetting to
  // update the test. Testream will flag this in Jira with the exact diff.
  // ─────────────────────────────────────────────────────────────────────────
  it('reports multiple errors for an expired coupon that also fails min order check', () => {
    const badCoupon: Coupon = {
      ...validPercentageCoupon,
      expiresAt: new Date('2020-01-01'),
      minOrderValue: 20000,
    };
    const errors = validateCoupon(badCoupon, 5000, now);
    // BUG: expects 3 errors but only 2 are returned (expired + min order)
    expect(errors).toHaveLength(3);
  });
});

describe('applyCoupon', () => {
  const now = new Date('2025-06-01T12:00:00Z');

  it('applies a valid percentage coupon', () => {
    expect(applyCoupon(1000, validPercentageCoupon, now)).toBe(800); // 20% off
  });

  it('applies a coupon with a minimum order value when met', () => {
    const couponWithMin: Coupon = { ...validPercentageCoupon, minOrderValue: 5000 };
    expect(applyCoupon(10000, couponWithMin, now)).toBe(8000);
  });

  it('applies a valid fixed coupon', () => {
    expect(applyCoupon(1000, validFixedCoupon, now)).toBe(500); // £5.00 off
  });

  it('throws when an expired coupon is applied', () => {
    const expired: Coupon = { ...validPercentageCoupon, expiresAt: new Date('2020-01-01') };
    expect(() => applyCoupon(1000, expired, now)).toThrow('Coupon has expired');
  });
});
