import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';

@Injectable()
export class CoffeesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const coffees = await this.prisma.coffee.findMany({
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return coffees.map(coffee => ({
      ...coffee,
      tags: coffee.tags.map(coffeeTag => coffeeTag.tag),
    }));
  }

  async findOne(id: string) {
    const coffee = await this.prisma.coffee.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!coffee) {
      throw new NotFoundException(`Café com ID ${id} não encontrado.`);
    }

    return {
      ...coffee,
      tags: coffee.tags.map(coffeeTag => coffeeTag.tag),
    };
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const { tags, ...coffeeData } = createCoffeeDto;

    const createdCoffee = await this.prisma.coffee.create({
      data: {
        ...coffeeData,
        price: parseFloat(coffeeData.price.toString()), // Garante que o preço seja um número
        tags: {
          create: await Promise.all(
            tags.map(async (tagName) => {
              const tag = await this.prisma.tag.upsert({
                where: { name: tagName },
                update: {},
                create: { name: tagName },
              });
              return { tagId: tag.id };
            }),
          ),
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return {
      ...createdCoffee,
      tags: createdCoffee.tags.map(coffeeTag => coffeeTag.tag),
    };
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const existingCoffee = await this.prisma.coffee.findUnique({ where: { id } });

    if (!existingCoffee) {
      throw new NotFoundException(`Café com ID ${id} não encontrado.`);
    }

    const { tags, ...coffeeData } = updateCoffeeDto;

    const updateData: any = { ...coffeeData };

    if (updateCoffeeDto.price !== undefined) {
      updateData.price = parseFloat(updateCoffeeDto.price.toString());
    }

    if (tags !== undefined) {
      // Limpar tags existentes e conectar novas
      await this.prisma.coffeeTag.deleteMany({
        where: { coffeeId: id },
      });

      updateData.tags = {
        create: await Promise.all(
          tags.map(async (tagId) => {
            // Verifica se a tag realmente existe para evitar erros
            const tagExists = await this.prisma.tag.findUnique({ where: { id: tagId } });
            if (!tagExists) {
              throw new NotFoundException(`Tag com ID ${tagId} não encontrada.`);
            }
            return { tagId };
          }),
        ),
      };
    }

    const updatedCoffee = await this.prisma.coffee.update({
      where: { id },
      data: updateData,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return {
      ...updatedCoffee,
      tags: updatedCoffee.tags.map(coffeeTag => coffeeTag.tag),
    };
  }

  async remove(id: string) {
    const coffee = await this.prisma.coffee.findUnique({ where: { id } });

    if (!coffee) {
      throw new NotFoundException(`Café com ID ${id} não encontrado.`);
    }

    await this.prisma.coffeeTag.deleteMany({ where: { coffeeId: id } });
    await this.prisma.coffee.delete({ where: { id } });

    return { message: `Café com ID ${id} removido com sucesso.` };
  }

  async searchCoffees(params: {
    start_date?: Date;
    end_date?: Date;
    name?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }) {
    const { start_date, end_date, name, tags, limit = 10, offset = 0 } = params;

    const where: any = {};

    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) {
        where.createdAt.gte = start_date;
      }
      if (end_date) {
        where.createdAt.lte = end_date;
      }
    }

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: { in: tags, mode: 'insensitive' },
          },
        },
      };
    }

    const [coffees, total] = await this.prisma.$transaction([
      this.prisma.coffee.findMany({
        where,
        take: limit,
        skip: offset,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      this.prisma.coffee.count({ where }),
    ]);

    const formattedCoffees = coffees.map(coffee => ({
      ...coffee,
      tags: coffee.tags.map(coffeeTag => coffeeTag.tag),
    }));

    return {
      data: formattedCoffees,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }
}