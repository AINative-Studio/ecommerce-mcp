#!/usr/bin/env node
/**
 * CLI for ecommerce-mcp
 *
 * Usage:
 *   npx ecommerce-mcp --shop my-store.myshopify.com
 *   npx ecommerce-mcp --shop my-store.myshopify.com search "winter jackets"
 */

import { EcommerceMCP } from './ecommerce-mcp';

const args = process.argv.slice(2);

function getArg(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

const shopDomain = getArg('shop') || getArg('domain');
const command = args.find((a) => !a.startsWith('--') && a !== shopDomain);
const query = args.slice(args.indexOf(command || '') + 1).join(' ');

if (!shopDomain) {
  console.log(`
ecommerce-mcp — Universal MCP client for ecommerce platforms

Usage:
  npx ecommerce-mcp --shop <domain> [command] [args]

Commands:
  tools                    List available MCP tools
  search <query>           Search products
  cart                     Show current cart
  order <id>               Get order status

Examples:
  npx ecommerce-mcp --shop my-store.myshopify.com tools
  npx ecommerce-mcp --shop my-store.myshopify.com search "blue sneakers"

Supported platforms: Shopify (auto-detected from domain)
Coming soon: WooCommerce, BigCommerce

Powered by AINative Studio — https://ainative.studio
`);
  process.exit(0);
}

async function main() {
  const mcp = new EcommerceMCP({ shopDomain: shopDomain! });

  console.log(`\nConnecting to ${shopDomain} (${mcp.platform})...`);
  const tools = await mcp.connect();
  console.log(`Connected — ${tools.length} MCP tools available\n`);

  if (!command || command === 'tools') {
    console.log('Available tools:');
    for (const tool of tools) {
      console.log(`  ${tool.name} — ${tool.description}`);
    }
  } else if (command === 'search') {
    const products = await mcp.searchProducts(query || 'popular products');
    console.log(`Found ${products.length} products:`);
    for (const p of products) {
      console.log(`  ${p.title} — ${p.currency} ${p.price}`);
      if (p.url) console.log(`    ${p.url}`);
    }
  } else if (command === 'cart') {
    const cart = await mcp.getCart();
    console.log('Cart:', JSON.stringify(cart, null, 2));
  } else if (command === 'order') {
    const status = await mcp.getOrderStatus(query);
    console.log('Order status:', JSON.stringify(status, null, 2));
  } else {
    console.log(`Unknown command: ${command}`);
  }
}

main().catch(console.error);
