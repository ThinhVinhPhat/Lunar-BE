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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserReq } from '@/common/decorator/user.decorator';
import { User } from './entity/user.entity';
import { Public } from '@/common/decorator/public.decorator';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import { ApiOperationDecorator } from '@/common/decorator/api-operation.decorator';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @Get('/me')
  getMe(@UserReq() user: User) {
    return user;
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

  // @ApiBearerAuth()
  // @Patch('update/:id')
  // update(@Param('id') userid: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(userid, updateUserDto);
  // }

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
  @Delete('delete/:id')
  remove(@Param('id') userId: string) {
    return this.usersService.remove(userId);
  }
}
