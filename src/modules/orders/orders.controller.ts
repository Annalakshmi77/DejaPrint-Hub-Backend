import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { OrdersService } from './orders.service'
import { CreateOrderDto } from './dto/create-order.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Place a new order' })
  create(@CurrentUser('_id') userId, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(userId.toString(), dto)
  }

  @Get()
  @ApiOperation({ summary: 'Get my orders' })
  findAll(
    @CurrentUser('_id') userId,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) { return this.ordersService.findAllForUser(userId.toString(), page, limit) }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('_id') userId) {
    return this.ordersService.findOne(id, userId.toString())
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser('_id') userId) {
    return this.ordersService.cancel(id, userId.toString())
  }
}
