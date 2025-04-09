import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UnprocessableEntityException,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UserReq } from '@/common/decorator/user.decorator';
import { User } from './entity/user.entity';
import { Public } from '@/common/decorator/public.decorator';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import { ApiOperationDecorator } from '@/common/decorator/api-operation.decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Roles } from '@/common/decorator/role.decorator';
import { Role } from '@/constant/role';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @Get('/me')
  getMe(@UserReq() user: User) {
    return this.usersService.findMe(user);
  }

  @ApiBearerAuth()
  @Get('/find-all')
  findAll(
    @Query() query: string,
    @Query('current') current: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.usersService.findAll(query, current, pageSize);
  }

  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('avatar'))
  @ApiOperationDecorator({
    summary: 'Update user',
    description: 'Update user information',
    type: UpdateUserDto,
  })
  @Patch('update')
  update(
    @UserReq() currentUser: User,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFiles() avatar: Express.Multer.File[],
  ) {
    const userId = currentUser.id;
    return this.usersService.update(userId, {
      ...updateUserDto,
      avatar: avatar,
    });
  }


  @Public()
  @UseGuards(JwtAuthGuard)
  @ApiOperationDecorator({
    summary: 'User reset password',
    description: 'User reset password',
    type: UpdatePasswordDTO,
  })
  @Patch('update/update-password')
  updatePassword(@Body() updatePassword: UpdatePasswordDTO) {
    if (Object.keys(updatePassword).length == 0) {
      throw new UnprocessableEntityException(
        'Cannot update password with empty data',
      );
    }
    try {
      return this.usersService.updatePassword(updatePassword);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Delete('delete/:id')
  remove(@Param('id') userId: string) {
    return this.usersService.remove(userId);
  }
}
