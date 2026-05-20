import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type OrderDocument = Order & Document

export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true }) productId: Types.ObjectId
  @Prop({ required: true }) variantId: string
  @Prop({ required: true }) productName: string
  @Prop({ required: true, min: 1 }) quantity: number
  @Prop({ type: Object, default: {} }) customText: Record<string, string>
  @Prop() designFileUrl: string
  @Prop() previewUrl: string
  @Prop({ default: 'pending' }) designStatus: string
}

export class ShippingAddress {
  @Prop({ required: true }) name: string
  @Prop({ required: true }) phone: string
  @Prop({ required: true }) line1: string
  @Prop() line2: string
  @Prop({ required: true }) city: string
  @Prop({ required: true }) state: string
  @Prop({ required: true }) pincode: string
  @Prop({ required: true }) email: string
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true }) orderNumber: string
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) userId: Types.ObjectId
  @Prop({ type: [Object], required: true }) items: OrderItem[]
  @Prop({ type: Object, required: true }) shippingAddress: ShippingAddress
  @Prop({ enum: ['pending','confirmed','designing','printing','dispatched','delivered','cancelled'], default: 'pending' }) status: string
  @Prop({ enum: ['pending','paid','failed','refunded'], default: 'pending' }) paymentStatus: string
  @Prop() couponCode: string
  @Prop({ default: 0 }) discountAmount: number
  @Prop({ default: 0 }) totalAmount: number
  @Prop({ default: 0 }) paidAmount: number
  @Prop() notes: string
  @Prop() deliveryDate: Date
  @Prop() trackingNumber: string
}

export const OrderSchema = SchemaFactory.createForClass(Order)
OrderSchema.index({ userId: 1, createdAt: -1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ orderNumber: 1 }, { unique: true })
