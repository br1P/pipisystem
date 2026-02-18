-- Insert sample products
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

-- Note: Sales data will be automatically created when sales are processed through the app
