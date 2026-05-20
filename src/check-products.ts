import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductsService } from './modules/products/products.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productsService = app.get(ProductsService);
  
  const result = await productsService.findAll({ page: 1, limit: 100 } as any);
  console.log('PRODUCTS_COUNT:', result.data.total);
  console.log('PRODUCTS_SAMPLES:', JSON.stringify(result.data.products.slice(0, 2)));
  
  await app.close();
}
bootstrap();
