import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator';
import { CreateReportDto } from './dto/createReport.dto';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { GetReportsDto } from './dto/getReports.dto';
import { Role } from '../../common/decorators/role.decorator';
import { HandleReportDto } from './dto/handleReport.dto';

@Controller('report')
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Post()
  @ResponseMessage('Create report successfully')
  async createReport(
    @Body() dto: CreateReportDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.reportService.createReport(dto, user.id);
  }

  @Get('my-reports')
  @ResponseMessage('Get my reports successfully')
  async findMyReports(
    @Query() query: GetReportsDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.reportService.findMyReports(query, user.id);
  }

  @Get()
  @Role('SuperAdmin', 'Admin')
  @ResponseMessage('Get reports successfully')
  async findAll(@Query() query: GetReportsDto) {
    return this.reportService.findAll(query);
  }

  @Get(':id')
  @ResponseMessage('Get report by id successfully')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.reportService.findOne(id, user);
  }

  @Patch(':id/status')
  @Role('SuperAdmin', 'Admin')
  @ResponseMessage('Update report status successfully')
  async handleReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: HandleReportDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.reportService.handleReport(id, dto, user.id);
  }
}
