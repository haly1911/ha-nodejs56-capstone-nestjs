import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ReviewModule } from '../review/review.module';

@Module({
  imports: [ReviewModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
