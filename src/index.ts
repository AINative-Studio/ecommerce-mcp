/**
 * ecommerce-mcp — Universal MCP client for ecommerce platforms
 *
 * Connect AI agents to Shopify, WooCommerce, BigCommerce, and more.
 * Product search, cart management, checkout, and order tracking via
 * Model Context Protocol (MCP).
 *
 * @example
 * ```typescript
 * import { EcommerceMCP } from 'ecommerce-mcp';
 *
 * // Shopify (auto-detected from domain)
 * const mcp = new EcommerceMCP({ shopDomain: 'my-store.myshopify.com' });
 * await mcp.connect();
 *
 * const products = await mcp.searchProducts('winter jackets');
 * const cart = await mcp.addToCart(products[0].id);
 * const checkout = await mcp.getCheckoutUrl();
 * ```
 */

export { EcommerceMCP } from './ecommerce-mcp';
export { ShopifyProvider } from './providers/shopify';
export { ZeroCommerceProvider } from './providers/zerocommerce';
export type {
  EcommerceConfig,
  EcommerceProduct,
  EcommerceCart,
  EcommerceProvider,
  MCPConnection,
} from './types';
