-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PROCESSANDO', 'EM_TRANSITO', 'ENTREGUE', 'CANCELADO', 'AGUARDANDO_PAGAMENTO');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PROCESSANDO';
