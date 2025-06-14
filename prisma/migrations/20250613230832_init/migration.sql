-- CreateEnum
CREATE TYPE "typeCoffee" AS ENUM ('tradicional', 'com_leite', 'gelado');

-- CreateEnum
CREATE TYPE "CartStatus" AS ENUM ('Abandonado', 'AguardandoPagamento', 'Finalizado');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Aprovado', 'Analise', 'Pendente', 'Cancelado');

-- CreateTable
CREATE TABLE "Coffee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coffee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "typeCoffee" NOT NULL DEFAULT 'tradicional',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoffeeTag" (
    "coffeeId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "CoffeeTag_pkey" PRIMARY KEY ("coffeeId","tagId")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "data_time_completed" TIMESTAMPTZ,
    "status" "CartStatus" NOT NULL DEFAULT 'AguardandoPagamento',
    "status_payment" "PaymentStatus" NOT NULL DEFAULT 'Pendente',

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "quantity" SMALLINT NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cart_id" TEXT NOT NULL,
    "coffee_id" TEXT NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- AddForeignKey
ALTER TABLE "CoffeeTag" ADD CONSTRAINT "CoffeeTag_coffeeId_fkey" FOREIGN KEY ("coffeeId") REFERENCES "Coffee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoffeeTag" ADD CONSTRAINT "CoffeeTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_coffee_id_fkey" FOREIGN KEY ("coffee_id") REFERENCES "Coffee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
