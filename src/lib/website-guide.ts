/**
 * Website Usage Guide for AI Chat
 *
 * Curated, verified how-to knowledge about using the Trayi Jewellery website.
 * Included in the AI assistant's trusted context so it can answer
 * "how do I..." questions accurately. Static content — no DB calls.
 */

export const WEBSITE_GUIDE: Record<string, string> = {
  add_to_wishlist:
    'To add an item to your wishlist: click the heart icon at the top-right of any product card, or open the product page and click the "Wishlist" button (heart icon) below the Add to Bag / Buy Now buttons. You must be signed in — if you are logged out, you will be redirected to the login page first. Click the heart again to remove the item. View all saved pieces on the Wishlist page (accessible from your account/menu).',
  add_to_bag:
    'To add a product to your bag: open the product page, choose your preferred purity (e.g. 14 KT / 18 KT), metal colour (Rose Gold, Yellow Gold, White Gold) and size (where applicable), set the quantity with the − / + selector, then click "Add to Bag". A confirmation appears and the item is added to your cart.',
  buy_now:
    'The "Buy Now" button on a product page adds the selected item to your bag and takes you straight to the cart to complete your purchase.',
  share_product:
    'The "Share" button on a product page opens your device\'s share options (or copies the product link) so you can share the piece with others.',
  ask_for_price:
    'The "Ask for Price" button on a product page (next to Share) submits a price request for that product through the AI Assistant chat. Our team receives the request and will get back to you shortly.',
  browse_collections:
    'Browse jewellery via the Collections page, or go directly to a category such as Rings, Earrings, Pendants, Necklaces, Bracelets, Tanmaniya or Nose Pins (e.g. /collections/rings). Category pages support filters like price, purity, metal colour, size and carat range (filter availability can vary).',
  search:
    'Use the search icon in the site header to open the search dialog and quickly find products or jump to a category.',
  account:
    'Create an account or sign in from the Login page (person icon in the header). An account is required for the wishlist and lets you track your details. Logged-out visitors can still browse, chat with the AI Assistant, and add items to the bag.',
  cart_checkout:
    'Open your bag/cart from the header to review items, adjust quantities or remove pieces, and proceed to checkout.',
  support:
    'For anything else — order help, returns, custom requests — contact us at support@trayi.com.',
};
