import {
  IsString,
  IsNotEmpty,
  IsDecimal,
  IsUrl,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCoffeeDto {
  @ApiProperty({ description: 'Nome do café', example: 'Espresso' })
  @IsString({ message: 'O nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
  name: string;

  @ApiProperty({
    description: 'Descrição do café',
    example: 'Um café forte e rico em sabor.',
  })
  @IsString({ message: 'A descrição deve ser uma string.' })
  @IsNotEmpty({ message: 'A descrição não pode ser vazia.' })
  description: string;

  @ApiProperty({
    description: 'Preço do café',
    example: 12.50,
    type: Number,
    format: 'float',
  })
  @IsNotEmpty({ message: 'O preço não pode ser vazio.' })
  @IsDecimal(
    { decimal_digits: '2', locale: 'en-US' },
    { message: 'O preço deve ser um valor decimal válido com até 2 casas decimais.' },
  )
  price: string; // Usei a string aqui para representar Decimal de forma mais segura antes da conversão

  @ApiProperty({
    description: 'URL da imagem do café',
    example: 'https://example.com/espresso.jpg',
  })
  @IsUrl({}, { message: 'A URL da imagem deve ser uma URL válida.' })
  @IsNotEmpty({ message: 'A URL da imagem não pode ser vazia.' })
  imageUrl: string;

  @ApiProperty({
    description: 'Array de nomes de tags associadas ao café',
    example: ['tradicional', 'intenso'],
    isArray: true,
    type: String,
  })
  @IsArray({ message: 'As tags devem ser um array.' })
  @ArrayNotEmpty({ message: 'O array de tags não pode ser vazio.' })
  @ArrayMinSize(1, { message: 'É necessário pelo menos uma tag.' })
  @IsString({ each: true, message: 'Cada tag deve ser uma string.' })
  tags: string[]; // Aqui você espera os nomes das tags
}