-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('COLLECTIONS', 'HWRC', 'DEPOT_OFFICE', 'OTHER');

-- DropForeignKey
ALTER TABLE "ExternalContract" DROP CONSTRAINT "ExternalContract_parentContractId_fkey";

-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "value",
ADD COLUMN     "type" "ContractType" NOT NULL DEFAULT 'OTHER';

-- DropTable
DROP TABLE "ExternalContract";

