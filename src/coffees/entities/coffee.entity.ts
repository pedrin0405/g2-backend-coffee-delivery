// import { Coffee as PrismaCoffee } from '@prisma/client';
// import { Decimal } from '@prisma/client/runtime/library';

// export class Coffee implements PrismaCoffee {
//   id: string;
//   name: string;
//   description: string;
//   price: Decimal;
//   imageUrl: string;
//   createdAt: Date;
//   updatedAt: Date;
  
//   // Campos adicionais não presentes no modelo Prisma
//   tags?: { id: string; name: string }[];
// }

import { Coffee as CoffeePrisma, Tag as TagPrisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Tag } from '../../tags/entities/tag.entity'; // Assumindo que você terá uma entidade Tag
import { Decimal } from '@prisma/client/runtime/library';

export class Coffee implements CoffeePrisma {
  @ApiProperty({ description: 'Unique identifier of the coffee' })
  id: string;

  @ApiProperty({ description: 'Name of the coffee' })
  name: string;

  @ApiProperty({ description: 'Description of the coffee' })
  description: string;

  @ApiProperty({
    description: 'Price of the coffee',
    type: Number,
    format: 'float',
  })
  price: Decimal; // Decimal do Prisma é mapeado para number no TypeScript

  @ApiProperty({ description: 'URL of the coffee image' })
  imageUrl: string;

  @ApiProperty({ description: 'Date and time when the coffee was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Date and time when the coffee was last updated' })
  updatedAt: Date;

  @ApiProperty({
    type: () => [Tag],
    description: 'List of tags associated with the coffee',
    isArray: true,
  })
  tags: TagPrisma[]; // Ou `Tag[]` se você mapear completamente a entidade Tag aqui
  // Para simplificar, estamos usando TagPrisma[], mas idealmente você mapearia para sua própria entidade Tag

  // Você pode adicionar um construtor se precisar inicializar a entidade de alguma forma
  constructor(data: Partial<CoffeePrisma>) {
    Object.assign(this, data);
  }
}

