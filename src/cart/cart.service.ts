import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CartItem } from '@prisma/client';

@Injectable()
export class CartService {
  private readonly MAX_QUANTITY = 5;
  private readonly MIN_QUANTITY = 1; // Para adição e atualização normal

  constructor(private prisma: PrismaService) {}

  async getOrCreateCart(userId?: string) {
    if (userId) {
      const existingCart = await this.prisma.cart.findFirst({
        where: { userId },
        include: {
          items: {
            include: {
              coffee: true, // Inclui os detalhes do café
            },
          },
        },
      });

      if (existingCart) {
        return {
          ...existingCart,
          items: existingCart.items.map(item => ({
            ...item,
            subtotal: item.quantity * item.unitPrice.toNumber(), // Calcula o subtotal
          })),
        };
      }
    }

    const newCart = await this.prisma.cart.create({
      data: {
        userId: userId || null,
      },
      include: {
        items: {
          include: {
            coffee: true,
          },
        },
      },
    });

    return {
      ...newCart,
      items: [], // Novo carrinho não tem itens inicialmente
    };
  }

  async getCart(cart_id: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cart_id },
      include: {
        items: {
          include: {
            coffee: true, // Inclui os detalhes do café
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException(`Carrinho com ID ${cart_id} não encontrado.`);
    }

    // Calcula o subtotal para cada item antes de retornar
    return {
      ...cart,
      items: cart.items.map(item => ({
        ...item,
        subtotal: item.quantity * item.unitPrice.toNumber(),
      })),
    };
  }

  async addItem(cart_id: string, addItemDto: AddItemDto) {
    const { coffeeId, quantity } = addItemDto;

    if (quantity < this.MIN_QUANTITY || quantity > this.MAX_QUANTITY) {
      throw new BadRequestException(
        `A quantidade para adicionar deve estar entre ${this.MIN_QUANTITY} e ${this.MAX_QUANTITY} unidades.`,
      );
    }

    const cart = await this.prisma.cart.findUnique({
      where: { id: cart_id },
      include: {
        items: {
          where: { coffee_id: coffeeId }, // Verifica se o item já existe para este café
        },
      },
    });

    if (!cart) {
      throw new NotFoundException(`Carrinho com ID ${cart_id} não encontrado.`);
    }

    const coffee = await this.prisma.coffee.findUnique({
      where: { id: coffeeId },
    });

    if (!coffee) {
      throw new NotFoundException(`Café com ID ${coffeeId} não encontrado.`);
    }

    const existingCartItem = cart.items.length > 0 ? cart.items[0] : null;

    let updatedCartItem: CartItem;

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      if (newQuantity > this.MAX_QUANTITY) {
        throw new BadRequestException(
          `A quantidade total do item para o café ${coffee.name} excederia o limite de ${this.MAX_QUANTITY} unidades.`,
        );
      }
      updatedCartItem = await this.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: newQuantity,
          // unitPrice não é atualizado ao adicionar, mantém o preço original da inclusão
        },
        include: { coffee: true },
      });
    } else {
      updatedCartItem = await this.prisma.cartItem.create({
        data: {
          cart: { connect: { id: cart_id } },
          coffee: { connect: { id: coffeeId } },
          quantity,
          unitPrice: coffee.price, // Salva o preço atual do café no momento da adição
        },
        include: { coffee: true },
      });
    }

    return {
      ...updatedCartItem,
      subtotal: updatedCartItem.quantity * updatedCartItem.unitPrice.toNumber(),
    };
  }

  async updateItem(cart_id: string, itemId: string, updateItemDto: UpdateItemDto) {
    const { quantity: newQuantity } = updateItemDto;

    const cart = await this.prisma.cart.findUnique({ where: { id: cart_id } });
    if (!cart) {
      throw new NotFoundException(`Carrinho com ID ${cart_id} não encontrado.`);
    }

    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart_id,
      },
      include: { coffee: true }, // Inclui detalhes do café para a resposta
    });

    if (!item) {
      throw new NotFoundException(`Item com ID ${itemId} não encontrado no carrinho ${cart_id}.`);
    }

    if (newQuantity === 0) {
      await this.prisma.cartItem.delete({ where: { id: itemId } });
      return { message: `Item com ID ${itemId} removido do carrinho.` };
    }

    if (newQuantity < this.MIN_QUANTITY || newQuantity > this.MAX_QUANTITY) {
      throw new BadRequestException(
        `A quantidade do item deve estar entre ${this.MIN_QUANTITY} e ${this.MAX_QUANTITY} unidades.`,
      );
    }

    const updatedItem = await this.prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity: newQuantity,
      },
      include: { coffee: true },
    });

    return {
      ...updatedItem,
      subtotal: updatedItem.quantity * updatedItem.unitPrice.toNumber(),
    };
  }

  async removeItem(cart_id: string, itemId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { id: cart_id } });
    if (!cart) {
      throw new NotFoundException(`Carrinho com ID ${cart_id} não encontrado.`);
    }

    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart_id,
      },
    });

    if (!item) {
      throw new NotFoundException(`Item com ID ${itemId} não encontrado no carrinho ${cart_id}.`);
    }

    await this.prisma.cartItem.delete({ where: { id: itemId } });

    return { message: `Item com ID ${itemId} removido do carrinho com sucesso.` };
  }
}