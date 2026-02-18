-- Disable Row Level Security for development (remove in production if you want auth)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;

-- Grant permissions to anon role (remove in production)
GRANT ALL ON products TO anon;
GRANT ALL ON sales TO anon;
GRANT USAGE ON SEQUENCE sales_id_seq TO anon;
