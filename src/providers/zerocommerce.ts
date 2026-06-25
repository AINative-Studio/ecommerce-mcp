/**
 * ZeroCommerce Provider — MCP client for ZeroCommerce stores
 *
 * Connects to ZeroCommerce API (FastAPI + ZeroDB backend).
 * 46 tools across catalog, orders, customers, analytics, store config, storefront.
 */

import type {
  EcommerceProvider,
  EcommerceProduct,
  EcommerceCart,
  MCPTool,
} from '../types';

export class ZeroCommerceProvider implements EcommerceProvider {
  readonly platform = 'custom' as const;
  private apiUrl: string;
  private apiKey: string;
  private storeSlug: string;
  private tools: MCPTool[] = [];

  constructor(shopDomain: string, apiKey?: string) {
    this.apiUrl = shopDomain.startsWith('http')
      ? shopDomain
      : `https://${shopDomain}`;
    this.apiKey = apiKey || process.env.ZEROCOMMERCE_API_KEY || '';
    // Extract store slug from domain
    this.storeSlug = shopDomain.replace(/https?:\/\//, '').split('.')[0];
  }

  async connect(): Promise<MCPTool[]> {
    // ZeroCommerce exposes tools via /mcp/tools endpoint
    try {
      const resp = await fetch(`${this.apiUrl}/mcp/tools`, {
        headers: this.headers(),
      });
      if (resp.ok) {
        const data = (await resp.json()) as { tools?: MCPTool[] };
        this.tools = data.tools || [];
      }
    } catch {
      // Fallback: define known tools statically
      this.tools = ZEROCOMMERCE_TOOLS;
    }
    return this.tools;
  }

  async searchProducts(query: string): Promise<EcommerceProduct[]> {
    const resp = await fetch(
      `${this.apiUrl}/api/v1/stores/${this.storeSlug}/products/search?q=${encodeURIComponent(query)}`,
      { headers: this.headers() },
    );
    if (!resp.ok) return [];
    const data = (await resp.json()) as { items?: Record<string, unknown>[] };
    return (data.items || []).map(formatProduct);
  }

  async addToCart(
    productId: string,
    variantId?: string,
    quantity = 1,
  ): Promise<EcommerceCart> {
    const resp = await fetch(
      `${this.apiUrl}/api/v1/stores/${this.storeSlug}/cart/items`,
      {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({
          product_id: productId,
          variant_id: variantId,
          quantity,
        }),
      },
    );
    const data = (await resp.json()) as Record<string, unknown>;
    return parseCart(data);
  }

  async getCart(): Promise<EcommerceCart> {
    const resp = await fetch(
      `${this.apiUrl}/api/v1/stores/${this.storeSlug}/cart`,
      { headers: this.headers() },
    );
    const data = (await resp.json()) as Record<string, unknown>;
    return parseCart(data);
  }

  async getCheckoutUrl(): Promise<string | null> {
    const cart = await this.getCart();
    return cart.checkoutUrl || null;
  }

  async getOrderStatus(orderId: string): Promise<Record<string, unknown>> {
    const resp = await fetch(
      `${this.apiUrl}/api/v1/stores/${this.storeSlug}/orders/${orderId}`,
      { headers: this.headers() },
    );
    return (await resp.json()) as Record<string, unknown>;
  }

  async callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    const resp = await fetch(`${this.apiUrl}/mcp/call`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ tool: name, arguments: args }),
    });
    return await resp.json();
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) h['Authorization'] = `Bearer ${this.apiKey}`;
    return h;
  }
}

function formatProduct(p: Record<string, unknown>): EcommerceProduct {
  return {
    id: (p.id as string) || '',
    title: (p.name as string) || (p.title as string) || '',
    description: (p.description as string) || '',
    price: String(p.price || ''),
    currency: (p.currency as string) || 'USD',
    imageUrl: (p.image_url as string) || '',
    url: (p.url as string) || '',
    available: (p.active as boolean) !== false,
  };
}

function parseCart(data: Record<string, unknown>): EcommerceCart {
  const items = (data.items as Array<Record<string, unknown>>) || [];
  return {
    id: (data.id as string) || (data.cart_id as string) || '',
    items: items.map((i) => ({
      productId: (i.product_id as string) || '',
      variantId: (i.variant_id as string) || undefined,
      title: (i.title as string) || (i.name as string) || '',
      quantity: (i.quantity as number) || 1,
      price: String(i.price || ''),
    })),
    total: String(data.total || ''),
    checkoutUrl: (data.checkout_url as string) || undefined,
  };
}

const ZEROCOMMERCE_TOOLS: MCPTool[] = [
  { name: 'list_products', description: 'List products in a store', input_schema: {} },
  { name: 'get_product', description: 'Get product details by ID', input_schema: {} },
  { name: 'create_product', description: 'Create a new product', input_schema: {} },
  { name: 'search_products', description: 'Search products by query', input_schema: {} },
  { name: 'list_orders', description: 'List orders for a store', input_schema: {} },
  { name: 'get_order', description: 'Get order details', input_schema: {} },
  { name: 'create_order', description: 'Create a new order', input_schema: {} },
  { name: 'list_customers', description: 'List customers', input_schema: {} },
  { name: 'get_customer', description: 'Get customer details', input_schema: {} },
  { name: 'get_sales_summary', description: 'Get sales analytics', input_schema: {} },
  { name: 'get_top_products', description: 'Get top-selling products', input_schema: {} },
  { name: 'get_store', description: 'Get store configuration', input_schema: {} },
];
