/**
 * Comprehensive Catalog Index Builder
 *
 * Loads entire product catalog once and extracts:
 * - Unique attribute values (colors, metals, purities, sizes, carats)
 * - Searchable product maps
 * - Collection information with product counts
 *
 * Implements caching with 1-hour TTL for performance.
 */

import { posSupabase } from './pos-supabase';

interface CatalogIndex {
  colors: string[];
  metals: string[];
  purities: string[];
  sizes: string[];
  caratRanges: string[];
  collections: Map<string, { count: number; examples: string[] }>;
  productsByName: Map<string, any>;
  lastUpdated: number;
}

// Cache configuration
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds
let catalogCache: CatalogIndex | null = null;
let cacheTimestamp = 0;

/**
 * Extract unique metal/color options from all products
 */
function extractColors(products: any[]): Set<string> {
  const colors = new Set<string>();

  products.forEach(product => {
    if (product.options) {
      // Check common color field names
      const colorFields = ['Color', 'Colour', 'Metal', 'Metal Colour', 'Metal Color'];
      colorFields.forEach(field => {
        if (product.options[field] && Array.isArray(product.options[field])) {
          product.options[field].forEach((color: string) => {
            if (color && color.trim()) {
              colors.add(color.trim());
            }
          });
        }
      });
    }

    // Also check metalOptions if available
    if (product.metalOptions && Array.isArray(product.metalOptions)) {
      product.metalOptions.forEach((metal: string) => {
        if (metal && metal.trim()) {
          colors.add(metal.trim());
        }
      });
    }
  });

  return colors;
}

/**
 * Extract unique purity options from all products
 */
function extractPurities(products: any[]): Set<string> {
  const purities = new Set<string>();

  products.forEach(product => {
    if (product.options) {
      // Check common purity field names
      const purityFields = ['Purity', 'Karat', 'KT', 'kt', 'Metal Purity'];
      purityFields.forEach(field => {
        if (product.options[field] && Array.isArray(product.options[field])) {
          product.options[field].forEach((purity: string) => {
            if (purity && purity.trim()) {
              purities.add(purity.trim());
            }
          });
        }
      });
    }

    // Also check purityOptions if available
    if (product.purityOptions && Array.isArray(product.purityOptions)) {
      product.purityOptions.forEach((purity: string) => {
        if (purity && purity.trim()) {
          purities.add(purity.trim());
        }
      });
    }
  });

  return purities;
}

/**
 * Extract unique size options from all products
 */
function extractSizes(products: any[]): Set<string> {
  const sizes = new Set<string>();

  products.forEach(product => {
    if (product.options) {
      // Check common size field names
      const sizeFields = ['Size', 'Ring Size', 'Length', 'Dimensions'];
      sizeFields.forEach(field => {
        if (product.options[field] && Array.isArray(product.options[field])) {
          product.options[field].forEach((size: string) => {
            if (size && size.trim()) {
              sizes.add(size.trim());
            }
          });
        }
      });
    }

    // Also check variants for sizes
    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach((variant: any) => {
        if (variant.size && variant.size.trim()) {
          sizes.add(variant.size.trim());
        }
      });
    }
  });

  return sizes;
}

/**
 * Extract carat ranges from products
 */
function extractCaratRanges(products: any[]): Set<string> {
  const carats = new Set<string>();
  const caratValues: number[] = [];

  products.forEach(product => {
    // Extract from diamondCt field if available
    if (product.diamondCt && typeof product.diamondCt === 'number') {
      caratValues.push(product.diamondCt);
    }

    // Extract from tags (e.g., "0.5ct", "1ct")
    if (product.tags && Array.isArray(product.tags)) {
      product.tags.forEach((tag: string) => {
        const match = tag.match(/(\d+\.?\d*)\s*ct/i);
        if (match) {
          caratValues.push(parseFloat(match[1]));
        }
      });
    }
  });

  // Create buckets
  if (caratValues.length > 0) {
    carats.add('Below 1 ct');
    carats.add('1-2 ct');
    carats.add('2-3 ct');
    carats.add('3 ct+');
  }

  return carats;
}

/**
 * Extract collection information
 */
function extractCollections(
  products: any[]
): Map<string, { count: number; examples: string[] }> {
  const collections = new Map<string, { count: number; examples: string[] }>();

  products.forEach(product => {
    if (product.product_type) {
      const collectionName = product.product_type
        .split('_')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      if (!collections.has(collectionName)) {
        collections.set(collectionName, { count: 0, examples: [] });
      }

      const collection = collections.get(collectionName)!;
      collection.count += 1;

      // Store first 3 product names as examples
      if (collection.examples.length < 3 && product.title) {
        collection.examples.push(product.title);
      }
    }
  });

  return collections;
}

/**
 * Build searchable product map by name
 */
function buildProductMap(products: any[]): Map<string, any> {
  const productMap = new Map<string, any>();

  products.forEach(product => {
    if (product.title) {
      const normalizedName = product.title.toLowerCase();
      productMap.set(normalizedName, {
        name: product.title,
        description: product.description || '',
        category: product.product_type || 'jewelry',
        metals: product.metalOptions || [],
        purities: product.purityOptions || [],
        price: product.base_price || product.display_price,
        carats: product.diamondCt || 0,
      });
    }
  });

  return productMap;
}

/**
 * Load and build the complete catalog index
 */
