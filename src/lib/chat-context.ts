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
  catalog_stats?: {
    total_products: number;
    total_collections: number;
    collection_names: string[];
  };
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
 * Searches by product name, collection type, and tags
 * Returns only top 5 relevant results to avoid overwhelming context
 */
async function searchProducts(searchTerm?: string): Promise<TrustedContext['products']> {
  if (!searchTerm || searchTerm.length < 2) {
    return undefined;
  }

  try {
    const searchPattern = `%${searchTerm}%`;

    // Search by product title, product_type (collection), or tags
    const { data, error } = await posSupabase
      .from('catalog_products')
      .select('id, title, description, product_type, options, tags')
      .or(
        `title.ilike.${searchPattern},product_type.ilike.${searchPattern},tags.cs.{"${searchTerm.toLowerCase()}"}`
      )
      .limit(5);

    if (error || !data) {
      console.warn('Product search failed:', error);
      return undefined;
    }

    // If no results, try broader search on just title
    if (data.length === 0) {
      const { data: titleData } = await posSupabase
        .from('catalog_products')
        .select('id, title, description, product_type, options')
        .ilike('title', searchPattern)
        .limit(5);

      if (!titleData) return undefined;
      data.push(...titleData);
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
 * Retrieve catalog statistics
 * Total product count and dynamically fetched collection information
 */
async function getCatalogStats(): Promise<TrustedContext['catalog_stats']> {
  try {
    // Get total product count
    const { count } = await posSupabase
      .from('catalog_products')
      .select('*', { count: 'exact', head: true });

    // Get distinct collections from product_type field
    const { data: collectionData } = await posSupabase
      .from('catalog_products')
      .select('product_type', { count: 'exact' })
      .neq('product_type', null);

    // Extract unique collection names and sort them
    const collections = Array.from(
      new Set(
        collectionData
          ?.map((item: any) => item.product_type)
          .filter((type: string) => type && type.length > 0)
          .map((type: string) =>
            type
              .split('_')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ')
          ) || ['Rings', 'Earrings', 'Pendants', 'Necklaces', 'Bracelets']
      )
    ).sort();

    const finalCollections = collections.length > 0 ? collections : ['Rings', 'Earrings', 'Pendants', 'Necklaces', 'Bracelets'];

    return {
      total_products: count || 0,
      total_collections: finalCollections.length,
      collection_names: finalCollections,
    };
  } catch (error) {
    console.error('Catalog stats error:', error);
    return {
      total_products: 0,
      total_collections: 5,
      collection_names: ['Rings', 'Earrings', 'Pendants', 'Necklaces', 'Bracelets'],
    };
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
    };
  } catch (error) {
    console.error('Website config error:', error);
    return {
      contact: 'support@trayi.com',
      shipping: 'Available worldwide',
      returns: 'Please contact support for return inquiries',
      payment: 'We accept major credit cards and digital payment methods',
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

  // Always include catalog statistics (product count, collections)
  context.catalog_stats = await getCatalogStats();

  // Always include website info (policies, contact, etc.)
  context.website_info = await getWebsiteInfo();

  return context;
}
