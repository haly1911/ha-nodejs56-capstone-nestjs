import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { GigService } from './gig.service';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator';
import { GetGigsDto } from './dto/getGigs.dto';

@Controller('gig')
export class GigController {
  constructor(private gigService: GigService) {}

  @Get()
  @Public()
  @ResponseMessage('Get gigs successfully')
  async findAll(@Query() query: GetGigsDto) {
    return this.gigService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Get gig by id successfully')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gigService.findOne(id);
  }
}
