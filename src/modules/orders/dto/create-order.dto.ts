import { IsString, IsArray, IsNumber, IsOptional, ValidateNested, Min, IsObject } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class OrderItemDto {
  @IsString() productId: string
  @IsString() variantId: string
  @IsString() productName: string
  @IsNumber() @Min(1) quantity: number
  @IsOptional() @IsObject() customText?: Record<string, string>
}

export class ShippingAddressDto {
  @IsString() name: string
  @IsString() phone: string
  @IsString() line1: string
  @IsOptional() @IsString() line2?: string
  @IsString() city: string
  @IsString() state: string
  @IsString() pincode: string
  @IsString() email: string
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto)
  items: OrderItemDto[]

  @ValidateNested() @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto

  @IsOptional() @IsString() couponCode?: string
  @IsOptional() @IsString() notes?: string
  @IsOptional() @IsString() requestedDeliveryDate?: string
}
