-- AlterTable
ALTER TABLE "Manager" ADD COLUMN "password" TEXT,
ADD COLUMN "createdAt" TIMESTAMP
(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP
(3),
ADD CONSTRAINT "Manager_email_key" UNIQUE
("email");

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN "password" TEXT,
ADD COLUMN "createdAt" TIMESTAMP
(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP
(3),
ADD CONSTRAINT "Tenant_email_key" UNIQUE
("email");
