import { IsEmail, IsString, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
export class LoginDto {
  @ApiProperty({ example: 'arjun@example.com' })
  @IsEmail() email: string

  @ApiProperty({ example: 'Secure@123' })
  @IsString() @IsNotEmpty() password: string
}
