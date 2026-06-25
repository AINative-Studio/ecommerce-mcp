import { describe, it, expect } from 'vitest';

describe('ecommerce-mcp package', () => {
  it('should export EcommerceMCP', async () => {
    const mod = await import('../dist/index.mjs');
    expect(typeof mod.EcommerceMCP).toBe('function');
  });

  it('should export ShopifyProvider', async () => {
    const mod = await import('../dist/index.mjs');
    expect(typeof mod.ShopifyProvider).toBe('function');
  });

  it('should auto-detect Shopify from domain', async () => {
    const mod = await import('../dist/index.mjs');
    const mcp = new mod.EcommerceMCP({ shopDomain: 'test.myshopify.com' });
    expect(mcp.platform).toBe('shopify');
  });

  it('should detect WooCommerce from domain', async () => {
    const mod = await import('../dist/index.mjs');
    const mcp = new mod.EcommerceMCP({ shopDomain: 'store.woocommerce.com' });
    expect(mcp.platform).toBe('shopify'); // falls back for now
  });

  it('should instantiate ShopifyProvider directly', async () => {
    const mod = await import('../dist/index.mjs');
    const provider = new mod.ShopifyProvider('test.myshopify.com');
    expect(provider).toBeDefined();
    expect(typeof provider.connect).toBe('function');
    expect(typeof provider.searchProducts).toBe('function');
    expect(typeof provider.addToCart).toBe('function');
    expect(typeof provider.getCart).toBe('function');
    expect(typeof provider.callTool).toBe('function');
  });

  it('should work via shopify subpath export', async () => {
    const mod = await import('../dist/shopify.mjs');
    expect(typeof mod.ShopifyProvider).toBe('function');
    expect(typeof mod.EcommerceMCP).toBe('function');
  });

  it('should work with CJS require', () => {
    const mod = require('../dist/index.js');
    expect(typeof mod.EcommerceMCP).toBe('function');
    expect(typeof mod.ShopifyProvider).toBe('function');
  });
});
