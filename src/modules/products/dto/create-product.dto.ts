import { IsString, IsNumber, IsEnum, IsOptional, IsArray, ValidateNested, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class CreateVariantDto {
  @IsString() size: string
  @IsString() paperType: string
  @IsOptional() @IsString() binding?: string
  @IsOptional() @IsString() coverFinish?: string
  @IsOptional() @IsNumber() pages?: number
  @IsNumber() @Min(0) priceModifier: number
  @IsOptional() @IsNumber() stockQty?: number
}

export class CreateFeatureDto {
  @IsString() name: string
  @IsString() value: string
}

export class CreateProductDto {
  @ApiProperty({ example: 'Desk Calendar 2026' })
  @IsString() name: string

  @ApiProperty({ example: 'Diary' })
  @IsString() category: string

  @IsOptional() @IsArray() @IsString({ each: true }) description?: string[]

  @ApiProperty({ example: 299 })
  @IsNumber() @Min(0) basePrice: number

  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[]

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[]

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => CreateFeatureDto)
  features?: CreateFeatureDto[]

  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[]
}
