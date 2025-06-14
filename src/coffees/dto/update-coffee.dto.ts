import { PartialType } from '@nestjs/mapped-types';
import { CreateCoffeeDto } from './create-coffee.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray, IsString, ArrayMinSize, ArrayNotEmpty } from 'class-validator';

export class UpdateCoffeeDto extends PartialType(CreateCoffeeDto) {
  @ApiProperty({
    description: 'Array de IDs de tags para associar ao café. Tags existentes que não estiverem nesta lista serão removidas, e novas serão adicionadas.',
    example: ['uuid-tag-1', 'uuid-tag-2'],
    isArray: true,
    type: String,
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'As tags devem ser um array.' })
  @ArrayNotEmpty({ message: 'O array de tags não pode ser vazio se fornecido.' })
  @ArrayMinSize(1, { message: 'É necessário pelo menos um ID de tag se as tags forem fornecidas.' })
  @IsString({ each: true, message: 'Cada ID de tag deve ser uma string.' })
  tags?: string[];
}