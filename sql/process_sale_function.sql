-- Function to process a sale with stock validation and deduction
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
