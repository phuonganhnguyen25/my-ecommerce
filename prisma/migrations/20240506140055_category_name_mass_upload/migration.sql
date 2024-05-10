-- CreateEnum
CREATE TYPE "ENTITY" AS ENUM ('CATEGORY');

-- CreateTable
CREATE TABLE "Name" (
    "id" SERIAL NOT NULL,
    "name_en" TEXT NOT NULL DEFAULT '',
    "name_vi" TEXT NOT NULL DEFAULT '',
    "entity" "ENTITY" NOT NULL,

    CONSTRAINT "Name_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order" SERIAL NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "parent_id" INTEGER,
    "name_id" INTEGER NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MassUpload" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "json" JSONB NOT NULL,
    "target" "ENTITY" NOT NULL,
    "parent_id" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MassUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Name_name_en_entity_key" ON "Name"("name_en", "entity");

-- CreateIndex
CREATE UNIQUE INDEX "Name_name_vi_entity_key" ON "Name"("name_vi", "entity");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_id_key" ON "Category"("name_id");

-- CreateIndex
CREATE UNIQUE INDEX "Category_order_level_key" ON "Category"("order", "level");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_name_id_fkey" FOREIGN KEY ("name_id") REFERENCES "Name"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
