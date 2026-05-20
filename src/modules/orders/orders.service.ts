import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Order, OrderDocument } from './schemas/order.schema'
import { CreateOrderDto } from './dto/create-order.dto'
import { v4 as uuidv4 } from 'uuid'
import { MailService } from '../mail/mail.service'

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private mailService: MailService,
  ) {}

  private generateOrderNumber(): string {
    const date = new Date()
    const prefix = `PC${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`
    return `${prefix}-${uuidv4().split('-')[0].toUpperCase()}`
  }

  async create(userId: string, dto: CreateOrderDto) {
    const order = await this.orderModel.create({
      orderNumber: this.generateOrderNumber(),
      userId: new Types.ObjectId(userId),
      items: dto.items.map(item => ({ ...item, productId: new Types.ObjectId(item.productId) })),
      shippingAddress: dto.shippingAddress,
      couponCode: dto.couponCode,
      notes: dto.notes,
      totalAmount: 0,
      paidAmount: 0,
      deliveryDate: dto.requestedDeliveryDate ? new Date(dto.requestedDeliveryDate) : undefined,
    })

    // Send confirmation email
    if (dto.shippingAddress?.email) {
      this.mailService.sendOrderConfirmation(
        dto.shippingAddress.email,
        dto.shippingAddress.name || 'Valued Customer',
        order.orderNumber
      ).catch(err => console.error('Background mail error:', err));
    }

    return { data: order, message: 'Order placed successfully' }
  }

  async findAllForUser(userId: string, page = 1, limit = 10) {
    const [orders, total] = await Promise.all([
      this.orderModel.find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      this.orderModel.countDocuments({ userId: new Types.ObjectId(userId) }),
    ])
    return { data: { orders, total, page, totalPages: Math.ceil(total / limit) }, message: 'Orders fetched' }
  }

  async findOne(orderId: string, userId: string) {
    const order = await this.orderModel.findById(orderId)
    if (!order) throw new NotFoundException('Order not found')
    if (order.userId.toString() !== userId) throw new ForbiddenException('Access denied')
    return { data: order, message: 'Order fetched' }
  }

  async cancel(orderId: string, userId: string) {
    const order = await this.orderModel.findById(orderId)
    if (!order) throw new NotFoundException('Order not found')
    if (order.userId.toString() !== userId) throw new ForbiddenException('Access denied')
    if (!['pending', 'confirmed'].includes(order.status))
      throw new BadRequestException('Order cannot be cancelled at this stage')
    order.status = 'cancelled'
    await order.save()
    return { data: order, message: 'Order cancelled' }
  }

  async updateStatus(orderId: string, status: string, trackingNumber?: string) {
    const update: any = { status }
    if (trackingNumber) update.trackingNumber = trackingNumber
    if (status === 'dispatched') update.deliveryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const order = await this.orderModel.findByIdAndUpdate(orderId, update, { new: true })
    if (!order) throw new NotFoundException('Order not found')
    return { data: order, message: `Order status updated to ${status}` }
  }

  async updatePaymentStatus(orderId: string, paymentStatus: string) {
    const order = await this.orderModel.findByIdAndUpdate(orderId, { paymentStatus }, { new: true })
    if (!order) throw new NotFoundException('Order not found')
    return { data: order, message: `Payment status updated to ${paymentStatus}` }
  }

  async updateDesignStatus(orderId: string, itemId: string, designUrl: string) {
    const order = await this.orderModel.findOneAndUpdate(
      { _id: orderId, 'items._id': itemId },
      { $set: { 'items.$.designFileUrl': designUrl, 'items.$.designStatus': 'uploaded' } },
      { new: true }
    )
    if (!order) throw new NotFoundException('Order or item not found')
    return { data: order, message: 'Design uploaded successfully' }
  }

  // Admin: get all orders
  async findAll(page = 1, limit = 20, status?: string) {
    const filter: any = {}
    if (status) filter.status = status
    const [orders, total] = await Promise.all([
      this.orderModel.find(filter).populate('userId', 'name email phone').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      this.orderModel.countDocuments(filter),
    ])
    return { data: { orders, total, page, totalPages: Math.ceil(total / limit) }, message: 'All orders fetched' }
  }

  // Admin: Update full order details
  async updateAdminOrder(orderId: string, updateData: any) {
    const order = await this.orderModel.findByIdAndUpdate(orderId, updateData, { new: true })
    if (!order) throw new NotFoundException('Order not found')
    return { data: order, message: 'Order updated successfully' }
  }

  // Admin: Delete order
  async deleteOrder(orderId: string) {
    const order = await this.orderModel.findByIdAndDelete(orderId)
    if (!order) throw new NotFoundException('Order not found')
    return { data: null, message: 'Order deleted successfully' }
  }
}
