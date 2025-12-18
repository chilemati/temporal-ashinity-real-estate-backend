-- CreateEnum
CREATE TYPE "PropertySaleStatus" AS ENUM ('AVAILABLE', 'SOLD');

-- CreateEnum
CREATE TYPE "PropertyOccupancyStatus" AS ENUM ('VACANT', 'RENTED');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "occupancyStatus" "PropertyOccupancyStatus" NOT NULL DEFAULT 'VACANT',
ADD COLUMN     "saleStatus" "PropertySaleStatus" NOT NULL DEFAULT 'AVAILABLE';

-- CreateTable
CREATE TABLE "BoughtProperty" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoughtProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WishlistProperty" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestedProperty" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestedProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentedProperty" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentedProperty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BoughtProperty_userId_propertyId_key" ON "BoughtProperty"("userId", "propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistProperty_userId_propertyId_key" ON "WishlistProperty"("userId", "propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestedProperty_userId_propertyId_key" ON "InvestedProperty"("userId", "propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "RentedProperty_userId_propertyId_key" ON "RentedProperty"("userId", "propertyId");

-- AddForeignKey
ALTER TABLE "BoughtProperty" ADD CONSTRAINT "BoughtProperty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoughtProperty" ADD CONSTRAINT "BoughtProperty_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistProperty" ADD CONSTRAINT "WishlistProperty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistProperty" ADD CONSTRAINT "WishlistProperty_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestedProperty" ADD CONSTRAINT "InvestedProperty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestedProperty" ADD CONSTRAINT "InvestedProperty_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentedProperty" ADD CONSTRAINT "RentedProperty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentedProperty" ADD CONSTRAINT "RentedProperty_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
