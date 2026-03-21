-- CreateTable
CREATE TABLE "dashboard_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailyObjective" INTEGER NOT NULL DEFAULT 100000,
    "dailyExpenseLimit" INTEGER NOT NULL DEFAULT 50000,
    "minProfitMargin" REAL NOT NULL DEFAULT 15,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tenantId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_configs_tenantId_key" ON "dashboard_configs"("tenantId");
