/**
 * Catalog Context Builder for AI Chat
 *
 * Retrieves trusted, verified product and website information
 * to ground AI responses in actual catalog data.
 *
 * Never sends entire catalog - only relevant context for the user's query.
 */

import { posSupabase } from './pos-supabase';

export interface TrustedContext {
  products?: Array<{
    name: string;
    description: string;
    category: string;
    metal_options?: string[];
    purity_options?: string[];
    url: string;
  }>;
  website_info?: {
    shipping?: string;
    returns?: string;
    payment?: string;
    contact?: string;
    collections?: string[];
  };
}

/**
 * Search catalog for products matching user query
 * Returns only top 3-5 relevant results to avoid overwhelming context
 */
async function searchProducts(searchTerm?: string): Promise<TrustedContext['products']> {
  if (!searchTerm || searchTerm.length < 2) {
    return undefined;
  }

  try {
    const { data, error } = await posSupabase
      .from('catalog_products')
      .select('id, title, description, product_type, options')
      .ilike('title', `%${searchTerm}%`)
      .limit(5);

    if (error || !data) {
      console.warn('Product search failed:', error);
      return undefined;
    }

    return data.map((product: any) => {
      // Extract metal and purity options
      const metals: string[] = [];
      const purities: string[] = [];

      if (product.options) {
        Object.entries(product.options).forEach(([key, values]: [string, any]) => {
          const keyLower = key.toLowerCase();
          if (
            keyLower.includes('color') ||
            keyLower.includes('metal') ||
            keyLower.includes('colour')
          ) {
            if (Array.isArray(values)) metals.push(...values);
          }
          if (
            keyLower.includes('purity') ||
            keyLower.includes('karat') ||
            keyLower.includes('kt')
          ) {
            if (Array.isArray(values)) purities.push(...values);
          }
        });
      }

      return {
        name: product.title,
        description: product.description || '',
        category: product.product_type || 'jewelry',
        metal_options: metals.length > 0 ? metals : undefined,
        purity_options: purities.length > 0 ? purities : undefined,
        url: `/product/${product.id}`,
      };
    });
  } catch (error) {
    console.error('Product search error:', error);
    return undefined;
  }
}

/**
 * Retrieve website configuration and policies
 * These are static, verified facts about the business
 */
async function getWebsiteInfo(): Promise<TrustedContext['website_info']> {
  try {
    const { data, error } = await posSupabase
      .from('website_config')
      .select('key, value')
      .in('key', [
        'shipping_info',
        'return_policy',
        'payment_info',
        'contact_email',
      ]);

    if (error || !data) {
      return {
        contact: 'support@trayi.com',
        shipping: 'Available worldwide',
        returns: 'Please contact support for return inquiries',
        payment: 'We accept major credit cards and digital payment methods',
      };
    }

    const config: Record<string, string> = {};
    data.forEach((item: any) => {
      config[item.key] = item.value;
    });

    return {
      shipping: config.shipping_info || 'Available worldwide',
      returns: config.return_policy || 'Please contact support for return inquiries',
      payment: config.payment_info || 'We accept major credit cards',
      contact: config.contact_email || 'support@trayi.com',
      collections: ['Rings', 'Earrings', 'Pendants', 'Necklaces', 'Bracelets'],
    };
  } catch (error) {
    console.error('Website config error:', error);
    return {
      contact: 'support@trayi.com',
      shipping: 'Available worldwide',
      returns: 'Please contact support for return inquiries',
      payment: 'We accept major credit cards and digital payment methods',
      collections: ['Rings', 'Earrings', 'Pendants', 'Necklaces', 'Bracelets'],
    };
  }
}

/**
 * Build complete trusted context for AI assistant
 *
 * This function retrieves only the context needed for the user's query,
 * avoiding the overhead of loading the entire catalog.
 */
export async function buildTrustedContext(
  searchTerm?: string
): Promise<TrustedContext> {
  const context: TrustedContext = {};

  // Search for products if user asked about something specific
  if (searchTerm) {
    context.products = await searchProducts(searchTerm);
  }

  // Always include website info (policies, contact, etc.)
  context.website_info = await getWebsiteInfo();

  return context;
}
