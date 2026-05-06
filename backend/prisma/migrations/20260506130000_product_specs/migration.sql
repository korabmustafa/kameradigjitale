-- CreateTable
CREATE TABLE "ProductSpec" (
    "id" BIGSERIAL NOT NULL,
    "productId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductSpec_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductSpec_productId_position_idx" ON "ProductSpec"("productId", "position");

-- AddForeignKey
ALTER TABLE "ProductSpec" ADD CONSTRAINT "ProductSpec_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
