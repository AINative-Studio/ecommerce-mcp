/**
 * Core types for ecommerce-mcp
 */

export type Platform = 'shopify' | 'woocommerce' | 'bigcommerce' | 'custom';

export interface EcommerceConfig {
  /** Store domain (e.g., 'store.myshopify.com') */
  shopDomain: string;
  /** Platform type (auto-detected from domain if not specified) */
  platform?: Platform;
  /** Custom MCP endpoint URL (overrides auto-detection) */
  mcpEndpoint?: string;
  /** API key for authenticated operations */
  apiKey?: string;
  /** AINative API key for ZeroMemory */
  ainativeApiKey?: string;
}

export interface EcommerceProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  imageUrl: string;
  url: string;
  available: boolean;
  variants?: Array<{
    id: string;
    title: string;
    price: string;
    available: boolean;
  }>;
}

export interface EcommerceCart {
  id: string;
  items: Array<{
    productId: string;
    variantId?: string;
    title: string;
    quantity: number;
    price: string;
  }>;
  total: string;
  checkoutUrl?: string;
}

export interface EcommerceProvider {
  platform: Platform;
  connect(): Promise<MCPTool[]>;
  searchProducts(query: string): Promise<EcommerceProduct[]>;
  addToCart(productId: string, variantId?: string, quantity?: number): Promise<EcommerceCart>;
  getCart(): Promise<EcommerceCart>;
  getCheckoutUrl(): Promise<string | null>;
  getOrderStatus(orderId: string): Promise<Record<string, unknown>>;
  callTool(name: string, args: Record<string, unknown>): Promise<unknown>;
}

export interface MCPConnection {
  endpoint: string;
  tools: MCPTool[];
  connected: boolean;
}

export interface MCPTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}
