-- CreateTable
CREATE TABLE "NavigationSubcategory" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NavigationSubcategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NavigationSubcategory_category_active_position_idx" ON "NavigationSubcategory"("category", "active", "position");

-- CreateIndex
CREATE UNIQUE INDEX "NavigationSubcategory_category_slug_key" ON "NavigationSubcategory"("category", "slug");
