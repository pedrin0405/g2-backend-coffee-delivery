import { $Enums, Cart as PrismaCart } from '@prisma/client';

export class Cart implements PrismaCart {
  id: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
  data_time_completed: Date | null;
  status: $Enums.CartStatus;
  status_payment: $Enums.PaymentStatus;

} 