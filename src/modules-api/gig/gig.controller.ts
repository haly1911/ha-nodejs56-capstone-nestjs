import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { GigService } from './gig.service';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator';
import { GetGigsDto } from './dto/getGigs.dto';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { CreateGigDto } from './dto/createGig.dto';
import { UpdateGigDto } from './dto/updateGig.dto';
import { Role } from '../../common/decorators/role.decorator';
import { UpdateModerationDto } from '../../common/dto/updateModeration.dto';

@Controller('gig')
export class GigController {
  constructor(private gigService: GigService) {}

  @Get()
  @Public()
  @ResponseMessage('Get gigs successfully')
  async findAll(@Query() query: GetGigsDto) {
    return this.gigService.findAll(query);
  }

  @Get('my-gigs')
  @ResponseMessage('Get my gigs successfully')
  async findMyGigs(
    @Query() query: GetGigsDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.gigService.findMyGigs(query, user.id);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Get gig by id successfully')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gigService.findOne(id);
  }

  @Post()
  @ResponseMessage('Create gig successfully')
  async createGig(
    @Body() dto: CreateGigDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.gigService.createGig(dto, user.id);
  }

  @Patch(':id')
  @ResponseMessage('Update gig successfully')
  async updateGig(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGigDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.gigService.updateGig(id, dto, user);
  }

  @Patch(':id/moderation')
  @Role('SuperAdmin', 'Admin')
  @ResponseMessage('Update gig moderation status successfully')
  async updateModerationStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateModerationDto,
  ) {
    return this.gigService.updateModerationStatus(id, dto);
  }

  @Delete(':id')
  @ResponseMessage('Delete gig successfully')
  async deleteGig(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.gigService.deleteGig(id, user);
  }
}
