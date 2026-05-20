import { IsString, IsOptional, Matches } from 'class-validator'
export class UpdateUserDto {
  @IsOptional() @IsString() name?: string
  @IsOptional() @Matches(/^[6-9]\d{9}$/) phone?: string
}
export class AddAddressDto {
  @IsString() line1: string
  @IsOptional() @IsString() line2?: string
  @IsString() city: string
  @IsString() state: string
  @IsString() pincode: string
  @IsOptional() isDefault?: boolean
}
