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
import { ReviewService } from './review.service';
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator';
import { CreateReviewDto } from './dto/createReview.dto';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { UpdateReviewDto } from './dto/updateReview.dto';
import { Public } from '../../common/decorators/public.decorator';
import { GetReviewsDto } from './dto/getReviews.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('review')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get()
  @Public()
  @ResponseMessage('Get reviews by gig successfully')
  async findReviewsByGig(@Query() query: GetReviewsDto) {
    return this.reviewService.findReviewsByGig(query);
  }

  @Get('my-reviews')
  @ResponseMessage('Get my reviews successfully')
  async findMyReviews(
    @Query() query: PaginationDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.reviewService.findMyReviews(query, user.id);
  }

  @Post()
  @ResponseMessage('Create review successfully')
  async createReview(
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.reviewService.createReview(dto, user.id);
  }

  @Patch(':id')
  @ResponseMessage('Update review successfully')
  async updateReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.reviewService.updateReview(id, dto, user.id);
  }

  @Delete(':id')
  @ResponseMessage('Delete review successfully')
  async deleteReview(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.reviewService.deleteReview(id, user);
  }
}
