import { CartItem as PrismaCartItem } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class CartItem implements PrismaCartItem {
  id: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;

  cart_id: string;
  coffee_id: string;
  
  unitPrice: Decimal;
  
  // Campos adicionais não presentes no modelo Prisma
  coffee?: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
  subtotal?: number;
} 