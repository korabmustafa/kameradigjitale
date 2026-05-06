-- Add order numbers for customer-facing order lookup.
ALTER TABLE "Order" ADD COLUMN "orderNumber" TEXT;

WITH numbered_orders AS (
  SELECT "id", row_number() OVER (ORDER BY "createdAt", "id") AS sequence
  FROM "Order"
  WHERE "orderNumber" IS NULL
)
UPDATE "Order" AS orders
SET "orderNumber" = 'KD-' || to_char(orders."createdAt", 'YYYYMMDD') || '-' || lpad(numbered_orders.sequence::text, 6, '0')
FROM numbered_orders
WHERE orders."id" = numbered_orders."id";

ALTER TABLE "Order" ALTER COLUMN "orderNumber" SET NOT NULL;
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
