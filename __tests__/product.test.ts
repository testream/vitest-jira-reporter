import { describe, it, expect } from 'vitest';
import { formatPrice, validateProduct, getDiscountedPrice, isInStock } from '../src/product';
import type { Product } from '../src/product';

// ─────────────────────────────────────────────────────────────────────────────
// Product tests
//
// See the "INTENTIONALLY FAILING" comment below for a test that is
// deliberately broken to demonstrate Testream failure inspection in Jira.
// ─────────────────────────────────────────────────────────────────────────────

const validProduct: Product = {
  id: 'prod-001',
  name: 'Wireless Headphones',
  price: 7999, // £79.99
  stock: 42,
  category: 'Electronics',
};

describe('formatPrice', () => {
  it('formats a price in USD by default', () => {
    expect(formatPrice(1999)).toBe('$19.99');
  });

  it('formats a price in GBP', () => {
    expect(formatPrice(7999, 'GBP', 'en-GB')).toBe('£79.99');
  });

  it('formats zero correctly', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('formats whole pounds/dollars without extra decimals', () => {
    expect(formatPrice(1000)).toBe('$10.00');
  });
});

describe('validateProduct', () => {
  it('returns no errors for a fully valid product', () => {
    expect(validateProduct(validProduct)).toHaveLength(0);
  });

  it('reports an error when id is missing', () => {
    const errors = validateProduct({ ...validProduct, id: '' });
    expect(errors).toContain('id is required');
  });

  it('reports an error when name is missing', () => {
    const errors = validateProduct({ ...validProduct, name: '' });
    expect(errors).toContain('name is required');
  });

  it('reports an error when price is negative', () => {
    const errors = validateProduct({ ...validProduct, price: -1 });
    expect(errors).toContain('price must be a non-negative number');
  });

  it('reports an error when stock is negative', () => {
    const errors = validateProduct({ ...validProduct, stock: -5 });
    expect(errors).toContain('stock must be a non-negative number');
  });

  it('reports an error when category is missing', () => {
    const errors = validateProduct({ ...validProduct, category: '' });
    expect(errors).toContain('category is required');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // INTENTIONALLY FAILING TEST
  //
  // This test checks behaviour when multiple required fields are absent.
  // The assertion count is wrong (expects 3, but only 2 fields are missing)
  // to simulate a test that drifted out of sync with the implementation.
  // Testream will show the expected vs received diff in Jira.
  // ─────────────────────────────────────────────────────────────────────────
  it('reports multiple errors when several required fields are missing', () => {
    const errors = validateProduct({ price: 999 }); // id, name, category all missing
    expect(errors).toHaveLength(4);
  });
});

describe('getDiscountedPrice', () => {
  it('applies a 10% discount correctly', () => {
    expect(getDiscountedPrice(1000, 10)).toBe(900);
  });

  it('applies a 50% discount correctly', () => {
    expect(getDiscountedPrice(1000, 50)).toBe(500);
  });

  it('applies a 100% discount (free item)', () => {
    expect(getDiscountedPrice(1000, 100)).toBe(0);
  });

  it('returns the original price for a 0% discount', () => {
    expect(getDiscountedPrice(1000, 0)).toBe(1000);
  });

  it('clamps price to 0 and never returns a negative value', () => {
    // The implementation already clamps, but a 100% discount should hit exactly 0
    expect(getDiscountedPrice(500, 100)).toBeGreaterThanOrEqual(0);
  });

  it('throws when discount percent is out of range', () => {
    expect(() => getDiscountedPrice(1000, -1)).toThrow();
    expect(() => getDiscountedPrice(1000, 101)).toThrow();
  });
});

describe('isInStock', () => {
  it('returns true when stock is greater than 0', () => {
    expect(isInStock(validProduct)).toBe(true);
  });

  it('returns true when stock equals 1', () => {
    expect(isInStock({ ...validProduct, stock: 1 })).toBe(true);
  });

  it('returns false when stock is 0', () => {
    expect(isInStock({ ...validProduct, stock: 0 })).toBe(false);
  });
});
