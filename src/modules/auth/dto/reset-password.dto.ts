import { IsString, MinLength, Matches } from 'class-validator'
export class ResetPasswordDto {
  @IsString() @IsNotEmpty() token: string
  @IsString() @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  password: string
}
import { IsNotEmpty } from 'class-validator'
