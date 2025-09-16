-- Add collection and sizes fields to products table
ALTER TABLE products ADD COLUMN collection TEXT;
ALTER TABLE products ADD COLUMN sizes TEXT[] DEFAULT '{}';