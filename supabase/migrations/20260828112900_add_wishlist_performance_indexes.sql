-- Add performance indexes to wishlist_items table
-- Improves query performance for user-specific wishlist queries and sorting

-- Index for user-specific queries (filters by user_id)
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id
  ON public.wishlist_items(user_id);

-- Index for ordering by creation date (supports ORDER BY created_at DESC)
CREATE INDEX IF NOT EXISTS idx_wishlist_items_created_at
  ON public.wishlist_items(created_at DESC);

-- Composite index for optimal performance with both user_id and created_at
-- This is the most critical index for the current query pattern
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_created
  ON public.wishlist_items(user_id, created_at DESC);
