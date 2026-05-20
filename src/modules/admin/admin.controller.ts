import { Controller, Get, Put, Delete, Body, Param, Query, UseGuards, DefaultValuePipe, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Order, OrderDocument } from '../orders/schemas/order.schema'
import { User, UserDocument } from '../users/schemas/user.schema'
import { DesignAsset, DesignAssetDocument } from '../designs/schemas/design-asset.schema'
import { DesignsService } from '../designs/designs.service'
import { OrdersService } from '../orders/orders.service'

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(DesignAsset.name) private designModel: Model<DesignAssetDocument>,
    private ordersService: OrdersService,
    private designsService: DesignsService,
  ) {}

  @Get('dashboard')
  async getDashboard() {
    const [
      totalOrders, pendingOrders, todayOrders,
      totalUsers, pendingDesigns
    ] = await Promise.all([
      this.orderModel.countDocuments(),
      this.orderModel.countDocuments({ status: 'pending' }),
      this.orderModel.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
      this.userModel.countDocuments({ role: 'customer' }),
      this.designModel.countDocuments({ status: 'pending' }),
    ])
    return {
      data: {
        totalOrders, pendingOrders, todayOrders,
        totalUsers, pendingDesigns,
      },
      message: 'Dashboard stats fetched',
    }
  }

  @Get('orders')
  getAllOrders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) { return this.ordersService.findAll(page, limit, status) }

  @Put('orders/:id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: string; trackingNumber?: string },
  ) { return this.ordersService.updateStatus(id, body.status, body.trackingNumber) }

  @Put('orders/:id')
  updateOrder(
    @Param('id') id: string,
    @Body() body: any,
  ) { return this.ordersService.updateAdminOrder(id, body) }

  @Delete('orders/:id')
  deleteOrder(@Param('id') id: string) {
    return this.ordersService.deleteOrder(id)
  }

  @Get('designs/pending')
  getPendingDesigns(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) { return this.designsService.getPendingDesigns(page) }

  @Put('designs/:id/review')
  reviewDesign(
    @Param('id') id: string,
    @CurrentUser('_id') adminId,
    @Body() body: { status: 'approved' | 'rejected'; notes?: string },
  ) { return this.designsService.review(id, adminId.toString(), body.status, body.notes) }

  @Get('customers')
  async getCustomers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const [users, total] = await Promise.all([
      this.userModel.find({ role: 'customer' }).select('-passwordHash -refreshToken').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      this.userModel.countDocuments({ role: 'customer' }),
    ])
    return { data: { users, total, page }, message: 'Customers fetched' }
  }
}
