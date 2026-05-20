import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type UserDocument = User & Document

export class Address {
  @Prop({ required: true }) line1: string
  @Prop() line2: string
  @Prop({ required: true }) city: string
  @Prop({ required: true }) state: string
  @Prop({ required: true }) pincode: string
  @Prop({ default: false }) isDefault: boolean
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true }) name: string
  @Prop({ required: true, unique: true, lowercase: true, trim: true }) email: string
  @Prop({ required: true }) passwordHash: string
  @Prop({ required: true }) phone: string
  @Prop() company: string
  @Prop({ enum: ['customer', 'admin', 'designer'], default: 'customer' }) role: string
  @Prop({ default: false }) emailVerified: boolean
  @Prop({ type: [Object], default: [] }) addresses: Address[]
  @Prop() refreshToken: string
  @Prop() emailVerificationToken: string
  @Prop() passwordResetToken: string
  @Prop() passwordResetExpires: Date
}

export const UserSchema = SchemaFactory.createForClass(User)
