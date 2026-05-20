import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { DesignAsset, DesignAssetDocument } from './schemas/design-asset.schema'
import { Order, OrderDocument } from '../orders/schemas/order.schema'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class DesignsService {
  constructor(
    @InjectModel(DesignAsset.name) private designModel: Model<DesignAssetDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async upload(userId: string, orderId: string, itemId: string, file: Express.Multer.File) {
    const order = await this.orderModel.findOne({ _id: orderId, userId: new Types.ObjectId(userId) })
    if (!order) throw new NotFoundException('Order not found')

    const item = order.items.find(i => (i as any)._id?.toString() === itemId)
    if (!item) throw new NotFoundException('Order item not found')

    const fileUrl = `/uploads/${file.filename}`

    const design = await this.designModel.create({
      orderId: new Types.ObjectId(orderId),
      orderItemId: itemId,
      uploadedBy: new Types.ObjectId(userId),
      fileUrl,
      originalName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
    })

    await this.orderModel.findOneAndUpdate(
      { _id: orderId, 'items._id': itemId },
      { $set: { 'items.$.designFileUrl': fileUrl, 'items.$.designStatus': 'uploaded' } }
    )

    return { data: design, message: 'Design file uploaded successfully' }
  }

  async getByOrder(orderId: string, userId: string) {
    const order = await this.orderModel.findById(orderId)
    if (!order) throw new NotFoundException('Order not found')
    if (order.userId.toString() !== userId) throw new ForbiddenException('Access denied')
    const designs = await this.designModel.find({ orderId: new Types.ObjectId(orderId) })
    return { data: designs, message: 'Designs fetched' }
  }

  async review(designId: string, adminId: string, status: 'approved' | 'rejected', notes?: string) {
    const design = await this.designModel.findByIdAndUpdate(
      designId,
      { status, adminNotes: notes, reviewedBy: new Types.ObjectId(adminId), reviewedAt: new Date() },
      { new: true }
    )
    if (!design) throw new NotFoundException('Design not found')

    await this.orderModel.findOneAndUpdate(
      { _id: design.orderId, 'items._id': design.orderItemId },
      { $set: { 'items.$.designStatus': status } }
    )
    return { data: design, message: `Design ${status}` }
  }

  async getPendingDesigns(page = 1, limit = 20) {
    const [designs, total] = await Promise.all([
      this.designModel.find({ status: 'pending' })
        .populate('orderId', 'orderNumber')
        .populate('uploadedBy', 'name email')
        .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      this.designModel.countDocuments({ status: 'pending' }),
    ])
    return { data: { designs, total, page }, message: 'Pending designs fetched' }
  }
}
