-- Migration: Add image_urls column to products table
-- Run this SQL to add support for multiple product images

ALTER TABLE products ADD COLUMN image_urls JSON NOT NULL DEFAULT ('[]');

-- Optional: Migrate existing image_url to image_urls array
UPDATE products SET image_urls = JSON_ARRAY(image_url) WHERE image_url != '' AND image_url IS NOT NULL;

-- Migration: Create visitors table for tracking page views
-- Run this SQL to add visitor tracking support

CREATE TABLE IF NOT EXISTS visitors (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  page_url VARCHAR(500) NOT NULL DEFAULT '',
  referrer VARCHAR(500) NOT NULL DEFAULT '',
  country VARCHAR(100) NOT NULL DEFAULT '',
  city VARCHAR(100) NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  session_id VARCHAR(100) NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_session_id (session_id),
  INDEX idx_created_at (created_at),
  INDEX idx_page_url (page_url)
);
