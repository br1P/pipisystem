-- Complete database setup script for POS app
-- Run this in Supabase SQL Editor in the correct order

-- 1. Create tables
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price > 0),
  stock INTEGER NOT NULL CHECK (stock >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL CHECK (total >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);

-- 3. Disable RLS for development (enable in production with proper policies)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;

-- 4. Grant permissions
GRANT ALL ON products TO anon;
GRANT ALL ON sales TO anon;
GRANT USAGE ON SEQUENCE sales_id_seq TO anon;

-- 5. Create the process_sale function
CREATE OR REPLACE FUNCTION process_sale(cart_items jsonb, total numeric)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  item jsonb;
  product_id text;
  qty int;
BEGIN
  -- Validate stock for all items first
  FOR item IN SELECT * FROM jsonb_array_elements(cart_items)
  LOOP
    product_id := item->>'productId';
    qty := (item->>'quantity')::int;

    -- Check if product exists and has sufficient stock
    IF NOT EXISTS (SELECT 1 FROM products WHERE id = product_id AND stock >= qty) THEN
      RAISE EXCEPTION 'Insufficient stock or product not found for product %', product_id;
    END IF;
  END LOOP;

  -- Deduct stock for all items
  FOR item IN SELECT * FROM jsonb_array_elements(cart_items)
  LOOP
    product_id := item->>'productId';
    qty := (item->>'quantity')::int;

    UPDATE products SET stock = stock - qty WHERE id = product_id;
  END LOOP;

  -- Register the sale
  INSERT INTO sales (items, total, created_at) VALUES (cart_items, total, now());
END;
$$;

-- 6. Insert sample data
INSERT INTO products (name, price, stock) VALUES
  ('Café Americano', 2.50, 100),
  ('Café Latte', 4.00, 50),
  ('Croissant', 3.25, 30),
  ('Torta de Chocolate', 5.50, 20),
  ('Jugo de Naranja', 3.00, 40),
  ('Sándwich de Jamón', 6.75, 25),
  ('Té Verde', 2.75, 60),
  ('Muffin de Arándanos', 3.50, 35)
ON CONFLICT (id) DO NOTHING;
