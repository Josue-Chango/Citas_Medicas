/*
  Warnings:

  - The `estado` column on the `Appointment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('pendiente', 'confirmada', 'cancelada', 'completada');

-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoCita" NOT NULL DEFAULT 'pendiente';
