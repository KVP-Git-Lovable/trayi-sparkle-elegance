// Port of the POS `schemeEvaluationEngine` so the storefront prices match
// exactly what Catalog Master shows for the same product.

export type DiscountBasis =
  | "product_price"
  | "dia_charge"
  | "making_charge"
  | "total_eligible";

export type Scheme = {
  id: string;
  name: string;
  description?: string | null;
  discount_type: string;
  discount_value: number;
  max_discount_amount: number | null;
  status: string;
  start_date: string;
  end_date: string;
  priority: number;
  rule_type: string;
  target_categories?: string[] | null;
  target_products?: string[] | null;
  dia_charge_min?: number | null;
  dia_charge_max?: number | null;
  making_charge_min?: number | null;
  making_charge_max?: number | null;
  price_min?: number | null;
  price_max?: number | null;
  discount_basis: DiscountBasis;
};

export type ProductSchemeContext = {
  productId: string;
  productName: string;
  category: string;
  basePrice: number;
  diaCharge?: number;
  makingCharge?: number;
};

function schemeAppliesToProduct(scheme: Scheme, product: ProductSchemeContext): boolean {
  const today = new Date().toISOString().split("T")[0];

  if (scheme.status !== "active") return false;
  if (scheme.start_date && today < scheme.start_date) return false;
  if (scheme.end_date && today > scheme.end_date) return false;

  switch (scheme.rule_type) {
    case "generic":
      return true;

    case "category":
      return (scheme.target_categories || []).includes(product.category);

    case "category_dia": {
      if (!scheme.target_categories?.includes(product.category)) return false;
      if (!product.diaCharge) return false;
      const min = scheme.dia_charge_min ?? 0;
      const max = scheme.dia_charge_max ?? Infinity;
      return product.diaCharge >= min && product.diaCharge <= max;
    }

    case "category_making": {
      if (!scheme.target_categories?.includes(product.category)) return false;
      if (!product.makingCharge) return false;
      const min = scheme.making_charge_min ?? 0;
      const max = scheme.making_charge_max ?? Infinity;
      return product.makingCharge >= min && product.makingCharge <= max;
    }

    case "category_price": {
      if (!scheme.target_categories?.includes(product.category)) return false;
      const min = scheme.price_min ?? 0;
      const max = scheme.price_max ?? Infinity;
      return product.basePrice >= min && product.basePrice <= max;
    }

    case "product":
      return (scheme.target_products || []).includes(product.productId);

    default:
      return false;
  }
}

/** Discount produced by a scheme for a given basis amount (mirrors POS). */
export function calculateDiscount(scheme: Scheme, discountBasis: number): number {
  let discount = 0;

  switch (scheme.discount_type) {
    case "percentage":
    case "tiered":
    case "cashback":
      discount = (discountBasis * scheme.discount_value) / 100;
      break;
    case "fixed":
    case "buy_x_get_y":
    case "bundle":
    case "second_at_discount":
      discount = scheme.discount_value;
      break;
    case "free_shipping":
      discount = 0;
      break;
    default:
      discount = 0;
  }

  if (scheme.max_discount_amount != null && discount > scheme.max_discount_amount) {
    discount = scheme.max_discount_amount;
  }

  return Math.max(0, discount);
}

function getDiscountBasisAmount(basis: DiscountBasis, product: ProductSchemeContext): number {
  switch (basis) {
    case "dia_charge":
      return product.diaCharge || 0;
    case "making_charge":
      return product.makingCharge || 0;
    case "total_eligible":
      return (product.basePrice || 0) + (product.diaCharge || 0) + (product.makingCharge || 0);
    case "product_price":
    default:
      return product.basePrice;
  }
}

const SPECIFICITY: Record<string, number> = {
  product: 5,
  category_dia: 4,
  category_making: 4,
  category_price: 4,
  category: 3,
  generic: 1,
};

export function evaluateApplicableSchemes(
  product: ProductSchemeContext,
  schemes: Scheme[],
): { scheme: Scheme; discountAmount: number; effectivePrice: number } | null {
  const applicable = schemes.filter((s) => schemeAppliesToProduct(s, product));
  if (applicable.length === 0) return null;

  const sorted = [...applicable].sort((a, b) => {
    if ((a.priority ?? 0) !== (b.priority ?? 0)) return (b.priority ?? 0) - (a.priority ?? 0);
    return (SPECIFICITY[b.rule_type] || 0) - (SPECIFICITY[a.rule_type] || 0);
  });

  const winning = sorted[0];
  const basisAmount = getDiscountBasisAmount(winning.discount_basis, product);
  const discountAmount = calculateDiscount(winning, basisAmount);

  let effectivePrice = product.basePrice;
  if (winning.discount_basis === "product_price") {
    effectivePrice = product.basePrice - discountAmount;
  }

  return { scheme: winning, discountAmount, effectivePrice: Math.max(0, effectivePrice) };
}

/**
 * Apply an already-matched scheme to another price (e.g. a selected variant),
 * so the detail page and the listing stay consistent.
 */
export function applySchemeToPrice(
  scheme: Scheme,
  price: number,
): { discountAmount: number; effectivePrice: number } {
  if (scheme.discount_basis !== "product_price") {
    return { discountAmount: 0, effectivePrice: price };
  }
  const discountAmount = Math.min(calculateDiscount(scheme, price), price);
  return { discountAmount, effectivePrice: Math.max(0, price - discountAmount) };
}
