-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price > 0),
  stock INTEGER NOT NULL CHECK (stock >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL CHECK (total >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on products name for faster searches (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Create index on sales created_at for faster queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);

-- Enable Row Level Security (RLS) if needed for security
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Create policies if RLS is enabled (adjust based on your authentication setup)
-- CREATE POLICY "Allow all operations for authenticated users" ON products FOR ALL USING (auth.role() = 'authenticated');
-- CREATE POLICY "Allow all operations for authenticated users" ON sales FOR ALL USING (auth.role() = 'authenticated');
