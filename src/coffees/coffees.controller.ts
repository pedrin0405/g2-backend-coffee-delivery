import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  Query,
  Patch, // Importa Patch para atualizações parciais
  Delete, // Importa Delete para remoções
} from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto'; // Importa UpdateCoffeeDto
import { ApiTags, ApiResponse } from '@nestjs/swagger'; // Para documentação Swagger

@ApiTags('coffees') // Tag do controlador para o Swagger
@Controller('coffees')
export class CoffeesController {
  constructor(private readonly coffeesService: CoffeesService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Retorna todos os cafés.' })
  async findAll() {
    return this.coffeesService.findAll();
  }

  @Get('search')
  @ApiResponse({ status: 200, description: 'Busca cafés com base em critérios de filtro.' })
  async search(
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('name') name?: string,
    @Query('tags') tags?: string,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
  ) {
    const tagsList = tags ? tags.split(',') : [];

    return this.coffeesService.searchCoffees({
      start_date: start_date ? new Date(start_date) : undefined,
      end_date: end_date ? new Date(end_date) : undefined,
      name,
      tags: tagsList,
      limit: +limit, // Converte para número
      offset: +offset, // Converte para número
    });
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Retorna um café específico pelo ID.' })
  @ApiResponse({ status: 404, description: 'Café não encontrado.' })
  async findOne(@Param('id') id: string) {
    return this.coffeesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED) // Define o código de status HTTP para 201 Created
  @ApiResponse({ status: 201, description: 'Cria um novo café com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  async create(@Body() createCoffeeDto: CreateCoffeeDto) {
    return this.coffeesService.create(createCoffeeDto);
  }

  @Patch(':id') // Usa Patch para atualizações parciais
  @ApiResponse({ status: 200, description: 'Atualiza um café existente pelo ID.' })
  @ApiResponse({ status: 404, description: 'Café não encontrado.' })
  @ApiResponse({ status: 400, description: 'Dados de atualização inválidos.' })
  async update(@Param('id') id: string, @Body() updateCoffeeDto: UpdateCoffeeDto) {
    return this.coffeesService.update(id, updateCoffeeDto);
  }

  @Delete(':id') // Usa Delete para remoções
  @HttpCode(HttpStatus.NO_CONTENT) // Define o código de status HTTP para 204 No Content para exclusão bem-sucedida
  @ApiResponse({ status: 204, description: 'Remove um café existente pelo ID com sucesso.' })
  @ApiResponse({ status: 404, description: 'Café não encontrado.' })
  async remove(@Param('id') id: string) {
    return this.coffeesService.remove(id);
  }
}