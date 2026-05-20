import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from './schemas/user.schema'
import { UpdateUserDto, AddAddressDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-passwordHash -refreshToken')
    if (!user) throw new NotFoundException('User not found')
    return { data: user, message: 'Profile fetched' }
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.userModel.findByIdAndUpdate(userId, dto, { new: true }).select('-passwordHash -refreshToken')
    return { data: user, message: 'Profile updated' }
  }

  async addAddress(userId: string, dto: AddAddressDto) {
    const user = await this.userModel.findById(userId)
    if (!user) throw new NotFoundException('User not found')
    if (dto.isDefault) user.addresses.forEach(a => (a.isDefault = false))
    user.addresses.push(dto as any)
    await user.save()
    return { data: user.addresses, message: 'Address added' }
  }

  async updateAddress(userId: string, addressId: string, dto: AddAddressDto) {
    const user = await this.userModel.findById(userId)
    if (!user) throw new NotFoundException('User not found')
    const addr = (user.addresses as any).id(addressId)
    if (!addr) throw new NotFoundException('Address not found')
    if (dto.isDefault) user.addresses.forEach(a => (a.isDefault = false))
    Object.assign(addr, dto)
    await user.save()
    return { data: user.addresses, message: 'Address updated' }
  }

  async removeAddress(userId: string, addressId: string) {
    await this.userModel.findByIdAndUpdate(userId, { $pull: { addresses: { _id: addressId } } })
    return { message: 'Address removed' }
  }
}
