import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { UpdateUserDto, AddAddressDto } from './dto/update-user.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me') getProfile(@CurrentUser('_id') userId) { return this.usersService.getProfile(userId.toString()) }
  @Put('me') updateProfile(@CurrentUser('_id') userId, @Body() dto: UpdateUserDto) { return this.usersService.updateProfile(userId.toString(), dto) }
  @Post('me/addresses') addAddress(@CurrentUser('_id') userId, @Body() dto: AddAddressDto) { return this.usersService.addAddress(userId.toString(), dto) }
  @Put('me/addresses/:id') updateAddress(@CurrentUser('_id') userId, @Param('id') id: string, @Body() dto: AddAddressDto) { return this.usersService.updateAddress(userId.toString(), id, dto) }
  @Delete('me/addresses/:id') removeAddress(@CurrentUser('_id') userId, @Param('id') id: string) { return this.usersService.removeAddress(userId.toString(), id) }
}
