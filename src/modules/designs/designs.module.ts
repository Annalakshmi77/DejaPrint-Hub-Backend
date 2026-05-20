import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { DesignsController } from './designs.controller'
import { DesignsService } from './designs.service'
import { DesignAsset, DesignAssetSchema } from './schemas/design-asset.schema'
import { Order, OrderSchema } from '../orders/schemas/order.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DesignAsset.name, schema: DesignAssetSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [DesignsController],
  providers: [DesignsService],
  exports: [DesignsService],
})
export class DesignsModule {}
