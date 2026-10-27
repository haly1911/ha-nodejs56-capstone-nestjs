import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PORT } from './common/constant/app.constant';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  // transform: true để @Type(() => Number) có tác dụng, nếu không page vẫn là chuỗi
  // whitelist: true sẽ xóa mọi thuộc tính không có decorator của class-validator

  await app.listen(PORT as string, () => {
    console.log(`Gateway is running on port ${PORT}`);
  });
}
bootstrap();
