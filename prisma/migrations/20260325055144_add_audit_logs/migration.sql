-- AlterTable
ALTER TABLE "tenants" ADD COLUMN "features" TEXT;

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "details" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_dashboard_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dailyObjective" INTEGER NOT NULL DEFAULT 100000,
    "dailyExpenseLimit" INTEGER NOT NULL DEFAULT 50000,
    "minProfitMargin" REAL NOT NULL DEFAULT 15,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tenantId" TEXT NOT NULL,
    CONSTRAINT "dashboard_configs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_dashboard_configs" ("createdAt", "dailyExpenseLimit", "dailyObjective", "id", "lowStockThreshold", "minProfitMargin", "tenantId", "updatedAt") SELECT "createdAt", "dailyExpenseLimit", "dailyObjective", "id", "lowStockThreshold", "minProfitMargin", "tenantId", "updatedAt" FROM "dashboard_configs";
DROP TABLE "dashboard_configs";
ALTER TABLE "new_dashboard_configs" RENAME TO "dashboard_configs";
CREATE UNIQUE INDEX "dashboard_configs_tenantId_key" ON "dashboard_configs"("tenantId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
