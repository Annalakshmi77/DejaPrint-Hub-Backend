import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Model } from 'mongoose'
import * as bcrypt from 'bcryptjs'
import { User, UserDocument } from '../users/schemas/user.schema'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userModel.findOne({ email: dto.email.toLowerCase() })
    if (exists) throw new ConflictException('Email already registered')

    const passwordHash = await bcrypt.hash(dto.password, 12)
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      phone: dto.phone,
      company: dto.company,
    })

    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role)
    await this.userModel.findByIdAndUpdate(user._id, { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) })

    return {
      message: 'Registration successful',
      data: {
        user: { id: user._id, full_name: user.name, email: user.email, role: user.role },
        ...tokens,
      },
    }
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() })
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash)
    if (!isMatch) throw new UnauthorizedException('Invalid credentials')

    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role)
    await this.userModel.findByIdAndUpdate(user._id, { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) })

    return {
      message: 'Login successful',
      data: {
        user: { id: user._id, full_name: user.name, email: user.email, role: user.role, phone: user.phone },
        ...tokens,
      },
    }
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userModel.findById(userId)
    if (!user || !user.refreshToken) throw new UnauthorizedException('Access denied')

    const matches = await bcrypt.compare(refreshToken, user.refreshToken)
    if (!matches) throw new UnauthorizedException('Access denied')

    const tokens = await this.generateTokens(user._id.toString(), user.email, user.role)
    await this.userModel.findByIdAndUpdate(user._id, { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) })
    return { data: tokens, message: 'Tokens refreshed' }
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null })
    return { message: 'Logged out successfully' }
  }

  async getMe(userId: string) {
    const user = await this.userModel.findById(userId).select('-passwordHash -refreshToken')
    if (!user) throw new UnauthorizedException('User not found')
    return { data: user, message: 'Profile fetched' }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role }
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
      }),
    ])
    return { accessToken, refreshToken }
  }
}
