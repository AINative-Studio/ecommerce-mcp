# ecommerce-mcp

Universal MCP client for ecommerce platforms — connect AI agents to Shopify, WooCommerce, BigCommerce, and more.

[![npm](https://img.shields.io/npm/v/ecommerce-mcp)](https://www.npmjs.com/package/ecommerce-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What This Does

Connects any AI agent to any ecommerce store via the [Model Context Protocol](https://modelcontextprotocol.io/). One interface, multiple platforms.

```typescript
import { EcommerceMCP } from 'ecommerce-mcp';

const mcp = new EcommerceMCP({ shopDomain: 'my-store.myshopify.com' });
await mcp.connect();

const products = await mcp.searchProducts('winter jackets under $200');
const cart = await mcp.addToCart(products[0].id);
const checkoutUrl = await mcp.getCheckoutUrl();
```

## Why MCP for Ecommerce?

- **5.6M Shopify stores** already have MCP endpoints (`/api/mcp`) — deployed by default
- **Standard protocol** — no custom API wrappers, no platform-specific SDKs
- **AI-native** — designed for LLM tool calling, not human HTTP clients
- **"Agentic commerce"** — Google + Shopify's term for AI agents that shop autonomously

## Quick Start

```bash
npm install ecommerce-mcp
```

### As a Library

```typescript
import { EcommerceMCP } from 'ecommerce-mcp';

const mcp = new EcommerceMCP({
  shopDomain: 'store.myshopify.com',
  // platform auto-detected from domain
});

await mcp.connect();

// Search products
const products = await mcp.searchProducts('blue sneakers');

// Cart operations
const cart = await mcp.addToCart(products[0].id);
const fullCart = await mcp.getCart();
const checkout = await mcp.getCheckoutUrl();

// Order tracking
const order = await mcp.getOrderStatus('order-123');
```

### As a CLI

```bash
# List MCP tools available on a store
npx ecommerce-mcp --shop my-store.myshopify.com tools

# Search products
npx ecommerce-mcp --shop my-store.myshopify.com search "running shoes"

# Check cart
npx ecommerce-mcp --shop my-store.myshopify.com cart
```

### Direct Shopify Provider

```typescript
import { ShopifyProvider } from 'ecommerce-mcp/shopify';

const shopify = new ShopifyProvider('my-store.myshopify.com');
await shopify.connect();
const products = await shopify.searchProducts('snowboards');
```

## Supported Platforms

| Platform | Status | MCP Endpoint |
|----------|--------|-------------|
| **Shopify** | Supported | `/api/mcp` (all 5.6M stores) |
| **WooCommerce** | Coming Soon | Custom plugin |
| **BigCommerce** | Coming Soon | API adapter |
| **Custom** | Via `mcpEndpoint` option | Any MCP-compatible endpoint |

## MCP Tools (Shopify)

| Tool | What it does |
|------|-------------|
| `search_catalog` | Natural language product search |
| `update_cart` | Add/remove/update cart items |
| `get_cart` | View current cart |
| `search_shop_policies_and_faqs` | Store policies, shipping, returns |
| `get_order_status` | Look up a specific order |
| `get_most_recent_order_status` | Check latest order |

## Use with AI Agents

Combine with [shopify-ai-agent](https://www.npmjs.com/package/shopify-ai-agent) for a complete AI shopping experience with ZeroMemory (persistent shopper context):

```typescript
import { ShopifyAIAgent } from 'shopify-ai-agent';

const agent = new ShopifyAIAgent({
  apiKey: process.env.AINATIVE_API_KEY,
  shopDomain: 'my-store.myshopify.com',
});

const r = await agent.chat('I need winter boots, size 10');
// Agent searches via MCP, remembers size preference via ZeroMemory
```

## Configuration

```typescript
const mcp = new EcommerceMCP({
  shopDomain: 'store.myshopify.com',   // Required
  platform: 'shopify',                  // Auto-detected from domain
  mcpEndpoint: 'https://custom/mcp',   // Override auto-detection
  apiKey: 'for-authenticated-ops',      // For customer operations
  ainativeApiKey: 'for-zeromemory',     // Optional: persistent context
});
```

## Links

- [Model Context Protocol](https://modelcontextprotocol.io/) — The standard
- [Shopify MCP Docs](https://shopify.dev/docs/apps/build/storefront-mcp) — Shopify's implementation
- [AINative Studio](https://ainative.studio) — Multi-provider AI gateway
- [shopify-ai-agent](https://www.npmjs.com/package/shopify-ai-agent) — Full AI agent with memory

## License

MIT

Built by [AINative Studio](https://ainative.studio)
