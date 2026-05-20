import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type ProductDocument = Product & Document

export class ProductVariant {
  @Prop({ required: true }) size: string
  @Prop({ required: true }) paperType: string
  @Prop({ default: 'perfect-bound' }) binding: string
  @Prop({ default: 'matte' }) coverFinish: string
  @Prop({ default: 0 }) pages: number
  @Prop({ default: 0 }) priceModifier: number
  @Prop({ default: 100 }) stockQty: number
}

export class ProductFeature {
  @Prop({ required: true }) name: string
  @Prop({ required: true }) value: string
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true }) name: string
  @Prop({ required: true, trim: true }) category: string
  @Prop({ type: [String], default: [] }) description: string[]
  @Prop({ required: true, min: 0 }) basePrice: number
  @Prop({ type: [String], default: [] }) images: string[]
  @Prop({ type: [Object], default: [] }) variants: ProductVariant[]
  @Prop({ type: [Object], default: [] }) features: ProductFeature[]
  @Prop({ default: true }) isActive: boolean
  @Prop({ default: 0 }) totalOrders: number
  @Prop({ type: [String], default: [] }) tags: string[]
}

export const ProductSchema = SchemaFactory.createForClass(Product)
ProductSchema.index({ category: 1, isActive: 1 })
ProductSchema.index({ name: 'text', description: 'text' })
