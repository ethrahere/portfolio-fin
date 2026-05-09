// Strip protocol and trailing slash so the env var is forgiving
const rawDomain = import.meta.env.VITE_SHOPIFY_DOMAIN ?? '';
const SHOPIFY_DOMAIN = rawDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
const SHOPIFY_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN ?? '';

export const shopifyConfigured = !!(SHOPIFY_DOMAIN && SHOPIFY_TOKEN);

console.log('[Shopify] configured:', shopifyConfigured, '| domain:', SHOPIFY_DOMAIN || '(not set)');

async function gql(query: string, variables?: Record<string, unknown>) {
  const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalAmount: { amount: string; currencyCode: string };
}

const CART_FIELDS = `
  id checkoutUrl
  cost { totalAmount { amount currencyCode } }
`;

// Accepts plain numeric IDs or full GIDs
export function normalizeVariantId(id: string): string {
  if (id.startsWith('gid://')) return id;
  if (/^\d+$/.test(id.trim())) return `gid://shopify/ProductVariant/${id.trim()}`;
  return id.trim();
}

export async function createShopifyCart(
  lines: { variantId: string; quantity: number }[]
): Promise<ShopifyCart> {
  const data = await gql(
    `mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart { ${CART_FIELDS} }
        userErrors { field message }
      }
    }`,
    {
      input: {
        lines: lines.map(l => ({
          merchandiseId: normalizeVariantId(l.variantId),
          quantity: l.quantity,
        })),
      },
    }
  );
  if (data.cartCreate.userErrors?.length) {
    throw new Error(data.cartCreate.userErrors[0].message);
  }
  return data.cartCreate.cart;
}
