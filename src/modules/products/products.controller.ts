import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { QueryProductDto } from './dto/query-product.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { Public } from '../../common/decorators/public.decorator'

@ApiTags('Products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Public() @Get() @ApiOperation({ summary: 'Get all products' })
  findAll(@Query() query: QueryProductDto) { return this.productsService.findAll(query) }

  @Public() @Get('categories') getCategories() { return this.productsService.getCategories() }

  @Public() @Get(':id') findOne(@Param('id') id: string) { return this.productsService.findOne(id) }

  @Post() @Roles('admin') @ApiBearerAuth()
  create(@Body() dto: CreateProductDto) { return this.productsService.create(dto) }

  @Put(':id') @Roles('admin') @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>) { return this.productsService.update(id, dto) }

  @Delete(':id') @Roles('admin') @ApiBearerAuth()
  remove(@Param('id') id: string) { return this.productsService.remove(id) }
}
