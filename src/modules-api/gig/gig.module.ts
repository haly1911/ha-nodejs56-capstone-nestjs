import { Module } from '@nestjs/common';
import { GigController } from './gig.controller';
import { GigService } from './gig.service';
import { CloudinaryModule } from '../../modules-system/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [GigController],
  providers: [GigService],
})
export class GigModule {}
