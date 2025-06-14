import { ApiProperty } from '@nestjs/swagger';
import { Tag } from '../../tags/entities/tag.entity';

export class CoffeeResponseDto {
  @ApiProperty({ description: 'Identificador único do café' })
  id: string;

  @ApiProperty({ description: 'Nome do café' })
  name: string;

  @ApiProperty({ description: 'Descrição do café' })
  description: string;

  @ApiProperty({
    description: 'Preço do café',
    type: Number,
    format: 'float',
  })
  price: number;

  @ApiProperty({ description: 'URL da imagem do café' })
  imageUrl: string;

  @ApiProperty({ description: 'Data e hora de criação do café' })
  createdAt: Date;

  @ApiProperty({ description: 'Data e hora da última atualização do café' })
  updatedAt: Date;

  @ApiProperty({
    type: () => [Tag],
    description: 'Lista de tags associadas ao café',
    isArray: true,
  })
  tags: Tag[];
}