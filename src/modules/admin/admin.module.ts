import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AdminController } from './admin.controller'
import { Order, OrderSchema } from '../orders/schemas/order.schema'
import { User, UserSchema } from '../users/schemas/user.schema'
import { DesignAsset, DesignAssetSchema } from '../designs/schemas/design-asset.schema'
import { OrdersModule } from '../orders/orders.module'
import { DesignsModule } from '../designs/designs.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
      { name: DesignAsset.name, schema: DesignAssetSchema },
    ]),
    OrdersModule,
    DesignsModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
