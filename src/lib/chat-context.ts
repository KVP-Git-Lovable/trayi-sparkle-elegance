/**
 * Catalog Context Builder for AI Chat
 *
 * Retrieves trusted, verified product and website information
 * to ground AI responses in actual catalog data.
 *
 * Integrates catalog index for comprehensive attribute extraction
 * and search intent detection for intelligent context building.
 */

import { posSupabase } from './pos-supabase';
import {
  getCatalogIndex,
  getAllColors,
  getAllPurities,
  getAllSizes,
  getCaratRanges,
  getCollections,
  searchProductsByName,
} from './catalog-index';
import { analyzeSearchIntent, extractKeywords } from './search-intent';

export interface TrustedContext {
  globalAttributes?: {
    colors: string[];
    metals: string[];
    purities: string[];
    sizes: string[];
    caratRanges: string[];
  };
  products?: Array<{
    name: string;
    description: string;
    category: string;
    metal_options?: string[];
    purity_options?: string[];
    url: string;
  }>;
  collections?: Array<{
    name: string;
    productCount: number;
    examples: string[];
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
 * Intelligently builds context based on detected search intent:
 * - Attribute queries: Include all unique values (colors, purities, etc.)
 * - Product queries: Include matching product details
 * - Collection queries: Include collection info
 * - General queries: Include catalog stats and website info
 */
export async function buildTrustedContext(searchTerm?: string): Promise<TrustedContext> {
  const context: TrustedContext = {};

  // Detect search intent from query
  const intent = searchTerm ? analyzeSearchIntent(searchTerm) : null;

  // Build context based on intent
  try {
    switch (intent?.type) {
      case 'attribute':
        // For attribute queries, include all unique values
        if (intent.key === 'color') {
          context.globalAttributes = {
            colors: await getAllColors(),
            metals: await getAllColors(),
            purities: await getAllPurities(),
            sizes: await getAllSizes(),
            caratRanges: await getCaratRanges(),
          };
        } else if (intent.key === 'purity') {
          context.globalAttributes = {
            colors: await getAllColors(),
            metals: await getAllColors(),
            purities: await getAllPurities(),
            sizes: await getAllSizes(),
            caratRanges: await getCaratRanges(),
          };
        } else if (intent.key === 'size') {
          context.globalAttributes = {
            colors: await getAllColors(),
            metals: await getAllColors(),
            purities: await getAllPurities(),
            sizes: await getAllSizes(),
            caratRanges: await getCaratRanges(),
          };
        } else if (intent.key === 'carat') {
          context.globalAttributes = {
            colors: await getAllColors(),
            metals: await getAllColors(),
            purities: await getAllPurities(),
            sizes: await getAllSizes(),
            caratRanges: await getCaratRanges(),
          };
        } else {
          // Default to all attributes
          context.globalAttributes = {
            colors: await getAllColors(),
            metals: await getAllColors(),
            purities: await getAllPurities(),
            sizes: await getAllSizes(),
            caratRanges: await getCaratRanges(),
          };
        }
        break;

      case 'collection':
        // For collection queries, include collection info
        const allCollections = await getCollections();
        context.collections = allCollections.map(c => ({
          name: c.name,
          productCount: c.count,
          examples: c.examples,
        }));
        context.globalAttributes = {
          colors: await getAllColors(),
          metals: await getAllColors(),
          purities: await getAllPurities(),
          sizes: await getAllSizes(),
          caratRanges: await getCaratRanges(),
        };
        break;

      case 'product':
        // For product queries, search for matching products
        if (intent.query) {
          context.products = await searchProducts(intent.query);
        }
        context.globalAttributes = {
          colors: await getAllColors(),
          metals: await getAllColors(),
          purities: await getAllPurities(),
          sizes: await getAllSizes(),
          caratRanges: await getCaratRanges(),
        };
        break;

      default:
        // For general queries, include full context
        if (searchTerm) {
          context.products = await searchProducts(searchTerm);
        }
        context.globalAttributes = {
          colors: await getAllColors(),
          metals: await getAllColors(),
          purities: await getAllPurities(),
          sizes: await getAllSizes(),
          caratRanges: await getCaratRanges(),
        };
        context.collections = (await getCollections()).map(c => ({
          name: c.name,
          productCount: c.count,
          examples: c.examples,
        }));
    }

    // Always include catalog statistics and website info
    context.catalog_stats = await getCatalogStats();
    context.website_info = await getWebsiteInfo();
  } catch (error) {
    console.error('Error building trusted context:', error);
    // Fallback to basic context
    context.catalog_stats = await getCatalogStats();
    context.website_info = await getWebsiteInfo();
  }

  return context;
}
