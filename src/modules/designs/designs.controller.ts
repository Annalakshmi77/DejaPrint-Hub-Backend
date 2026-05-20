import { Controller, Post, Get, Param, Body, UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { DesignsService } from './designs.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Designs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('designs')
export class DesignsController {
  constructor(private designsService: DesignsService) {}

  @Post('orders/:orderId/items/:itemId')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (_, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`),
    }),
  }))
  upload(
    @CurrentUser('_id') userId,
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @UploadedFile(new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }),
        new FileTypeValidator({ fileType: /(pdf|png|jpg|jpeg|svg)$/ }),
      ],
    })) file: Express.Multer.File,
  ) { return this.designsService.upload(userId.toString(), orderId, itemId, file) }

  @Get('orders/:orderId')
  getByOrder(@Param('orderId') orderId: string, @CurrentUser('_id') userId) {
    return this.designsService.getByOrder(orderId, userId.toString())
  }
}
