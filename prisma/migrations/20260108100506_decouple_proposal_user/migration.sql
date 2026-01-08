-- DropForeignKey
ALTER TABLE "proposals" DROP CONSTRAINT "proposals_created_by_id_fkey";

-- AlterTable
ALTER TABLE "proposals" ADD COLUMN     "created_by_user" TEXT,
ALTER COLUMN "created_by_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
