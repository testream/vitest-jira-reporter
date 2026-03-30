import { describe, it, expect, beforeEach } from 'vitest';
import { Cart } from '../src/cart';

// ─────────────────────────────────────────────────────────────────────────────
// Cart tests
//
// These tests cover the core shopping-cart behaviour.
// A handful of tests are deliberately broken to demonstrate how Testream
// surfaces failures in the Jira dashboard (failure inspection, stack traces,
// and one-click Jira issue creation).
//
// Look for the "INTENTIONALLY FAILING" comments below.
// ─────────────────────────────────────────────────────────────────────────────

const APPLE = { id: 'prod-001', name: 'Apple', price: 120 }; // £1.20
const BANANA = { id: 'prod-002', name: 'Banana', price: 80 }; // £0.80

describe('Cart — adding items', () => {
  let cart: Cart;

  beforeEach(() => {
    cart = new Cart();
  });

  it('starts with an empty cart', () => {
    expect(cart.isEmpty()).toBe(true);
  });

  it('adds a new item with default quantity of 1', () => {
    cart.addItem(APPLE);
    const items = cart.getItems();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ ...APPLE, quantity: 1 });
  });

  it('adds a new item with a specified quantity', () => {
    cart.addItem(APPLE, 3);
    expect(cart.getItems()[0].quantity).toBe(3);
  });

  it('increments quantity when the same item is added twice', () => {
    cart.addItem(APPLE, 2);
    cart.addItem(APPLE, 1);
    expect(cart.getItems()[0].quantity).toBe(3);
  });

  it('can hold multiple different items', () => {
    cart.addItem(APPLE);
    cart.addItem(BANANA);
    expect(cart.getItems()).toHaveLength(2);
  });

  it('throws when quantity is 0 or negative', () => {
    expect(() => cart.addItem(APPLE, 0)).toThrow('Quantity must be greater than zero');
    expect(() => cart.addItem(APPLE, -1)).toThrow('Quantity must be greater than zero');
  });
});

describe('Cart — removing items', () => {
  let cart: Cart;

  beforeEach(() => {
    cart = new Cart();
    cart.addItem(APPLE, 3);
  });

  it('decrements quantity when removing fewer than the stocked amount', () => {
    cart.removeItem(APPLE.id, 2);
    expect(cart.getItems()[0].quantity).toBe(1);
  });

  it('removes the item entirely when quantity reaches 0', () => {
    cart.removeItem(APPLE.id, 3);
    expect(cart.isEmpty()).toBe(true);
  });

  it('removes the item entirely when quantity removed exceeds stock', () => {
    cart.removeItem(APPLE.id, 99);
    expect(cart.isEmpty()).toBe(true);
  });

  it('throws when trying to remove an item that is not in the cart', () => {
    expect(() => cart.removeItem('does-not-exist')).toThrow('Item "does-not-exist" not found in cart');
  });
});

describe('Cart — totals', () => {
  let cart: Cart;

  beforeEach(() => {
    cart = new Cart();
  });

  it('returns 0 for an empty cart', () => {
    expect(cart.getTotal()).toBe(0);
  });

  it('calculates total correctly for a single item', () => {
    cart.addItem(APPLE, 2); // 2 × 120 = 240
    expect(cart.getTotal()).toBe(240);
  });

  it('calculates total correctly for multiple items', () => {
    cart.addItem(APPLE, 2); // 240
    cart.addItem(BANANA, 3); // 240
    expect(cart.getTotal()).toBe(480);
  });
});

describe('Cart — clear', () => {
  it('empties the cart', () => {
    const cart = new Cart();
    cart.addItem(APPLE);
    cart.addItem(BANANA);
    cart.clear();
    expect(cart.isEmpty()).toBe(true);
    expect(cart.getItems()).toHaveLength(0);
  });
});

describe('Cart — checkout', () => {
  it('returns items and total for a populated cart', () => {
    const cart = new Cart();
    cart.addItem(APPLE, 2);
    const result = cart.checkout();
    expect(result.total).toBe(240);
    expect(result.items).toHaveLength(1);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // INTENTIONALLY FAILING TEST
  //
  // This test asserts the wrong error message to simulate a real-world
  // regression. In Testream you will see the exact error diff, the full
  // stack trace, and you can open a Jira issue for it in one click.
  // ─────────────────────────────────────────────────────────────────────────
  it('throws a descriptive error when checking out an empty cart', () => {
    const cart = new Cart();
    expect(() => cart.checkout()).toThrow('Cannot check out with an empty cart');
  });
});
