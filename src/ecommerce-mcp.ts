/**
 * EcommerceMCP — Universal MCP client for ecommerce platforms
 *
 * Auto-detects platform from domain and connects to the right MCP endpoint.
 * Currently supports Shopify, with WooCommerce and BigCommerce coming soon.
 */

import { ShopifyProvider } from './providers/shopify';
import type {
  EcommerceConfig,
  EcommerceProduct,
  EcommerceCart,
  EcommerceProvider,
  Platform,
  MCPTool,
} from './types';

export class EcommerceMCP {
  private provider: EcommerceProvider;
  private connected = false;

  constructor(config: EcommerceConfig) {
    const platform = config.platform || detectPlatform(config.shopDomain);
    this.provider = createProvider(platform, config);
  }

  /** Connect to the store's MCP endpoint and discover available tools. */
  async connect(): Promise<MCPTool[]> {
    const tools = await this.provider.connect();
    this.connected = true;
    return tools;
  }

  /** Search for products using natural language. */
  async searchProducts(query: string): Promise<EcommerceProduct[]> {
    if (!this.connected) await this.connect();
    return this.provider.searchProducts(query);
  }

  /** Add a product to the cart. */
  async addToCart(
    productId: string,
    variantId?: string,
    quantity?: number,
  ): Promise<EcommerceCart> {
    if (!this.connected) await this.connect();
    return this.provider.addToCart(productId, variantId, quantity);
  }

  /** Get the current cart. */
  async getCart(): Promise<EcommerceCart> {
    if (!this.connected) await this.connect();
    return this.provider.getCart();
  }

  /** Get the checkout URL. */
  async getCheckoutUrl(): Promise<string | null> {
    if (!this.connected) await this.connect();
    return this.provider.getCheckoutUrl();
  }

  /** Get order status by ID. */
  async getOrderStatus(
    orderId: string,
  ): Promise<Record<string, unknown>> {
    if (!this.connected) await this.connect();
    return this.provider.getOrderStatus(orderId);
  }

  /** Call any MCP tool directly. */
  async callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    if (!this.connected) await this.connect();
    return this.provider.callTool(name, args);
  }

  /** Get the detected/configured platform. */
  get platform(): Platform {
    return this.provider.platform;
  }
}

function detectPlatform(domain: string): Platform {
  if (domain.includes('myshopify.com') || domain.includes('shopify'))
    return 'shopify';
  if (domain.includes('woocommerce') || domain.includes('wordpress'))
    return 'woocommerce';
  if (domain.includes('bigcommerce')) return 'bigcommerce';
  return 'shopify'; // Default to Shopify (largest platform)
}

function createProvider(
  platform: Platform,
  config: EcommerceConfig,
): EcommerceProvider {
  switch (platform) {
    case 'shopify':
      return new ShopifyProvider(config.shopDomain, config.mcpEndpoint);
    case 'woocommerce':
    case 'bigcommerce':
      // Coming soon — fall through to Shopify for now
      console.warn(
        `${platform} support coming soon. Using Shopify provider as fallback.`,
      );
      return new ShopifyProvider(config.shopDomain, config.mcpEndpoint);
    default:
      return new ShopifyProvider(config.shopDomain, config.mcpEndpoint);
  }
}
