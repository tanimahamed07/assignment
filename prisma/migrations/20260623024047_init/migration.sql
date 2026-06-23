-- CreateTable
CREATE TABLE "Preorder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "products" INTEGER NOT NULL,
    "preorderWhen" TEXT NOT NULL DEFAULT 'regardless_of_stock',
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
