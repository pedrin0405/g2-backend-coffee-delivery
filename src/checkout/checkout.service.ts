import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { CheckoutDto } from './dto/checkout.dto';
import { CartStatus, PaymentStatus, OrderStatus } from '@prisma/client';

@Injectable()
export class CheckoutService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
  ) {}

  async createOrder(checkoutDto: CheckoutDto) {
    const { cartId, deliveryAddress, paymentMethod } = checkoutDto;

    const cart = await this.cartService.getCart(cartId);

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cartId} not found.`);
    }

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cannot create an order from an empty cart.');
    }

    let totalItems = 0;
    let totalAmount = 0;
    let uniqueCategories = new Set<string>();

    for (const item of cart.items) {
      totalItems += item.quantity;
      totalAmount += item.quantity * item.unitPrice.toNumber();
      uniqueCategories.add(item.coffee.name);
    }

    const shippingFee = 10.00;
    totalAmount += shippingFee;

    const order = await this.prisma.$transaction(async (prisma) => {
      const newOrder = await prisma.order.create({
        data: {
          cart: { connect: { id: cartId } },
          totalItems: totalItems,
          shippingFee: shippingFee,
          totalAmount: totalAmount,
          status: OrderStatus.AGUARDANDO_PAGAMENTO,
        },
        include: {
            cart: {
                include: {
                    items: {
                        include: {
                            coffee: true
                        }
                    }
                }
            }
        }
      });

      await prisma.cart.update({
        where: { id: cartId },
        data: {
          status: CartStatus.Finalizado,
          status_payment: PaymentStatus.Pendente,
          data_time_completed: new Date(),
        },
      });

      return newOrder;
    });

    return {
      id: order.id,
      items: order.cart.items.map(item => ({
        coffeeId: item.coffee_id,
        name: item.coffee.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      })),
      uniqueCategories: uniqueCategories.size,
      itemsTotal: Number(order.totalItems),
      shippingFee: Number(order.shippingFee),
      total: Number(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt,
    };
  }
}