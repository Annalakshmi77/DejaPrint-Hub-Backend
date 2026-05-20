import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type DesignAssetDocument = DesignAsset & Document

@Schema({ timestamps: true })
export class DesignAsset {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true }) orderId: Types.ObjectId
  @Prop({ required: true }) orderItemId: string
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) uploadedBy: Types.ObjectId
  @Prop({ required: true }) fileUrl: string
  @Prop({ required: true }) originalName: string
  @Prop({ required: true }) fileType: string
  @Prop({ required: true }) fileSize: number
  @Prop({ default: 1 }) version: number
  @Prop({ enum: ['pending','approved','rejected'], default: 'pending' }) status: string
  @Prop() adminNotes: string
  @Prop({ type: Types.ObjectId, ref: 'User' }) reviewedBy: Types.ObjectId
  @Prop() reviewedAt: Date
}

export const DesignAssetSchema = SchemaFactory.createForClass(DesignAsset)
