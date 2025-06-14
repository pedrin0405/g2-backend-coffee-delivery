import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  Patch, // Importa Patch para atualizações parciais
  Delete, // Importa Delete para remoções
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto'; // Importa UpdateItemDto
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger'; // Para documentação Swagger

@ApiTags('cart') // Tag do controlador para o Swagger
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria um novo carrinho ou retorna um existente para o usuário' })
  @ApiResponse({ status: 201, description: 'Carrinho criado ou obtido com sucesso.' })
  async createCart() {
    // Para criar um carrinho associado a um usuário autenticado, você passaria o userId aqui.
    // Ex: return this.cartService.getOrCreateCart(req.user.id);
    return this.cartService.getOrCreateCart();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém os detalhes de um carrinho específico' })
  @ApiResponse({ status: 200, description: 'Detalhes do carrinho retornados com sucesso.' })
  @ApiResponse({ status: 404, description: 'Carrinho não encontrado.' })
  async getCart(@Param('id') id: string) {
    return this.cartService.getCart(id);
  }

  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Adiciona um item ao carrinho ou atualiza sua quantidade' })
  @ApiResponse({ status: 201, description: 'Item adicionado/atualizado no carrinho com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados do item inválidos ou quantidade excede o limite.' })
  @ApiResponse({ status: 404, description: 'Carrinho ou café não encontrado.' })
  async addItem(@Param('id') id: string, @Body() addItemDto: AddItemDto) {
    return this.cartService.addItem(id, addItemDto);
  }

  @Patch(':cartId/items/:itemId') // PATCH /cart/{cartId}/items/{itemId}
  @ApiOperation({ summary: 'Atualiza a quantidade de um item específico no carrinho' })
  @ApiResponse({ status: 200, description: 'Quantidade do item atualizada com sucesso.' })
  @ApiResponse({ status: 200, description: 'Item removido se a quantidade for zero.' }) // Considerar 204 No Content se a remoção for o resultado principal
  @ApiResponse({ status: 400, description: 'Quantidade inválida ou excede o limite.' })
  @ApiResponse({ status: 404, description: 'Carrinho ou item não encontrado.' })
  async updateItem(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.cartService.updateItem(cartId, itemId, updateItemDto);
  }

  @Delete(':cartId/items/:itemId') // DELETE /cart/{cartId}/items/{itemId}
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content para exclusão bem-sucedida
  @ApiOperation({ summary: 'Remove um item específico do carrinho' })
  @ApiResponse({ status: 204, description: 'Item removido do carrinho com sucesso.' })
  @ApiResponse({ status: 404, description: 'Carrinho ou item não encontrado.' })
  async removeItem(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
  ) {
    await this.cartService.removeItem(cartId, itemId);
  }
}