-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'CLASSIFYING', 'CALCULATING', 'COMPARING', 'COMPLETE', 'FAILED');

-- CreateTable
CREATE TABLE "HtsCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "heading" TEXT NOT NULL,
    "subheading" TEXT NOT NULL,
    "mfnRate" DECIMAL(65,30),
    "mfnRateText" TEXT,
    "unit" TEXT,
    "specialRates" JSONB,
    "section301List" TEXT,
    "section301Rate" DECIMAL(65,30),
    "section232" BOOLEAN NOT NULL DEFAULT false,
    "section232Rate" DECIMAL(65,30),
    "adcvdOrders" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HtsCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "productDesc" TEXT NOT NULL,
    "originCountry" TEXT NOT NULL DEFAULT 'CN',
    "cifValue" DECIMAL(65,30) NOT NULL DEFAULT 10000,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "result" JSONB,
    "htsCode" TEXT,
    "totalDutyRate" DECIMAL(65,30),
    "totalDutyAmount" DECIMAL(65,30),
    "executionMs" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdcvdOrder" (
    "id" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "htsCodePattern" TEXT NOT NULL,
    "dutyType" TEXT NOT NULL,
    "estimatedRate" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AdcvdOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HtsCode_code_key" ON "HtsCode"("code");

-- CreateIndex
CREATE INDEX "HtsCode_chapter_idx" ON "HtsCode"("chapter");

-- CreateIndex
CREATE INDEX "HtsCode_heading_idx" ON "HtsCode"("heading");

-- CreateIndex
CREATE INDEX "HtsCode_section301List_idx" ON "HtsCode"("section301List");

-- CreateIndex
CREATE INDEX "Analysis_sessionId_idx" ON "Analysis"("sessionId");

-- CreateIndex
CREATE INDEX "Analysis_htsCode_idx" ON "Analysis"("htsCode");

-- CreateIndex
CREATE INDEX "AdcvdOrder_country_idx" ON "AdcvdOrder"("country");

-- CreateIndex
CREATE INDEX "AdcvdOrder_htsCodePattern_idx" ON "AdcvdOrder"("htsCodePattern");
