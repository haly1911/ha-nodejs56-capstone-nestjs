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
import { UserService } from './user.service';
import { Role } from '../../common/decorators/role.decorator';
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator';
import { GetUsersDto } from './dto/getUsers.dto';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { UpdateUserStatusDto } from './dto/updateUserStatus.dto';
import { UpdateUserRoleDto } from './dto/updateUserRole.dto';
import { CreateUserDto } from './dto/createUser.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Patch('profile')
  @ResponseMessage('Update profile successfully')
  async updateProfile(
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.userService.updateProfile(user.id, dto);
  }

  @Patch('password')
  @ResponseMessage('Change password successfully')
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.userService.changePassword(user.id, dto);
  }

  @Get()
  @Role('Admin', 'SuperAdmin')
  @ResponseMessage('Get users successfully')
  async findAll(@Query() query: GetUsersDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @Role('Admin', 'SuperAdmin')
  @ResponseMessage('Get user by id successfully')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Post()
  @Role('Admin', 'SuperAdmin')
  @ResponseMessage('Create user successfully')
  async createUser(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.userService.createUser(dto, user);
  }

  @Patch(':id/status')
  @Role('Admin', 'SuperAdmin')
  @ResponseMessage('Update user status successfully')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.userService.updateStatus(id, dto, user);
  }

  @Patch(':id/role')
  @Role('SuperAdmin')
  @ResponseMessage('Update user role successfully')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.userService.updateRole(id, dto, user);
  }

  @Delete(':id')
  @Role('Admin', 'SuperAdmin')
  @ResponseMessage('Delete user successfully')
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.userService.deleteUser(id, user);
  }
}
