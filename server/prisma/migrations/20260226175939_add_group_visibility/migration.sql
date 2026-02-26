-- CreateEnum
CREATE TYPE "GroupVisibility" AS ENUM ('PUBLIC', 'FRIENDS_ONLY');

-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "visibility" "GroupVisibility" NOT NULL DEFAULT 'PUBLIC';
