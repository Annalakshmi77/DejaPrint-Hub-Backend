import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductsService } from './modules/products/products.service';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productsService = app.get(ProductsService);
  
  const result = await productsService.findAll({ page: 1, limit: 100 } as any);
  const output = `COUNT: ${result.data.total}\nDATA: ${JSON.stringify(result.data.products)}`;
  fs.writeFileSync('db-check.txt', output);
  
  await app.close();
}
bootstrap();
