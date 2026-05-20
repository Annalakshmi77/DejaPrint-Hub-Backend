import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class QueryProductDto {
  @IsOptional() @IsEnum(['calendar','diary','notebook','invitation','custom']) category?: string
  @IsOptional() @IsString() search?: string
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) minPrice?: number
  @IsOptional() @Type(() => Number) @IsNumber() maxPrice?: number
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page?: number = 1
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) limit?: number = 12
  @IsOptional() @IsString() sortBy?: string = 'createdAt'
  @IsOptional() @IsEnum(['asc','desc']) order?: 'asc' | 'desc' = 'desc'
}
