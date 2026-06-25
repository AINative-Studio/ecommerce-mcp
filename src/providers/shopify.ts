/**
 * Shopify Provider — MCP client for Shopify stores
 *
 * Connects to Shopify's native /api/mcp endpoint (available on all 5.6M stores).
 */

import type {
  EcommerceProvider,
  EcommerceProduct,
  EcommerceCart,
  MCPTool,
} from '../types';

export class ShopifyProvider implements EcommerceProvider {
  readonly platform = 'shopify' as const;
  private endpoint: string;
  private tools: MCPTool[] = [];

  constructor(shopDomain: string, mcpEndpoint?: string) {
    const baseUrl = shopDomain.startsWith('http')
      ? shopDomain
      : `https://${shopDomain}`;
    this.endpoint = mcpEndpoint || `${baseUrl}/api/mcp`;
  }

  async connect(): Promise<MCPTool[]> {
    const response = await this.jsonRpc('tools/list', {});
    const toolsData = (response.result as { tools?: Record<string, unknown>[] })?.tools || [];
    this.tools = toolsData.map((t) => ({
      name: t.name as string,
      description: t.description as string,
      input_schema: (t.inputSchema || t.input_schema || {}) as Record<string, unknown>,
    }));
    return this.tools;
  }

  async searchProducts(query: string): Promise<EcommerceProduct[]> {
    const toolName = this.tools.find(
      (t) => t.name === 'search_catalog' || t.name === 'search_shop_catalog',
    )?.name;
    if (!toolName) return [];

    const result = await this.callTool(toolName, { query });
    const content = result as { content?: Array<{ text: string }> };
    const text = content.content?.[0]?.text || JSON.stringify(result);

    try {
      const parsed = JSON.parse(text);
      return (parsed.products || []).map(
        (p: Record<string, unknown>): EcommerceProduct => {
          const priceRange = p.price_range as { min: { amount: number; currency: string }; max: { amount: number; currency: string } } | undefined;
          const desc = p.description as { html?: string } | string | undefined;
          const descText = typeof desc === 'string' ? desc : desc?.html || '';
          const media = p.media as Array<{ url: string }> | undefined;
          const amount = priceRange?.min?.amount;
          const cents = typeof amount === 'number' ? (amount / 100).toFixed(2) : '';
          return {
            id: (p.id as string) || '',
            title: (p.title as string) || '',
            description: descText,
            price: cents,
            currency: priceRange?.min?.currency || 'USD',
            imageUrl: media?.[0]?.url || '',
            url: (p.url as string) || '',
            available: true,
          };
        },
      );
    } catch {
      return [];
    }
  }

  async addToCart(
    productId: string,
    variantId?: string,
    quantity = 1,
  ): Promise<EcommerceCart> {
    const result = await this.callTool('update_cart', {
      product_id: productId,
      variant_id: variantId,
      quantity,
    });
    return this.parseCart(result);
  }

  async getCart(): Promise<EcommerceCart> {
    const result = await this.callTool('get_cart', {});
    return this.parseCart(result);
  }

  async getCheckoutUrl(): Promise<string | null> {
    const cart = await this.getCart();
    return cart.checkoutUrl || null;
  }

  async getOrderStatus(orderId: string): Promise<Record<string, unknown>> {
    return (await this.callTool('get_order_status', {
      order_id: orderId,
    })) as Record<string, unknown>;
  }

  async callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    const response = await this.jsonRpc('tools/call', {
      name,
      arguments: args,
    });
    return response.result || response;
  }

  private parseCart(result: unknown): EcommerceCart {
    const data = result as Record<string, unknown>;
    return {
      id: (data.cart_id as string) || '',
      items: [],
      total: '',
      checkoutUrl: (data.checkout_url as string) || undefined,
    };
  }

  private async jsonRpc(
    method: string,
    params: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const resp = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method, id: 1, params }),
    });
    if (!resp.ok) throw new Error(`MCP request failed: ${resp.status}`);
    return (await resp.json()) as Record<string, unknown>;
  }
}
