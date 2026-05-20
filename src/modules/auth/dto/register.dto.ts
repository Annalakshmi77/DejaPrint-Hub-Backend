import { IsEmail, IsString, MinLength, Matches, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty({ example: 'Arjun Kumar' })
  @IsString() @IsNotEmpty() name: string

  @ApiProperty({ example: 'arjun@example.com' })
  @IsEmail() email: string

  @ApiProperty({ example: 'Secure@123' })
  @IsString() @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { message: 'Password must have uppercase, lowercase and number' })
  password: string

  @ApiProperty({ example: '9876543210' })
  @IsString() @Matches(/^[6-9]\d{9}$/, { message: 'Enter valid Indian mobile number' })
  phone: string

  @ApiProperty({ example: 'PrintCraft Solutions', required: false })
  @IsString() @IsNotEmpty() company?: string
}