async function buildCatalogIndex(): Promise<CatalogIndex> {
  try {
    console.log('[Catalog Index] Starting build...');

    // Fetch all active products from POS database
    const { data, error, count } = await posSupabase
      .from('catalog_products')
      .select('id, title, description, product_type, options, variants, tags, base_price, display_price, diamondCt, metalOptions, purityOptions', { count: 'exact' })
      .eq('status', 'active')
      .limit(1000);

    if (error) {
      console.error('[Catalog Index] Database error:', error);
      throw error;
    }

    const products = data || [];
    console.log(`[Catalog Index] Fetched ${products.length} products (total count: ${count})`);

    if (products.length === 0) {
      console.warn('[Catalog Index] No products found, returning fallback data');
      return getDefaultIndex();
    }

    // Extract all attributes
    const colors = extractColors(products);
    const metals = extractColors(products); // Metals are same as colors
    const purities = extractPurities(products);
    const sizes = extractSizes(products);
    const caratRanges = extractCaratRanges(products);
    const collections = extractCollections(products);
    const productsByName = buildProductMap(products);

    console.log(`[Catalog Index] Extracted: ${colors.size} colors, ${purities.size} purities, ${sizes.size} sizes`);
    console.log(`[Catalog Index] Colors:`, Array.from(colors).join(', '));
    console.log(`[Catalog Index] Purities:`, Array.from(purities).join(', '));

    return {
      colors: Array.from(colors).sort(),
      metals: Array.from(metals).sort(),
      purities: Array.from(purities).sort(),
      sizes: Array.from(sizes).sort(),
      caratRanges: Array.from(caratRanges),
      collections,
      productsByName,
      lastUpdated: Date.now(),
    };
  } catch (error) {
    console.error('[Catalog Index] Build failed, using fallback:', error);
    return getDefaultIndex();
  }
}

/**
 * Get default/fallback catalog index
 * Used when database fetch fails
 */
function getDefaultIndex(): CatalogIndex {
  return {
    colors: ['Rose Gold', 'Yellow Gold', 'White Gold'],
    metals: ['Rose Gold', 'Yellow Gold', 'White Gold'],
    purities: ['9KT', '14KT', '18KT'],
    sizes: ['8', '9', '10', '11', '12', '13', '14', '15', '16'],
    caratRanges: ['Below 1 ct', '1-2 ct', '2-3 ct', '3 ct+'],
    collections: new Map([
      ['Rings', { count: 0, examples: ['Diamond Ring', 'Gold Ring'] }],
      ['Earrings', { count: 0, examples: ['Diamond Earrings', 'Gold Earrings'] }],
      ['Pendants', { count: 0, examples: ['Diamond Pendant', 'Gold Pendant'] }],
      ['Necklaces', { count: 0, examples: ['Diamond Necklace', 'Gold Necklace'] }],
      ['Bracelets', { count: 0, examples: ['Diamond Bracelet', 'Gold Bracelet'] }],
      ['Tanmaniya', { count: 0, examples: ['Tanmaniya'] }],
    ]),
    productsByName: new Map(),
    lastUpdated: Date.now(),
  };
}

/**
 * Get cached catalog index, building if necessary
 */
export async function getCatalogIndex(): Promise<CatalogIndex> {
  const now = Date.now();

  // Return cached index if still fresh
  if (catalogCache && now - cacheTimestamp < CACHE_TTL) {
    return catalogCache;
  }

  // Build new index
  catalogCache = await buildCatalogIndex();
  cacheTimestamp = now;

  return catalogCache;
}

/**
 * Get all unique metal/color options
 */
export async function getAllColors(): Promise<string[]> {
  const index = await getCatalogIndex();
  return index.colors;
}

/**
 * Get all unique purity options
 */
export async function getAllPurities(): Promise<string[]> {
  const index = await getCatalogIndex();
  return index.purities;
}

/**
 * Get all unique size options
 */
export async function getAllSizes(): Promise<string[]> {
  const index = await getCatalogIndex();
  return index.sizes;
}

/**
 * Get carat range buckets
 */
export async function getCaratRanges(): Promise<string[]> {
  const index = await getCatalogIndex();
  return index.caratRanges;
}

/**
 * Get all collections with product counts
 */
export async function getCollections(): Promise<
  Array<{ name: string; count: number; examples: string[] }>
> {
  const index = await getCatalogIndex();
  return Array.from(index.collections.entries()).map(([name, data]) => ({
    name,
    count: data.count,
    examples: data.examples,
  }));
}

/**
 * Search for products by name
 */
export async function searchProductsByName(query: string): Promise<any[]> {
  const index = await getCatalogIndex();
  const normalizedQuery = query.toLowerCase();
  const results: any[] = [];

  index.productsByName.forEach((product, name) => {
    if (name.includes(normalizedQuery)) {
      results.push(product);
    }
  });

  return results.slice(0, 5); // Return top 5 matches
}

/**
 * Invalidate the cache (e.g., after catalog update)
 */
export function invalidateCatalogCache(): void {
  catalogCache = null;
  cacheTimestamp = 0;
}

/**
 * Get cache status
 */
export function getCacheStatus(): {
  isCached: boolean;
  age: number;
  ttl: number;
} {
  const now = Date.now();
  const age = now - cacheTimestamp;
  const isCached = catalogCache !== null && age < CACHE_TTL;

  return {
    isCached,
    age,
    ttl: CACHE_TTL,
  };
}
